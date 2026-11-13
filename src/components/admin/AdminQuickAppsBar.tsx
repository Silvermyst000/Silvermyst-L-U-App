import React, { useState } from 'react';
import {
  Smartphone,
  SlidersHorizontal,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ExternalLink,
  X,
  Music,
  PlayCircle,
  Map,
  Navigation,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { AdminAndroidApp, SupportedLanguage } from '../../types/kiosk';
import { getAdminTranslations } from '../../data/adminTranslations';
import { DEFAULT_ADMIN_ANDROID_APPS } from '../../data/cabinThemes';
import { playCabinChime } from '../../utils/cabinAudio';

interface AdminQuickAppsBarProps {
  apps: AdminAndroidApp[];
  onUpdateApps: (apps: AdminAndroidApp[]) => void;
  adminLanguage: SupportedLanguage;
  onShowToast: (msg: string) => void;
}

const ICON_EMOJI_OPTIONS = ['🎧', '▶️', '🗺️', '🚘', '🎵', '💬', '📻', '📞', '🎙️', '⚡', '📅', '🛠️'];

function renderAppIcon(app: AdminAndroidApp) {
  switch (app.iconPreset) {
    case 'spotify':
      return <Music className="w-5 h-5 text-white" />;
    case 'youtube':
      return <PlayCircle className="w-5 h-5 text-white" />;
    case 'maps':
      return <Map className="w-5 h-5 text-white" />;
    case 'waze':
      return <Navigation className="w-5 h-5 text-white" />;
    case 'whatsapp':
      return <MessageCircle className="w-5 h-5 text-white" />;
    default:
      return <span className="text-lg leading-none">{app.emoji || '📱'}</span>;
  }
}

export const AdminQuickAppsBar: React.FC<AdminQuickAppsBarProps> = ({
  apps,
  onUpdateApps,
  adminLanguage,
  onShowToast,
}) => {
  const at = getAdminTranslations(adminLanguage);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<AdminAndroidApp | null>(null);
  const [launchingApp, setLaunchingApp] = useState<AdminAndroidApp | null>(null);

  // Form state for add / edit
  const [formName, setFormName] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formEmoji, setFormEmoji] = useState('📱');
  const [formPreset, setFormPreset] = useState<AdminAndroidApp['iconPreset']>('custom');
  const [formPackage, setFormPackage] = useState('');
  const [formDeepLink, setFormDeepLink] = useState('');
  const [formWebUrl, setFormWebUrl] = useState('');
  const [formColor, setFormColor] = useState('#7c3aed');

  const sortedApps = [...apps].sort((a, b) => a.order - b.order);
  const visibleApps = sortedApps.filter((a) => a.isVisible);

  const openAddForm = () => {
    setEditingApp({
      id: '',
      name: '',
      subtitle: '',
      emoji: '📱',
      iconPreset: 'custom',
      packageName: '',
      deepLinkUrl: '',
      webFallbackUrl: '',
      accentColor: '#7c3aed',
      isVisible: true,
      order: apps.length,
    });
    setFormName('');
    setFormSubtitle('');
    setFormEmoji('📱');
    setFormPreset('custom');
    setFormPackage('');
    setFormDeepLink('');
    setFormWebUrl('');
    setFormColor('#7c3aed');
  };

  const openEditForm = (app: AdminAndroidApp) => {
    setEditingApp(app);
    setFormName(app.name);
    setFormSubtitle(app.subtitle || '');
    setFormEmoji(app.emoji || '📱');
    setFormPreset(app.iconPreset || 'custom');
    setFormPackage(app.packageName || '');
    setFormDeepLink(app.deepLinkUrl || '');
    setFormWebUrl(app.webFallbackUrl || '');
    setFormColor(app.accentColor || '#7c3aed');
  };

  const handleSaveAppForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    playCabinChime('acknowledged');

    if (editingApp && editingApp.id) {
      const updated = apps.map((a) =>
        a.id === editingApp.id
          ? {
              ...a,
              name: formName.trim(),
              subtitle: formSubtitle.trim() || 'Android App',
              emoji: formEmoji,
              iconPreset: formPreset,
              packageName: formPackage.trim(),
              deepLinkUrl: formDeepLink.trim(),
              webFallbackUrl: formWebUrl.trim(),
              accentColor: formColor,
            }
          : a
      );
      onUpdateApps(updated);
      onShowToast(`${formName.trim()} updated`);
    } else {
      const newApp: AdminAndroidApp = {
        id: `admin-app-${Date.now()}`,
        name: formName.trim(),
        subtitle: formSubtitle.trim() || 'Driver Android App',
        emoji: formEmoji,
        iconPreset: formPreset,
        packageName: formPackage.trim(),
        deepLinkUrl: formDeepLink.trim(),
        webFallbackUrl: formWebUrl.trim(),
        accentColor: formColor,
        isVisible: true,
        order: apps.length,
      };
      onUpdateApps([...apps, newApp]);
      onShowToast(`${newApp.name} added`);
    }
    setEditingApp(null);
  };

  const handleMove = (id: string, dir: 'prev' | 'next') => {
    playCabinChime('tap');
    const idx = sortedApps.findIndex((a) => a.id === id);
    if (idx < 0) return;
    const swapIdx = dir === 'prev' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sortedApps.length) return;
    const copy = [...sortedApps];
    const [moved] = copy.splice(idx, 1);
    copy.splice(swapIdx, 0, moved);
    const reindexed = copy.map((item, i) => ({ ...item, order: i }));
    onUpdateApps(reindexed);
  };

  const handleToggleVisible = (id: string) => {
    playCabinChime('tap');
    onUpdateApps(apps.map((a) => (a.id === id ? { ...a, isVisible: !a.isVisible } : a)));
  };

  const handleDelete = (id: string) => {
    playCabinChime('tap');
    onUpdateApps(apps.filter((a) => a.id !== id));
    onShowToast('Removed admin quick app');
  };

  const handleResetDefaults = () => {
    playCabinChime('acknowledged');
    onUpdateApps(DEFAULT_ADMIN_ANDROID_APPS);
    onShowToast('Admin Android apps reset to defaults');
  };

  const buildAndroidIntentHref = (app: AdminAndroidApp) => {
    if (app.packageName && typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent)) {
      const fallback = encodeURIComponent(app.webFallbackUrl || `https://play.google.com/store/apps/details?id=${app.packageName}`);
      return `intent://#Intent;package=${app.packageName};S.browser_fallback_url=${fallback};end`;
    }
    return app.deepLinkUrl || app.webFallbackUrl || `https://play.google.com/store/apps/details?id=${app.packageName}`;
  };

  return (
    <div className="p-4 sm:p-5 rounded-3xl cabin-card border shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl cabin-primary-btn flex items-center justify-center shrink-0 shadow-sm">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold tracking-tight flex items-center gap-2">
              <span>{at.adminAppsTitle}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black cabin-badge border">
                {visibleApps.length}
              </span>
            </h3>
            <p className="text-xs cabin-text-muted">{at.adminAppsSub}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            playCabinChime('tap');
            setIsCustomizeOpen(true);
          }}
          className="px-3.5 py-2 rounded-xl cabin-badge border hover:brightness-110 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>{at.customizeAdminApps}</span>
        </button>
      </div>

      {/* Tactile Quick-Launch Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {visibleApps.map((app) => (
          <button
            key={app.id}
            type="button"
            onClick={() => {
              playCabinChime('tap');
              setLaunchingApp(app);
            }}
            className="group p-3 rounded-2xl cabin-panel border hover:brightness-110 transition-all text-left flex items-center gap-3 cursor-pointer shadow-2xs"
            title={`${app.name} — ${at.tapToOpenApp}`}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform"
              style={{ backgroundColor: app.accentColor || '#7c3aed' }}
            >
              {renderAppIcon(app)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs sm:text-sm font-extrabold truncate">{app.name}</div>
              <div className="text-[10px] cabin-text-muted truncate">
                {app.subtitle || app.packageName || at.tapToOpenApp}
              </div>
            </div>
          </button>
        ))}

        {/* Quick "+ Add App" Button right in the bar */}
        <button
          type="button"
          onClick={() => {
            playCabinChime('tap');
            setIsCustomizeOpen(true);
            openAddForm();
          }}
          className="p-3 rounded-2xl border border-dashed cabin-panel hover:brightness-110 transition-all flex items-center justify-center gap-2 text-xs font-extrabold cabin-text-muted cursor-pointer min-h-[68px]"
        >
          <Plus className="w-4 h-4" />
          <span>{at.addAdminApp}</span>
        </button>
      </div>

      {/* App Launch Helper Modal (avoids popup blockers & window.open) */}
      {launchingApp && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="cabin-card border rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: launchingApp.accentColor || '#7c3aed' }}
                >
                  {renderAppIcon(launchingApp)}
                </div>
                <div>
                  <h4 className="font-black text-base">{launchingApp.name}</h4>
                  <p className="text-xs cabin-text-muted">{launchingApp.subtitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLaunchingApp(null)}
                className="p-1.5 rounded-xl cabin-panel border cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {launchingApp.packageName && (
              <div className="p-3 rounded-xl cabin-panel border text-[11px] font-mono cabin-text-muted break-all">
                Android Package: {launchingApp.packageName}
              </div>
            )}

            <div className="grid grid-cols-1 gap-2.5 pt-1">
              {(launchingApp.deepLinkUrl || launchingApp.packageName) && (
                <a
                  href={buildAndroidIntentHref(launchingApp)}
                  rel="noopener noreferrer"
                  onClick={() => {
                    playCabinChime('acknowledged');
                    onShowToast(`Launching ${launchingApp.name}...`);
                  }}
                  className="w-full py-3 px-4 rounded-xl cabin-primary-btn font-extrabold text-xs flex items-center justify-center gap-2 hover:brightness-110 shadow-md text-center"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Open Installed Android App ({launchingApp.name})</span>
                </a>
              )}

              {launchingApp.webFallbackUrl && (
                <a
                  href={launchingApp.webFallbackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => playCabinChime('tap')}
                  className="w-full py-2.5 px-4 rounded-xl cabin-panel border font-bold text-xs flex items-center justify-center gap-2 hover:brightness-110"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Web Version ({launchingApp.webFallbackUrl})</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Customize Admin Android Apps Modal */}
      {isCustomizeOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="cabin-card border rounded-3xl max-w-3xl w-full p-5 sm:p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b" style={{ borderColor: 'var(--cabin-border)' }}>
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5" style={{ color: 'var(--cabin-accent)' }} />
                <div>
                  <h3 className="font-black text-base">{at.customizeAdminApps}</h3>
                  <p className="text-xs cabin-text-muted">{at.adminAppsSub}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="px-3 py-1.5 rounded-xl cabin-panel border text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{at.resetDefaultApps}</span>
                </button>
                <button
                  type="button"
                  onClick={openAddForm}
                  className="px-3 py-1.5 rounded-xl cabin-primary-btn text-xs font-extrabold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{at.addAdminApp}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingApp(null);
                    setIsCustomizeOpen(false);
                  }}
                  className="p-1.5 rounded-xl cabin-panel border cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add / Edit Inline Form */}
            {editingApp && (
              <form
                onSubmit={handleSaveAppForm}
                className="p-4 rounded-2xl cabin-panel border space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm">
                    {editingApp.id ? `${at.editAdminApp}: ${editingApp.name}` : at.addAdminApp}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingApp(null)}
                    className="cabin-text-muted hover:opacity-100 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold cabin-text-muted mb-1">{at.appNameLabel} *</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Spotify, YouTube, Audible..."
                      className="w-full px-3 py-2 rounded-xl cabin-card border text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold cabin-text-muted mb-1">{at.appSubtitleLabel}</label>
                    <input
                      type="text"
                      value={formSubtitle}
                      onChange={(e) => setFormSubtitle(e.target.value)}
                      placeholder="Driver Audio / Navigation"
                      className="w-full px-3 py-2 rounded-xl cabin-card border text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold cabin-text-muted mb-1">{at.appColorLabel}</label>
                    <input
                      type="color"
                      value={formColor}
                      onChange={(e) => setFormColor(e.target.value)}
                      className="w-full h-9 rounded-xl cabin-card border cursor-pointer p-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold cabin-text-muted mb-1">{at.appEmojiLabel}</label>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {ICON_EMOJI_OPTIONS.map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => {
                          setFormEmoji(em);
                          setFormPreset('custom');
                        }}
                        className={`w-8 h-8 rounded-lg border text-base flex items-center justify-center cursor-pointer ${
                          formEmoji === em ? 'cabin-primary-btn' : 'cabin-card'
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold cabin-text-muted mb-1">{at.appPackageLabel}</label>
                    <input
                      type="text"
                      value={formPackage}
                      onChange={(e) => setFormPackage(e.target.value)}
                      placeholder="com.spotify.music"
                      className="w-full px-3 py-2 rounded-xl cabin-card border font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold cabin-text-muted mb-1">{at.appDeepLinkLabel}</label>
                    <input
                      type="text"
                      value={formDeepLink}
                      onChange={(e) => setFormDeepLink(e.target.value)}
                      placeholder="spotify: or waze://"
                      className="w-full px-3 py-2 rounded-xl cabin-card border font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold cabin-text-muted mb-1">{at.appWebUrlLabel}</label>
                    <input
                      type="url"
                      value={formWebUrl}
                      onChange={(e) => setFormWebUrl(e.target.value)}
                      placeholder="https://open.spotify.com"
                      className="w-full px-3 py-2 rounded-xl cabin-card border font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingApp(null)}
                    className="px-4 py-2 rounded-xl cabin-card border font-bold cursor-pointer"
                  >
                    {at.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl cabin-primary-btn font-extrabold cursor-pointer"
                  >
                    {at.saveChanges}
                  </button>
                </div>
              </form>
            )}

            {/* Existing Apps List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sortedApps.map((app, index) => (
                <div
                  key={app.id}
                  className={`p-3.5 rounded-2xl cabin-panel border flex items-center justify-between gap-3 ${
                    app.isVisible ? '' : 'opacity-55'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                      style={{ backgroundColor: app.accentColor || '#7c3aed' }}
                    >
                      {renderAppIcon(app)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-extrabold text-xs sm:text-sm truncate">{app.name}</div>
                      <div className="text-[10px] cabin-text-muted truncate">{app.packageName || app.webFallbackUrl}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleMove(app.id, 'prev')}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg cabin-card border disabled:opacity-30 cursor-pointer"
                      title="Move Left"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(app.id, 'next')}
                      disabled={index === sortedApps.length - 1}
                      className="p-1.5 rounded-lg cabin-card border disabled:opacity-30 cursor-pointer"
                      title="Move Right"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleVisible(app.id)}
                      className="p-1.5 rounded-lg cabin-card border cursor-pointer"
                      title={app.isVisible ? at.hideBtn : at.showBtn}
                    >
                      {app.isVisible ? <Eye className="w-3.5 h-3.5 text-emerald-500" /> : <EyeOff className="w-3.5 h-3.5 text-amber-500" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditForm(app)}
                      className="p-1.5 rounded-lg cabin-card border cursor-pointer"
                      title={at.editBtn}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(app.id)}
                      className="p-1.5 rounded-lg cabin-card border text-rose-500 cursor-pointer"
                      title={at.deleteBtn}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
