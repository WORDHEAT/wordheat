
import { Theme } from '../types';

export const THEMES: Record<string, Theme> = {
  default: {
    id: 'default',
    name: 'Classic Slate',
    price: 0,
    description: 'The original WordHeat experience.',
    bgHome: 'bg-slate-900',
    heatColors: [
      'from-slate-900 via-blue-900/20 to-slate-900',   // Freezing
      'from-slate-900 via-cyan-900/20 to-slate-900',   // Cold
      'from-slate-900 via-yellow-900/20 to-slate-900', // Warm
      'from-slate-900 via-orange-900/20 to-slate-900', // Hot
      'from-slate-900 via-red-900/30 to-slate-900'     // Burning
    ],
    accentColor: 'emerald'
  },
  ocean: {
    id: 'ocean',
    name: 'Deep Ocean',
    price: 200,
    description: 'Dive into the abyss.',
    bgHome: 'bg-blue-950',
    heatColors: [
      'from-blue-950 via-indigo-950/40 to-blue-950',
      'from-blue-950 via-cyan-900/20 to-blue-950',
      'from-blue-950 via-teal-800/20 to-blue-950',
      'from-blue-950 via-emerald-600/20 to-blue-950',
      'from-blue-950 via-cyan-400/30 to-blue-950'
    ],
    accentColor: 'cyan'
  },
  forest: {
    id: 'forest',
    name: 'Enchanted Forest',
    price: 350,
    description: 'For the nature lovers.',
    bgHome: 'bg-green-950',
    heatColors: [
      'from-green-950 via-slate-900/40 to-green-950',
      'from-green-950 via-emerald-900/20 to-green-950',
      'from-green-950 via-lime-900/20 to-green-950',
      'from-green-950 via-yellow-600/20 to-green-950',
      'from-green-950 via-amber-400/30 to-green-950'
    ],
    accentColor: 'lime'
  },
  cyber: {
    id: 'cyber',
    name: 'Cyberpunk City',
    price: 500,
    description: 'High tech, low life.',
    bgHome: 'bg-black',
    heatColors: [
      'from-black via-slate-900 to-black',
      'from-black via-indigo-900/40 to-black',
      'from-black via-purple-900/40 to-black',
      'from-black via-fuchsia-800/40 to-black',
      'from-black via-pink-500/30 to-black'
    ],
    accentColor: 'pink'
  }
};
