import { useState, useRef } from 'react';
import { motion } from 'motion/react';

interface StickerProps {
  imageSrc: string;
  audioSrc: string;
}

function Sticker({ imageSrc, audioSrc }: StickerProps) {
  const [rotation, setRotation] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleClick = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error("Audio play failed:", e));
    }
    
    setRotation(prev => prev + 360);
  };

  return (
    <div className="relative">
      <audio 
        ref={audioRef} 
        src={audioSrc} 
        preload="auto" 
      />
      
      <motion.button
        onClick={handleClick}
        animate={{ rotate: rotation }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="relative group w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 sm:border-[3px] border-emerald-500 shadow-lg hover:scale-110 cursor-pointer"
      >
        <img 
          src={imageSrc} 
          alt="Siddhant Sticker" 
          className="w-full h-full object-cover"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity group-hover:bg-black/50">
          <span className="text-white font-black text-[8px] sm:text-[10px] tracking-wider drop-shadow-md transform -rotate-12">
            CLICK
          </span>
        </div>
      </motion.button>
    </div>
  );
}

export function SiddhantSticker() {
  return (
    <div className="fixed bottom-4 left-4 z-40 flex flex-row sm:flex-col gap-2 sm:gap-3 opacity-50 hover:opacity-100 transition-opacity duration-300">
      <Sticker 
        imageSrc="/siddhant1.jpeg" 
        audioSrc="https://www.myinstants.com/media/sounds/chicken-on-tree-screaming.mp3" 
      />
      <Sticker 
        imageSrc="/siddhant2.jpeg" 
        audioSrc="https://www.myinstants.com/media/sounds/fahhhhhhhhhhhhhh.mp3" 
      />
      <Sticker 
        imageSrc="/siddhant3.jpeg" 
        audioSrc="https://www.myinstants.com/media/sounds/pehchana-mujhe.mp3" 
      />
    </div>
  );
}
