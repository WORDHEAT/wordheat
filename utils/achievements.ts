
import { Achievement } from '../types';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_win',
    name: 'First Discovery',
    description: 'Win your first game.',
    icon: 'Trophy'
  },
  {
    id: 'sniper',
    name: 'Semantic Sniper',
    description: 'Win a game in 5 guesses or less.',
    icon: 'Target'
  },
  {
    id: 'veteran',
    name: 'Word Explorer',
    description: 'Play 10 games.',
    icon: 'Gamepad2'
  },
  {
    id: 'streak_3',
    name: 'On Fire',
    description: 'Reach a 3-day daily streak.',
    icon: 'Flame'
  },
  {
    id: 'rich',
    name: 'Tycoon',
    description: 'Accumulate 500 coins.',
    icon: 'Coins'
  },
  {
    id: 'fashionista',
    name: 'Fashionista',
    description: 'Unlock 2 visual themes.',
    icon: 'Palette'
  }
];