
import { DailyMission, MissionType } from '../types';

const TEMPLATES: { type: MissionType; description: string; target: number; reward: number }[] = [
  { type: 'WIN_GAME', description: 'Win 1 Game', target: 1, reward: 20 },
  { type: 'WIN_GAME', description: 'Win 3 Games', target: 3, reward: 50 },
  { type: 'GET_BURNING', description: 'Find 3 Burning Words', target: 3, reward: 30 },
  { type: 'GET_BURNING', description: 'Find 5 Burning Words', target: 5, reward: 45 },
  { type: 'PLAY_BLITZ', description: 'Play 1 Blitz Round', target: 1, reward: 25 },
  { type: 'PLAY_BLITZ', description: 'Play 3 Blitz Rounds', target: 3, reward: 60 },
];

export const generateDailyMissions = (): DailyMission[] => {
  // Shuffle and pick 3
  const shuffled = [...TEMPLATES].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 3);

  return selected.map((template, index) => ({
    id: `mission_${Date.now()}_${index}`,
    type: template.type,
    description: template.description,
    target: template.target,
    progress: 0,
    reward: template.reward,
    isClaimed: false
  }));
};
