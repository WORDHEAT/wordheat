
import { WordCategory } from '../types';

export const CATEGORIES: Record<string, WordCategory> = {
  common: {
    id: 'common',
    name: 'General',
    icon: 'Globe',
    price: 0,
    description: 'Common everyday words from all walks of life.'
  },
  animals: {
    id: 'animals',
    name: 'Animals',
    icon: 'PawPrint',
    price: 100,
    description: 'Creatures from the wild, farm, or home.'
  },
  food: {
    id: 'food',
    name: 'Food & Drink',
    icon: 'Utensils',
    price: 150,
    description: 'Ingredients, dishes, and culinary terms.'
  },
  science: {
    id: 'science',
    name: 'Science',
    icon: 'FlaskConical',
    price: 200,
    description: 'Physics, Biology, Chemistry, and Space.'
  },
  travel: {
    id: 'travel',
    name: 'Travel',
    icon: 'Plane',
    price: 150,
    description: 'Places, transportation, and geography.'
  },
  fantasy: {
    id: 'fantasy',
    name: 'Fantasy',
    icon: 'Wand2',
    price: 300,
    description: 'Magic, monsters, and mythical items.'
  }
};