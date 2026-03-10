import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Image as ImageIcon } from 'lucide-react';

interface NormalGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Images for the normal gallery
const NORMAL_IMAGES = [
  '/siddhant1.jpeg',
  '/siddhant2.jpeg',
  '/siddhant3.jpeg',
  '/siddhant4.jpeg',
];

export function NormalGalleryModal({ isOpen, onClose }: NormalGalleryModalProps) {
  if (!isOpen) return null;

  const handleDownload = async (url: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `siddhant-normal-${index + 1}.jpeg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading image:', error);
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
              A collection of completely normal, unedited images of Siddhant. You can download these to use as templates for memes.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {NORMAL_IMAGES.map((url, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 aspect-square">
                  <img 
                    src={url} 
                    alt={`Siddhant ${idx + 1}`} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => handleDownload(url, idx)}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-zinc-900 rounded-full font-medium hover:bg-zinc-100 transition-colors transform translate-y-4 group-hover:translate-y-0 duration-200"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
