import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

export function AmbientBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Orb 1 */}
      <motion.div
        className="absolute top-[10%] left-[20%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[80px] md:blur-[120px]"
        animate={{
          x: [0, 50, -20, 0],
          y: [0, -30, 40, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* Orb 2 */}
      <motion.div
        className="absolute bottom-[10%] right-[10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-teal-500/10 dark:bg-teal-500/5 rounded-full blur-[80px] md:blur-[120px]"
        animate={{
          x: [0, -40, 30, 0],
          y: [0, 50, -20, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Orb 3 */}
      <motion.div
        className="absolute top-[40%] left-[60%] w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-[80px] md:blur-[120px]"
        animate={{
          x: [0, -30, 20, 0],
          y: [0, -40, 30, 0],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );
}
