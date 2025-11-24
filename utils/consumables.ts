
import { Consumable } from '../types';

export const CONSUMABLES: Record<string, Consumable> = {
  compass: {
    id: 'compass',
    name: 'Semantic Compass',
    icon: 'Compass',
    price: 40,
    description: 'Reveals a "Warm" word (score 50-70) to guide you.',
    type: 'hint'
  },
  letter_spy: {
    id: 'letter_spy',
    name: 'Letter Spy',
    icon: 'Eye',
    price: 60,
    description: 'Reveals the next letter of the secret word.',
    type: 'reveal'
  },
  time_freeze: {
    id: 'time_freeze',
    name: 'Time Freeze',
    icon: 'Clock',
    price: 30,
    description: 'Adds 20 seconds to the Blitz timer.',
    type: 'time'
  },
  streak_freeze: {
    id: 'streak_freeze',
    name: 'Streak Freeze',
    icon: 'Flame',
    price: 150,
    description: 'Automatically saves your streak if you miss a day.',
    type: 'time'
  }
};
