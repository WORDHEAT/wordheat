

import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Language, SemanticResponse, HintResponse, Guess } from '../types';

// NOTE: In a production environment, these calls would go to a backend to protect the API key.
// For this demo, we use the environment variable directly as per instructions.

const getAiClient = () => {
  // Use Vite's environment variable system
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (apiKey) {
    return new GoogleGenAI({ apiKey });
  }
  throw new Error("VITE_GEMINI_API_KEY is missing. Please set it in your .env file.");
};

const MODEL_NAME = 'gemini-2.5-flash';

// Helper to clean markdown code blocks from JSON responses
const cleanJson = (text: string): string => {
  if (!text) return '{}';

  // 1. Try to find markdown code blocks
  const match = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
  if (match) return match[1];

  // 2. If no markdown, try to find the first '{' and last '}' to handle conversational wrappers
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1) {
    return text.substring(start, end + 1);
  }

  // 3. Fallback to original text
  return text;
};

export const generateTargetWord = async (language: Language, seed?: string, category?: string): Promise<string> => {
  try {
    const ai = getAiClient();

    let basePrompt = "";
    if (category && category !== 'common') {
      // Enhanced prompt to handle both preset IDs and custom user topics
      basePrompt = `Generate a single, specific noun in ${language} that is strongly associated with the theme/category "${category}". 
      Examples:
      - If category is 'Star Wars', return 'Jedi' or 'Lightsaber'.
      - If category is 'Cooking', return 'Spatula' or 'Recipe'.
      - If category is 'Animals', return 'Giraffe'.
      Ensure the word is a single noun (no spaces), lowercase, and relatively well-known within that context.`;
    } else {
      basePrompt = `Generate a random, common, simple noun (singular) in ${language} for a word guessing game. Avoid proper nouns unless they are extremely common concepts.`;
    }

    // Use the provided seed directly. It should be YYYY-MM-DD format for consistency.
    const prompt = seed
      ? `Generate the "Daily Word" for the date seed "${seed}" in ${language}. It must be a common, simple noun (singular). Return only the word.`
      : `${basePrompt} Return only the word.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING }
          }
        }
      }
    });

    const json = JSON.parse(cleanJson(response.text || '{}'));
    return json.word?.trim().toLowerCase() || 'ocean';
  } catch (error) {
    console.error("Error generating word:", error);
    return 'apple'; // Fallback so game can load even if API fails
  }
};

export const calculateSimilarity = async (target: string, guess: string, language: Language): Promise<SemanticResponse> => {
  // Cleaning inputs
  const cleanTarget = target.trim().toLowerCase();
  const cleanGuess = guess.trim().toLowerCase();

  // Local check first - allows winning even if API is down
  if (cleanTarget === cleanGuess) {
    return { score: 100, isMatch: true, estimatedRank: 1 };
  }

  try {
    const ai = getAiClient();
    const prompt = `
      Analyze the semantic similarity between the target word "${cleanTarget}" and the guess word "${cleanGuess}" in ${language}.
      Provide a similarity score from 0 to 100, where:
      - 100 is the exact word or perfect synonym.
      - 90-99 is a very close synonym or direct type-of relationship.
      - 70-89 is a strong association (same category, frequent context).
      - 40-69 is a loose association.
      - 0-39 is unrelated.
      
      Also estimate the "rank" of closeness (e.g., 1 is the word itself, 1000 is far away).
    `;

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.NUMBER },
        isMatch: { type: Type.BOOLEAN },
        estimatedRank: { type: Type.INTEGER }
      },
      required: ['score', 'estimatedRank']
    };

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema
      }
    });

    const data = JSON.parse(cleanJson(response.text || '{}'));

    // Ensure score is 1 if it's solved (handled in UI, but good for data consistency)
    const score = data.isMatch ? 1 : (data.score ?? 0);

    return {
      score: score,
      isMatch: data.score === 100 || cleanTarget === cleanGuess,
      estimatedRank: data.estimatedRank ?? 9999
    };
  } catch (error) {
    console.error("Error calculating similarity:", error);
    return { score: 0, isMatch: false, estimatedRank: 10000 };
  }
};

export const generateHint = async (
  target: string,
  language: Language,
  type: 'word' | 'sentence',
  previousHints: string[] = []
): Promise<string> => {
  try {
    const ai = getAiClient();

    const prevHintsStr = previousHints.length > 0
      ? `NOTE: The user has already received these hints, DO NOT repeat similar information or words: ${previousHints.join('; ')}`
      : '';

    let prompt = '';

    if (type === 'word') {
      prompt = `
        The user is trying to guess the word "${target}" in ${language}.
        Provide a SINGLE word hint that is related.
        
        STRICT RULES:
        1. The output word MUST be in ${language}.
        2. Do NOT provide a direct synonym (e.g. if target is "House", do NOT say "Home").
        3. Do NOT provide a translated version of the word.
        4. Provide a related concept, an object often found with it, or a characteristic.
        5. Return ONLY the single word.
        6. ${prevHintsStr}
      `;
    } else {
      prompt = `
        The user is trying to guess the word "${target}" in ${language}.
        Provide a helpful sentence hint (riddle style) describing its function, appearance, or context.
        
        STRICT RULES:
        1. The sentence MUST be written in ${language}. This is mandatory.
        2. Make it easier than the single word hint, but do not use the word itself.
        3. Keep it under 20 words.
        4. ${prevHintsStr}
      `;
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'text/plain',
      }
    });
    return response.text?.trim() || "No hint available.";
  } catch (error) {
    console.error("Error generating hint:", error);
    return "Try thinking about nature.";
  }
};

export const generateCompassClue = async (target: string, language: Language): Promise<string> => {
  try {
    const ai = getAiClient();
    const prompt = `
      Generate a single word in ${language} that is semantically related to "${target}" but is NOT a direct synonym.
      The similarity score should be between 50 and 70 (Warm, not Hot).
      Return only the word.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: { responseMimeType: 'text/plain' }
    });

    return response.text?.trim() || "sky";
  } catch (error) {
    console.error("Error generating compass clue:", error);
    return "thing";
  }
};

