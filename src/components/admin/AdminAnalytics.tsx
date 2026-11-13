import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  MessageSquare,
  Music,
  Briefcase,
  Star,
  FileSpreadsheet,
  Printer,
  Download,
  Play,
  Calendar as CalendarIcon,
  CheckCircle2,
} from 'lucide-react';
import {
  AnalyticsEvent,
  SongRequest,
  CabinMessage,
  ServiceInquiry,
  PassengerFeedback,
  DriverProfile,
  WorkShift,
  SupportedLanguage,
} from '../../types/kiosk';
import { cloudSync } from '../../services/cloudSync';
import { playCabinChime } from '../../utils/cabinAudio';
import { getAdminTranslations, getAdminSubLabels } from '../../data/adminTranslations';

interface AdminAnalyticsProps {
  songRequests: SongRequest[];
  cabinMessages: CabinMessage[];
  inquiries: ServiceInquiry[];
  drivers?: DriverProfile[];
  adminLanguage?: SupportedLanguage;
}

type ReportType = 'fleet_summary' | 'passenger_requests' | 'driver_shifts' | 'feedback_inquiries';
type ReportRange = 'daily' | 'weekly' | 'monthly' | 'all';

interface GeneratedReport {
  id: string;
  title: string;
  reportType: ReportType;
  generatedAt: string;
  rangeLabel: string;
  driverFilterLabel: string;
  summaryStats: { label: string; value: string }[];
  columns: string[];
  rows: string[][];
}

