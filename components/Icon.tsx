
import React from 'react';
import {
  Globe, PawPrint, Utensils, FlaskConical, Plane, Wand2,
  Trophy, Target, Gamepad2, Flame, Coins, Palette,
  Brain, Banknote, Hourglass, Gem,
  Compass, Eye, Clock, Play, Calendar, Zap,
  Leaf, Waves, Monitor, LayoutGrid, ShoppingBag, Book, Settings, HelpCircle, X,
  Check, Lock, Copy, Plus, Bot, Loader2, Volume2, VolumeX, BrainCircuit,
  ChevronDown, Share2, ArrowRight, Flag, Lightbulb, ArrowRightCircle, Medal, Swords, CheckCircle, ClipboardList,
  Smartphone, Globe2, Users, User, Heart, MessageSquare, GraduationCap
} from 'lucide-react';

// Map string IDs from data files to Lucide components
const iconMap: Record<string, React.ElementType> = {
  // Categories
  'Globe': Globe,
  'PawPrint': PawPrint,
  'Utensils': Utensils,
  'FlaskConical': FlaskConical,
  'Plane': Plane,
  'Wand2': Wand2,
  'LayoutGrid': LayoutGrid,
  'GraduationCap': GraduationCap,

  // Achievements
  'Trophy': Trophy,
  'Target': Target,
  'Gamepad2': Gamepad2,
  'Flame': Flame,
  'Coins': Coins,
  'Palette': Palette,

  // Perks
  'Brain': Brain,
  'Banknote': Banknote,
  'Hourglass': Hourglass,
  'Gem': Gem,

  // Consumables
  'Compass': Compass,
  'Eye': Eye,
  'Clock': Clock,

  // Missions
  'Play': Play,
  'Calendar': Calendar,
  'Zap': Zap,

  // Themes
  'Leaf': Leaf,
  'Waves': Waves,
  'Monitor': Monitor,

  // UI
  'ShoppingBag': ShoppingBag,
  'Book': Book,
  'Settings': Settings,
  'HelpCircle': HelpCircle,
  'X': X,
  'Check': Check,
  'Lock': Lock,
  'Copy': Copy,
  'Plus': Plus,
  'Bot': Bot,
  'Loader2': Loader2,
  'Volume2': Volume2,
  'VolumeX': VolumeX,
  'BrainCircuit': BrainCircuit,
  'ChevronDown': ChevronDown,
  'Share2': Share2,
  'ArrowRight': ArrowRight,
  'Flag': Flag,
  'Lightbulb': Lightbulb,
  'ArrowRightCircle': ArrowRightCircle,
  'Medal': Medal,
  'Swords': Swords,
  'CheckCircle': CheckCircle,
  'ClipboardList': ClipboardList,
  'Smartphone': Smartphone,
  'Globe2': Globe2,
  'Users': Users,
  'User': User,
  'Heart': Heart,
  'MessageSquare': MessageSquare
};

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export const Icon: React.FC<IconProps> = ({ name, size = 24, className = "", strokeWidth = 2, ...props }) => {
  const IconComponent = iconMap[name] || Globe; // Default fallback
  return <IconComponent size={size} className={className} strokeWidth={strokeWidth} {...props} />;
};
