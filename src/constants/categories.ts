import type { CategoryInfo } from '../types';

/**
 * Category definitions with display info and icons
 */
export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: 'Tv',
    color: '#8b5cf6',
    gradient: 'from-violet-400 to-purple-500',
  },
  {
    id: 'utilities',
    name: 'Utilities',
    icon: 'Zap',
    color: '#f59e0b',
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    id: 'software',
    name: 'Software',
    icon: 'Cpu',
    color: '#3b82f6',
    gradient: 'from-blue-400 to-indigo-500',
  },
  {
    id: 'fitness',
    name: 'Fitness',
    icon: 'Dumbbell',
    color: '#10b981',
    gradient: 'from-emerald-400 to-teal-500',
  },
  {
    id: 'education',
    name: 'Education',
    icon: 'BookOpen',
    color: '#06b6d4',
    gradient: 'from-cyan-400 to-sky-500',
  },
  {
    id: 'gaming',
    name: 'Gaming',
    icon: 'Gamepad2',
    color: '#ec4899',
    gradient: 'from-pink-400 to-rose-500',
  },
  {
    id: 'music',
    name: 'Music',
    icon: 'Music',
    color: '#f97316',
    gradient: 'from-orange-400 to-red-500',
  },
  {
    id: 'cloud',
    name: 'Cloud & Storage',
    icon: 'Cloud',
    color: '#6366f1',
    gradient: 'from-indigo-400 to-violet-500',
  },
  {
    id: 'other',
    name: 'Other',
    icon: 'MoreHorizontal',
    color: '#6b7280',
    gradient: 'from-gray-400 to-slate-500',
  },
];

/**
 * Popular lucide icons for category selection
 */
export const POPULAR_ICONS = [
  'Tv', 'Film', 'Radio', 'Speaker',
  'Zap', 'Lightbulb', 'Plug', 'Wifi',
  'Cpu', 'Monitor', 'Keyboard', 'Mouse', 'Laptop', 'Smartphone',
  'Dumbbell', 'Bicycle', 'HeartPulse', 'Activity',
  'BookOpen', 'GraduationCap', 'Languages', 'PenTool',
  'Gamepad2', 'Gamepad', 'Trophy', 'Target',
  'Music', 'Headphones', 'Mic2', 'Disc3',
  'Cloud', 'HardDrive', 'Database', 'Server',
  'ShoppingBag', 'ShoppingCart', 'Package', 'Truck',
  'Home', 'Building', 'Building2', 'Store',
  'Car', 'Plane', 'Train', 'Ship',
  'Coffee', 'Pizza', 'Utensils', 'Cake',
  'Heart', 'Star', 'Sparkles', 'Flame',
  'MoreHorizontal', 'CircleDot', 'Settings', 'Wrench'
];

/**
 * Local storage key
 */
export const STORAGE_KEY = 'subtrack_subscriptions';
