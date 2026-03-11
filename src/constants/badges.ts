import { Flame, Star, Medal, Crown } from 'lucide-react';

export const BADGE_MAP: Record<string, { id: string, target: number, icon: any, color: string, gradient: string, label: string, description: string }> = {
  '3_day_streak': { 
    id: '3_day_streak', 
    target: 3, 
    icon: Flame, 
    color: 'text-orange-500', 
    gradient: 'from-orange-400 to-red-500', 
    label: '3 Day Streak', 
    description: 'Maintain a streak for 3 days' 
  },
  '7_day_streak': { 
    id: '7_day_streak', 
    target: 7, 
    icon: Star, 
    color: 'text-yellow-500', 
    gradient: 'from-yellow-400 to-orange-500', 
    label: '7 Day Streak', 
    description: 'Maintain a streak for 7 days' 
  },
  '14_day_streak': { 
    id: '14_day_streak', 
    target: 14, 
    icon: Medal, 
    color: 'text-blue-500', 
    gradient: 'from-blue-400 to-indigo-500', 
    label: '14 Day Streak', 
    description: 'Maintain a streak for 14 days' 
  },
  '30_day_streak': { 
    id: '30_day_streak', 
    target: 30, 
    icon: Crown, 
    color: 'text-purple-500', 
    gradient: 'from-purple-400 to-pink-500', 
    label: '30 Day Streak', 
    description: 'Maintain a streak for 30 days' 
  },
};

export const BADGES = Object.values(BADGE_MAP).sort((a, b) => a.target - b.target);
