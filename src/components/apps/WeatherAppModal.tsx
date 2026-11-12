import React, { useState, useEffect } from 'react';
import {
  X,
  CloudSun,
  Wind,
  Droplets,
  Sun,
  CloudRain,
  Compass,
  MapPin,
  Search,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Thermometer,
  Calendar,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  CloudLightning,
  CloudSnow,
  Eye,
  Sunset,
} from 'lucide-react';
import { playCabinChime } from '../../utils/cabinAudio';
import { CabinMessage } from '../../types/kiosk';

interface WeatherAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultZip?: string;
  onLaunchNativeWeather?: () => void;
  onSendMessage?: (msg: Omit<CabinMessage, 'id' | 'sentAt' | 'status'>) => void;
}

interface ForecastDay {
  day: string;
  fullDay: string;
  date: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
  rainChance: number;
  windSpeed: number;
  humidity: number;
  summary: string;
}

interface HourlySlot {
  time: string;
  temp: number;
  condition: string;
  icon: string;
  label: string;
}

interface ZipData {
  city: string;
  state: string;
  temp: number;
  feelsLike: number;
  high: number;
  low: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  aqi: number;
  aqiLabel: string;
  rainChance: number;
  visibility: string;
  hourly: HourlySlot[];
  forecast: ForecastDay[];
}

// Known regional weather presets for instant realistic lookup
const PRESET_LOCATIONS: Record<string, Partial<ZipData>> = {
  '46601': {
    city: 'South Bend',
    state: 'IN',
    temp: 72,
    feelsLike: 73,
    high: 75,
    low: 52,
    condition: 'Partly Cloudy & Pleasant',
    icon: '⛅',
    humidity: 44,
    windSpeed: 8,
    uvIndex: 5,
    aqi: 32,
    aqiLabel: 'Good (Clean Air)',
    rainChance: 10,
    visibility: '10 miles',
  },
  '60666': {
    city: 'Chicago O’Hare (ORD)',
    state: 'IL',
    temp: 68,
    feelsLike: 66,
    high: 71,
    low: 49,
    condition: 'Breezy Lake Wind',
    icon: '🌤️',
    humidity: 52,
    windSpeed: 14,
    uvIndex: 4,
    aqi: 38,
    aqiLabel: 'Good',
    rainChance: 15,
    visibility: '10 miles',
  },
  '46241': {
    city: 'Indianapolis Airport (IND)',
    state: 'IN',
    temp: 74,
    feelsLike: 75,
    high: 77,
    low: 54,
    condition: 'Mild Sunshine',
    icon: '☀️',
    humidity: 46,
    windSpeed: 9,
    uvIndex: 6,
    aqi: 35,
    aqiLabel: 'Good',
    rainChance: 5,
    visibility: '10 miles',
  },
  '46545': {
    city: 'Mishawaka',
    state: 'IN',
    temp: 71,
    feelsLike: 72,
    high: 74,
    low: 51,
    condition: 'Partly Cloudy',
    icon: '⛅',
    humidity: 45,
    windSpeed: 7,
    uvIndex: 5,
    aqi: 30,
    aqiLabel: 'Good',
    rainChance: 10,
    visibility: '10 miles',
  },
  '46516': {
    city: 'Elkhart',
    state: 'IN',
    temp: 70,
    feelsLike: 71,
    high: 73,
    low: 50,
    condition: 'Clear Blue Skies',
    icon: '☀️',
    humidity: 42,
    windSpeed: 8,
    uvIndex: 5,
    aqi: 31,
    aqiLabel: 'Good',
    rainChance: 5,
    visibility: '10 miles',
  },
  '10001': {
    city: 'New York City',
    state: 'NY',
    temp: 66,
    feelsLike: 65,
    high: 69,
    low: 48,
    condition: 'Crisp Autumn Skies',
    icon: '🌤️',
    humidity: 48,
    windSpeed: 11,
    uvIndex: 4,
    aqi: 42,
    aqiLabel: 'Moderate',
    rainChance: 10,
    visibility: '10 miles',
  },
  '33101': {
    city: 'Miami',
    state: 'FL',
    temp: 83,
    feelsLike: 87,
    high: 86,
    low: 74,
    condition: 'Tropical Sunshine',
    icon: '☀️',
    humidity: 68,
    windSpeed: 12,
    uvIndex: 8,
    aqi: 28,
    aqiLabel: 'Good',
    rainChance: 25,
    visibility: '10 miles',
  },
  '90001': {
    city: 'Los Angeles',
    state: 'CA',
    temp: 78,
    feelsLike: 78,
    high: 81,
    low: 58,
    condition: 'Sunny Pacific Skies',
    icon: '☀️',
    humidity: 38,
    windSpeed: 6,
    uvIndex: 7,
    aqi: 45,
    aqiLabel: 'Moderate',
    rainChance: 0,
    visibility: '9 miles',
  },
  '75201': {
    city: 'Dallas',
    state: 'TX',
    temp: 79,
    feelsLike: 81,
    high: 83,
    low: 60,
    condition: 'Warm Sunshine',
    icon: '☀️',
    humidity: 50,
    windSpeed: 10,
    uvIndex: 7,
    aqi: 36,
    aqiLabel: 'Good',
    rainChance: 5,
    visibility: '10 miles',
  },
  '98101': {
    city: 'Seattle',
    state: 'WA',
    temp: 58,
    feelsLike: 56,
    high: 61,
    low: 46,
    condition: 'Passing Showers',
    icon: '🌧️',
    humidity: 78,
    windSpeed: 9,
    uvIndex: 3,
    aqi: 22,
    aqiLabel: 'Excellent',
    rainChance: 65,
    visibility: '8 miles',
  },
};

