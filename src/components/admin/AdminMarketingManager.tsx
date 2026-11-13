import React, { useState, useEffect } from 'react';
import {
  Palette,
  Plus,
  Trash2,
  Play,
  Volume2,
  Check,
  Gift,
  PartyPopper,
  Calendar,
  Clock,
  Edit2,
  Tablet,
} from 'lucide-react';
import { CabinThemeMode, MarketingPopup, SupportedLanguage } from '../../types/kiosk';
import { CABIN_THEMES, DEFAULT_MARKETING_POPUPS } from '../../data/cabinThemes';
import { cloudSync } from '../../services/cloudSync';
import { playCabinChime } from '../../utils/cabinAudio';
import { getAdminTranslations, getAdminSubLabels } from '../../data/adminTranslations';

interface AdminMarketingManagerProps {
  cabinTheme: CabinThemeMode;
  onUpdateCabinTheme: (theme: CabinThemeMode) => void;
  onShowToast: (msg: string) => void;
  onPreviewPopup?: (popup: MarketingPopup) => void;
  adminLanguage?: SupportedLanguage;
}

const POPUP_BG_PRESETS = [
  { id: 'from-[#0c2340] via-[#102e54] to-amber-950/60', label: 'Notre Dame Navy & Gold' },
  { id: 'from-rose-950 via-slate-900 to-emerald-950', label: 'Holiday Crimson & Evergreen' },
  { id: 'from-amber-950 via-stone-900 to-purple-950', label: 'Birthday & Champagne VIP' },
  { id: 'from-slate-900 via-purple-950 to-slate-950', label: 'Royal Silvermyst Purple' },
  { id: 'from-emerald-950 via-slate-900 to-teal-950', label: 'Emerald VIP Lounge' },
];

const INTERVAL_OPTIONS = [
  { value: 1, label: 'Every 1 minute (Quick Test)' },
  { value: 2, label: 'Every 2 minutes' },
  { value: 5, label: 'Every 5 minutes' },
  { value: 10, label: 'Every 10 minutes' },
  { value: 15, label: 'Every 15 minutes' },
  { value: 30, label: 'Every 30 minutes' },
  { value: 60, label: 'Every 60 minutes' },
];

