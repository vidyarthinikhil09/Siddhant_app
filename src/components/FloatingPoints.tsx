import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';

interface FloatingPointsProps {
  points: number | null;
  onComplete: () => void;
}

export function FloatingPoints({ points, onComplete }: FloatingPointsProps) {
  const [phase, setPhase] = useState<'hidden' | 'floating' | 'burst'>('hidden');

  useEffect(() => {
    if (points !== null) {
      setPhase('floating');
      
      // After floating animation, trigger burst
      const burstTimer = setTimeout(() => {
        setPhase('burst');
      }, 1200);

      // After burst, complete
      const completeTimer = setTimeout(() => {
        setPhase('hidden');
        onComplete();
      }, 1800);

      return () => {
        clearTimeout(burstTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [points, onComplete]);

  // Generate random particles for the burst
  const particles = Array.from({ length: 16 }).map((_, i) => ({
    id: i,
    angle: (i * 360) / 16,
    distance: 40 + Math.random() * 60,
    size: 3 + Math.random() * 5,
  }));

  return (
    <AnimatePresence>
      {phase === 'floating' && points !== null && (
        <motion.div
          key="number"
          initial={{ opacity: 0, scale: 0.5, y: 80 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0.5, 1.5, 1, 0.3], 
            y: [80, 0, -100, -220] 
          }}
          transition={{ duration: 1.2, ease: "easeInOut", times: [0, 0.2, 0.8, 1] }}
          className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
        >
          <div className="text-4xl md:text-6xl font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)] font-mono">
            +{points}
          </div>
        </motion.div>
      )}
      
      {phase === 'burst' && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="relative" style={{ transform: 'translateY(-220px)' }}>
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                animate={{ 
                  opacity: 0, 
                  x: Math.cos((p.angle * Math.PI) / 180) * p.distance, 
                  y: Math.sin((p.angle * Math.PI) / 180) * p.distance,
                  scale: 0 
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                style={{ 
                  width: p.size, 
                  height: p.size,
                  marginLeft: -p.size / 2,
                  marginTop: -p.size / 2
                }}
              />
            ))}
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
