import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Music,
  PlusCircle,
  Radio,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { PlaylistTrack, SongRequest } from '../types/kiosk';
import { playCabinChime, cabinSynth } from '../utils/cabinAudio';

interface MusicJukeboxProps {
  tracks: PlaylistTrack[];
  currentTrackIndex: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  songRequests: SongRequest[];
  onSubmitSongRequest: (request: Omit<SongRequest, 'id' | 'requestedAt' | 'status'>) => void;
}

export const MusicJukebox: React.FC<MusicJukeboxProps> = ({
  tracks,
  currentTrackIndex,
  isPlaying,
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  songRequests,
  onSubmitSongRequest,
}) => {
  const currentTrack = tracks[currentTrackIndex] || tracks[0];
  const [volume, setVolume] = useState<number>(0.6);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [elapsedSec, setElapsedSec] = useState<number>(38);
  const [showRequestModal, setShowRequestModal] = useState<boolean>(false);

  // Form state for song request
  const [reqTitle, setReqTitle] = useState('');
  const [reqArtist, setReqArtist] = useState('');
  const [reqGenre, setReqGenre] = useState('Pop / Top 40');
  const [reqNote, setReqNote] = useState('');
  const [submittedFeedback, setSubmittedFeedback] = useState(false);

  // Sync ambient synthesizer volume and play state
  useEffect(() => {
    if (isPlaying && !isMuted) {
      cabinSynth.setStyle(currentTrack.synthesizedWave || 'ambient');
      cabinSynth.setVolume(volume);
      cabinSynth.start();
    } else {
      cabinSynth.stop();
    }
  }, [isPlaying, isMuted, currentTrack, volume]);

  useEffect(() => {
    let interval: number;
    if (isPlaying) {
      interval = window.setInterval(() => {
        setElapsedSec((prev) => {
          if (prev >= currentTrack.duration) {
            onNextTrack();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack, onNextTrack]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val === 0) setIsMuted(true);
    else setIsMuted(false);
    cabinSynth.setVolume(val);
  };

  const toggleMute = () => {
    playCabinChime('tap');
    if (isMuted) {
      setIsMuted(false);
      cabinSynth.setVolume(volume);
    } else {
      setIsMuted(true);
      cabinSynth.setVolume(0);
    }
  };

  const handleQuickMood = (vibeName: string, wave: 'ambient' | 'chill' | 'lofi' | 'smooth' | 'jazz') => {
    playCabinChime('tap');
    cabinSynth.setStyle(wave);
    if (!isPlaying) {
      onTogglePlay();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle.trim()) return;

    onSubmitSongRequest({
      title: reqTitle.trim(),
      artist: reqArtist.trim() || 'Various Artists',
      genre: reqGenre,
      note: reqNote.trim() || undefined,
    });

    playCabinChime('song');
    setSubmittedFeedback(true);
    setReqTitle('');
    setReqArtist('');
    setReqNote('');

    setTimeout(() => {
      setSubmittedFeedback(false);
      setShowRequestModal(false);
    }, 1800);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Current Playing Deck Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 shadow-sm relative overflow-hidden">
        {/* Soft background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-3 relative z-10">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-sky-400 animate-pulse" />
            <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">
              Cabin Jukebox
            </span>
          </div>
          <span className="text-xs text-sky-400 font-medium px-2 py-0.5 rounded-full bg-sky-950/70 border border-sky-800/60">
            {currentTrack.genre}
          </span>
        </div>

        {/* Track Info & Visualizer */}
        <div className="flex items-center gap-4 mb-4 relative z-10">
          <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center shrink-0 relative overflow-hidden shadow-inner">
            <Music className="w-8 h-8 text-sky-400/80" />
            {isPlaying && (
              <div className="absolute inset-0 bg-sky-500/10 flex items-end justify-center gap-1 pb-1">
                <span className="w-1 h-5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-8 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-4 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="w-1 h-6 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-base font-bold text-white truncate tracking-tight font-display">
              {currentTrack.title}
            </h4>
            <p className="text-xs text-slate-300 truncate mt-0.5">
              {currentTrack.artist}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1.5">
              <span>{currentTrack.vibe}</span>
              <span>·</span>
              <span className="tabular-nums">{currentTrack.bpm} BPM</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1 relative z-10">
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-sky-400 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (elapsedSec / currentTrack.duration) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 tabular-nums">
            <span>{formatTime(elapsedSec)}</span>
            <span>{formatTime(currentTrack.duration)}</span>
          </div>
        </div>

        {/* Playback Controls & Volume */}
        <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-800/80 relative z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playCabinChime('tap');
                onPrevTrack();
              }}
              className="p-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Previous track"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                playCabinChime('tap');
                onTogglePlay();
              }}
              className="w-11 h-11 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold flex items-center justify-center shadow-md shadow-sky-500/20 active:scale-95 transition-all cursor-pointer"
              aria-label={isPlaying ? 'Pause music' : 'Play music'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            <button
              onClick={() => {
                playCabinChime('tap');
                onNextTrack();
              }}
              className="p-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Next track"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-slate-400 hover:text-white transition-colors p-1"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              aria-label="Volume slider"
            />
          </div>
        </div>
      </div>

      {/* Action Row: Request Song CTA & Mood Presets */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => {
            playCabinChime('tap');
            setShowRequestModal(true);
          }}
          className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-semibold text-xs tracking-tight transition-all shadow-sm cursor-pointer min-h-[48px]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Request a Song / Artist</span>
        </button>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <button
            onClick={() => handleQuickMood('Jazz', 'jazz')}
            className="flex-1 py-1.5 px-2 text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-center truncate"
          >
            Jazz
          </button>
          <button
            onClick={() => handleQuickMood('LoFi', 'lofi')}
            className="flex-1 py-1.5 px-2 text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-center truncate"
          >
            Lo-Fi
          </button>
          <button
            onClick={() => handleQuickMood('Acoustic', 'ambient')}
            className="flex-1 py-1.5 px-2 text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-center truncate"
          >
            Chill
          </button>
        </div>
      </div>

      {/* Song Request Modal / Bottom Sheet */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white font-display">
                  Request a Song for Carlos
                </h3>
              </div>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-2 py-1 rounded-md"
              >
                Close
              </button>
            </div>

            {submittedFeedback ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto animate-bounce" />
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Request Sent to Carlos!
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Carlos will queue your track right up in the cabin sound system.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Song Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={reqTitle}
                    onChange={(e) => setReqTitle(e.target.value)}
                    placeholder="e.g. Hotel California, Blinding Lights..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Artist
                    </label>
                    <input
                      type="text"
                      value={reqArtist}
                      onChange={(e) => setReqArtist(e.target.value)}
                      placeholder="e.g. Eagles, The Weeknd"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Genre / Mood
                    </label>
                    <select
                      value={reqGenre}
                      onChange={(e) => setReqGenre(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                    >
                      <option>Pop / Top 40</option>
                      <option>Classic Rock</option>
                      <option>Hip-Hop / R&B</option>
                      <option>Latin / Reggaeton</option>
                      <option>Smooth Jazz</option>
                      <option>Country</option>
                      <option>Lo-Fi / Instrumental</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Note for Carlos (optional)
                  </label>
                  <input
                    type="text"
                    value={reqNote}
                    onChange={(e) => setReqNote(e.target.value)}
                    placeholder="e.g. Quiet volume please, or It is my birthday!"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs tracking-tight transition-colors shadow-sm cursor-pointer mt-2"
                >
                  Send Request to Driver
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Passenger Request Status Feed (if any requests made) */}
      {songRequests.length > 0 && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
            <span>Recent Cabin Song Requests</span>
            <span className="tabular-nums">{songRequests.length} in queue</span>
          </div>
          <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
            {songRequests.slice(0, 3).map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/60 text-xs"
              >
                <div className="min-w-0 pr-2">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {req.title}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {req.artist} · {req.genre}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                  <Clock className="w-3 h-3" />
                  <span>{req.status === 'playing' ? 'Now Playing' : req.status === 'accepted' ? 'Accepted' : 'In Driver Queue'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
