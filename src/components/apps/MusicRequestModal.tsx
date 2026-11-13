import React, { useState } from 'react';
import {
  Music,
  Send,
  X,
  Play,
  CheckCircle,
  ExternalLink,
  Search,
  Sparkles,
  Radio,
  Clock,
  ListMusic,
} from 'lucide-react';
import { SongRequest } from '../../types/kiosk';
import { playCabinChime } from '../../utils/cabinAudio';
import { openExternalUrl } from '../../utils/appLauncher';

interface MusicRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSongRequest: (req: Omit<SongRequest, 'id' | 'requestedAt' | 'status'>) => void;
  existingRequests?: SongRequest[];
  driverName?: string;
}

export const MusicRequestModal: React.FC<MusicRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmitSongRequest,
  existingRequests = [],
  driverName = 'Carlos',
}) => {
  const [activeTab, setActiveTab] = useState<'request' | 'queue'>('request');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('Top Hits');
  const [note, setNote] = useState('');
  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  const quickPills = [
    { title: 'Blinding Lights', artist: 'The Weeknd', genre: 'Synthwave / Pop' },
    { title: 'Midnight City', artist: 'M83', genre: 'Chillwave' },
    { title: 'Fly Me to the Moon', artist: 'Frank Sinatra', genre: 'Jazz Classics' },
    { title: 'Starboy', artist: 'The Weeknd ft. Daft Punk', genre: 'Electro / R&B' },
    { title: 'As It Was', artist: 'Harry Styles', genre: 'Pop / Indie' },
    { title: 'Hotel California', artist: 'Eagles', genre: 'Classic Rock' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    playCabinChime('acknowledged');
    onSubmitSongRequest({
      title: title.trim(),
      artist: artist.trim() || 'Passenger Choice',
      genre,
      note: note.trim() || undefined,
    });

    setIsSent(true);
    setTimeout(() => {
      setTitle('');
      setArtist('');
      setNote('');
      setIsSent(false);
      setActiveTab('queue');
    }, 1200);
  };

  const handleSelectQuick = (item: { title: string; artist: string; genre: string }) => {
    playCabinChime('tap');
    setTitle(item.title);
    setArtist(item.artist);
    setGenre(item.genre);
  };

  const handleLaunchSpotify = () => {
    playCabinChime('tap');
    // Try opening Spotify Android App via URI intent or fallback to web
    const isAndroid = /android/i.test(navigator.userAgent);
    if (isAndroid) {
      window.location.href = 'intent:#Intent;package=com.spotify.music;end';
      setTimeout(() => {
        openExternalUrl('https://open.spotify.com');
      }, 750);
    } else {
      openExternalUrl('https://open.spotify.com');
    }
  };

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
        className="w-full max-w-2xl max-h-[92vh] bg-slate-950 text-white rounded-3xl border border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.2)] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border-b border-emerald-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
              <Music className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Music Request Center</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Spotify Sync
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Pick your soundtrack for today's drive with {driverName}.
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

        {/* Tab Controls & Spotify App Launcher Banner */}
        <div className="px-5 py-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playCabinChime('tap');
                setActiveTab('request');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'request'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Request a Track
            </button>
            <button
              onClick={() => {
                playCabinChime('tap');
                setActiveTab('queue');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'queue'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>Cabin Queue</span>
              {existingRequests.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-slate-950 text-white text-[10px]">
                  {existingRequests.length}
                </span>
              )}
            </button>
          </div>

          {/* Launch Spotify button */}
          <button
            onClick={handleLaunchSpotify}
            className="px-3 py-1.5 rounded-xl bg-[#1db954]/20 hover:bg-[#1db954]/30 border border-[#1db954]/40 text-[#1db954] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Launch Spotify on this Tablet"
          >
            <Play className="w-3.5 h-3.5 fill-[#1db954]" />
            <span>Open Spotify App</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {activeTab === 'request' ? (
            <div className="space-y-5">
              {isSent ? (
                <div className="p-8 text-center space-y-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl animate-fade-in">
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h4 className="text-lg font-extrabold text-white">Song Request Sent!</h4>
                  <p className="text-xs text-slate-300">
                    "{title}" has been sent to {driverName}'s console queue.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Quick Suggestions */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Popular In-Cabin Highway Picks (Tap to Fill)</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {quickPills.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectQuick(item)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-emerald-900/40 border border-slate-800 hover:border-emerald-500/50 text-[11px] text-slate-300 hover:text-white transition-all cursor-pointer"
                        >
                          {item.title} • {item.artist}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Song Title *</label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Save Your Tears"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Artist or Band</label>
                      <input
                        type="text"
                        value={artist}
                        onChange={(e) => setArtist(e.target.value)}
                        placeholder="e.g. The Weeknd"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Genre / Vibe</label>
                      <select
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Top Hits">Top Hits / Pop</option>
                        <option value="Synthwave / Electronic">Synthwave / Electronic</option>
                        <option value="Hip-Hop / R&B">Hip-Hop / R&B</option>
                        <option value="Smooth Jazz / Lo-Fi">Smooth Jazz / Lo-Fi</option>
                        <option value="Latin / Reggaeton">Latin / Reggaeton</option>
                        <option value="Classic Rock">Classic Rock / 80s</option>
                        <option value="Country">Country Hits</option>
                        <option value="Classical / Instrumental">Classical / Ambient</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Optional Dedication / Note</label>
                      <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="e.g. Heading to Notre Dame football game!"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/30 active:scale-98 transition-all cursor-pointer"
                    >
                      <Send className="w-4 h-4 text-slate-950" />
                      <span>Send Song Request</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* Queue tab */
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-400">Current Trip Playlist Queue</span>
                <span className="text-xs text-emerald-400 font-bold">{existingRequests.length} Requested</span>
              </div>

              {existingRequests.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No song requests currently queued. Be the first to pick a track!
                </div>
              ) : (
                <div className="space-y-2">
                  {existingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                          <Music className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{req.title}</div>
                          <div className="text-xs text-slate-400">
                            {req.artist} • <span className="text-slate-500">{req.genre}</span>
                            {req.note && <span className="text-emerald-400 ml-1.5 font-medium">"{req.note}"</span>}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {req.status === 'playing' ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 animate-pulse">
                            <Radio className="w-3 h-3 text-emerald-400" />
                            <span>Playing</span>
                          </span>
                        ) : req.status === 'accepted' ? (
                          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
                            Accepted
                          </span>
                        ) : req.status === 'completed' ? (
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold">
                            Completed
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