export const AdminMarketingManager: React.FC<AdminMarketingManagerProps> = ({
  cabinTheme,
  onUpdateCabinTheme,
  onShowToast,
  onPreviewPopup,
  adminLanguage = 'en',
}) => {
  const at = getAdminTranslations(adminLanguage);
  const sl = getAdminSubLabels(adminLanguage);
  const [popups, setPopups] = useState<MarketingPopup[]>(DEFAULT_MARKETING_POPUPS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPopupId, setEditingPopupId] = useState<string | null>(null);

  // Create / Edit form state
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [badgeText, setBadgeText] = useState('Special Announcement');
  const [ctaLabel, setCtaLabel] = useState('Explore Local Spots');
  const [ctaUrl, setCtaUrl] = useState('internal:explore');
  const [audioSound, setAudioSound] = useState<MarketingPopup['audioSound']>('celebrate');
  const [bgGradient, setBgGradient] = useState(POPUP_BG_PRESETS[0].id);
  const [triggerType, setTriggerType] = useState<MarketingPopup['triggerType']>('periodic');
  const [repeatIntervalMinutes, setRepeatIntervalMinutes] = useState<number>(5);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('23:00');

  useEffect(() => {
    const unsub = cloudSync.subscribeToMarketingPopups((list) => {
      if (list && list.length > 0) {
        setPopups(list);
      }
    });
    return () => unsub();
  }, []);

  const getLocalTodayDate = () => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const resetForm = () => {
    setEditingPopupId(null);
    setTitle('');
    setSubtitle('');
    setBodyText('');
    setBadgeText('Special Announcement');
    setCtaLabel('Explore Local Spots');
    setCtaUrl('internal:explore');
    setAudioSound('celebrate');
    setBgGradient(POPUP_BG_PRESETS[0].id);
    setTriggerType('periodic');
    setRepeatIntervalMinutes(5);
    const today = getLocalTodayDate();
    setStartDate(today);
    setEndDate(today);
    setStartTime('08:00');
    setEndTime('23:00');
  };

  const openCreateModal = () => {
    playCabinChime('tap');
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (popup: MarketingPopup) => {
    playCabinChime('tap');
    setEditingPopupId(popup.id);
    setTitle(popup.title);
    setSubtitle(popup.subtitle || '');
    setBodyText(popup.bodyText);
    setBadgeText(popup.badgeText || 'Special Announcement');
    setCtaLabel(popup.callToActionLabel || '');
    setCtaUrl(popup.callToActionUrl || 'internal:explore');
    setAudioSound(popup.audioSound || 'celebrate');
    setBgGradient(popup.backgroundColor || POPUP_BG_PRESETS[0].id);
    setTriggerType(popup.triggerType || 'manual');
    setRepeatIntervalMinutes(popup.repeatIntervalMinutes ?? 5);
    const today = getLocalTodayDate();
    setStartDate(popup.startDate || today);
    setEndDate(popup.endDate || today);
    setStartTime(popup.startTime || '08:00');
    setEndTime(popup.endTime || '23:00');
    setIsModalOpen(true);
  };

  const handleSelectTheme = async (themeId: CabinThemeMode) => {
    playCabinChime('acknowledged');
    onUpdateCabinTheme(themeId);
    await cloudSync.saveSystemSetting('cabin_theme', { mode: themeId });
    onShowToast(`Default cabin theme updated to ${CABIN_THEMES[themeId].name}`);
  };

  const handleSavePopup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !bodyText.trim()) return;
    playCabinChime('acknowledged');

    const existing = editingPopupId ? popups.find((p) => p.id === editingPopupId) : undefined;
    const savedPopup: MarketingPopup = {
      id: existing ? existing.id : `promo-${Date.now()}`,
      title: title.trim(),
      ...(subtitle.trim() ? { subtitle: subtitle.trim() } : {}),
      bodyText: bodyText.trim(),
      badgeText: badgeText.trim() || 'VIP Special',
      ...(ctaLabel.trim() ? { callToActionLabel: ctaLabel.trim() } : {}),
      ...(ctaUrl.trim() ? { callToActionUrl: ctaUrl.trim() } : {}),
      audioSound,
      backgroundColor: bgGradient,
      isActive: existing ? existing.isActive : true,
      triggerType,
      repeatIntervalMinutes:
        triggerType === 'periodic' || triggerType === 'scheduled' ? repeatIntervalMinutes : 0,
      ...(triggerType === 'scheduled'
        ? {
            ...(startDate ? { startDate } : {}),
            ...(endDate ? { endDate } : {}),
            ...(startTime ? { startTime } : {}),
            ...(endTime ? { endTime } : {}),
          }
        : {}),
      ...(existing?.lastTriggeredAt ? { lastTriggeredAt: existing.lastTriggeredAt } : {}),
      createdAt: existing ? existing.createdAt : Date.now(),
    };

    const nextList = existing
      ? popups.map((p) => (p.id === existing.id ? savedPopup : p))
      : [savedPopup, ...popups];

    setPopups(nextList);
    await cloudSync.saveMarketingPopup(savedPopup);
    setIsModalOpen(false);
    resetForm();
    onShowToast(
      existing
        ? `Updated passenger pop-up "${savedPopup.title}"`
        : `Published "${savedPopup.title}" for Passenger Kiosk screens!`
    );
  };

  const handleTogglePopupActive = async (popup: MarketingPopup) => {
    playCabinChime('tap');
    const updated = { ...popup, isActive: !popup.isActive };
    setPopups((prev) => prev.map((p) => (p.id === popup.id ? updated : p)));
    await cloudSync.saveMarketingPopup(updated);
    onShowToast(
      `${updated.title} is now ${updated.isActive ? 'ACTIVE on Passenger Kiosks' : 'PAUSED'}`
    );
  };

  const handlePushToPassengersNow = async (popup: MarketingPopup) => {
    playCabinChime('acknowledged');
    const updated: MarketingPopup = {
      ...popup,
      isActive: true,
      lastTriggeredAt: Date.now(),
    };
    setPopups((prev) => prev.map((p) => (p.id === popup.id ? updated : p)));
    await cloudSync.saveMarketingPopup(updated);
    onPreviewPopup?.(updated);
    onShowToast(`Sent "${popup.title}" to Passenger Kiosk screens!`);
  };

  const handleDeletePopup = async (popupId: string) => {
    playCabinChime('tap');
    setPopups((prev) => prev.filter((p) => p.id !== popupId));
    await cloudSync.deleteMarketingPopup(popupId);
    onShowToast('Marketing pop-up removed');
  };

  const formatScheduleSummary = (popup: MarketingPopup): string => {
    if (popup.triggerType === 'periodic') {
      return `Every ${popup.repeatIntervalMinutes || 5} min on Passenger Kiosk`;
    }
    if (popup.triggerType === 'scheduled') {
      const windowLabel = `${popup.startDate || 'Any'} ${popup.startTime || ''} → ${popup.endDate || 'Any'} ${popup.endTime || ''}`.trim();
      const repeatLabel =
        popup.repeatIntervalMinutes && popup.repeatIntervalMinutes > 0
          ? ` • Repeats every ${popup.repeatIntervalMinutes}m`
          : ' • Once in window';
      return `${windowLabel}${repeatLabel}`;
    }
    if (popup.triggerType === 'startup') {
      return 'Passenger Startup';
    }
    return 'Manual Push to Passengers';
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Section 1: Multi-Color Cabin Themes & Faded Event Backgrounds */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-400" />
              <span>{sl.cabinThemesHeading}</span>
            </h2>
            <p className="text-xs text-slate-400">{at.marketingSub}</p>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-700/40 text-xs font-bold text-purple-300 shrink-0">
            {sl.activeStatus}: {CABIN_THEMES[cabinTheme]?.name || 'Royal Silvermyst Purple'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {(Object.values(CABIN_THEMES) as typeof CABIN_THEMES[CabinThemeMode][]).map((theme) => {
            const isSelected = cabinTheme === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => handleSelectTheme(theme.id)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'border-amber-400 ring-2 ring-amber-400/30 bg-slate-900 shadow-lg'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div
                  className={`h-16 rounded-xl mb-3 bg-gradient-to-r ${theme.bgGradient} border border-white/10 flex items-center justify-between px-4 relative overflow-hidden`}
                >
                  <div className="flex items-center gap-2 z-10">
                    <span
                      className="w-5 h-5 rounded-full border border-white/50 shadow"
                      style={{ backgroundColor: theme.primaryColor }}
                    />
                    <span
                      className="w-5 h-5 rounded-full border border-white/50 shadow"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                  </div>
                  {theme.fadedPattern === 'notre_dame' && (
                    <span className="text-2xl opacity-30 font-black">☘️ ND</span>
                  )}
                  {theme.fadedPattern === 'holiday_snow' && (
                    <span className="text-2xl opacity-30">❄️ ✨</span>
                  )}
                  {isSelected && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center gap-1 z-10">
                      <Check className="w-3 h-3" /> Default
                    </span>
                  )}
                </div>

                <div className="font-extrabold text-sm text-white">{theme.name}</div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{theme.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 2: Passenger-Only Marketing, Holiday & Scheduled Pop-Ups */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <PartyPopper className="w-5 h-5 text-amber-400" />
              <span>{sl.marketingPopupsHeading}</span>
            </h2>
            <p className="text-xs text-slate-400">
              Active and scheduled pop-ups appear exclusively on Passenger Kiosk tablets — never inside the Admin Console.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs hover:brightness-110 cursor-pointer shadow-md shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{sl.createMarketingPopup}</span>
          </button>
        </div>

        {/* Passenger-Only Clarity Strip */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-xs text-amber-200">
          <Tablet className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Passenger Screen Target:</strong> When activated or scheduled periodically (e.g., every 5–30 minutes), these pop-ups show on the passenger screen and disappear immediately when dismissed until the next interval.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {popups.map((popup) => (
            <div
              key={popup.id}
              className={`p-5 rounded-2xl border space-y-3 bg-gradient-to-br ${
                popup.backgroundColor || 'from-slate-900 to-slate-950'
              } ${popup.isActive ? 'border-amber-400/60 shadow-lg' : 'border-slate-800 opacity-80'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400 text-slate-950">
                    {popup.badgeText || 'Promo'}
                  </span>
                  <h3 className="font-extrabold text-base text-white mt-2">{popup.title}</h3>
                  {popup.subtitle && <p className="text-xs font-bold text-amber-300">{popup.subtitle}</p>}
                </div>

                <span
                  className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase shrink-0 ${
                    popup.isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {popup.isActive ? sl.activeStatus : sl.pausedStatus}
                </span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed">{popup.bodyText}</p>

              {/* Schedule & Audio Meta Row */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-300 pt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{formatScheduleSummary(popup)}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                  <span className="capitalize">{popup.audioSound || 'none'}</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/10 text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditModal(popup)}
                    className="px-2.5 py-1.5 rounded-xl bg-black/30 hover:bg-black/50 text-slate-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>{at.editBtn}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTogglePopupActive(popup)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer"
                  >
                    {popup.isActive ? sl.pauseBtn : sl.activateBtn}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePushToPassengersNow(popup)}
                    className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center gap-1 cursor-pointer"
                    title="Queue this pop-up immediately on Passenger Kiosk tablets"
                  >
                    <Play className="w-3 h-3 fill-slate-950" />
                    <span>Push to Passengers</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeletePopup(popup.id)}
                    className="p-1.5 rounded-xl bg-black/30 hover:bg-rose-600/80 text-slate-300 hover:text-white cursor-pointer"
                    title="Delete pop-up"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create / Edit Marketing Pop-Up Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-400" />
                <span>
                  {editingPopupId
                    ? 'Edit Passenger Marketing Pop-Up'
                    : 'Create Passenger Marketing Pop-Up'}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePopup} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Pop-Up Headline *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Happy Holidays from Silvermyst! 🎄"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. Notre Dame Game Day Special"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Top Badge Text</label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Announcement Message *</label>
                <textarea
                  rows={3}
                  required
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  placeholder="Write your promotional offer, holiday greeting, or local event note..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Background Style</label>
                  <select
                    value={bgGradient}
                    onChange={(e) => setBgGradient(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white cursor-pointer"
                  >
                    {POPUP_BG_PRESETS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Chime / Music Sound</label>
                  <select
                    value={audioSound}
                    onChange={(e) => setAudioSound(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white cursor-pointer"
                  >
                    <option value="celebrate">Celebration Chime</option>
                    <option value="jingle">Upbeat Jingle Bell</option>
                    <option value="chime">Soft Cabin Chime</option>
                    <option value="none">Silent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Action Button Label</label>
                  <input
                    type="text"
                    value={ctaLabel}
                    onChange={(e) => setCtaLabel(e.target.value)}
                    placeholder="e.g. Explore Local Spots"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    Passenger Display Schedule
                  </label>
                  <select
                    value={triggerType}
                    onChange={(e) =>
                      setTriggerType(e.target.value as MarketingPopup['triggerType'])
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white cursor-pointer"
                  >
                    <option value="periodic">Display Periodically (From Time to Time)</option>
                    <option value="scheduled">Scheduled Date &amp; Time Window</option>
                    <option value="startup">Once on Passenger Startup</option>
                    <option value="manual">Manual Push Only</option>
                  </select>
                </div>
              </div>

              {(triggerType === 'periodic' || triggerType === 'scheduled') && (
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-3">
                  <div>
                    <label className="block text-amber-300 font-bold mb-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Repeat Display Interval (Passenger Screen)</span>
                    </label>
                    <select
                      value={repeatIntervalMinutes}
                      onChange={(e) => setRepeatIntervalMinutes(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white cursor-pointer"
                    >
                      {triggerType === 'scheduled' && (
                        <option value={0}>Show Once During Scheduled Window</option>
                      )}
                      {INTERVAL_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {triggerType === 'scheduled' && (
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-slate-400 font-bold mb-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Start Date</span>
                        </label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Start Time</label>
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>End Date</span>
                        </label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">End Time</label>
                        <input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold cursor-pointer"
                >
                  {at.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black cursor-pointer hover:brightness-110"
                >
                  {editingPopupId ? at.saveChanges : 'Publish to Passengers'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
