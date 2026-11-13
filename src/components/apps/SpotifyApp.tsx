import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Search,
  ExternalLink,
  Volume2,
  ListMusic,
  Sparkles,
  PlusCircle,
} from 'lucide-react';
import { playCabinChime, cabinSynth } from '../../utils/cabinAudio';
import { openExternalUrl } from '../../utils/appLauncher';
import { SongRequest } from '../../types/kiosk';

interface SpotifyAppProps {
  onSongRequest: (req: Omit<SongRequest, 'id' | 'requestedAt' | 'status'>) => void;
}

interface SpotifyTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  coverColor: string;
  style: 'ambient' | 'chill' | 'lofi' | 'smooth' | 'jazz';
}

const SPOTIFY_PLAYLISTS: { name: string; tag: string; tracks: SpotifyTrack[] }[] = [
  {
    name: 'Executive Cabin Chill',
    tag: 'Official Silvermyst Mix',
    tracks: [
      { id: 'sp1', title: 'Midnight Drive Lo-Fi', artist: 'Kavinsky & Lofi Sleep', album: 'Nightfall Sessions', duration: '3:24', coverColor: 'from-emerald-700 to-slate-900', style: 'lofi' },
      { id: 'sp2', title: 'Sunset Boulevard Sax', artist: 'Miles Horizon', album: 'Blue Neon 2026', duration: '4:12', coverColor: 'from-teal-800 to-slate-900', style: 'jazz' },
      { id: 'sp3', title: 'Pacific Coastline Ambient', artist: 'Aero Lounge', album: 'Highway Reverie', duration: '3:45', coverColor: 'from-sky-700 to-slate-900', style: 'ambient' },
      { id: 'sp4', title: 'Velvet Raindrops', artist: 'Quiet Cabin Ensemble', album: 'Executive Comfort', duration: '2:58', coverColor: 'from-indigo-800 to-slate-900', style: 'smooth' },
    ],
  },
  {
    name: 'Top Hits & Upbeat Vibes',
    tag: 'Global Trending',
    tracks: [
      { id: 'sp5', title: 'Blinding Horizons', artist: 'The Weekend Beats', album: 'Neon After Hours', duration: '3:20', coverColor: 'from-rose-800 to-slate-900', style: 'chill' },
      { id: 'sp6', title: 'Espresso Morning Cortado', artist: 'Sabrina Coffee Grooves', album: 'Summer Drive', duration: '3:05', coverColor: 'from-amber-700 to-slate-900', style: 'smooth' },
      { id: 'sp7', title: 'Golden Hour Symphony', artist: 'Coldplay & Avicii Club', album: 'Sky Full of Lights', duration: '4:15', coverColor: 'from-cyan-800 to-slate-900', style: 'ambient' },
    ],
  },
  {
    name: 'Latin Groove & Sunshine',
    tag: 'Carlos Curated',
    tracks: [
      { id: 'sp8', title: 'Bailando en la Ciudad', artist: 'Sonora Sunset', album: 'Havana Nights', duration: '3:32', coverColor: 'from-orange-700 to-slate-900', style: 'smooth' },
      { id: 'sp9', title: 'Cali Salsa Clásica', artist: 'Grupo Niche Tribute', album: 'Ritmo & Pasión', duration: '4:08', coverColor: 'from-red-800 to-slate-900', style: 'jazz' },
    ],
  },
];