// Generate realistic 7-day week forecast based on base data
function generate7DayForecast(baseTemp: number, baseCondition: string): ForecastDay[] {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const fullNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();
  const currentDayIdx = today.getDay();

  const conditions = [
    { cond: 'Clear & Sunny', icon: '☀️', rain: 5, tip: 'Ideal clear driving and sightseeing' },
    { cond: 'Partly Cloudy', icon: '⛅', rain: 15, tip: 'Comfortable mild afternoon travel' },
    { cond: 'Passing Clouds', icon: '🌤️', rain: 10, tip: 'Great evening for dinner & outdoor walk' },
    { cond: 'Scattered Showers', icon: '🌦️', rain: 55, tip: 'Keep umbrella handy for airport curb' },
    { cond: 'Sunny & Crisp', icon: '☀️', rain: 0, tip: 'Smooth highway cruise conditions' },
    { cond: 'Overcast & Mild', icon: '☁️', rain: 20, tip: 'Gentle breeze, comfortable commute' },
    { cond: 'Clear Starlit Night', icon: '✨', rain: 5, tip: 'Pleasant night travel' },
  ];

  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() + i);
    const dayIdx = (currentDayIdx + i) % 7;
    const condObj = conditions[(currentDayIdx + i * 2) % conditions.length];
    const offset = ((i * 3) % 9) - 4; // slight fluctuation
    const high = baseTemp + offset;
    const low = high - (18 + (i % 5));

    const monthStr = d.toLocaleDateString([], { month: 'short' });
    const dateNum = d.getDate();

    return {
      day: i === 0 ? 'Today' : dayNames[dayIdx],
      fullDay: i === 0 ? 'Today' : fullNames[dayIdx],
      date: `${monthStr} ${dateNum}`,
      high,
      low,
      condition: i === 0 ? baseCondition : condObj.cond,
      icon: condObj.icon,
      rainChance: condObj.rain,
      windSpeed: 7 + (i % 6),
      humidity: 42 + ((i * 5) % 25),
      summary: condObj.tip,
    };
  });
}

function generateHourly(baseTemp: number): HourlySlot[] {
  return [
    { time: 'Morning (8 AM)', temp: baseTemp - 8, condition: 'Fresh & Crisp', icon: '⛅', label: 'Morning Commute' },
    { time: 'Midday (12 PM)', temp: baseTemp + 2, condition: 'Warm Sunshine', icon: '☀️', label: 'Lunchtime Drive' },
    { time: 'Afternoon (4 PM)', temp: baseTemp + 3, condition: 'Pleasant & Mild', icon: '🌤️', label: 'Peak High' },
    { time: 'Evening (8 PM)', temp: baseTemp - 5, condition: 'Clear Evening', icon: '🌙', label: 'Dinner & Airport' },
  ];
}

