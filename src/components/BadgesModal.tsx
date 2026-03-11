import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Award, CheckCircle2 } from 'lucide-react';
import { BADGES } from '../constants/badges';

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStreak: number;
}

export function BadgesModal({ isOpen, onClose, currentStreak }: BadgesModalProps) {
  if (!isOpen) return null;

  const nextBadgeIndex = BADGES.findIndex(b => currentStreak < b.target);

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
          className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[85vh]"
        >
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl">
                <Award className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Your Badges</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {BADGES.map((badge, index) => {
              const isEarned = currentStreak >= badge.target;
              const isNext = index === nextBadgeIndex;
              const progress = Math.min((currentStreak / badge.target) * 100, 100);
              const Icon = badge.icon;

              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-5 rounded-2xl border relative overflow-hidden transition-all duration-300 ${
                    isEarned 
                      ? 'bg-white dark:bg-zinc-800/80 border-emerald-200 dark:border-emerald-900/50 shadow-sm' 
                      : isNext 
                        ? 'bg-white dark:bg-zinc-800 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)] dark:shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/50' 
                        : 'bg-zinc-50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800/80 opacity-70 grayscale'
                  }`}
                >
                  {isNext && (
                    <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
                  )}
                  
                  <div className="relative z-10 flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-2xl flex-shrink-0 ${
                      isEarned 
                        ? `bg-gradient-to-br ${badge.gradient} shadow-lg` 
                        : isNext 
                          ? 'bg-zinc-100 dark:bg-zinc-700' 
                          : 'bg-zinc-200 dark:bg-zinc-800'
                    }`}>
                      <Icon className={`w-8 h-8 ${isEarned ? 'text-white' : isNext ? badge.color : 'text-zinc-400 dark:text-zinc-500'}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-bold truncate ${isEarned || isNext ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'}`}>
                          {badge.label}
                        </h3>
                        {isEarned && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                      </div>
                      <p className={`text-xs mt-0.5 ${isEarned || isNext ? 'text-zinc-500 dark:text-zinc-400' : 'text-zinc-400 dark:text-zinc-500'}`}>
                        {badge.description}
                      </p>
                    </div>
                    
                    <div className="text-right flex-shrink-0">
                      <div className={`text-lg font-bold ${isEarned ? 'text-emerald-500 dark:text-emerald-400' : isNext ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500'}`}>
                        {currentStreak} <span className="text-sm font-medium opacity-60">/ {badge.target}</span>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 w-full h-2.5 bg-zinc-200 dark:bg-zinc-700/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.2 + index * 0.1 }}
                      className={`h-full rounded-full ${
                        isEarned 
                          ? 'bg-emerald-500' 
                          : isNext 
                            ? 'bg-emerald-400 dark:bg-emerald-500 relative overflow-hidden' 
                            : 'bg-zinc-400 dark:bg-zinc-600'
                      }`}
                    >
                      {isNext && (
                        <motion.div 
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-1/2 h-full skew-x-12" 
                        />
                      )}
                    </motion.div>
                  </div>
                  
                  {isNext && (
                    <div className="relative z-10 mt-3 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-right">
                      Next Milestone
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
