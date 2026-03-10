/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlobalMeter } from './components/GlobalMeter';
import { StatCard } from './components/StatCard';
import { QuizModal } from './components/QuizModal';
import { InfoModal } from './components/InfoModal';
import { FloatingPoints } from './components/FloatingPoints';
import { AmbientBackground } from './components/AmbientBackground';
import { NormalGalleryModal } from './components/NormalGalleryModal';
import { MemeGalleryModal } from './components/MemeGalleryModal';
import { SiddhantSticker } from './components/SiddhantSticker';
import { Ghost, Sparkles, ChevronRight, Flame, Target, Moon, Sun, Info, Image as ImageIcon, ImagePlus, ExternalLink, Skull, Bird, Bot, Zap, Star, Cloud, Snowflake, Droplet, Wind, Coffee, Rocket, Crown, Eye, Shield, Key } from 'lucide-react';
import { audio } from './utils/audio';
import { io } from 'socket.io-client';

const ADJECTIVES = ['Based', 'Sigma', 'Chill', 'Secret', 'Hidden', 'Elite', 'Dank', 'Cursed', 'Blessed', 'Rogue', 'Loyal', 'Goofy', 'Chad', 'Mysterious', 'Silent', 'Anon'];
const NOUNS = ['Investigator', 'Watcher', 'Follower', 'Friend', 'Bro', 'Detective', 'Observer', 'Fan', 'Stan', 'Believer', 'Witness', 'Agent', 'Scholar', 'Poster', 'Lurker', 'Sleuth'];
const ICON_NAMES = ['Ghost', 'Skull', 'Bird', 'Bot', 'Zap', 'Flame', 'Star', 'Moon', 'Sun', 'Cloud', 'Snowflake', 'Droplet', 'Wind', 'Coffee', 'Rocket', 'Crown', 'Eye', 'Shield', 'Key'];
const ICON_MAP: Record<string, any> = { Ghost, Skull, Bird, Bot, Zap, Flame, Star, Moon, Sun, Cloud, Snowflake, Droplet, Wind, Coffee, Rocket, Crown, Eye, Shield, Key };

// Initialize socket outside component to prevent multiple connections
const socket = io();

