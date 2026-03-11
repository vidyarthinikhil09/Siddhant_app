import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, Ghost, Skull, Bird, Bot, Zap, Moon, Sun, Cloud, Snowflake, Droplet, Wind, Coffee, Rocket, Eye, Shield, Key, Flame, Star, Crown } from 'lucide-react';
import { io } from 'socket.io-client';
import { BADGE_MAP } from '../constants/badges';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LeaderboardEntry {
  user_name: string;
  user_icon: string;
  score: number;
  badges: string;
}

const ICON_MAP: Record<string, any> = { Ghost, Skull, Bird, Bot, Zap, Flame, Star, Moon, Sun, Cloud, Snowflake, Droplet, Wind, Coffee, Rocket, Crown, Eye, Shield, Key };

const socket = io();

export function LeaderboardModal({ isOpen, onClose }: LeaderboardModalProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'all_time'>('all_time');

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`/api/leaderboard?timeframe=${timeframe}`);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
    } catch (e) {
      console.error('Failed to fetch leaderboard', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
      
      const handleUpdate = () => fetchLeaderboard();
      socket.on('leaderboard_update', handleUpdate);

      return () => {
        socket.off('leaderboard_update', handleUpdate);
      };
    }
  }, [isOpen, timeframe]);

  if (!isOpen) return null;

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.2)]';
      case 1:
        return 'bg-gradient-to-r from-slate-300/10 to-slate-500/10 border-slate-400/30 shadow-[0_0_15px_rgba(148,163,184,0.2)]';
      case 2:
        return 'bg-gradient-to-r from-amber-700/10 to-amber-900/10 border-amber-700/30 shadow-[0_0_15px_rgba(180,83,9,0.2)]';
      default:
        return 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700/50';
    }
  };

  const getRankText = (index: number) => {
    switch (index) {
      case 0:
        return 'text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-yellow-500 font-black text-xl drop-shadow-sm';
      case 1:
        return 'text-transparent bg-clip-text bg-gradient-to-r from-slate-400 to-slate-600 dark:from-slate-300 dark:to-slate-100 font-bold text-lg';
      case 2:
        return 'text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800 dark:from-amber-500 dark:to-amber-700 font-bold text-lg';
      default:
        return 'text-zinc-500 dark:text-zinc-400 font-medium';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/80 dark:bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[80vh]"
        >
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex flex-col gap-4 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-500/20 rounded-xl">
                  <Trophy className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Leaderboard</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex p-1 bg-zinc-200 dark:bg-zinc-800 rounded-xl">
              {(['weekly', 'monthly', 'all_time'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-all ${
                    timeframe === t 
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' 
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  {t === 'all_time' ? 'All Time' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              {leaderboard.map((entry, index) => {
                const Icon = ICON_MAP[entry.user_icon] || Ghost;
                const badges = JSON.parse(entry.badges || '[]');
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-4 p-4 rounded-xl border ${getRankStyle(index)}`}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/50 dark:bg-black/20 text-zinc-600 dark:text-zinc-300 font-bold backdrop-blur-sm">
                      {index + 1}
                    </div>
                    
                    <div className="p-2 bg-white/80 dark:bg-zinc-800/80 rounded-lg shadow-sm backdrop-blur-sm">
                      <Icon className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                    </div>
                    
                    <div className="flex-1">
                      <div className={`font-semibold ${index < 3 ? 'text-zinc-900 dark:text-white' : 'text-zinc-800 dark:text-zinc-200'}`}>
                        {entry.user_name}
                      </div>
                      <div className="flex gap-2 mt-1">
                        {badges.map((badgeId: string) => {
                          const badge = BADGE_MAP[badgeId];
                          if (!badge) return null;
                          const BadgeIcon = badge.icon;
                          return (
                            <div key={badgeId} className="flex items-center gap-1 text-xs bg-white/80 dark:bg-zinc-800/80 px-2 py-1 rounded-md shadow-sm backdrop-blur-sm" title={badge.label}>
                              <BadgeIcon className={`w-3 h-3 ${badge.color}`} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="text-right flex items-center gap-2">
                      <div className="flex flex-col items-end">
                        <div className={getRankText(index)}>
                          {entry.score}
                        </div>
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">
                          Points
                        </div>
                      </div>
                      {index === 0 && <Flame className="w-6 h-6 text-orange-500 animate-pulse" />}
                    </div>
                  </motion.div>
                );
              })}
              
              {leaderboard.length === 0 && (
                <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
                  <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No one is on the leaderboard yet.</p>
                  <p className="text-sm mt-2">Be the first to claim your daily streak!</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
