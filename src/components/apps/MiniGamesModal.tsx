import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  Trophy,
  RotateCcw,
  Sparkles,
  HelpCircle,
  CheckCircle,
  XCircle,
  X,
  Play,
  Lightbulb,
  Award,
} from 'lucide-react';
import { playCabinChime } from '../../utils/cabinAudio';

interface MiniGamesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 1. TRIVIA QUESTIONS BANK
const TRIVIA_QUESTIONS = [
  {
    q: 'In which Indiana city was the legendary Studebaker automobile corporation founded and manufactured?',
    options: ['Indianapolis', 'South Bend', 'Fort Wayne', 'Elkhart'],
    correct: 1,
    category: 'Indiana History',
    funFact: 'Studebaker began as a blacksmith shop in South Bend in 1852 before building Presidential wagons and iconic classic cars.',
  },
  {
    q: 'What is the world-famous golden statue on top of the Notre Dame Main Building called?',
    options: ['The Golden Angel', 'The Golden Dome (Mary)', 'The Spirit of Flight', 'The Torch of Knowledge'],
    correct: 1,
    category: 'Notre Dame & Landmarks',
    funFact: 'The 19-foot statue of Mary atop the Golden Dome was crafted in 1886 and re-gilded in 23.9-karat gold leaf.',
  },
  {
    q: 'What is the highway nickname for Interstate 80 / 90 that traverses northern Indiana?',
    options: ['The Hoosier Express', 'The Indiana Toll Road', 'Lincoln Highway', 'Route 66 North'],
    correct: 1,
    category: 'Highway & Travel',
    funFact: 'The 157-mile Indiana Toll Road connects Chicago with the Ohio Turnpike and opened in 1956.',
  },
  {
    q: 'Which historic luxury vehicle is often nicknamed "The Standard of the World"?',
    options: ['Lincoln Continental', 'Cadillac', 'Packard', 'Rolls-Royce'],
    correct: 1,
    category: 'Automotive Heritage',
    funFact: 'Cadillac won the Dewar Trophy in 1908 for interchangeable precision parts, giving rise to "The Standard of the World".',
  },
  {
    q: 'What musical genre is known for 80s analog synthesizers, neon aesthetics, and nighttime highway cruising?',
    options: ['Synthwave / Retrowave', 'Nu-Metal', 'Dubstep', 'Bebop Jazz'],
    correct: 0,
    category: 'Music & Vibes',
    funFact: 'Synthwave draws inspiration from 1980s film soundtracks by John Carpenter and Tangerine Dream.',
  },
  {
    q: 'What famous mural on the Hesburgh Library at Notre Dame is popularly nicknamed "Touchdown Jesus"?',
    options: ['The Divine Play', 'The Word of Life', 'The Goalpost Blessing', 'The Golden Apostles'],
    correct: 1,
    category: 'Notre Dame & Landmarks',
    funFact: 'The mural titled "The Word of Life" contains 81 different kinds of stone and granite from around the world.',
  },
  {
    q: 'What is the approximate cruising speed of a standard commercial passenger airliner like a Boeing 737?',
    options: ['350 - 400 mph', '500 - 575 mph', '700 - 750 mph', '850 - 900 mph'],
    correct: 1,
    category: 'Aviation & Travel',
    funFact: 'Most commercial jetliners cruise around Mach 0.78 to 0.82 (approx 550 mph) at 35,000 feet.',
  },
  {
    q: 'What year did Cadillac introduce the iconic Escalade full-size luxury SUV?',
    options: ['1992', '1999', '2005', '2010'],
    correct: 1,
    category: 'Automotive Heritage',
    funFact: 'The Escalade debuted for the 1999 model year in response to luxury German and domestic competitors.',
  },
];

// 2. MEMORY MATCH CARDS
const MEMORY_CARDS_DATA = [
  { id: '1', symbol: '🚗', name: 'Cadillac' },
  { id: '2', symbol: '⚡', name: 'Fast Charger' },
  { id: '3', symbol: '🎵', name: 'Music' },
  { id: '4', symbol: '⭐', name: 'Five Stars' },
  { id: '5', symbol: '✈️', name: 'Airport' },
  { id: '6', symbol: '👑', name: 'Executive' },
];