export const WeatherAppModal: React.FC<WeatherAppModalProps> = ({
  isOpen,
  onClose,
  defaultZip = '46601',
  onLaunchNativeWeather,
  onSendMessage,
}) => {
  const [zipInput, setZipInput] = useState(defaultZip);
  const [activeTab, setActiveTab] = useState<'today' | 'week'>('today');
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveGps, setIsLiveGps] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Weather data state
  const [weatherData, setWeatherData] = useState<ZipData>(() => {
    const base = PRESET_LOCATIONS[defaultZip] || PRESET_LOCATIONS['46601']!;
    return {
      city: base.city || 'South Bend',
      state: base.state || 'IN',
      temp: base.temp || 72,
      feelsLike: base.feelsLike || 73,
      high: base.high || 75,
      low: base.low || 52,
      condition: base.condition || 'Partly Cloudy & Pleasant',
      icon: base.icon || '⛅',
      humidity: base.humidity || 44,
      windSpeed: base.windSpeed || 8,
      uvIndex: base.uvIndex || 5,
      aqi: base.aqi || 32,
      aqiLabel: base.aqiLabel || 'Good (Clean Air)',
      rainChance: base.rainChance || 10,
      visibility: base.visibility || '10 miles',
      hourly: generateHourly(base.temp || 72),
      forecast: generate7DayForecast(base.temp || 72, base.condition || 'Partly Cloudy & Pleasant'),
    };
  });

  // Try GPS Geolocation on load
  useEffect(() => {
    if (isOpen && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setIsLiveGps(true);
        },
        () => {
          setIsLiveGps(false);
        },
        { timeout: 4000 }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const executeZipLookup = (zipToSearch: string) => {
    const cleanZip = zipToSearch.trim().slice(0, 5);
    if (!cleanZip) return;

    playCabinChime('tap');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsLiveGps(false);

      if (PRESET_LOCATIONS[cleanZip]) {
        const p = PRESET_LOCATIONS[cleanZip]!;
        setWeatherData({
          city: p.city || 'Metro Area',
          state: p.state || 'US',
          temp: p.temp || 72,
          feelsLike: p.feelsLike || 73,
          high: p.high || 75,
          low: p.low || 52,
          condition: p.condition || 'Clear & Pleasant',
          icon: p.icon || '☀️',
          humidity: p.humidity || 45,
          windSpeed: p.windSpeed || 8,
          uvIndex: p.uvIndex || 5,
          aqi: p.aqi || 30,
          aqiLabel: p.aqiLabel || 'Good',
          rainChance: p.rainChance || 10,
          visibility: p.visibility || '10 miles',
          hourly: generateHourly(p.temp || 72),
          forecast: generate7DayForecast(p.temp || 72, p.condition || 'Clear & Pleasant'),
        });
      } else {
        // Algorithmic realistic weather generator for any arbitrary 5-digit US ZIP code
        const num = parseInt(cleanZip.replace(/[^0-9]/g, '')) || 46601;
        const seedTemp = 60 + (num % 25);
        const seedHumidity = 35 + (num % 45);
        const seedWind = 6 + (num % 12);
        const condList = [
          { c: 'Clear Skies & Sunny', ic: '☀️', r: 5 },
          { c: 'Partly Cloudy', ic: '⛅', r: 15 },
          { c: 'Mild Sunshine', ic: '🌤️', r: 10 },
          { c: 'Overcast Breeze', ic: '☁️', r: 25 },
        ];
        const selectedCond = condList[num % condList.length];

        setWeatherData({
          city: `ZIP ${cleanZip}`,
          state: 'Metro Area',
          temp: seedTemp,
          feelsLike: seedTemp + 1,
          high: seedTemp + 4,
          low: seedTemp - 16,
          condition: selectedCond.c,
          icon: selectedCond.ic,
          humidity: seedHumidity,
          windSpeed: seedWind,
          uvIndex: 4 + (num % 4),
          aqi: 25 + (num % 20),
          aqiLabel: 'Good (Clean Air)',
          rainChance: selectedCond.r,
          visibility: '10 miles',
          hourly: generateHourly(seedTemp),
          forecast: generate7DayForecast(seedTemp, selectedCond.c),
        });
      }
      showToast(`Updated weather for ZIP ${cleanZip}!`);
    }, 350);
  };

  const handleZipSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeZipLookup(zipInput);
  };

  const handleQuickPreset = (zip: string) => {
    setZipInput(zip);
    executeZipLookup(zip);
  };

  const handleRequestAcCooler = () => {
    playCabinChime('comfort');
    if (onSendMessage) {
      onSendMessage({
        type: 'comfort',
        text: 'Passenger Request: Please adjust cabin A/C a little cooler ❄️',
        category: 'too-cold',
      });
    }
    showToast('Sent A/C Cooler request to driver!');
  };

  const handleRequestAcWarmer = () => {
    playCabinChime('comfort');
    if (onSendMessage) {
      onSendMessage({
        type: 'comfort',
        text: 'Passenger Request: Please adjust cabin heating a little warmer ☀️',
        category: 'too-hot',
      });
    }
    showToast('Sent Cabin Warmer request to driver!');
  };

  const handleLaunchNative = () => {
    playCabinChime('tap');
    if (onLaunchNativeWeather) {
      onLaunchNativeWeather();
    } else {
      const isAndroid = /android/i.test(navigator.userAgent);
      if (isAndroid) {
        window.location.href = 'intent://#Intent;action=android.intent.action.MAIN;category=android.intent.category.APP_WEATHER;end';
      } else {
        window.open(`https://weather.com/weather/today/l/${zipInput}`, '_blank');
      }
    }
  };

  return (
    <div
      onClick={() => {
        playCabinChime('tap');
        onClose();
      }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 transition-all animate-fade-in"
    >
      {/* Toast Feedback */}
      {feedbackToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-60 bg-sky-600 text-white px-5 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 border border-sky-400/40 text-xs font-bold animate-fade-in">
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
          <span>{feedbackToast}</span>
        </div>
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-slate-950 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/25">
              <CloudSun className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
                  Live Weather & Forecast
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">
                  {isLiveGps ? '📍 GPS Synced' : `ZIP ${zipInput}`}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {weatherData.city}, {weatherData.state} • In-Cabin Climate 71°F
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playCabinChime('tap');
              onClose();
            }}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ZIP Code Search Bar */}
        <form onSubmit={handleZipSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={zipInput}
              onChange={(e) => setZipInput(e.target.value)}
              placeholder="Type any US ZIP code (e.g. 46601, 60666, 10001)..."
              maxLength={10}
              className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium focus:outline-hidden focus:border-sky-500"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:brightness-110 active:scale-95 text-white font-extrabold text-xs sm:text-sm tracking-tight transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>View Weather</span>}
          </button>
        </form>

        {/* Quick Airport & City Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold">
          <span className="text-slate-400 text-xs mr-1 shrink-0">Quick Cities:</span>
          {[
            { zip: '46601', label: 'South Bend' },
            { zip: '60666', label: 'Chicago (ORD)' },
            { zip: '46241', label: 'Indy (IND)' },
            { zip: '46545', label: 'Mishawaka' },
            { zip: '46516', label: 'Elkhart' },
            { zip: '10001', label: 'New York' },
            { zip: '33101', label: 'Miami' },
            { zip: '90001', label: 'Los Angeles' },
          ].map((item) => (
            <button
              key={item.zip}
              type="button"
              onClick={() => handleQuickPreset(item.zip)}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                zipInput === item.zip
                  ? 'bg-sky-500 text-slate-950 font-extrabold'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {item.label} ({item.zip})
            </button>
          ))}
        </div>

        {/* View Toggle: Today's Weather vs Full Week */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <button
            onClick={() => {
              playCabinChime('tap');
              setActiveTab('today');
            }}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'today'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs text-sky-600 dark:text-sky-400'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Today's Weather & In-Cabin Climate</span>
          </button>

          <button
            onClick={() => {
              playCabinChime('tap');
              setActiveTab('week');
            }}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'week'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs text-sky-600 dark:text-sky-400'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Full Week (7-Day Forecast)</span>
          </button>
        </div>

        {/* TAB 1: TODAY'S WEATHER */}
        {activeTab === 'today' && (
          <div className="space-y-3.5">
            {/* Hero Weather Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 text-white space-y-3 shadow-lg relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-sky-100 bg-white/20 px-2.5 py-0.5 rounded-full">
                      {weatherData.city}, {weatherData.state}
                    </span>
                    <span className="text-xs text-sky-100">Today</span>
                  </div>

                  <div className="flex items-baseline gap-3 mt-2">
                    <span className="text-5xl sm:text-6xl font-black font-display tabular-nums tracking-tight">
                      {weatherData.temp}°F
                    </span>
                    <div>
                      <div className="text-base sm:text-lg font-bold text-sky-100">
                        {weatherData.condition}
                      </div>
                      <div className="text-xs text-sky-200">
                        Feels like {weatherData.feelsLike}°F • High {weatherData.high}° / Low {weatherData.low}°
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-5xl sm:text-6xl shrink-0 p-2 filter drop-shadow-md">
                  {weatherData.icon}
                </div>
              </div>

              {/* In-Cabin Environmental Bar */}
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 flex items-center justify-between text-xs text-sky-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>Cabin Climate: <strong>71°F Regulated</strong></span>
                </div>
                <div className="flex items-center gap-1.5 font-bold">
                  <span>Air Quality: </span>
                  <span className="text-emerald-300">{weatherData.aqiLabel}</span>
                </div>
              </div>
            </div>

            {/* Hourly In-Ride Breakdown */}
            <div className="space-y-1.5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Today's Ride Timeline
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {weatherData.hourly.map((slot, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-1"
                  >
                    <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">
                      {slot.time}
                    </div>
                    <div className="text-2xl my-1">{slot.icon}</div>
                    <div className="text-base font-black text-slate-900 dark:text-white tabular-nums">
                      {slot.temp}°F
                    </div>
                    <div className="text-[10px] text-sky-500 font-semibold truncate">
                      {slot.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Atmospheric Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-2.5">
                <Droplets className="w-5 h-5 text-sky-500 shrink-0" />
                <div>
                  <div className="text-slate-400 text-[10px]">Humidity</div>
                  <div className="font-extrabold text-slate-900 dark:text-white">{weatherData.humidity}%</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-2.5">
                <Wind className="w-5 h-5 text-indigo-500 shrink-0" />
                <div>
                  <div className="text-slate-400 text-[10px]">Wind Speed</div>
                  <div className="font-extrabold text-slate-900 dark:text-white">{weatherData.windSpeed} mph</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-2.5">
                <Sun className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <div className="text-slate-400 text-[10px]">UV Index</div>
                  <div className="font-extrabold text-slate-900 dark:text-white">{weatherData.uvIndex} (Moderate)</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-2.5">
                <Eye className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <div className="text-slate-400 text-[10px]">Visibility</div>
                  <div className="font-extrabold text-slate-900 dark:text-white">{weatherData.visibility}</div>
                </div>
              </div>
            </div>

            {/* Quick Cabin A/C Comfort Adjustments */}
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-center sm:text-left">
                <span className="font-bold text-slate-900 dark:text-white">Need a temperature tweak?</span>
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                  Send 1-tap request directly to your driver Carlos
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleRequestAcCooler}
                  className="px-3.5 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-600 dark:text-sky-400 font-extrabold text-xs flex items-center gap-1.5 border border-sky-500/30 cursor-pointer active:scale-95"
                >
                  <span>❄️ Cooler A/C</span>
                </button>
                <button
                  type="button"
                  onClick={handleRequestAcWarmer}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 font-extrabold text-xs flex items-center gap-1.5 border border-amber-500/30 cursor-pointer active:scale-95"
                >
                  <span>☀️ Warmer</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FULL WEEK (7-DAY FORECAST) */}
        {activeTab === 'week' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-extrabold uppercase tracking-wider">
                7-Day Extended Outlook for {weatherData.city}
              </span>
              <span>High / Low Range</span>
            </div>

            <div className="space-y-2">
              {weatherData.forecast.map((day, i) => (
                <div
                  key={i}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    i === 0
                      ? 'bg-sky-500/10 dark:bg-sky-950/40 border-sky-400/40'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  {/* Day & Date */}
                  <div className="w-24 sm:w-28 shrink-0">
                    <div className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{day.fullDay}</span>
                      {i === 0 && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-sky-500 text-white font-extrabold">
                          Today
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">{day.date}</div>
                  </div>

                  {/* Icon & Condition */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="text-2xl shrink-0">{day.icon}</span>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                        {day.condition}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate hidden sm:block">
                        {day.summary}
                      </div>
                    </div>
                  </div>

                  {/* Rain chance badge */}
                  {day.rainChance > 0 ? (
                    <span className="text-[10px] font-bold text-sky-500 bg-sky-500/10 px-2 py-0.5 rounded-full shrink-0">
                      💧 {day.rainChance}%
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 shrink-0">0% Rain</span>
                  )}

                  {/* High / Low Bar */}
                  <div className="flex items-center gap-2 shrink-0 text-right">
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white tabular-nums">
                      {day.high}°
                    </span>
                    <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden hidden sm:block">
                      <div
                        className="h-full bg-gradient-to-r from-sky-400 to-amber-400 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(30, (day.high / 100) * 100))}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 tabular-nums">
                      {day.low}°
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Footer */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleLaunchNative}
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs tracking-tight transition-colors cursor-pointer flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 shadow-2xs"
            title="Launch native weather app on tablet"
          >
            <span>Launch Installed Weather App</span>
            <ExternalLink className="w-3.5 h-3.5 text-sky-500" />
          </button>

          <button
            type="button"
            onClick={() => {
              playCabinChime('tap');
              onClose();
            }}
            className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-extrabold text-xs tracking-tight transition-all cursor-pointer shadow-sm text-center"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
