import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, Image as ImageIcon } from 'lucide-react';

interface NormalGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// External links provided by the user for the normal images
const NORMAL_IMAGE_LINKS = [
  { id: 1, title: 'Template 1', url: 'https://droped.in/f/69b03ef800037a2c4566' },
  { id: 2, title: 'Template 2', url: 'https://droped.in/f/69b03f15003b5616cc84' },
  { id: 3, title: 'Template 3', url: 'https://droped.in/f/69b03f270034be4763e2' },
  { id: 4, title: 'Template 4', url: 'https://droped.in/f/69b03f37003e60252047' },
];

export function NormalGalleryModal({ isOpen, onClose }: NormalGalleryModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/80 dark:bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-2xl max-h-[80vh] flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden relative shadow-2xl transition-colors"
        >
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                <ImageIcon className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
              </div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Normal Images</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800/50 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              A collection of completely normal, unedited images of Siddhant. Click any card below to view and download the high-quality template.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {NORMAL_IMAGE_LINKS.map((item) => (
                <a 
                  key={item.id} 
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex flex-col items-center justify-center p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:border-emerald-500/50 transition-all overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="w-16 h-16 mb-4 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <ImageIcon className="w-8 h-8 text-zinc-400 dark:text-zinc-500 group-hover:text-emerald-500 transition-colors" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">
                    {item.title}
                  </h3>
                  
                  <div className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 font-medium mt-2 opacity-80 group-hover:opacity-100">
                    <span>View & Download</span>
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