// 3. WORD SCRAMBLE WORDS
const WORD_PUZZLES = [
  { word: 'CADILLAC', scrambled: 'ALCDLICA', hint: 'Iconic American luxury SUV brand' },
  { word: 'HIGHWAY', scrambled: 'YAGWHHI', hint: 'Open road for long distance travels' },
  { word: 'SILVERMYST', scrambled: 'SYMLVRTISE', hint: 'Executive passenger transportation provider' },
  { word: 'CHILLWAVE', scrambled: 'VLLEWAHCI', hint: 'Relaxing ambient electronic music vibe' },
  { word: 'NOTREDAME', scrambled: 'METNDOEAR', hint: 'Famous South Bend university with a Golden Dome' },
  { word: 'CONCIERGE', scrambled: 'CECIREONGC', hint: 'Personalized executive cabin service host' },
];

export const MiniGamesModal: React.FC<MiniGamesModalProps> = ({ isOpen, onClose }) => {
  const [activeGame, setActiveGame] = useState<'trivia' | 'memory' | 'word'>('trivia');

  // Trivia State
  const [triviaIdx, setTriviaIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [triviaScore, setTriviaScore] = useState(0);
  const [triviaAnsweredCount, setTriviaAnsweredCount] = useState(0);

  // Memory Match State
  const [memoryCards, setMemoryCards] = useState<any[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [movesCount, setMovesCount] = useState(0);

  // Word Scramble State
  const [wordIdx, setWordIdx] = useState(0);
  const [userLetters, setUserLetters] = useState<string[]>([]);
  const [availableLetters, setAvailableLetters] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [wordSolved, setWordSolved] = useState(false);

  if (!isOpen) return null;

  // Initialize Memory Match
  const initMemoryGame = () => {
    const pairs = [...MEMORY_CARDS_DATA, ...MEMORY_CARDS_DATA].map((card, i) => ({
      uniqueId: i,
      id: card.id,
      symbol: card.symbol,
      name: card.name,
    }));
    // Shuffle
    pairs.sort(() => Math.random() - 0.5);
    setMemoryCards(pairs);
    setFlippedCards([]);
    setMatchedPairs([]);
    setMovesCount(0);
  };

  // Initialize Word Scramble
  const initWordScramble = (idx: number) => {
    const current = WORD_PUZZLES[idx % WORD_PUZZLES.length];
    const letters = current.scrambled.split('');
    setAvailableLetters(letters);
    setUserLetters([]);
    setShowHint(false);
    setWordSolved(false);
  };

  useEffect(() => {
    if (activeGame === 'memory' && memoryCards.length === 0) {
      initMemoryGame();
    } else if (activeGame === 'word') {
      initWordScramble(wordIdx);
    }
  }, [activeGame]);

  // Handle Trivia Tap
  const handleTriviaOption = (optIdx: number) => {
    if (selectedAnswer !== null) return;
    playCabinChime('tap');
    setSelectedAnswer(optIdx);
    setTriviaAnsweredCount((prev) => prev + 1);

    const isCorrect = optIdx === TRIVIA_QUESTIONS[triviaIdx].correct;
    if (isCorrect) {
      playCabinChime('acknowledged');
      setTriviaScore((prev) => prev + 100);
    } else {
      playCabinChime('comfort');
    }
  };

  const handleNextTrivia = () => {
    playCabinChime('tap');
    setSelectedAnswer(null);
    setTriviaIdx((prev) => (prev + 1) % TRIVIA_QUESTIONS.length);
  };

  // Handle Memory Card Flip
  const handleCardClick = (index: number) => {
    if (flippedCards.length === 2 || flippedCards.includes(index)) return;
    const card = memoryCards[index];
    if (matchedPairs.includes(card.id)) return;

    playCabinChime('tap');
    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMovesCount((m) => m + 1);
      const first = memoryCards[newFlipped[0]];
      const second = memoryCards[newFlipped[1]];

      if (first.id === second.id) {
        playCabinChime('acknowledged');
        setMatchedPairs((prev) => [...prev, first.id]);
        setFlippedCards([]);
      } else {
        setTimeout(() => {
          setFlippedCards([]);
        }, 900);
      }
    }
  };

  // Handle Word Scramble letter tap
  const handlePickLetter = (letter: string, index: number) => {
    playCabinChime('tap');
    setUserLetters((prev) => [...prev, letter]);
    setAvailableLetters((prev) => prev.filter((_, i) => i !== index));

    // Check if word completed
    const currentWord = WORD_PUZZLES[wordIdx % WORD_PUZZLES.length].word;
    const nextUserWord = [...userLetters, letter].join('');
    if (nextUserWord.length === currentWord.length) {
      if (nextUserWord === currentWord) {
        playCabinChime('acknowledged');
        setWordSolved(true);
      } else {
        playCabinChime('comfort');
      }
    }
  };

  const handleResetLetters = () => {
    playCabinChime('tap');
    initWordScramble(wordIdx);
  };

  const handleNextWord = () => {
    playCabinChime('tap');
    const next = (wordIdx + 1) % WORD_PUZZLES.length;
    setWordIdx(next);
    initWordScramble(next);
  };

  const currentQ = TRIVIA_QUESTIONS[triviaIdx];
  const currentPuzzle = WORD_PUZZLES[wordIdx % WORD_PUZZLES.length];

  return (
    <div
      onClick={() => {
        playCabinChime('tap');
        onClose();
      }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[92vh] bg-slate-950 text-white rounded-3xl border border-indigo-500/40 shadow-[0_0_50px_rgba(99,102,241,0.2)] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 border-b border-indigo-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Cabin Arcade & Trivia</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Touchscreen Games
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Lightweight, touchscreen games designed for comfortable highway riding.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playCabinChime('tap');
              onClose();
            }}
            className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Game Switcher Tabs */}
        <div className="px-5 py-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {[
              { id: 'trivia', label: 'Cabin Trivia 🧠' },
              { id: 'memory', label: 'Memory Match 🃏' },
              { id: 'word', label: 'Word Puzzle 🔠' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  playCabinChime('tap');
                  setActiveGame(tab.id as any);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeGame === tab.id
                    ? 'bg-indigo-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeGame === 'trivia' && (
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Score: {triviaScore} pts</span>
            </div>
          )}

          {activeGame === 'memory' && (
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>Moves: <strong className="text-white">{movesCount}</strong></span>
              <span>Matched: <strong className="text-emerald-400">{matchedPairs.length}/6</strong></span>
            </div>
          )}
        </div>

        {/* Game Viewport */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col justify-center">
          {/* GAME 1: CABIN TRIVIA */}
          {activeGame === 'trivia' && (
            <div className="max-w-xl mx-auto w-full space-y-5 animate-fade-in">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-900/40 text-indigo-300 border border-indigo-700/40 font-bold">
                  {currentQ.category}
                </span>
                <span>Question {triviaIdx + 1} of {TRIVIA_QUESTIONS.length}</span>
              </div>

              {/* Question card */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
                <h4 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                  {currentQ.q}
                </h4>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentQ.options.map((opt, i) => {
                  const isChosen = selectedAnswer === i;
                  const isCorrect = i === currentQ.correct;
                  let btnStyle = 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-200';

                  if (selectedAnswer !== null) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-950/70 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/30';
                    } else if (isChosen) {
                      btnStyle = 'bg-rose-950/70 border-rose-500 text-rose-200 ring-2 ring-rose-500/30';
                    } else {
                      btnStyle = 'bg-slate-900/40 border-slate-800/60 text-slate-500';
                    }
                  }

                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={selectedAnswer !== null}
                      onClick={() => handleTriviaOption(i)}
                      className={`p-3.5 rounded-2xl border text-sm font-bold text-left flex items-center justify-between transition-all cursor-pointer ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {selectedAnswer !== null && (
                        <span>
                          {isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                          ) : isChosen ? (
                            <XCircle className="w-5 h-5 text-rose-400" />
                          ) : null}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Fun Fact reveal & Next button */}
              {selectedAnswer !== null && (
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-200 space-y-2 animate-fade-in">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-300">
                    <Lightbulb className="w-4 h-4 text-amber-300" />
                    <span>Did You Know?</span>
                  </div>
                  <p className="leading-relaxed">{currentQ.funFact}</p>
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleNextTrivia}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Next Question</span>
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* GAME 2: MEMORY MATCH */}
          {activeGame === 'memory' && (
            <div className="max-w-xl mx-auto w-full space-y-4 animate-fade-in">
              {matchedPairs.length === 6 ? (
                <div className="p-8 text-center space-y-4 bg-emerald-950/40 border border-emerald-500/40 rounded-3xl animate-fade-in">
                  <Award className="w-16 h-16 text-emerald-400 mx-auto" />
                  <h4 className="text-2xl font-black text-white">All Pairs Matched! 🎉</h4>
                  <p className="text-xs text-slate-300">
                    You cleared the cabin memory grid in <strong>{movesCount}</strong> moves!
                  </p>
                  <button
                    onClick={initMemoryGame}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Play Again
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {memoryCards.map((card, idx) => {
                    const isFlipped = flippedCards.includes(idx) || matchedPairs.includes(card.id);
                    const isMatched = matchedPairs.includes(card.id);

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleCardClick(idx)}
                        className={`h-24 sm:h-28 rounded-2xl border flex flex-col items-center justify-center text-3xl sm:text-4xl transition-all duration-300 cursor-pointer ${
                          isMatched
                            ? 'bg-emerald-900/30 border-emerald-500/50 scale-95 opacity-80'
                            : isFlipped
                            ? 'bg-indigo-900/50 border-indigo-400 ring-2 ring-indigo-400/30 shadow-lg'
                            : 'bg-slate-900 hover:bg-slate-800 border-slate-800'
                        }`}
                      >
                        {isFlipped ? (
                          <div className="flex flex-col items-center gap-1">
                            <span>{card.symbol}</span>
                            <span className="text-[10px] font-bold text-slate-300 uppercase">{card.name}</span>
                          </div>
                        ) : (
                          <span className="text-xl font-bold text-slate-600">★</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="pt-2 flex justify-center">
                <button
                  onClick={initMemoryGame}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restart Cards</span>
                </button>
              </div>
            </div>
          )}

          {/* GAME 3: WORD SCRAMBLE */}
          {activeGame === 'word' && (
            <div className="max-w-md mx-auto w-full space-y-5 text-center animate-fade-in">
              <div className="space-y-1">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  Automotive & Travel Scramble
                </span>
                <h4 className="text-sm text-slate-400">
                  Unscramble the letters to reveal the hidden word.
                </h4>
              </div>

              {/* Solved celebration or target slots */}
              {wordSolved ? (
                <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-3 animate-fade-in">
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
                  <div className="text-xl font-black text-white">{currentPuzzle.word}</div>
                  <p className="text-xs text-emerald-300">Correct! Excellent highway puzzle solving.</p>
                  <button
                    onClick={handleNextWord}
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors cursor-pointer"
                  >
                    Next Word
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* User Answer Display */}
                  <div className="flex justify-center gap-2 min-h-[50px] items-center">
                    {Array.from({ length: currentPuzzle.word.length }).map((_, i) => {
                      const letter = userLetters[i];
                      return (
                        <div
                          key={i}
                          className={`w-10 h-12 sm:w-12 sm:h-14 rounded-xl border-2 flex items-center justify-center font-black text-lg transition-all ${
                            letter
                              ? 'bg-indigo-900/50 border-indigo-500 text-white shadow-md'
                              : 'bg-slate-900/60 border-slate-800 text-transparent'
                          }`}
                        >
                          {letter || ''}
                        </div>
                      );
                    })}
                  </div>

                  {/* Scrambled Letter Bank */}
                  <div className="flex flex-wrap justify-center gap-2 pt-2">
                    {availableLetters.map((letter, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handlePickLetter(letter, i)}
                        className="w-11 h-12 rounded-xl bg-slate-900 hover:bg-indigo-900/50 border border-slate-800 hover:border-indigo-500/60 font-black text-base text-white flex items-center justify-center shadow-sm cursor-pointer active:scale-95 transition-all"
                      >
                        {letter}
                      </button>
                    ))}
                  </div>

                  {/* Hint & Reset */}
                  <div className="pt-2 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowHint((prev) => !prev)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-amber-300 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetLetters}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  </div>

                  {showHint && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                      Hint: {currentPuzzle.hint}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
