import React, { useEffect, useState } from 'react';
import {
  Save,
  Languages,
  Volume2,
  Square,
  Gauge,
  AlertCircle,
} from 'lucide-react';
import { TranslationItem, SupportedLanguage } from '../../types/kiosk';
import { cloudSync } from '../../services/cloudSync';
import { playCabinChime } from '../../utils/cabinAudio';
import { getAdminTranslations, getAdminSubLabels } from '../../data/adminTranslations';
import { isSpeechSupported, speakText, stopSpeech, TtsLanguage } from '../../utils/speechTts';

interface AdminTranslationManagerProps {
  onShowToast: (msg: string) => void;
  adminLanguage?: SupportedLanguage;
}

const DEFAULT_TRANSLATIONS: TranslationItem[] = [
  { key: 'nav.apps', en: 'Apps & Games', es: 'Aplicaciones y Juegos', category: 'navigation' },
  { key: 'nav.comfort', en: 'Cabin Comfort', es: 'Comodidad en Cabina', category: 'navigation' },
  { key: 'nav.gallery', en: 'Photo Gallery', es: 'Galería de Fotos', category: 'navigation' },
  { key: 'btn.preferences', en: 'Ride Preferences', es: 'Preferencias de Viaje', category: 'buttons' },
  { key: 'btn.music_center', en: 'Music Request', es: 'Solicitar Música', category: 'buttons' },
  { key: 'btn.explore', en: 'Explore Nearby', es: 'Explorar Lugares Cercanos', category: 'buttons' },
  { key: 'btn.arcade', en: 'Cabin Arcade', es: 'Juegos y Trivia', category: 'buttons' },
  { key: 'btn.feedback', en: 'Passenger Review', es: 'Opinión del Pasajero', category: 'buttons' },
  { key: 'btn.weather', en: 'Weather & Forecast', es: 'Clima y Pronóstico', category: 'buttons' },
  { key: 'req.quiet', en: 'Quiet Ride', es: 'Viaje en Silencio', category: 'requests' },
  { key: 'req.cooler', en: 'Cooler A/C (68°F)', es: 'Aire Más Frío (68°F)', category: 'requests' },
  { key: 'req.warmer', en: 'Warmer Heat (74°F)', es: 'Calefacción (74°F)', category: 'requests' },
  { key: 'anno.welcome', en: 'Welcome aboard Silvermyst Ride Experience!', es: '¡Bienvenidos a bordo de Silvermyst Ride Experience!', category: 'announcements' },
  { key: 'anno.water', en: 'Complimentary cold water available upon request.', es: 'Agua fría de cortesía disponible a pedido.', category: 'announcements' },
];