function calcShiftHrs(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  if (Number.isNaN(sh) || Number.isNaN(eh)) return 0;
  let startM = sh * 60 + (sm || 0);
  let endM = eh * 60 + (em || 0);
  if (endM <= startM) endM += 24 * 60;
  return Math.round(((endM - startM) / 60) * 10) / 10;
}

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({
  songRequests,
  cabinMessages,
  inquiries,
  drivers = [],
  adminLanguage = 'en',
}) => {
  const at = getAdminTranslations(adminLanguage);
  const sl = getAdminSubLabels(adminLanguage);
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [feedbackList, setFeedbackList] = useState<PassengerFeedback[]>([]);
  const [shifts, setShifts] = useState<WorkShift[]>([]);

  // Analytical Report Generator State
  const [reportType, setReportType] = useState<ReportType>('fleet_summary');
  const [reportRange, setReportRange] = useState<ReportRange>('weekly');
  const [reportDriverId, setReportDriverId] = useState<string>('all');
  const [activeReport, setActiveReport] = useState<GeneratedReport | null>(null);

  useEffect(() => {
    const unsubEvents = cloudSync.subscribeToAnalytics((evts) => {
      setEvents(evts);
    });
    const unsubFb = cloudSync.subscribeToFeedback((fbs) => {
      setFeedbackList(fbs);
    });
    const unsubShifts = cloudSync.subscribeToWorkShifts((sh) => {
      setShifts(sh || []);
    });
    return () => {
      unsubEvents();
      unsubFb();
      unsubShifts();
    };
  }, []);

  // Filter based on selected KPI time range
  const now = Date.now();
  const timeThreshold =
    timeRange === 'daily'
      ? now - 1000 * 60 * 60 * 24
      : timeRange === 'weekly'
      ? now - 1000 * 60 * 60 * 24 * 7
      : now - 1000 * 60 * 60 * 24 * 30;

  const filteredEvents = events.filter((e) => e.timestamp >= timeThreshold);
  const filteredSongs = songRequests.filter((s) => s.requestedAt >= timeThreshold);
  const filteredComfort = cabinMessages.filter((m) => m.sentAt >= timeThreshold);
  const filteredInquiries = inquiries.filter((i) => i.submittedAt >= timeThreshold);
  const filteredFeedback = feedbackList.filter((f) => f.submittedAt >= timeThreshold);

  const averageRating =
    filteredFeedback.length > 0
      ? (filteredFeedback.reduce((acc, curr) => acc + curr.rating, 0) / filteredFeedback.length).toFixed(1)
      : '5.0';

  const totalPassengerInteractions =
    filteredSongs.length +
    filteredComfort.length +
    filteredInquiries.length +
    filteredFeedback.length +
    filteredEvents.length;

  const handleRunReport = () => {
    playCabinChime('acknowledged');
    const cutoff =
      reportRange === 'daily'
        ? Date.now() - 86400000
        : reportRange === 'weekly'
        ? Date.now() - 86400000 * 7
        : reportRange === 'monthly'
        ? Date.now() - 86400000 * 30
        : 0;

    const rangeLabel =
      reportRange === 'daily'
        ? 'Last 24 Hours'
        : reportRange === 'weekly'
        ? 'Last 7 Days'
        : reportRange === 'monthly'
        ? 'Last 30 Days'
        : 'All Recorded History';

    const driverObj = drivers.find((d) => d.id === reportDriverId);
    const driverFilterLabel = driverObj ? driverObj.name : 'All Fleet Drivers';

    const matchDriver = (id?: string) => reportDriverId === 'all' || !id || id === reportDriverId;

    const rSongs = songRequests.filter((s) => s.requestedAt >= cutoff && matchDriver(s.driverId));
    const rMsgs = cabinMessages.filter((m) => m.sentAt >= cutoff && matchDriver(m.driverId));
    const rInq = inquiries.filter((i) => i.submittedAt >= cutoff && matchDriver(i.driverId));
    const rFb = feedbackList.filter((f) => f.submittedAt >= cutoff && matchDriver(f.driverId));
    const rShifts = shifts.filter((s) => {
      const ts = new Date(`${s.dateStr}T12:00:00`).getTime();
      const inRange = cutoff === 0 || ts >= cutoff;
      return inRange && (reportDriverId === 'all' || s.driverId === reportDriverId);
    });

    const totalShiftHours = rShifts
      .filter((s) => s.status !== 'time_off')
      .reduce((acc, s) => acc + calcShiftHrs(s.startTime, s.endTime), 0);

    if (reportType === 'fleet_summary') {
      const driverRows = (driverObj ? [driverObj] : drivers).map((d) => {
        const dShifts = rShifts.filter((s) => s.driverId === d.id && s.status !== 'time_off');
        const dHrs = dShifts.reduce((a, s) => a + calcShiftHrs(s.startTime, s.endTime), 0);
        const dReqs = rMsgs.filter((m) => m.driverId === d.id).length + rSongs.filter((s) => s.driverId === d.id).length;
        const dInq = rInq.filter((i) => i.driverId === d.id).length;
        const dFbs = rFb.filter((f) => f.driverId === d.id);
        const dRating = dFbs.length
          ? (dFbs.reduce((a, b) => a + b.rating, 0) / dFbs.length).toFixed(1)
          : String(d.rating);
        return [
          d.name,
          d.vehicleModel,
          String(dShifts.length),
          `${dHrs.toFixed(1)} hrs`,
          String(dReqs),
          String(dInq),
          `${dRating} ★`,
        ];
      });

      setActiveReport({
        id: `rep-${Date.now()}`,
        title: 'Executive Fleet Performance Report',
        reportType,
        generatedAt: new Date().toLocaleString(),
        rangeLabel,
        driverFilterLabel,
        summaryStats: [
          { label: 'Active Drivers', value: String(driverObj ? 1 : drivers.length) },
          { label: 'Total Requests & Songs', value: String(rMsgs.length + rSongs.length) },
          { label: 'Scheduled Hours', value: `${totalShiftHours.toFixed(1)}h` },
          { label: 'Service Inquiries', value: String(rInq.length) },
        ],
        columns: ['Driver', 'Vehicle', 'Shifts', 'Scheduled Hours', 'Passenger Requests', 'Inquiries', 'Rating'],
        rows: driverRows.length > 0 ? driverRows : [['Fleet Active', 'Silvermyst SUV', String(rShifts.length), `${totalShiftHours.toFixed(1)} hrs`, String(rMsgs.length + rSongs.length), String(rInq.length), `${averageRating} ★`]],
      });
    } else if (reportType === 'passenger_requests') {
      const rows = [
        ...rMsgs.map((m) => [
          new Date(m.sentAt).toLocaleString(),
          'Cabin Message / Comfort',
          m.text,
          m.audioDuration ? `Audio (${m.audioDuration}s)` : m.type,
          m.status.toUpperCase(),
        ]),
        ...rSongs.map((s) => [
          new Date(s.requestedAt).toLocaleString(),
          'Song Request',
          `${s.title} — ${s.artist}`,
          s.genre,
          s.status.toUpperCase(),
        ]),
      ];

      setActiveReport({
        id: `rep-${Date.now()}`,
        title: 'Passenger Requests & Cabin Chat Report',
        reportType,
        generatedAt: new Date().toLocaleString(),
        rangeLabel,
        driverFilterLabel,
        summaryStats: [
          { label: 'Cabin Comfort & Chat', value: String(rMsgs.length) },
          { label: 'Song Requests', value: String(rSongs.length) },
          { label: 'Pending Action', value: String(rMsgs.filter((m) => m.status === 'sent').length + rSongs.filter((s) => s.status === 'pending').length) },
          { label: 'Acknowledged', value: String(rMsgs.filter((m) => m.status === 'acknowledged').length + rSongs.filter((s) => s.status !== 'pending').length) },
        ],
        columns: ['Timestamp', 'Category', 'Details', 'Type / Genre', 'Status'],
        rows: rows.length > 0 ? rows : [['No requests found in selected range', '-', '-', '-', '-']],
      });
    } else if (reportType === 'driver_shifts') {
      const rows = rShifts.map((s) => [
        s.dateStr,
        s.driverName,
        `${s.startTime} - ${s.endTime}`,
        `${calcShiftHrs(s.startTime, s.endTime)} hrs`,
        s.timeZone,
        s.locationZone,
        s.status.replace('_', ' ').toUpperCase(),
      ]);

      setActiveReport({
        id: `rep-${Date.now()}`,
        title: 'Driver Working Shifts & Operating Zones Report',
        reportType,
        generatedAt: new Date().toLocaleString(),
        rangeLabel,
        driverFilterLabel,
        summaryStats: [
          { label: 'Total Shifts', value: String(rShifts.length) },
          { label: 'Total Working Hours', value: `${totalShiftHours.toFixed(1)}h` },
          { label: 'Active Drivers', value: String(new Set(rShifts.map((s) => s.driverId)).size) },
          { label: 'Time Off Entries', value: String(rShifts.filter((s) => s.status === 'time_off').length) },
        ],
        columns: ['Date', 'Driver', 'Shift Hours', 'Duration', 'Time Zone', 'Location Zone', 'Status'],
        rows: rows.length > 0 ? rows : [['No shifts scheduled in selected range', '-', '-', '-', '-', '-', '-']],
      });
    } else {
      const rows: string[][] = [
        ...rInq.map((i) => [
          new Date(i.submittedAt).toLocaleDateString(),
          'Service Inquiry',
          i.passengerName || 'Guest Passenger',
          i.serviceTitle,
          i.notes || i.phoneOrContact,
          i.status.toUpperCase(),
        ]),
        ...rFb.map((f) => [
          new Date(f.submittedAt).toLocaleDateString(),
          `Feedback (${f.category})`,
          'Guest Passenger',
          f.driverName || 'Host',
          f.message || f.compliments?.join(', ') || 'Positive feedback',
          `${f.rating}/5 ★`,
        ]),
      ];

      setActiveReport({
        id: `rep-${Date.now()}`,
        title: 'Passenger Feedback & Service Inquiries Report',
        reportType,
        generatedAt: new Date().toLocaleString(),
        rangeLabel,
        driverFilterLabel,
        summaryStats: [
          { label: 'Service Inquiries', value: String(rInq.length) },
          { label: 'Reviews Logged', value: String(rFb.length) },
          { label: 'Average Rating', value: `${averageRating} ★` },
          { label: 'New Inquiries', value: String(rInq.filter((i) => i.status === 'new').length) },
        ],
        columns: ['Date', 'Record Type', 'Passenger', 'Subject / Driver', 'Details / Contact', 'Status / Score'],
        rows: rows.length > 0 ? rows : [['No feedback or inquiries found in selected range', '-', '-', '-', '-', '-']],
      });
    }
  };

  const handleExportCsv = () => {
    if (!activeReport) return;
    playCabinChime('tap');
    const escapeCell = (val: string) => `"${String(val).replace(/"/g, '""')}"`;
    const csvLines = [
      [escapeCell(activeReport.title), escapeCell(`Generated: ${activeReport.generatedAt}`)].join(','),
      [escapeCell(`Range: ${activeReport.rangeLabel}`), escapeCell(`Driver: ${activeReport.driverFilterLabel}`)].join(','),
      '',
      activeReport.columns.map(escapeCell).join(','),
      ...activeReport.rows.map((row) => row.map(escapeCell).join(',')),
    ];
    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `silvermyst-${activeReport.reportType}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-800/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-600/30 text-blue-300 border border-blue-500/40">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {at.analyticsTitle}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300">
            {at.analyticsSub}
          </p>
        </div>

        {/* Time Filter Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs shrink-0">
          {[
            { id: 'daily', label: sl.last24Hours },
            { id: 'weekly', label: sl.thisWeek },
            { id: 'monthly', label: sl.thisMonth },
          ].map((period) => (
            <button
              key={period.id}
              onClick={() => setTimeRange(period.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                timeRange === period.id
                  ? 'bg-blue-600 text-white shadow-xs font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">{sl.totalInteractions}</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{totalPassengerInteractions}</div>
          <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
            <span>Live Fleet Telemetry</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">{sl.songRequests}</span>
            <Music className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">{filteredSongs.length}</div>
          <div className="text-[11px] text-slate-400 font-medium">{sl.thisWeek}</div>
        </div>

        <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">{sl.comfortAndChat}</span>
            <MessageSquare className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-400">{filteredComfort.length}</div>
          <div className="text-[11px] text-slate-400 font-medium">VIP Cabin</div>
        </div>

        <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">{sl.scheduledShifts}</span>
            <CalendarIcon className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-400">{shifts.length}</div>
          <div className="text-[11px] text-slate-400 font-medium">{filteredInquiries.length} • {at.inquiriesTitle}</div>
        </div>

        <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">{sl.ratingScore}</span>
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400">{averageRating} ★</div>
          <div className="text-[11px] text-slate-400 font-medium">{filteredFeedback.length} {sl.reviewsShown}</div>
        </div>
      </div>

      {/* NEW: Run Analytical Reports Builder */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/95 border border-indigo-700/40 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              <span>{sl.runAnalyticalReports}</span>
            </h3>
            <p className="text-xs text-slate-400">
              {at.analyticsSub}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeReport && (
              <>
                <button
                  onClick={handleExportCsv}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{sl.exportCsv}</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{sl.print}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Report Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 font-bold mb-1">{sl.reportType}</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold cursor-pointer"
            >
              <option value="fleet_summary">Executive Fleet Summary</option>
              <option value="passenger_requests">{at.requestsTitle}</option>
              <option value="driver_shifts">{at.shiftCalTitle}</option>
              <option value="feedback_inquiries">{at.feedbackTitle}</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">{sl.timeframe}</label>
            <select
              value={reportRange}
              onChange={(e) => setReportRange(e.target.value as ReportRange)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold cursor-pointer"
            >
              <option value="daily">{sl.last24Hours}</option>
              <option value="weekly">{sl.thisWeek}</option>
              <option value="monthly">{sl.thisMonth}</option>
              <option value="all">{sl.allHistory}</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">{sl.driverScope}</label>
            <select
              value={reportDriverId}
              onChange={(e) => setReportDriverId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold cursor-pointer"
            >
              <option value="all">{sl.allStaff} ({drivers.length})</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleRunReport}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:brightness-110 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{at.generateReport}</span>
            </button>
          </div>
        </div>

        {/* Generated Report Preview */}
        {activeReport && (
          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 sm:p-5 space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm sm:text-base font-black text-white">{activeReport.title}</h4>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Scope: <strong className="text-slate-200">{activeReport.driverFilterLabel}</strong> • Period:{' '}
                  <strong className="text-slate-200">{activeReport.rangeLabel}</strong> • Generated: {activeReport.generatedAt}
                </p>
              </div>
            </div>

            {/* Summary Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {activeReport.summaryStats.map((st, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{st.label}</div>
                  <div className="text-lg font-black text-sky-400 mt-0.5">{st.value}</div>
                </div>
              ))}
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-slate-300 border-b border-slate-800">
                    {activeReport.columns.map((col, idx) => (
                      <th key={idx} className="py-2.5 px-3 font-extrabold whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {activeReport.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-900/50 text-slate-200">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="py-2.5 px-3 whitespace-nowrap max-w-[260px] truncate">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Secondary Detailed Breakdown: Most Popular Apps & Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Most Tapped Launcher Apps */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-extrabold text-sm sm:text-base text-white">{sl.mostTappedApps}</h3>
            <span className="text-xs text-slate-400">{sl.thisMonth}</span>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Spotify Music Streamer', category: 'Music', count: 48, percent: 85, color: 'bg-emerald-500' },
              { name: 'Cabin Arcade & Trivia', category: 'Games', count: 36, percent: 65, color: 'bg-indigo-500' },
              { name: 'Explore Nearby & Sights', category: 'Local Guide', count: 29, percent: 52, color: 'bg-sky-500' },
              { name: 'Weather & 7-Day Forecast', category: 'Utility', count: 24, percent: 42, color: 'bg-blue-500' },
              { name: 'Google Maps Navigation', category: 'Maps', count: 18, percent: 32, color: 'bg-amber-500' },
              { name: 'Carlos Photo Gallery', category: 'Photography', count: 14, percent: 25, color: 'bg-purple-500' },
            ].map((app, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-white">{app.name}</span>
                  <span className="text-slate-400">{app.count}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                  <div className={`h-full ${app.color}`} style={{ width: `${app.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Passenger Entertainment & Atmosphere Preferences Breakdown */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-extrabold text-sm sm:text-base text-white">{sl.atmospherePrefs}</h3>
            <span className="text-xs text-slate-400">VIP</span>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Quiet Ride (No conversation / restful cabin)', percent: 54, count: '54%' },
              { label: 'Friendly Conversation & Local Insights', percent: 34, count: '34%' },
              { label: 'Tour Guide Mode (Notre Dame & South Bend history)', percent: 12, count: '12%' },
              { label: 'Comfort AC Standard (71°F)', percent: 68, count: '68%' },
              { label: 'Cooler AC Request (68°F)', percent: 24, count: '24%' },
            ].map((pref, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-300">{pref.label}</span>
                  <span className="text-purple-400">{pref.count}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500" style={{ width: `${pref.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

