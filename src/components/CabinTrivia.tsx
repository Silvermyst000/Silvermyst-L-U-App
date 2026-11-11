import React, { useState } from 'react';
import { HelpCircle, CheckCircle, XCircle, RotateCcw, Trophy, Award } from 'lucide-react';
import { playCabinChime } from '../utils/cabinAudio';

interface TriviaQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  funFact: string;
}

const TRIVIA_SET: TriviaQuestion[] = [
  {
    question: 'Which instrument has 88 keys and covers the entire acoustic orchestra range?',
    options: ['Grand Piano', 'Harp', 'Pipe Organ', 'Harpsichord'],
    correctIndex: 0,
    funFact: 'A standard piano has 52 white keys and 36 black keys!',
  },
  {
    question: 'Authentic Neapolitan pizza was originally awarded UNESCO World Heritage status in which Italian city?',
    options: ['Rome', 'Naples', 'Milan', 'Florence'],
    correctIndex: 1,
    funFact: 'Traditional Neapolitan pizza dough is made with only 4 ingredients: flour, water, yeast, and salt.',
  },
  {
    question: 'What is the fastest commercial passenger aircraft currently in airline history?',
    options: ['Boeing 747', 'Concorde', 'Airbus A380', 'SR-71'],
    correctIndex: 1,
    funFact: 'The Concorde could fly from New York to London in under 3.5 hours at Mach 2.04!',
  },
  {
    question: 'What country is the world origin of the Arabica coffee plant?',
    options: ['Brazil', 'Colombia', 'Ethiopia', 'Vietnam'],
    correctIndex: 2,
    funFact: 'According to legend, a 9th-century Ethiopian goat herder named Kaldi first noticed coffee berries!',
  },
  {
    question: 'Which city has the longest subway network in the world by route length?',
    options: ['New York City', 'Tokyo', 'Beijing', 'London'],
    correctIndex: 2,
    funFact: 'Beijing Subway spans over 500 miles of active rapid transit tracks!',
  },
];

export const CabinTrivia: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  const q = TRIVIA_SET[currentIndex];
  const isAnswered = selectedOption !== null;
  const isCorrect = selectedOption === q.correctIndex;

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setAnsweredCount((prev) => prev + 1);

    if (idx === q.correctIndex) {
      setScore((s) => s + 1);
      playCabinChime('acknowledged');
    } else {
      playCabinChime('tap');
    }
  };

  const handleNext = () => {
    playCabinChime('tap');
    setSelectedOption(null);
    setCurrentIndex((prev) => (prev + 1) % TRIVIA_SET.length);
  };

  const handleReset = () => {
    playCabinChime('tap');
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setAnsweredCount(0);
  };

  return (
    <div className="flex flex-col h-full space-y-3.5">
      {/* Trivia Header & Score */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-display">
            In-Cabin Quick Trivia
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="tabular-nums font-semibold text-slate-800 dark:text-slate-200">
            Score: {score} / {answeredCount}
          </span>
          <button
            onClick={handleReset}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            title="Reset Quiz"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Question Card */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="flex items-start gap-2.5">
          <span className="w-6 h-6 rounded-full bg-sky-500/10 text-sky-500 dark:text-sky-400 text-xs font-bold flex items-center justify-center shrink-0">
            Q{currentIndex + 1}
          </span>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
            {q.question}
          </h4>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {q.options.map((opt, idx) => {
            let btnStyle = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-sky-500';

            if (isAnswered) {
              if (idx === q.correctIndex) {
                btnStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold';
              } else if (idx === selectedOption) {
                btnStyle = 'bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300 font-semibold';
              } else {
                btnStyle = 'opacity-50 border-slate-200 dark:border-slate-800';
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelect(idx)}
                className={`p-3 rounded-xl border text-xs font-medium text-left transition-all cursor-pointer min-h-[46px] flex items-center justify-between ${btnStyle}`}
              >
                <span className="truncate pr-1">{opt}</span>
                {isAnswered && idx === q.correctIndex && (
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                )}
                {isAnswered && idx === selectedOption && idx !== q.correctIndex && (
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback / Fun Fact */}
        {isAnswered && (
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 animate-fadeIn space-y-2">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-sky-600 dark:text-sky-400">Did you know? </span>
              {q.funFact}
            </p>
            <button
              onClick={handleNext}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 text-xs font-bold tracking-tight transition-colors cursor-pointer"
            >
              Next Question →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