export const getDefinition = async (word: string, language: Language): Promise<string> => {
  try {
    const ai = getAiClient();
    const prompt = `Provide a short, one-sentence dictionary definition for the word "${word}" in ${language}.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: { responseMimeType: 'text/plain' }
    });

    return response.text || "Definition unavailable.";
  } catch (error) {
    console.error("Error fetching definition:", error);
    return "";
  }
};

export const getRelatedWords = async (target: string, language: Language): Promise<string[]> => {
  try {
    const ai = getAiClient();
    const prompt = `
      List 5 common words in ${language} that are semantically very close to "${target}" (synonyms or strong associations).
      Return only the words as a JSON array of strings.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            words: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    const json = JSON.parse(cleanJson(response.text || '{}'));
    return json.words || [];
  } catch (error) {
    console.error("Error fetching related words:", error);
    return [];
  }
};

export const generateGameRecap = async (target: string, guesses: Guess[], language: Language): Promise<string> => {
  try {
    const ai = getAiClient();
    // Sort guesses chronologically for the narrative
    const sortedGuesses = [...guesses].sort((a, b) => a.timestamp - b.timestamp);
    // Take first few and best few to save tokens
    const guessList = sortedGuesses.map(g => `${g.word} (${g.temperature})`).join(', ');

    const prompt = `
      The user just finished a game of guessing the word "${target}" in ${language}.
      Here is their guess history: ${guessList}.
      
      Write a short, fun, witty, 2-sentence commentary on their performance. 
      Comment on their start, any big jumps they made, or how fast they found it.
      Address the user directly as "You".
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: { responseMimeType: 'text/plain' }
    });

    return response.text || "Great job finding the word!";
  } catch (error) {
    console.error("Error generating recap:", error);
    return "Well done!";
  }
};