export default function App() {
  const [globalScore, setGlobalScore] = useState(10);
  const [streak, setStreak] = useState(0);
  const [lastVisit, setLastVisit] = useState<string | null>(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isNormalGalleryOpen, setIsNormalGalleryOpen] = useState(false);
  const [isMemeGalleryOpen, setIsMemeGalleryOpen] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [personalScore, setPersonalScore] = useState<number | null>(null);
  const [floatingPoints, setFloatingPoints] = useState<number | null>(null);
  const [meterPulse, setMeterPulse] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [userName, setUserName] = useState<string>('');
  const [userIconName, setUserIconName] = useState<string>('Ghost');

  useEffect(() => {
    // Socket.IO listeners
    socket.on('score_update', (newScore: number) => {
      setGlobalScore(newScore);
    });

    return () => {
      socket.off('score_update');
    };
  }, []);

  useEffect(() => {
    // Load theme
    const storedTheme = localStorage.getItem('siddhant_theme');
    if (storedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    const storedStreak = localStorage.getItem('siddhant_streak');
    if (storedStreak) setStreak(parseInt(storedStreak, 10));

    const storedLastVisit = localStorage.getItem('siddhant_last_visit');
    const today = new Date().toISOString().split('T')[0];

    if (storedLastVisit) {
      const lastDate = new Date(storedLastVisit);
      const currentDate = new Date(today);
      const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Returned next day
        const newStreak = (parseInt(storedStreak || '0', 10)) + 1;
        setStreak(newStreak);
        setLastVisit(today);
        localStorage.setItem('siddhant_streak', newStreak.toString());
        localStorage.setItem('siddhant_last_visit', today);
        
        // Add 5 bonus points
        triggerPointsAnimation(5);
      } else if (diffDays > 1) {
        // Streak broken
        setStreak(1);
        setLastVisit(today);
        localStorage.setItem('siddhant_streak', '1');
        localStorage.setItem('siddhant_last_visit', today);
        triggerPointsAnimation(5);
      }
    } else {
      // First visit
      setStreak(1);
      setLastVisit(today);
      localStorage.setItem('siddhant_streak', '1');
      localStorage.setItem('siddhant_last_visit', today);
      triggerPointsAnimation(5);
    }

    const storedQuiz = localStorage.getItem('siddhant_quiz_completed');
    if (storedQuiz === 'true') setQuizCompleted(true);

    const storedPersonalScore = localStorage.getItem('siddhant_personal_score');
    if (storedPersonalScore) setPersonalScore(parseFloat(storedPersonalScore));

    // Load or generate random user name and icon
    let storedName = localStorage.getItem('siddhant_user_name');
    let storedIcon = localStorage.getItem('siddhant_user_icon');
    
    if (!storedName || !storedIcon) {
      const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
      const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
      storedName = `${adj} ${noun}`;
      storedIcon = ICON_NAMES[Math.floor(Math.random() * ICON_NAMES.length)];
      
      localStorage.setItem('siddhant_user_name', storedName);
      localStorage.setItem('siddhant_user_icon', storedIcon);
    }
    setUserName(storedName);
    setUserIconName(storedIcon);
  }, []);

  const triggerPointsAnimation = (points: number) => {
    setFloatingPoints(points);
    // The actual score update happens after animation completes
  };

  const handlePointsAnimationComplete = () => {
    if (floatingPoints !== null) {
      // Emit to server instead of local state
      socket.emit('add_score', floatingPoints);
      setFloatingPoints(null);
      
      // Trigger meter pulse effect
      audio.playTick();
      setMeterPulse(true);
      setTimeout(() => setMeterPulse(false), 500);
    }
  };

  const handleQuizSubmit = (score: number) => {
    setPersonalScore(score);
    setIsQuizOpen(false);
    setQuizCompleted(true);
    localStorage.setItem('siddhant_quiz_completed', 'true');
    localStorage.setItem('siddhant_personal_score', score.toString());

    // Scale down score (e.g., divide by 5)
    const scaledPoints = Math.max(1, Math.round(score / 5));
    
    // Slight delay before showing animation
    setTimeout(() => {
      triggerPointsAnimation(scaledPoints);
    }, 500);
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newTheme = !prev;
      if (newTheme) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('siddhant_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('siddhant_theme', 'light');
      }
      return newTheme;
    });
  };

  const canTakeQuiz = !quizCompleted || personalScore === null;
  const UserIcon = ICON_MAP[userIconName] || Ghost;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans relative overflow-hidden selection:bg-emerald-500/30 transition-colors duration-300">
      <div className="scanlines" />
      
      {/* User Greeting */}
      {userName && (
        <div className="absolute top-4 left-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-200/50 dark:bg-zinc-800/50 border border-zinc-300/50 dark:border-zinc-700/50 backdrop-blur-sm shadow-sm">
          <UserIcon className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-mono text-zinc-600 dark:text-zinc-300">
            Hi, <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{userName}</span>
          </span>
        </div>
      )}

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors z-50"
      >
        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <AmbientBackground />

      <main className="relative z-10 max-w-md mx-auto px-4 py-12 flex flex-col items-center min-h-screen">
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full mb-6 shadow-xl dark:shadow-2xl transition-colors overflow-hidden">
            <UserIcon className="w-12 h-12 text-zinc-400 dark:text-zinc-500" />
          </div>
          <h1 className="text-4xl font-bold tracking-tighter mb-3 bg-gradient-to-br from-zinc-800 to-zinc-500 dark:from-white dark:to-zinc-500 bg-clip-text text-transparent flex items-center justify-center gap-3">
            Room 824
            <button 
              onClick={() => setIsInfoOpen(true)}
              className="p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800/50 text-zinc-400 hover:text-emerald-500 transition-colors"
              aria-label="About Room 824"
            >
              <Info className="w-5 h-5" />
            </button>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-mono text-sm max-w-[280px] mx-auto transition-colors">
            The truth is out there. Contribute to the meter to force the reveal.
          </p>
        </motion.div>

        <div className="w-full space-y-6">
          <GlobalMeter score={globalScore} maxScore={824} pulse={meterPulse} />
          
          <div className="grid grid-cols-2 gap-4 w-full">
            <StatCard 
              title="Daily Streak" 
              value={streak} 
              suffix="days" 
              icon={<Flame className="w-5 h-5 text-orange-400" />} 
            />
            {!canTakeQuiz ? (
              <StatCard 
                title="Your Score" 
                value={personalScore!} 
                suffix="%" 
                icon={<Target className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />} 
                delay={0.1}
              />
            ) : (
              <div className="p-5 bg-zinc-100 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800/50 border-dashed rounded-2xl flex flex-col items-center justify-center text-center transition-colors">
                <div className="mb-3 p-2 bg-zinc-200 dark:bg-zinc-800/30 rounded-full transition-colors">
                  <Target className="w-5 h-5 text-zinc-500 dark:text-zinc-600" />
                </div>
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-500 uppercase tracking-wider">Score Hidden</span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-600 mt-1">Take quiz to reveal</span>
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {canTakeQuiz && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, height: 0, marginTop: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full"
              >
                <button
                  onClick={() => setIsQuizOpen(true)}
                  className="w-full group relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 text-left transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm dark:shadow-none"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 dark:from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1 flex items-center gap-2 transition-colors">
                        <Sparkles className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                        Know Siddhant?
                      </h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 font-mono transition-colors">Take the quiz to add points</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center group-hover:border-emerald-500/50 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Galleries Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-zinc-200 dark:border-zinc-800/50"
          >
            <button
              onClick={() => setIsNormalGalleryOpen(true)}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group shadow-sm dark:shadow-none"
            >
              <div className="p-3 bg-zinc-100 dark:bg-zinc-800/50 rounded-full group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors">
                <ImageIcon className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
              </div>
              <span className="text-sm font-medium text-zinc-900 dark:text-white">Normal Images</span>
            </button>

            <button
              onClick={() => setIsMemeGalleryOpen(true)}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-emerald-500/50 transition-all group shadow-sm dark:shadow-none"
            >
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-full group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40 transition-colors">
                <ImagePlus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-sm font-medium text-zinc-900 dark:text-white">Meme Gallery</span>
            </button>
          </motion.div>

          {/* Submit Content Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full pt-4"
          >
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSe3Imlkf-PF21ceEWT5KdjDtfJYD0pdHpS3-RdpBure33Kc7w/viewform?usp=publish-editor"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full group relative overflow-hidden rounded-2xl bg-zinc-900 dark:bg-zinc-100 border border-zinc-800 dark:border-zinc-200 p-6 text-left transition-all hover:bg-zinc-800 dark:hover:bg-white shadow-md flex items-center justify-between"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 dark:from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <h3 className="text-lg font-semibold text-white dark:text-zinc-900 mb-1 flex items-center gap-2 transition-colors">
                  Share Content
                </h3>
                <p className="text-sm text-zinc-400 dark:text-zinc-500 transition-colors max-w-[240px]">
                  Submit random Siddhant content for our Instagram. 100% anonymous.
                </p>
              </div>
              <div className="relative z-10 w-10 h-10 rounded-full bg-zinc-800 dark:bg-zinc-200 flex items-center justify-center text-zinc-400 dark:text-zinc-500 group-hover:text-emerald-400 dark:group-hover:text-emerald-500 transition-colors shrink-0">
                <ExternalLink className="w-5 h-5" />
              </div>
            </a>
          </motion.div>
        </div>

      </main>

      {isQuizOpen && (
        <QuizModal 
          isOpen={isQuizOpen} 
          onClose={() => setIsQuizOpen(false)} 
          onSubmit={handleQuizSubmit} 
        />
      )}

      <InfoModal 
        isOpen={isInfoOpen} 
        onClose={() => setIsInfoOpen(false)} 
      />

      <NormalGalleryModal
        isOpen={isNormalGalleryOpen}
        onClose={() => setIsNormalGalleryOpen(false)}
      />

      <MemeGalleryModal
        isOpen={isMemeGalleryOpen}
        onClose={() => setIsMemeGalleryOpen(false)}
      />

      <FloatingPoints 
        points={floatingPoints} 
        onComplete={handlePointsAnimationComplete} 
      />

      <SiddhantSticker />
    </div>
  );
}