export const SpotifyApp: React.FC<SpotifyAppProps> = ({ onSongRequest }) => {
  const [selectedPlaylistIndex, setSelectedPlaylistIndex] = useState(0);
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack>(SPOTIFY_PLAYLISTS[0].tracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customRequestInput, setCustomRequestInput] = useState('');
  const [requestNotice, setRequestNotice] = useState<string | null>(null);

  const activePlaylist = SPOTIFY_PLAYLISTS[selectedPlaylistIndex];

  const handlePlayTrack = (track: SpotifyTrack) => {
    playCabinChime('tap');
    setCurrentTrack(track);
    setIsPlaying(true);
    cabinSynth.setStyle(track.style);
    cabinSynth.setVolume(0.5);
    cabinSynth.start();
  };

  const handleTogglePlay = () => {
    playCabinChime('tap');
    if (isPlaying) {
      setIsPlaying(false);
      cabinSynth.stop();
    } else {
      setIsPlaying(true);
      cabinSynth.setStyle(currentTrack.style);
      cabinSynth.setVolume(0.5);
      cabinSynth.start();
    }
  };

  const handleLaunchSpotify = () => {
    playCabinChime('tap');
    // Try opening Spotify Android intent, fallback to web Spotify
    const isAndroid = /android/i.test(navigator.userAgent);
    if (isAndroid) {
      window.location.href = 'spotify:';
    } else {
      openExternalUrl('https://open.spotify.com');
    }
  };

  const handleQuickRequest = (trackTitle: string, artist: string) => {
    playCabinChime('song');
    onSongRequest({
      title: trackTitle,
      artist: artist,
      genre: 'Spotify In-Ride Selection',
      note: 'Requested via Spotify App Hub',
    });
    setRequestNotice(`Queued "${trackTitle}" for Carlos!`);
    setTimeout(() => setRequestNotice(null), 3000);
  };

  const handleCustomRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRequestInput.trim()) return;

    playCabinChime('song');
    onSongRequest({
      title: customRequestInput.trim(),
      artist: 'Spotify Catalog',
      genre: 'Passenger Request',
    });
    setRequestNotice(`Sent "${customRequestInput}" to Carlos!`);
    setCustomRequestInput('');
    setTimeout(() => setRequestNotice(null), 3000);
  };

  const filteredTracks = searchQuery.trim()
    ? SPOTIFY_PLAYLISTS.flatMap((p) => p.tracks).filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.artist.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : activePlaylist.tracks;

  return (
    <div className="flex flex-col h-full space-y-3.5 bg-slate-950 text-white rounded-2xl p-4 border border-slate-800 overflow-hidden">
      {/* Spotify App Header with Android Store / App Launcher */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          {/* Spotify Green Logo Icon */}
          <div className="w-8 h-8 rounded-full bg-[#1db954] flex items-center justify-center shadow-md shadow-[#1db954]/20">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-slate-950">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.31c-.218.357-.68.472-1.037.254-2.842-1.737-6.42-2.13-10.635-1.168-.408.094-.813-.16-.906-.568-.094-.407.16-.812.568-.906 4.622-1.056 8.587-.613 11.756 1.35.357.218.473.68.254 1.038zm1.47-3.26c-.274.446-.86.588-1.305.314-3.253-2-8.214-2.58-12.062-1.41-.5.152-1.032-.132-1.184-.633-.153-.5.132-1.032.633-1.184 4.41-1.338 9.882-.693 13.604 1.608.446.274.588.86.314 1.305zm.126-3.41c-3.902-2.317-10.334-2.53-14.062-1.397-.598.182-1.233-.157-1.415-.755-.182-.598.157-1.233.755-1.415 4.29-1.302 11.392-1.045 15.875 1.616.538.318.714 1.018.396 1.556-.318.538-1.018.714-1.556.396z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-white font-display">
              Spotify In-Cabin
            </h3>
            <p className="text-[10px] text-slate-400">
              Synced to Vehicle Audio • Android App
            </p>
          </div>
        </div>

        {/* Open in Spotify App CTA */}
        <button
          onClick={handleLaunchSpotify}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-slate-950 font-bold text-xs tracking-tight transition-all active:scale-95 cursor-pointer shadow-sm"
          title="Open Spotify application on tablet"
        >
          <span>Open Spotify App</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Playlist Selector Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
        {SPOTIFY_PLAYLISTS.map((pl, idx) => (
          <button
            key={pl.name}
            onClick={() => {
              playCabinChime('tap');
              setSelectedPlaylistIndex(idx);
              setSearchQuery('');
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedPlaylistIndex === idx && !searchQuery
                ? 'bg-white text-slate-950 shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {pl.name}
          </button>
        ))}
      </div>

      {/* Search Input for Tracks */}
      <div className="relative shrink-0">
        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Spotify songs, artists, or genres..."
          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-[#1db954]"
        />
      </div>

      {/* Track List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
        {filteredTracks.map((track) => {
          const isSelected = currentTrack.id === track.id;
          return (
            <div
              key={track.id}
              onClick={() => handlePlayTrack(track)}
              className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                isSelected
                  ? 'bg-slate-900 border-[#1db954]/60 shadow-xs'
                  : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${track.coverColor} flex items-center justify-center shrink-0 border border-slate-700/60`}
                >
                  {isSelected && isPlaying ? (
                    <Pause className="w-4 h-4 text-white" />
                  ) : (
                    <Play className="w-4 h-4 text-white ml-0.5" />
                  )}
                </div>

                <div className="min-w-0">
                  <p
                    className={`text-xs font-bold truncate ${
                      isSelected ? 'text-[#1db954]' : 'text-white'
                    }`}
                  >
                    {track.title}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {track.artist} · {track.album}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10.5px] text-slate-500 tabular-nums">
                  {track.duration}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickRequest(track.title, track.artist);
                  }}
                  className="px-2 py-1 rounded-md bg-slate-800 hover:bg-[#1db954] hover:text-slate-950 text-slate-300 text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                  title="Queue for Carlos"
                >
                  <PlusCircle className="w-3 h-3" />
                  <span>Queue</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Notice */}
      {requestNotice && (
        <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold text-center animate-fadeIn shrink-0">
          {requestNotice}
        </div>
      )}

      {/* Mini Player Bar */}
      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div className="min-w-0 flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#1db954] animate-pulse shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">
              {currentTrack.title}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {currentTrack.artist}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTogglePlay}
            className="w-8 h-8 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-slate-950 flex items-center justify-center transition-transform active:scale-95 cursor-pointer shadow-sm"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
