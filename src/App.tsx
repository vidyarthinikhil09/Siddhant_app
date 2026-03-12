/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlobalMeter } from './components/GlobalMeter';
import { StatCard } from './components/StatCard';
import { QuizModal } from './components/QuizModal';
import { InfoModal } from './components/InfoModal';
import { FloatingPoints } from './components/FloatingPoints';
import { AmbientBackground } from './components/AmbientBackground';
import { NormalGalleryModal } from './components/NormalGalleryModal';
import { MemeGalleryModal } from './components/MemeGalleryModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { BadgesModal } from './components/BadgesModal';
import { BadgeCelebrationModal } from './components/BadgeCelebrationModal';
import { BADGE_MAP } from './constants/badges';
import { Ghost, Sparkles, ChevronRight, Flame, Target, Moon, Sun, Info, Image as ImageIcon, ImagePlus, ExternalLink, Skull, Bird, Bot, Zap, Star, Cloud, Snowflake, Droplet, Wind, Coffee, Rocket, Crown, Eye, Shield, Key, Trophy, Medal, Award } from 'lucide-react';
import { audio } from './utils/audio';
import { io } from 'socket.io-client';
import fpPromise from '@fingerprintjs/fingerprintjs';

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
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isBadgesOpen, setIsBadgesOpen] = useState(false);
  const [celebrationBadge, setCelebrationBadge] = useState<string | null>(null);
  const [isNormalGalleryOpen, setIsNormalGalleryOpen] = useState(false);
  const [isMemeGalleryOpen, setIsMemeGalleryOpen] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [personalScore, setPersonalScore] = useState<number | null>(null);
  const [floatingPoints, setFloatingPoints] = useState<number | null>(null);
  const [meterPulse, setMeterPulse] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [userName, setUserName] = useState<string>('');
  const [userIconName, setUserIconName] = useState<string>('Ghost');
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [badges, setBadges] = useState<string[]>([]);

  useEffect(() => {
    const initFp = async () => {
      const fp = await fpPromise.load();
      const result = await fp.get();
      setDeviceId(result.visitorId);
    };
    initFp();

    // Socket.IO listeners
    socket.on('score_update', (newScore: number) => {
      setGlobalScore(newScore);
    });

    socket.on('points_awarded', (points: number) => {
      triggerPointsAnimation(points);
    });

    socket.on('device_status', (status: { quizCompleted: boolean, quizScore: number | null }) => {
      if (status.quizCompleted) {
        setQuizCompleted(true);
        if (status.quizScore !== null) {
          setPersonalScore(status.quizScore);
          localStorage.setItem('siddhant_quiz_completed', 'true');
          localStorage.setItem('siddhant_personal_score', status.quizScore.toString());
        }
      }
    });

    socket.on('profile_update', (profile: { streak: number, badges: string[] }) => {
      setStreak(profile.streak);
      setBadges(profile.badges);
      localStorage.setItem('siddhant_streak', profile.streak.toString());
      localStorage.setItem('siddhant_badges', JSON.stringify(profile.badges));
    });

    socket.on('badges_earned', (earnedBadges: string[]) => {
      if (earnedBadges && earnedBadges.length > 0) {
        // Show the highest badge earned if multiple
        setCelebrationBadge(earnedBadges[earnedBadges.length - 1]);
        audio.playReward();
      }
    });

    return () => {
      socket.off('score_update');
      socket.off('points_awarded');
      socket.off('device_status');
      socket.off('profile_update');
      socket.off('badges_earned');
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

    const storedBadges = localStorage.getItem('siddhant_badges');
    if (storedBadges) {
      try {
        setBadges(JSON.parse(storedBadges));
      } catch (e) {}
    }

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
      } else if (diffDays > 1) {
        // Streak broken
        setStreak(1);
        setLastVisit(today);
        localStorage.setItem('siddhant_streak', '1');
        localStorage.setItem('siddhant_last_visit', today);
      }
    } else {
      // First visit
      setStreak(1);
      setLastVisit(today);
      localStorage.setItem('siddhant_streak', '1');
      localStorage.setItem('siddhant_last_visit', today);
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

  useEffect(() => {
    if (deviceId) {
      socket.emit('check_device', deviceId);
      socket.emit('claim_daily', { deviceId, userName, userIcon: userIconName });
    }
  }, [deviceId, userName, userIconName]);

  const triggerPointsAnimation = (points: number) => {
    setFloatingPoints(points);
    // The actual score update happens after animation completes
  };

  const handlePointsAnimationComplete = useCallback(() => {
    if (floatingPoints !== null) {
      setFloatingPoints(null);
      
      // Trigger meter pulse effect
      audio.playReward();
      setMeterPulse(true);
      setTimeout(() => setMeterPulse(false), 500);
    }
  }, [floatingPoints]);

  const handleQuizSubmit = (score: number) => {
    setPersonalScore(score);
    setIsQuizOpen(false);
    setQuizCompleted(true);
    localStorage.setItem('siddhant_quiz_completed', 'true');
    localStorage.setItem('siddhant_personal_score', score.toString());

    if (deviceId) {
      socket.emit('claim_quiz', { deviceId, score });
    }
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
      
      {/* User Greeting & Streak */}
      <div className="absolute top-4 left-4 z-50 flex flex-col gap-2">
        {userName && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-200/50 dark:bg-zinc-800/50 border border-zinc-300/50 dark:border-zinc-700/50 backdrop-blur-sm shadow-sm transition-all hover:bg-zinc-200 dark:hover:bg-zinc-800">
            <UserIcon className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-mono text-zinc-600 dark:text-zinc-300">
              Hi, <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{userName}</span>
            </span>
          </div>
        )}
        {streak > 0 && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 backdrop-blur-sm shadow-sm w-fit transition-all hover:bg-orange-500/20 cursor-default"
          >
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
              {streak} Day Streak
            </span>
          </motion.div>
        )}
      </div>

      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <button
          onClick={() => setIsBadgesOpen(true)}
          className="p-2 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-all hover:scale-105 active:scale-95"
          aria-label="Badges"
        >
          <Award className="w-5 h-5" />
        </button>
        <button
          onClick={() => setIsLeaderboardOpen(true)}
          className="p-2 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-all hover:scale-105 active:scale-95"
          aria-label="Leaderboard"
        >
          <Trophy className="w-5 h-5" />
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-all hover:scale-105 active:scale-95"
          aria-label="Toggle Theme"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

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
              className="p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800/50 text-zinc-400 hover:text-emerald-500 transition-all hover:scale-105 active:scale-95"
              aria-label="About Room 824"
            >
              <Info className="w-5 h-5" />
            </button>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-mono text-sm max-w-[280px] mx-auto transition-colors">
            Lets see how much u hate him. Contribute daily to be a consistent hater.
          </p>
        </motion.div>

        <div className="w-full space-y-6">
          <GlobalMeter score={globalScore} maxScore={824} pulse={meterPulse} />
          
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="flex flex-col gap-2">
              <StatCard 
                title="Daily Streak" 
                value={streak} 
                suffix="days" 
                icon={<Flame className="w-5 h-5 text-orange-400" />} 
              />
              {badges.length > 0 && (
                <button 
                  onClick={() => setIsBadgesOpen(true)}
                  className="flex flex-wrap gap-1 justify-center p-2 bg-white/60 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 rounded-xl backdrop-blur-sm hover:bg-white dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  {badges.map(badgeId => {
                    const badge = BADGE_MAP[badgeId];
                    if (!badge) return null;
                    const BadgeIcon = badge.icon;
                    return (
                      <div key={badgeId} className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg shadow-sm" title={badge.label}>
                        <BadgeIcon className={`w-4 h-4 ${badge.color}`} />
                      </div>
                    );
                  })}
                </button>
              )}
            </div>
            <div className="flex flex-col h-full">
              {!canTakeQuiz ? (
                <StatCard 
                  title="Your Score" 
                  value={personalScore!} 
                  suffix="%" 
                  icon={<Target className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />} 
                  delay={0.1}
                />
              ) : (
                <div className="h-full p-5 bg-zinc-100 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800/50 border-dashed rounded-2xl flex flex-col items-center justify-center text-center transition-colors">
                  <div className="mb-3 p-2 bg-zinc-200 dark:bg-zinc-800/30 rounded-full transition-colors">
                    <Target className="w-5 h-5 text-zinc-500 dark:text-zinc-600" />
                  </div>
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-500 uppercase tracking-wider">Score Hidden</span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-600 mt-1">Take quiz to reveal</span>
                </div>
              )}
            </div>
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
                  className="w-full group relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 text-left transition-all duration-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:-translate-y-1 hover:shadow-lg active:scale-95 shadow-sm dark:shadow-none"
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
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-95 group shadow-sm dark:shadow-none"
            >
              <div className="p-3 bg-zinc-100 dark:bg-zinc-800/50 rounded-full group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors">
                <ImageIcon className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
              </div>
              <span className="text-sm font-medium text-zinc-900 dark:text-white">Normal Images</span>
            </button>

            <button
              onClick={() => setIsMemeGalleryOpen(true)}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-95 group shadow-sm dark:shadow-none"
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
              className="w-full group relative overflow-hidden rounded-2xl bg-zinc-900 dark:bg-zinc-100 border border-zinc-800 dark:border-zinc-200 p-6 text-left transition-all duration-300 hover:bg-zinc-800 dark:hover:bg-white hover:-translate-y-1 hover:shadow-xl active:scale-95 shadow-md flex items-center justify-between"
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

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />

      <BadgesModal
        isOpen={isBadgesOpen}
        onClose={() => setIsBadgesOpen(false)}
        currentStreak={streak}
      />

      <BadgeCelebrationModal
        isOpen={!!celebrationBadge}
        onClose={() => setCelebrationBadge(null)}
        badgeId={celebrationBadge}
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
    </div>
  );
}
