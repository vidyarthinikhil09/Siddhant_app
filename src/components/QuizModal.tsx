import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, ArrowRight } from 'lucide-react';
import { audio } from '../utils/audio';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (score: number) => void;
}

const QUESTIONS = [
  {
    id: 1,
    question: "How often does Siddhant show up to class?",
    options: ["Always", "Sometimes", "Rarely", "Only when the canteen is closed"],
    correct: 1
  },
  {
    id: 2,
    question: "What's Siddhant's favorite spot in the world?",
    options: ["Library", "Classroom", "Gym", "His bed (24/7 throne)"],
    correct: 3
  },
  {
    id: 3,
    question: "How does Siddhant treat his friends?",
    options: ["Very kindly", "Neutral", "Sometimes annoying", "Like background characters in his movie"],
    correct: 2
  },
  {
    id: 4,
    question: "What gets Siddhant out of bed fastest?",
    options: ["Alarm clock", "College attendance", "Friends calling", "Smell of samosas"],
    correct: 3
  },
  {
    id: 5,
    question: "How do people generally feel about Siddhant?",
    options: ["Love him", "Tolerate him", "Secretly dislike him", "Openly roast him"],
    correct: 2
  },
  {
    id: 6,
    question: "How much effort does Siddhant put into anything?",
    options: ["Maximum", "Moderate", "Minimum", "Negative effort (avoids everything)"],
    correct: 3
  },
  {
    id: 7,
    question: "How does Siddhant behave in groups?",
    options: ["Supportive", "Quiet", "Loud", "Annoyingly dramatic"],
    correct: 3
  },
  {
    id: 8,
    question: "What's Siddhant's go-to excuse for missing class?",
    options: ["“Was sick”", "“Overslept”", "“Had work”", "“Bed wouldn't let me go”"],
    correct: 3
  },
  {
    id: 9,
    question: "Siddhant has many friends, but…",
    options: ["Everyone loves him", "Some tolerate him", "Many dislike him", "Most roast him daily"],
    correct: 2
  },
  {
    id: 10,
    question: "Where will Siddhant be found 10 years later?",
    options: ["Office desk", "Gym", "Traveling the world", "Same bed, same blanket"],
    correct: 3
  }
];

export function QuizModal({ isOpen, onClose, onSubmit }: QuizModalProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (isOpen) {
      audio.playDrone();
    } else {
      audio.stopDrone();
    }
    return () => audio.stopDrone();
  }, [isOpen]);

  const handleSelect = (index: number) => {
    if (index === QUESTIONS[currentQuestion].correct) {
      audio.playSuccess();
    } else {
      audio.playFailure();
    }
    
    const newAnswers = [...answers, index];
    setAnswers(newAnswers);

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate score
      let correctCount = 0;
      newAnswers.forEach((ans, i) => {
        if (ans === QUESTIONS[i].correct) correctCount++;
      });
      const finalScore = (correctCount / QUESTIONS.length) * 100;
      setShowResult(true);
      
      audio.stopDrone();
      audio.playReward();
      
      // Delay closing to show result
      setTimeout(() => {
        onSubmit(finalScore);
      }, 2500);
    }
  };

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
          className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden relative shadow-2xl transition-colors"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800/50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6">
            {!showResult ? (
              <>
                <div className="mb-8 mt-4">
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-500 mb-2 block">
                    QUESTION {currentQuestion + 1} OF {QUESTIONS.length}
                  </span>
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
                    {QUESTIONS[currentQuestion].question}
                  </h3>
                </div>

                <div className="space-y-3">
                  {QUESTIONS[currentQuestion].options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      className="w-full text-left p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors flex items-center justify-between group"
                    >
                      <span className="text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                        {option}
                      </span>
                      <ArrowRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center"
              >
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Quiz Complete!</h3>
                <p className="text-zinc-500 dark:text-zinc-400 font-mono text-sm">
                  Calculating your contribution...
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
