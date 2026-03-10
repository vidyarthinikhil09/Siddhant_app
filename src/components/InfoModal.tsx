import { motion, AnimatePresence } from 'motion/react';
import { X, Info, Instagram } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InfoModal({ isOpen, onClose }: InfoModalProps) {
  if (!isOpen) return null;

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
          className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden relative shadow-2xl transition-colors"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800/50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
              <Info className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
            </div>
            
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
              The Legend of Room 824
            </h3>
            
            <div className="space-y-4 text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed">
              <p>
                Room 824 isn't just a room number—it's a lifestyle. It's the legendary sanctuary where Siddhant's bed exerts a gravitational pull stronger than a black hole.
              </p>
              <p>
                We set the goal to exactly <strong className="text-emerald-600 dark:text-emerald-400">824 points</strong> to honor this sacred space. Every quiz taken and every daily streak brings us closer to the truth.
              </p>
              <p>
                Once the global meter hits 824, we will finally reveal to Siddhant that this anonymous Instagram account exists—assuming he hasn't found out by then.
              </p>
            </div>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white font-semibold hover:opacity-90 transition-opacity shadow-lg"
            >
              <Instagram className="w-5 h-5" />
              Visit the Anonymous Account
            </a>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
