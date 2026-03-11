import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  suffix?: string;
  icon: ReactNode;
  delay?: number;
}

export function StatCard({ title, value, suffix, icon, delay = 0 }: StatCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="h-full p-5 bg-white/60 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center text-center backdrop-blur-sm hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors shadow-sm dark:shadow-none"
    >
      <div className="mb-3 p-2 bg-zinc-100 dark:bg-zinc-800/50 rounded-full transition-colors">{icon}</div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold font-mono text-zinc-900 dark:text-zinc-100">{value}</span>
        {suffix && <span className="text-sm text-zinc-500 font-mono">{suffix}</span>}
      </div>
      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-2 uppercase tracking-wider">{title}</span>
    </motion.div>
  );
}