export const AdminTranslationManager: React.FC<AdminTranslationManagerProps> = ({
  onShowToast,
  adminLanguage = 'en',
}) => {
  const at = getAdminTranslations(adminLanguage);
  const sl = getAdminSubLabels(adminLanguage);
  const [translations, setTranslations] = useState<TranslationItem[]>(DEFAULT_TRANSLATIONS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Text-to-Speech tester & inline preview state
  const [ttsTestText, setTtsTestText] = useState<string>(
    '¡Bienvenidos a bordo de Silvermyst Ride Experience!'
  );
  const [ttsTestLang, setTtsTestLang] = useState<TtsLanguage>('es');
  const [speechRate, setSpeechRate] = useState<number>(0.96);
  const [activeSpeakKey, setActiveSpeakKey] = useState<string | null>(null);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const ttsSupported = isSpeechSupported();

  useEffect(() => {
    const unsub = cloudSync.subscribeToSystemSettings((settings) => {
      if (settings.translations && Array.isArray(settings.translations.items)) {
        setTranslations(settings.translations.items);
      }
    });
    return () => {
      unsub();
      stopSpeech();
    };
  }, []);

  const handleUpdateTranslation = (key: string, field: 'en' | 'es', value: string) => {
    setTranslations((prev) =>
      prev.map((t) => (t.key === key ? { ...t, [field]: value } : t))
    );
  };

  const handleSpeakPhrase = (text: string, lang: TtsLanguage, slotKey: string) => {
    playCabinChime('tap');
    setTtsError(null);
    if (activeSpeakKey === slotKey) {
      stopSpeech();
      setActiveSpeakKey(null);
      return;
    }

    speakText({
      text,
      lang,
      rate: speechRate,
      onStart: () => setActiveSpeakKey(slotKey),
      onEnd: () => setActiveSpeakKey((prev) => (prev === slotKey ? null : prev)),
      onError: (reason) => {
        setActiveSpeakKey(null);
        setTtsError(reason);
      },
    });
  };

  const handlePublishTranslations = async () => {
    playCabinChime('acknowledged');
    setIsSaving(true);
    await cloudSync.saveSystemSetting('translations', {
      items: translations,
      updatedAt: Date.now(),
    });
    setTimeout(() => {
      setIsSaving(false);
      onShowToast('English & Spanish translations published to all passenger tablets!');
    }, 800);
  };

  const categories = [
    { id: 'all', label: sl.allPhrases },
    { id: 'navigation', label: sl.navTabsCat },
    { id: 'buttons', label: sl.appButtonsCat },
    { id: 'requests', label: sl.passengerReqsCat },
    { id: 'announcements', label: sl.announcementsCat },
  ];

  const filtered = translations.filter(
    (t) => selectedCategory === 'all' || t.category === selectedCategory
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-950/80 via-slate-900 to-indigo-950/80 border border-teal-800/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-600/30 text-teal-300 border border-teal-500/40">
              <Languages className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {at.translationsTitle}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300">
            {at.translationsSub}
          </p>
        </div>

        <button
          type="button"
          onClick={handlePublishTranslations}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-md shadow-teal-500/30 shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? sl.publishing : sl.publishToFleet}</span>
        </button>
      </div>

      {/* Text-to-Speech (TTS) Studio Preview */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-teal-500/30 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-extrabold text-white">
              Text-to-Speech (TTS) Pronunciation &amp; Voice Preview
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-950 border border-slate-800">
              <Gauge className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-slate-400 text-[11px]">Speed:</span>
              {[
                { label: '0.8x', value: 0.8 },
                { label: '1.0x', value: 0.96 },
                { label: '1.2x', value: 1.2 },
              ].map((sp) => (
                <button
                  key={sp.label}
                  type="button"
                  onClick={() => setSpeechRate(sp.value)}
                  className={`px-1.5 py-0.5 rounded font-bold cursor-pointer text-[11px] ${
                    speechRate === sp.value
                      ? 'bg-teal-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {sp.label}
                </button>
              ))}
            </div>

            <select
              value={ttsTestLang}
              onChange={(e) => setTtsTestLang(e.target.value as TtsLanguage)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-teal-300 cursor-pointer"
            >
              <option value="en">English Voice</option>
              <option value="es">Spanish Voice</option>
              <option value="fr">French Voice</option>
              <option value="de">German Voice</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={ttsTestText}
            onChange={(e) => setTtsTestText(e.target.value)}
            placeholder="Type any greeting, announcement, or translated phrase to test spoken voice..."
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
          <button
            type="button"
            disabled={!ttsSupported || !ttsTestText.trim()}
            onClick={() => handleSpeakPhrase(ttsTestText, ttsTestLang, 'studio-test')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-40 shrink-0 ${
              activeSpeakKey === 'studio-test'
                ? 'bg-rose-500 hover:bg-rose-600 text-white'
                : 'bg-teal-500 hover:bg-teal-400 text-slate-950'
            }`}
          >
            {activeSpeakKey === 'studio-test' ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Audio</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>Speak Aloud</span>
              </>
            )}
          </button>
        </div>

        {ttsError && (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{ttsError}</span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="p-2 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-1.5 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              playCabinChime('tap');
              setSelectedCategory(cat.id);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-teal-500 text-slate-950 font-black shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Translations Table / Grid with Inline TTS */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="font-extrabold text-sm sm:text-base text-white">{sl.activePhraseDict}</h3>
          <span className="text-xs text-slate-400">{filtered.length}</span>
        </div>

        <div className="space-y-3">
          {filtered.map((item) => {
            const enKey = `${item.key}-en`;
            const esKey = `${item.key}-es`;
            return (
              <div
                key={item.key}
                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-teal-400 font-bold">{item.key}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-500">{item.category}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                        <span>🇺🇸 English (Default)</span>
                      </label>
                      {ttsSupported && (
                        <button
                          type="button"
                          onClick={() => handleSpeakPhrase(item.en, 'en', enKey)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                            activeSpeakKey === enKey
                              ? 'bg-rose-500 text-white'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                          }`}
                          title="Speak English phrase"
                        >
                          {activeSpeakKey === enKey ? (
                            <Square className="w-2.5 h-2.5 fill-current" />
                          ) : (
                            <Volume2 className="w-3 h-3" />
                          )}
                          <span>{activeSpeakKey === enKey ? 'Stop' : at.speakAloud}</span>
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={item.en}
                      onChange={(e) => handleUpdateTranslation(item.key, 'en', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-teal-300 flex items-center gap-1">
                        <span>🇲🇽 Español (Spanish)</span>
                      </label>
                      {ttsSupported && (
                        <button
                          type="button"
                          onClick={() => handleSpeakPhrase(item.es, 'es', esKey)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                            activeSpeakKey === esKey
                              ? 'bg-rose-500 text-white'
                              : 'bg-teal-500/20 hover:bg-teal-500/30 text-teal-300'
                          }`}
                          title="Speak Spanish phrase"
                        >
                          {activeSpeakKey === esKey ? (
                            <Square className="w-2.5 h-2.5 fill-current" />
                          ) : (
                            <Volume2 className="w-3 h-3" />
                          )}
                          <span>{activeSpeakKey === esKey ? 'Stop' : at.speakAloud}</span>
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={item.es}
                      onChange={(e) => handleUpdateTranslation(item.key, 'es', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
