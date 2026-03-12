import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BADGE_MAP } from '../constants/badges';

interface BadgeCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  badgeId: string | null;
}

export function BadgeCelebrationModal({ isOpen, onClose, badgeId }: BadgeCelebrationModalProps) {
  useEffect(() => {
    if (isOpen && badgeId) {
      // Trigger confetti showers
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
      const randomColor = () => {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#ffffff'];
        return colors[Math.floor(Math.random() * colors.length)];
      };

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults, 
          particleCount,
          scalar: randomInRange(0.8, 1.4),
          colors: [randomColor(), randomColor(), randomColor()],
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults, 
          particleCount,
          scalar: randomInRange(0.8, 1.4),
          colors: [randomColor(), randomColor(), randomColor()],
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen, badgeId]);

  if (!isOpen || !badgeId) return null;

  const badge = BADGE_MAP[badgeId];
  if (!badge) return null;

  const Icon = badge.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/80 dark:bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.8, y: 50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.8, y: 50, opacity: 0 }}
          transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
          className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 text-center p-8"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.6, delay: 0.2, duration: 0.8 }}
            className="relative mx-auto w-32 h-32 mb-6"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${badge.gradient} opacity-20 rounded-full animate-ping`} style={{ animationDuration: '3s' }} />
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className={`absolute inset-2 bg-gradient-to-br ${badge.gradient} rounded-full flex items-center justify-center border-4 border-white dark:border-zinc-900 shadow-xl shadow-${badge.color.split('-')[1]}-500/50`}
            >
              <Icon className="w-16 h-16 text-white drop-shadow-md" />
            </motion.div>
            
            {/* Sparkles around the badge */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <Sparkles className="absolute -top-2 -left-2 w-6 h-6 text-yellow-400" />
              <Sparkles className="absolute -bottom-2 -right-2 w-5 h-5 text-emerald-400" />
              <Sparkles className="absolute top-1/2 -right-4 w-4 h-4 text-blue-400" />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              New Badge Unlocked!
            </div>
            
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
              {badge.label}
            </h2>
            
            <p className="text-zinc-500 dark:text-zinc-400 mb-8">
              {badge.description}
            </p>

            <button
              onClick={onClose}
              className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Awesome!
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
