import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  Calendar,
  Clock,
  Trash2,
  Sparkles,
  Tablet,
  CheckCircle2,
  AlertTriangle,
  Info,
  Flame,
  Plus,
} from 'lucide-react';
import { TabletDevice, ScheduledContentItem, SupportedLanguage } from '../../types/kiosk';
import { cloudSync } from '../../services/cloudSync';
import { playCabinChime } from '../../utils/cabinAudio';
import { getAdminTranslations, getAdminSubLabels } from '../../data/adminTranslations';

interface AdminAnnouncementsProps {
  tablets: TabletDevice[];
  onBroadcastAnnouncement: (text: string) => void;
  onShowToast: (msg: string) => void;
  adminLanguage?: SupportedLanguage;
}

export const AdminAnnouncements: React.FC<AdminAnnouncementsProps> = ({
  tablets,
  onBroadcastAnnouncement,
  onShowToast,
  adminLanguage = 'en',
}) => {
  const at = getAdminTranslations(adminLanguage);
  const sl = getAdminSubLabels(adminLanguage);
  const [targetTablet, setTargetTablet] = useState<'all' | string>('all');
  const [priority, setPriority] = useState<'info' | 'promo' | 'alert'>('info');
  const [announcementText, setAnnouncementText] = useState('');
  const [scheduledList, setScheduledList] = useState<ScheduledContentItem[]>([]);

  // Form for scheduled content
  const [isScheduling, setIsScheduling] = useState(false);
  const [schedTitle, setSchedTitle] = useState('');
  const [schedType, setSchedType] = useState<ScheduledContentItem['type']>('announcement');
  const [schedStartDate, setSchedStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [schedStartTime, setSchedStartTime] = useState('14:00');
  const [schedEndDate, setSchedEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [schedEndTime, setSchedEndTime] = useState('18:00');
  const [schedPayload, setSchedPayload] = useState('');

  // Subscribe to schedules
  useEffect(() => {
    const unsub = cloudSync.subscribeToSchedules((items) => {
      setScheduledList(items);
    });
    return () => unsub();
  }, []);

  const predefinedTemplates = [
    { text: 'Welcome aboard! Enjoy complimentary 5G Wi-Fi & device charging.', category: 'Welcome' },
    { text: 'Heading to Notre Dame? Ask Carlos for campus drop-off points.', category: 'Local' },
    { text: 'Reserve your personal constant driver for future business trips.', category: 'Service' },
    { text: 'Smooth highway cruise — current estimated arrival in 15 minutes.', category: 'Traffic' },
    { text: 'Cold water and snacks are available for your comfort.', category: 'Amenities' },
  ];

  const handleBroadcastNow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;

    playCabinChime('acknowledged');
    onBroadcastAnnouncement(announcementText.trim());
    onShowToast(`Dispatched announcement to ${targetTablet === 'all' ? 'all tablets' : targetTablet}!`);
    setAnnouncementText('');
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedTitle.trim() || !schedPayload.trim()) {
      onShowToast('Please provide a title and announcement content');
      return;
    }

    playCabinChime('acknowledged');
    const newItem: ScheduledContentItem = {
      id: `sched-${Date.now()}`,
      title: schedTitle.trim(),
      type: schedType,
      targetTabletId: targetTablet,
      startDate: schedStartDate,
      startTime: schedStartTime,
      endDate: schedEndDate,
      endTime: schedEndTime,
      isActive: true,
      contentPayload: schedPayload.trim(),
      createdAt: Date.now(),
    };

    await cloudSync.saveSchedule(newItem);
    setIsScheduling(false);
    setSchedTitle('');
    setSchedPayload('');
    onShowToast('Scheduled announcement saved to cloud calendar!');
  };

  const handleDeleteSchedule = async (id: string) => {
    playCabinChime('tap');
    await cloudSync.deleteSchedule(id);
    onShowToast('Removed scheduled item');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 border border-indigo-800/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/40">
              <Bell className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {at.announcementsTitle}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300">
            {at.announcementsSub}
          </p>
        </div>

        <button
          onClick={() => {
            playCabinChime('tap');
            setIsScheduling(!isScheduling);
          }}
          className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-indigo-600/30"
        >
          <Calendar className="w-4 h-4" />
          <span>{isScheduling ? sl.closeForm : sl.scheduleBroadcast}</span>
        </button>
      </div>

      {/* Instant Broadcast Form */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-indigo-400" />
            <h3 className="font-extrabold text-sm sm:text-base text-white">{sl.broadcastNow}</h3>
          </div>
        </div>

        <form onSubmit={handleBroadcastNow} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Target tablet */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">{sl.targetTablet}</label>
              <select
                value={targetTablet}
                onChange={(e) => setTargetTablet(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="all">{sl.allTablets}</option>
                {tablets.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.vehicleModel})
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">{sl.bannerPriority}</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="info">Standard (Purple Gradient)</option>
                <option value="promo">Promo Spotlight (Indigo/Gold)</option>
                <option value="alert">Driver / Traffic Alert (Amber)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">{sl.announcementText}</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder={at.pushAnnouncementPlaceholder}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-98 transition-all cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
                <span>{sl.dispatch}</span>
              </button>
            </div>
          </div>

          {/* Predefined message templates */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Predefined Templates (Tap to Insert):
            </span>
            <div className="flex flex-wrap gap-2">
              {predefinedTemplates.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    playCabinChime('tap');
                    setAnnouncementText(item.text);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-indigo-900/40 border border-slate-800 hover:border-indigo-500/50 text-xs text-slate-300 hover:text-white transition-all text-left cursor-pointer"
                >
                  <span className="font-bold text-indigo-400 mr-1.5">[{item.category}]</span>
                  <span>{item.text}</span>
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* Scheduling Creator Form (Collapsible) */}
      {isScheduling && (
        <form
          onSubmit={handleSaveSchedule}
          className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-purple-800/40 space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              <h3 className="font-extrabold text-sm sm:text-base text-white">Create Scheduled Broadcast / Promotion</h3>
            </div>
            <span className="text-xs text-purple-300">Automated by Date & Time</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Campaign Title *</label>
              <input
                type="text"
                required
                value={schedTitle}
                onChange={(e) => setSchedTitle(e.target.value)}
                placeholder="e.g. Notre Dame Game Day Promotion"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Content Type</label>
              <select
                value={schedType}
                onChange={(e) => setSchedType(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500"
              >
                <option value="announcement">Announcement Banner Overlay</option>
                <option value="screensaver">Screensaver Promotional Poster</option>
                <option value="quick_connect">Quick Connect Highlight</option>
                <option value="button_promo">App Button Spotlight</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Start Date</label>
              <input
                type="date"
                value={schedStartDate}
                onChange={(e) => setSchedStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Start Time</label>
              <input
                type="time"
                value={schedStartTime}
                onChange={(e) => setSchedStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">End Date</label>
              <input
                type="date"
                value={schedEndDate}
                onChange={(e) => setSchedEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">End Time</label>
              <input
                type="time"
                value={schedEndTime}
                onChange={(e) => setSchedEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Announcement Content / Payload *</label>
            <textarea
              rows={2}
              required
              value={schedPayload}
              onChange={(e) => setSchedPayload(e.target.value)}
              placeholder="Text or promotional copy to show during the scheduled window..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsScheduling(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-400 hover:text-white"
            >
              {at.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md cursor-pointer"
            >
              {sl.saveSchedule}
            </button>
          </div>
        </form>
      )}

      {/* Active Schedules Table */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-400" />
            <h3 className="font-extrabold text-sm sm:text-base text-white">{sl.activeScheduledCal}</h3>
          </div>
          <span className="text-xs text-slate-400">{scheduledList.length}</span>
        </div>

        {scheduledList.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No scheduled broadcasts or promotions currently active. Tap "Schedule Future Broadcast" above to create one.
          </div>
        ) : (
          <div className="space-y-2.5">
            {scheduledList.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-white">{item.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                      {item.type}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Target: {item.targetTabletId === 'all' ? 'Fleet-wide' : item.targetTabletId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">"{item.contentPayload}"</p>
                  <div className="text-[11px] text-slate-500 flex items-center gap-3">
                    <span>From: <strong>{item.startDate} {item.startTime}</strong></span>
                    <span>To: <strong>{item.endDate} {item.endTime}</strong></span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteSchedule(item.id)}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/40 transition-colors cursor-pointer shrink-0"
                  title="Delete schedule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
