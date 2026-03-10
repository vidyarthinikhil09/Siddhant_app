import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, ImagePlus, Trash2, Heart } from 'lucide-react';

interface MemeGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Meme {
  url: string;
  owner: string;
  likes?: number;
  likedBy?: string[];
}

export function MemeGalleryModal({ isOpen, onClose }: MemeGalleryModalProps) {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedName = localStorage.getItem('siddhant_user_name') || 'Anonymous';
    setCurrentUser(storedName);

    const storedMemes = localStorage.getItem('siddhant_memes');
    if (storedMemes) {
      try {
        const parsed = JSON.parse(storedMemes);
        // Handle backward compatibility for older string-only memes
        const formattedMemes = parsed.map((m: any) => {
          if (typeof m === 'string') {
            return { url: m, owner: 'Anonymous', likes: 0, likedBy: [] };
          }
          return {
            ...m,
            likes: m.likes || 0,
            likedBy: m.likedBy || []
          };
        });
        setMemes(formattedMemes);
      } catch (e) {
        console.error('Failed to parse memes', e);
      }
    }
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Only allow images/gifs
    if (!file.type.startsWith('image/')) {
      alert('Only images and GIFs are allowed.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      const newMeme: Meme = { url: base64String, owner: currentUser, likes: 0, likedBy: [] };
      const newMemes = [newMeme, ...memes];
      setMemes(newMemes);
      localStorage.setItem('siddhant_memes', JSON.stringify(newMemes));
    };
    reader.readAsDataURL(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLike = (index: number) => {
    const newMemes = [...memes];
    const meme = { ...newMemes[index] };
    const likedBy = meme.likedBy || [];
    
    if (likedBy.includes(currentUser)) {
      meme.likes = Math.max(0, (meme.likes || 0) - 1);
      meme.likedBy = likedBy.filter(u => u !== currentUser);
    } else {
      meme.likes = (meme.likes || 0) + 1;
      meme.likedBy = [...likedBy, currentUser];
    }
    
    newMemes[index] = meme;
    setMemes(newMemes);
    localStorage.setItem('siddhant_memes', JSON.stringify(newMemes));
  };

  const handleDelete = (index: number) => {
    const meme = memes[index];
    
    if (meme.owner !== currentUser && !isAdmin) {
      alert('You can only delete your own memes.');
      return;
    }

    if (confirm('Are you sure you want to delete this meme?')) {
      const newMemes = memes.filter((_, i) => i !== index);
      setMemes(newMemes);
      localStorage.setItem('siddhant_memes', JSON.stringify(newMemes));
    }
  };

  const handleAdminUnlock = () => {
    if (!isAdmin) {
      const pwd = prompt('Developer Admin Password:');
      if (pwd === '824') {
        setIsAdmin(true);
        alert('Admin mode unlocked. You can now delete any meme.');
      } else if (pwd !== null) {
        alert('Incorrect password.');
      }
    }
  };

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
          className="w-full max-w-2xl max-h-[80vh] flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden relative shadow-2xl transition-colors"
        >
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                <ImagePlus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 
                className="text-xl font-bold text-zinc-900 dark:text-white cursor-default select-none"
                onDoubleClick={handleAdminUnlock}
              >
                Meme Gallery {isAdmin && <span className="text-xs text-rose-500 ml-2 font-mono">(Admin)</span>}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800/50 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Post your best Siddhant memes here. (Images and GIFs only)
              </p>
              <button
                onClick={handleUploadClick}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-medium transition-colors text-sm shrink-0"
              >
                <Upload className="w-4 h-4" />
                Upload Meme
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            
            {memes.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                <ImagePlus className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-4" />
                <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-1">No memes yet</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Be the first to upload a masterpiece.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {memes.map((meme, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 flex flex-col">
                    <div className="relative aspect-square bg-zinc-200 dark:bg-zinc-900">
                      <img 
                        src={meme.url} 
                        alt={`Meme ${idx + 1}`} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {(meme.owner === currentUser || isAdmin) && (
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                          <button
                            onClick={() => handleDelete(idx)}
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors transform translate-y-4 group-hover:translate-y-0 duration-200 shadow-lg"
                            title={meme.owner === currentUser ? "Delete your meme" : "Delete (Admin)"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex items-center justify-between bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
                      <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 truncate pr-2" title={meme.owner}>
                        By: {meme.owner}
                      </span>
                      <button
                        onClick={() => handleLike(idx)}
                        className="flex items-center gap-1.5 text-zinc-500 hover:text-rose-500 dark:text-zinc-400 dark:hover:text-rose-400 transition-colors"
                      >
                        <Heart className={`w-4 h-4 transition-all ${meme.likedBy?.includes(currentUser) ? 'fill-rose-500 text-rose-500 dark:fill-rose-400 dark:text-rose-400 scale-110' : 'scale-100'}`} />
                        <span className="text-xs font-medium">{meme.likes || 0}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
