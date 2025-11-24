
import { Perk } from '../types';

export const PERKS: Perk[] = [
  {
    id: 'thrifty',
    name: 'Thrifty Thinker',
    description: 'Hints cost 15 coins instead of 20.',
    icon: 'Brain',
    unlockLevel: 2
  },
  {
    id: 'money_maker',
    name: 'Money Maker',
    description: 'Earn +5 extra coins for every win.',
    icon: 'Banknote',
    unlockLevel: 4
  },
  {
    id: 'time_lord',
    name: 'Time Lord',
    description: 'Start Blitz Mode with 70 seconds instead of 60.',
    icon: 'Hourglass',
    unlockLevel: 6
  },
  {
    id: 'deep_pockets',
    name: 'Deep Pockets',
    description: 'Daily Bonus increased to 75 coins.',
    icon: 'Gem',
    unlockLevel: 10
  }
];