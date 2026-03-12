import { motion } from 'motion/react';
import { Eye } from 'lucide-react';

interface GlobalMeterProps {
  score: number;
  maxScore: number;
  pulse?: boolean;
}

export function GlobalMeter({ score, maxScore, pulse = false }: GlobalMeterProps) {
  const percentage = Math.min((score / maxScore) * 100, 100);

  return (
    <motion.div 
      animate={pulse ? { 
        scale: [1, 1.02, 1], 
        borderColor: ['#27272a', '#34d399', '#27272a'],
        boxShadow: ['0 0 0px rgba(52,211,153,0)', '0 0 20px rgba(52,211,153,0.4)', '0 0 0px rgba(52,211,153,0)']
      } : {}}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto p-6 bg-white/80 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl backdrop-blur-sm relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
      
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <Eye className="w-5 h-5" />
          The Siddhant Reveal Meter
        </h2>
        <span className="font-mono text-sm text-zinc-500 dark:text-zinc-400">
          {Math.floor(score)} / {maxScore}
        </span>
      </div>

      <div className="relative h-8 bg-zinc-100 dark:bg-zinc-950 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-inner transition-colors">
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-emerald-400 dark:from-emerald-600 dark:to-emerald-400"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIvPjwvc3ZnPg==')] opacity-30" />
        </motion.div>
      </div>

      <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-500 font-mono text-center">
        If the meter hits 2000, we will reveal to Siddhant that his Instagram account exists (if he hasn't found out by then).
      </p>
    </motion.div>
  );
}
