import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Globe,
  Plus,
  Edit2,
  Trash2,
  Car,
  Users,
  CheckCircle2,
  X,
  GripVertical,
  Printer,
  Mail,
  MessageSquare,
  CalendarPlus,
  Download,
  ArrowLeftRight,
  Check,
  Copy,
  RefreshCw,
} from 'lucide-react';
import { DriverProfile, ShiftChangeRequest, WorkShift, SupportedLanguage } from '../../types/kiosk';
import { cloudSync } from '../../services/cloudSync';
import { playCabinChime } from '../../utils/cabinAudio';
import { getStaffRoleMeta } from '../../data/cabinThemes';
import { getAdminTranslations, getAdminSubLabels } from '../../data/adminTranslations';
import {
  connectGoogleCalendar,
  getGoogleCalendarConnectionState,
  syncShiftsBatchToGoogleCalendar,
  syncWorkShiftToGoogleCalendar,
  downloadShiftsAsIcs,
  buildGoogleCalendarQuickAddUrl,
} from '../../services/googleCalendar';

interface AdminShiftCalendarProps {
  drivers: DriverProfile[];
  currentDriver: DriverProfile;
  onShowToast: (text: string) => void;
  isDark?: boolean;
  adminLanguage?: SupportedLanguage;
}

const TIME_ZONES = [
  'America/Indiana/Indianapolis (ET)',
  'America/Chicago (CT)',
  'America/New_York (ET)',
  'America/Denver (MT)',
  'America/Los_Angeles (PT)',
];

const LOCATION_ZONES = [
  'South Bend / Notre Dame',
  "Chicago O'Hare (ORD)",
  'Chicago Midway (MDW)',
  'Indianapolis Airport (IND)',
  'Downtown Chicago Loop',
  'South Bend Airport (SBN)',
  'Granger / Mishawaka',
  'Custom Zone...',
];

const DRIVER_BADGE_COLORS = [
  'bg-purple-500/20 text-purple-300 border-purple-500/40',
  'bg-sky-500/20 text-sky-300 border-sky-500/40',
  'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  'bg-amber-500/20 text-amber-300 border-amber-500/40',
  'bg-pink-500/20 text-pink-300 border-pink-500/40',
];

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function calcShiftHours(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  if (Number.isNaN(sh) || Number.isNaN(eh)) return 0;
  const startMins = sh * 60 + (sm || 0);
  let endMins = eh * 60 + (em || 0);
  if (endMins <= startMins) endMins += 24 * 60;
  return Math.round(((endMins - startMins) / 60) * 10) / 10;
}

export const AdminShiftCalendar: React.FC<AdminShiftCalendarProps> = ({
  drivers,
  currentDriver,
  onShowToast,
  isDark = true,
  adminLanguage = 'en',
}) => {
  const at = getAdminTranslations(adminLanguage);
  const sl = getAdminSubLabels(adminLanguage);
  const todayStr = useMemo(() => toDateKey(new Date()), []);
  const [shifts, setShifts] = useState<WorkShift[]>([]);
  const [changeRequests, setChangeRequests] = useState<ShiftChangeRequest[]>([]);
  const [viewDate, setViewDate] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);
  const [filterDriverId, setFilterDriverId] = useState<string>('all');

  // Drag & drop state (Roster -> Calendar Cell)
  const [draggingDriverId, setDraggingDriverId] = useState<string | null>(null);
  const [dragOverDateStr, setDragOverDateStr] = useState<string | null>(null);

  // Shift Add / Edit form state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
  const [formDriverId, setFormDriverId] = useState<string>(currentDriver.id);
  const [formDateStr, setFormDateStr] = useState<string>(todayStr);
  const [formStartTime, setFormStartTime] = useState<string>('08:00');
  const [formEndTime, setFormEndTime] = useState<string>('17:00');
  const [formTimeZone, setFormTimeZone] = useState<string>(TIME_ZONES[0]);
  const [formLocationPreset, setFormLocationPreset] = useState<string>(LOCATION_ZONES[0]);
  const [formCustomLocation, setFormCustomLocation] = useState<string>('');
  const [formStatus, setFormStatus] = useState<WorkShift['status']>('scheduled');
  const [formNotes, setFormNotes] = useState<string>('');

  // Print / Email / Text Schedule Report modal
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [reportScope, setReportScope] = useState<'month' | 'day' | 'my_shifts'>('month');

  // Google Calendar Sync confirmation modal & status
  const [isGoogleSyncModalOpen, setIsGoogleSyncModalOpen] = useState<boolean>(false);
  const [googleSyncTargetShifts, setGoogleSyncTargetShifts] = useState<WorkShift[]>([]);
  const [googleAccountEmail, setGoogleAccountEmail] = useState<string | null>(
    () => getGoogleCalendarConnectionState().email
  );
  const [isSyncingGoogle, setIsSyncingGoogle] = useState<boolean>(false);

  // Shift Swap / Change Request modal
  const [swapModalShift, setSwapModalShift] = useState<WorkShift | null>(null);
  const [reqType, setReqType] = useState<ShiftChangeRequest['requestType']>('swap');
  const [reqTargetRole, setReqTargetRole] = useState<'driver' | 'manager'>('driver');
  const [reqTargetDriverId, setReqTargetDriverId] = useState<string>('');
  const [reqProposedStart, setReqProposedStart] = useState<string>('09:00');
  const [reqProposedEnd, setReqProposedEnd] = useState<string>('17:00');
  const [reqReason, setReqReason] = useState<string>('');

  useEffect(() => {
    const unsubShifts = cloudSync.subscribeToWorkShifts((cloudShifts) => {
      setShifts(cloudShifts || []);
    });
    const unsubReqs = cloudSync.subscribeToShiftChangeRequests((reqs) => {
      setChangeRequests(reqs || []);
    });
    return () => {
      unsubShifts();
      unsubReqs();
    };
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const dateLocale = adminLanguage === 'es' ? 'es-ES' : adminLanguage === 'fr' ? 'fr-FR' : adminLanguage === 'de' ? 'de-DE' : 'en-US';
  const monthLabel = viewDate.toLocaleDateString(dateLocale, { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const calendarCells = useMemo(() => {
    const cells: { dateStr: string; dayNum: number; inMonth: boolean }[] = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      cells.push({ dateStr: toDateKey(d), dayNum: d.getDate(), inMonth: false });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      cells.push({ dateStr: toDateKey(d), dayNum: day, inMonth: true });
    }
    const remainder = cells.length % 7;
    if (remainder !== 0) {
      const needed = 7 - remainder;
      for (let i = 1; i <= needed; i++) {
        const d = new Date(year, month + 1, i);
        cells.push({ dateStr: toDateKey(d), dayNum: i, inMonth: false });
      }
    }
    return cells;
  }, [year, month, firstDayOfWeek, daysInMonth]);

  const visibleShifts = useMemo(() => {
    if (filterDriverId === 'all') return shifts;
    return shifts.filter((s) => s.driverId === filterDriverId);
  }, [shifts, filterDriverId]);

  const shiftsByDate = useMemo(() => {
    const map: Record<string, WorkShift[]> = {};
    visibleShifts.forEach((s) => {
      if (!map[s.dateStr]) map[s.dateStr] = [];
      map[s.dateStr].push(s);
    });
    return map;
  }, [visibleShifts]);

  const selectedDayShifts = shiftsByDate[selectedDateStr] || [];
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;

  const monthlyShifts = useMemo(
    () =>
      visibleShifts
        .filter((s) => s.dateStr.startsWith(monthPrefix))
        .sort((a, b) => a.dateStr.localeCompare(b.dateStr) || a.startTime.localeCompare(b.startTime)),
    [visibleShifts, monthPrefix]
  );

  const monthlyHoursByDriver = useMemo(() => {
    const totals: Record<string, { hours: number; count: number }> = {};
    drivers.forEach((d) => {
      totals[d.id] = { hours: 0, count: 0 };
    });
    shifts
      .filter((s) => s.dateStr.startsWith(monthPrefix) && s.status !== 'time_off')
      .forEach((s) => {
        if (!totals[s.driverId]) totals[s.driverId] = { hours: 0, count: 0 };
        totals[s.driverId].hours += calcShiftHours(s.startTime, s.endTime);
        totals[s.driverId].count += 1;
      });
    return totals;
  }, [shifts, drivers, monthPrefix]);

  const getDriverColorClass = (driverId: string) => {
    const idx = drivers.findIndex((d) => d.id === driverId);
    return DRIVER_BADGE_COLORS[(idx >= 0 ? idx : 0) % DRIVER_BADGE_COLORS.length];
  };

  const openNewShiftModal = (dateStr?: string, presetDriverId?: string) => {
    playCabinChime('tap');
    setEditingShiftId(null);
    setFormDriverId(presetDriverId || (filterDriverId !== 'all' ? filterDriverId : currentDriver.id));
    setFormDateStr(dateStr || selectedDateStr || todayStr);
    setFormStartTime('08:00');
    setFormEndTime('17:00');
    setFormTimeZone(TIME_ZONES[0]);
    setFormLocationPreset(LOCATION_ZONES[0]);
    setFormCustomLocation('');
    setFormStatus('scheduled');
    setFormNotes('');
    setIsFormOpen(true);
  };

  const openEditShiftModal = (shift: WorkShift) => {
    playCabinChime('tap');
    setEditingShiftId(shift.id);
    setFormDriverId(shift.driverId);
    setFormDateStr(shift.dateStr);
    setFormStartTime(shift.startTime);
    setFormEndTime(shift.endTime);
    setFormTimeZone(shift.timeZone || TIME_ZONES[0]);
    if (LOCATION_ZONES.includes(shift.locationZone)) {
      setFormLocationPreset(shift.locationZone);
      setFormCustomLocation('');
    } else {
      setFormLocationPreset('Custom Zone...');
      setFormCustomLocation(shift.locationZone);
    }
    setFormStatus(shift.status);
    setFormNotes(shift.notes || '');
    setIsFormOpen(true);
  };

  const handleSaveShift = async (e: React.FormEvent) => {
    e.preventDefault();
    const chosenDriver = drivers.find((d) => d.id === formDriverId) || currentDriver;
    const finalLocation =
      formLocationPreset === 'Custom Zone...'
        ? formCustomLocation.trim() || 'South Bend / Regional'
        : formLocationPreset;

    const payload: WorkShift = {
      id: editingShiftId || `shift-${Date.now()}`,
      driverId: chosenDriver.id,
      driverName: chosenDriver.name,
      driverAvatar: chosenDriver.avatarUrl,
      dateStr: formDateStr,
      startTime: formStartTime,
      endTime: formEndTime,
      timeZone: formTimeZone,
      locationZone: finalLocation,
      vehicleModel: chosenDriver.vehicleModel,
      status: formStatus,
      notes: formNotes.trim(),
      createdAt: Date.now(),
    };

    playCabinChime('acknowledged');
    setShifts((prev) => {
      const exists = prev.some((s) => s.id === payload.id);
      return exists ? prev.map((s) => (s.id === payload.id ? payload : s)) : [...prev, payload];
    });
    setSelectedDateStr(formDateStr);
    setIsFormOpen(false);
    await cloudSync.saveWorkShift(payload);
    onShowToast(`Shift saved for ${chosenDriver.name} on ${formDateStr}`);
  };

  const handleDeleteShift = async (shift: WorkShift) => {
    if (!window.confirm(`Remove shift for ${shift.driverName} on ${shift.dateStr}?`)) return;
    playCabinChime('tap');
    setShifts((prev) => prev.filter((s) => s.id !== shift.id));
    await cloudSync.deleteWorkShift(shift.id);
    onShowToast(`Shift removed from ${shift.dateStr}`);
  };

  // Drag-and-drop handlers (Roster card -> Calendar Day Cell)
  const handleDropDriverOnDay = (dateStr: string, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOverDateStr(null);
    const droppedId = e.dataTransfer.getData('text/driver-id') || draggingDriverId;
    setDraggingDriverId(null);
    if (!droppedId) return;
    setSelectedDateStr(dateStr);
    openNewShiftModal(dateStr, droppedId);
  };

  // Report generation for Print, Email, Text
  const reportShifts = useMemo(() => {
    if (reportScope === 'day') return selectedDayShifts;
    if (reportScope === 'my_shifts') {
      return monthlyShifts.filter((s) => s.driverId === currentDriver.id);
    }
    return monthlyShifts;
  }, [reportScope, selectedDayShifts, monthlyShifts, currentDriver.id]);

  const formattedScheduleReport = useMemo(() => {
    const scopeTitle =
      reportScope === 'day'
        ? `Daily Shift Schedule (${selectedDateStr})`
        : reportScope === 'my_shifts'
        ? `My Working Shifts - ${currentDriver.name} (${monthLabel})`
        : `Silvermyst Fleet Shift Schedule (${monthLabel})`;

    if (reportShifts.length === 0) {
      return `${scopeTitle}\n\nNo shifts scheduled for this period.`;
    }

    const totalHours = reportShifts
      .filter((s) => s.status !== 'time_off')
      .reduce((acc, s) => acc + calcShiftHours(s.startTime, s.endTime), 0);

    const lines = reportShifts.map(
      (s, i) =>
        `${i + 1}. ${s.dateStr} | ${s.driverName} | ${s.startTime}-${s.endTime} (${calcShiftHours(s.startTime, s.endTime)}h) | ${s.locationZone} [${s.status.replace('_', ' ').toUpperCase()}]${s.notes ? ` - ${s.notes}` : ''}`
    );

    return `${scopeTitle}\nTotal Shifts: ${reportShifts.length} | Total Hours: ${totalHours.toFixed(1)} hrs\n\n${lines.join('\n')}`;
  }, [reportScope, reportShifts, selectedDateStr, monthLabel, currentDriver.name]);

  const handlePrintSchedule = () => {
    playCabinChime('tap');
    window.print();
  };

  const handleEmailSchedule = () => {
    playCabinChime('tap');
    const subject = encodeURIComponent(`Silvermyst Fleet Shift Schedule - ${monthLabel}`);
    const body = encodeURIComponent(formattedScheduleReport);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    onShowToast('Opening your email app with the formatted schedule report');
  };

  const handleTextSchedule = () => {
    playCabinChime('tap');
    const body = encodeURIComponent(formattedScheduleReport);
    window.location.href = `sms:?body=${body}`;
    onShowToast('Opening messaging app with shift schedule text');
  };

  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(formattedScheduleReport);
      playCabinChime('acknowledged');
      onShowToast('Schedule report copied to clipboard');
    } catch (e) {
      onShowToast('Could not copy automatically');
    }
  };

  // Google Calendar Sync flows (Confirmation Dialog -> API push)
  const openGoogleCalendarSyncModal = (targetShifts: WorkShift[]) => {
    playCabinChime('tap');
    setGoogleSyncTargetShifts(targetShifts);
    setIsGoogleSyncModalOpen(true);
  };

  const handleConnectGoogleAccount = async () => {
    try {
      playCabinChime('tap');
      const res = await connectGoogleCalendar();
      setGoogleAccountEmail(res.email || 'Connected Google Account');
      onShowToast(`Connected Google Calendar${res.email ? ` (${res.email})` : ''}`);
    } catch (err: any) {
      onShowToast(err?.message || 'Google sign-in was cancelled or blocked');
    }
  };

  const handleConfirmPushGoogleCalendar = async () => {
    if (googleSyncTargetShifts.length === 0) return;
    setIsSyncingGoogle(true);
    try {
      if (googleSyncTargetShifts.length === 1) {
        await syncWorkShiftToGoogleCalendar(googleSyncTargetShifts[0]);
        playCabinChime('acknowledged');
        onShowToast(`Synced shift on ${googleSyncTargetShifts[0].dateStr} to Google Calendar!`);
      } else {
        const { syncedCount, failedCount } = await syncShiftsBatchToGoogleCalendar(googleSyncTargetShifts);
        playCabinChime('acknowledged');
        onShowToast(
          `Synced ${syncedCount} shifts to Google Calendar${failedCount > 0 ? ` (${failedCount} skipped)` : ''}!`
        );
      }
      const state = getGoogleCalendarConnectionState();
      setGoogleAccountEmail(state.email);
      setIsGoogleSyncModalOpen(false);
    } catch (err: any) {
      onShowToast(err?.message || 'Google Calendar sync failed');
    } finally {
      setIsSyncingGoogle(false);
    }
  };

  // Shift Swap / Change Requests handlers
  const openSwapRequestModal = (shift: WorkShift) => {
    playCabinChime('tap');
    const otherDrivers = drivers.filter((d) => d.id !== shift.driverId);
    setSwapModalShift(shift);
    setReqType('swap');
    setReqTargetRole('driver');
    setReqTargetDriverId(otherDrivers[0]?.id || '');
    setReqProposedStart(shift.startTime);
    setReqProposedEnd(shift.endTime);
    setReqReason('');
  };

  const handleSubmitChangeRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!swapModalShift) return;
    const targetDriver =
      reqTargetRole === 'driver' ? drivers.find((d) => d.id === reqTargetDriverId) : undefined;

    const payload: ShiftChangeRequest = {
      id: `scr-${Date.now()}`,
      shiftId: swapModalShift.id,
      shiftDateStr: swapModalShift.dateStr,
      shiftHours: `${swapModalShift.startTime} - ${swapModalShift.endTime}`,
      locationZone: swapModalShift.locationZone,
      requesterId: currentDriver.id,
      requesterName: currentDriver.name,
      targetDriverId: targetDriver?.id,
      targetDriverName: targetDriver?.name,
      targetRole: reqTargetRole,
      requestType: reqType,
      proposedStartTime: reqType === 'time_change' ? reqProposedStart : undefined,
      proposedEndTime: reqType === 'time_change' ? reqProposedEnd : undefined,
      reason: reqReason.trim() || `${reqType.replace('_', ' ')} request`,
      status: 'pending',
      createdAt: Date.now(),
    };

    playCabinChime('acknowledged');
    setChangeRequests((prev) => [payload, ...prev]);
    setSwapModalShift(null);
    await cloudSync.saveShiftChangeRequest(payload);
    onShowToast(
      `Sent ${reqType.replace('_', ' ')} request to ${
        targetDriver ? targetDriver.name : 'Operations Manager'
      }`
    );
  };

  const handleResolveChangeRequest = async (
    req: ShiftChangeRequest,
    decision: 'approved' | 'declined'
  ) => {
    playCabinChime(decision === 'approved' ? 'acknowledged' : 'tap');
    setChangeRequests((prev) =>
      prev.map((r) =>
        r.id === req.id ? { ...r, status: decision, reviewedBy: currentDriver.name, reviewedAt: Date.now() } : r
      )
    );
    await cloudSync.updateShiftChangeRequestStatus(req.id, decision, currentDriver.name);

    // Apply shift update when approved
    if (decision === 'approved') {
      const targetShift = shifts.find((s) => s.id === req.shiftId);
      if (targetShift) {
        let updatedShift: WorkShift = { ...targetShift };
        if ((req.requestType === 'swap' || req.requestType === 'cover') && req.targetDriverId) {
          const newDriver = drivers.find((d) => d.id === req.targetDriverId);
          if (newDriver) {
            updatedShift = {
              ...updatedShift,
              driverId: newDriver.id,
              driverName: newDriver.name,
              driverAvatar: newDriver.avatarUrl,
              vehicleModel: newDriver.vehicleModel,
              notes: `${updatedShift.notes ? updatedShift.notes + ' | ' : ''}Updated via approved ${req.requestType} (${currentDriver.name})`,
            };
          }
        } else if (req.requestType === 'time_change' && req.proposedStartTime && req.proposedEndTime) {
          updatedShift = {
            ...updatedShift,
            startTime: req.proposedStartTime,
            endTime: req.proposedEndTime,
          };
        } else if (req.requestType === 'drop') {
          updatedShift = {
            ...updatedShift,
            status: 'time_off',
          };
        }
        setShifts((prev) => prev.map((s) => (s.id === updatedShift.id ? updatedShift : s)));
        await cloudSync.saveWorkShift(updatedShift);
      }
      onShowToast(`Approved shift ${req.requestType.replace('_', ' ')} request and updated calendar`);
    } else {
      onShowToast(`Declined shift change request from ${req.requesterName}`);
    }
  };

  const pendingChangeRequests = changeRequests.filter((r) => r.status === 'pending');
  const currentRoleMeta = getStaffRoleMeta(currentDriver.role);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl cabin-card border shadow-xl flex flex-col xl:flex-row xl:items-center justify-between gap-4 no-print">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl cabin-badge border">
              <CalendarIcon className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              {at.shiftCalTitle}
            </h2>
          </div>
          <p className="text-xs sm:text-sm cabin-text-muted">
            {at.shiftCalSub}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filter by Driver */}
          <select
            value={filterDriverId}
            onChange={(e) => setFilterDriverId(e.target.value)}
            className="px-3 py-2 rounded-xl cabin-panel border text-xs font-bold cursor-pointer"
          >
            <option value="all">{sl.allStaff} ({drivers.length})</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({getStaffRoleMeta(d.role).shortLabel})
              </option>
            ))}
          </select>

          {/* Share / Print / Email / Text Report */}
          <button
            onClick={() => {
              playCabinChime('tap');
              setReportScope('month');
              setIsReportModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl cabin-panel border hover:brightness-110 text-xs font-bold cursor-pointer"
            title={sl.printEmailText}
          >
            <Printer className="w-4 h-4 text-sky-400" />
            <span>{sl.printEmailText}</span>
          </button>

          {/* Google Calendar Sync */}
          <button
            onClick={() => openGoogleCalendarSyncModal(monthlyShifts)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl cabin-badge border hover:brightness-110 text-xs font-extrabold cursor-pointer"
            title={sl.syncGoogleCal}
          >
            <CalendarPlus className="w-4 h-4" />
            <span>{sl.syncGoogleCal}</span>
          </button>

          <button
            onClick={() => openNewShiftModal(selectedDateStr)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-xs hover:brightness-110 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>{sl.addShift}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Monthly Calendar (Left) + Selected Day Roster, Drag Roster & Change Requests (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start no-print">
        {/* Calendar Grid */}
        <div className="lg:col-span-8 p-4 sm:p-5 rounded-3xl cabin-card border shadow-lg space-y-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewDate(new Date(year, month - 1, 1))}
                className="p-2 rounded-xl cabin-panel border hover:brightness-110 cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h3 className="text-base sm:text-lg font-extrabold min-w-[170px] text-center">
                {monthLabel}
              </h3>
              <button
                onClick={() => setViewDate(new Date(year, month + 1, 1))}
                className="p-2 rounded-xl cabin-panel border hover:brightness-110 cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {draggingDriverId && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-[11px] font-bold animate-pulse">
                  Drop on any date to schedule
                </span>
              )}
              <button
                onClick={() => {
                  const now = new Date();
                  setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
                  setSelectedDateStr(todayStr);
                }}
                className="px-3 py-1.5 rounded-xl cabin-panel border text-xs font-bold cursor-pointer"
              >
                {sl.today}
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-extrabold uppercase tracking-wider cabin-text-muted">
            {sl.weekdays.map((dayName) => (
              <div key={dayName} className="py-1.5">
                {dayName}
              </div>
            ))}
          </div>

          {/* Days Grid (Drop Targets for Fleet Roster Cards) */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarCells.map((cell) => {
              const dayShifts = shiftsByDate[cell.dateStr] || [];
              const isSelected = selectedDateStr === cell.dateStr;
              const isToday = cell.dateStr === todayStr;
              const isDragTarget = dragOverDateStr === cell.dateStr;

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => {
                    playCabinChime('tap');
                    setSelectedDateStr(cell.dateStr);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (dragOverDateStr !== cell.dateStr) {
                      setDragOverDateStr(cell.dateStr);
                    }
                  }}
                  onDragLeave={() => {
                    if (dragOverDateStr === cell.dateStr) {
                      setDragOverDateStr(null);
                    }
                  }}
                  onDrop={(e) => handleDropDriverOnDay(cell.dateStr, e)}
                  className={`min-h-[84px] sm:min-h-[98px] p-1.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isDragTarget
                      ? 'bg-emerald-500/25 border-emerald-400 ring-2 ring-emerald-400 scale-[1.02]'
                      : isSelected
                      ? 'cabin-badge ring-2 ring-current'
                      : isToday
                      ? 'border-sky-500/70 cabin-panel'
                      : cell.inMonth
                      ? 'cabin-panel hover:brightness-105'
                      : 'cabin-panel opacity-40'
                  }`}
                >
                  <div className="flex items-center justify-between px-1">
                    <span
                      className={`text-xs font-extrabold ${
                        isToday ? 'px-1.5 py-0.5 rounded-md bg-sky-500 text-slate-950' : ''
                      }`}
                    >
                      {cell.dayNum}
                    </span>
                    {dayShifts.length > 0 && (
                      <span className="text-[10px] font-bold text-emerald-400">
                        {dayShifts.length}
                      </span>
                    )}
                  </div>

                  {isDragTarget ? (
                    <div className="text-[10px] font-black text-emerald-300 text-center my-auto">
                      + Drop Shift
                    </div>
                  ) : (
                    <div className="space-y-1 mt-1 overflow-hidden">
                      {dayShifts.slice(0, 2).map((sh) => (
                        <div
                          key={sh.id}
                          className={`px-1.5 py-0.5 rounded-md border text-[9.5px] font-bold truncate ${
                            sh.status === 'time_off'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : getDriverColorClass(sh.driverId)
                          }`}
                          title={`${sh.driverName}: ${sh.startTime}-${sh.endTime} (${sh.locationZone})`}
                        >
                          {sh.driverName.split(' ')[0]} · {sh.startTime}
                        </div>
                      ))}
                      {dayShifts.length > 2 && (
                        <div className="text-[9px] cabin-text-muted font-bold pl-1">
                          +{dayShifts.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Selected Day Agenda + Draggable Fleet Roster + Shift Change Requests */}
        <div className="lg:col-span-4 space-y-5">
          {/* Draggable Fleet Roster */}
          <div className="p-5 rounded-3xl cabin-card border shadow-lg space-y-3">
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--cabin-border)' }}>
              <div>
                <h3 className="text-sm font-extrabold flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>{monthLabel} • {sl.fleetRoster}</span>
                </h3>
                <p className="text-[10.5px] cabin-text-muted">
                  {sl.dragRosterHint}
                </p>
              </div>
              <span className="text-[11px] cabin-text-muted font-bold">{sl.hours}</span>
            </div>

            <div className="space-y-2">
              {drivers.map((d) => {
                const stat = monthlyHoursByDriver[d.id] || { hours: 0, count: 0 };
                const roleMeta = getStaffRoleMeta(d.role);
                return (
                  <div
                    key={d.id}
                    draggable
                    onDragStart={(e) => {
                      setDraggingDriverId(d.id);
                      e.dataTransfer.setData('text/driver-id', d.id);
                      e.dataTransfer.effectAllowed = 'copy';
                    }}
                    onDragEnd={() => {
                      setDraggingDriverId(null);
                      setDragOverDateStr(null);
                    }}
                    onClick={() => openNewShiftModal(selectedDateStr, d.id)}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-2xl cabin-panel border cursor-grab active:cursor-grabbing hover:brightness-110 transition-all group"
                    title={`Drag ${d.name} onto a calendar date or click to schedule`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <GripVertical className="w-4 h-4 opacity-50 group-hover:opacity-100 shrink-0" />
                      <img
                        src={d.avatarUrl}
                        alt={d.name}
                        className="w-8 h-8 rounded-full object-cover border border-white/20 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold truncate">{d.name}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase border ${
                              isDark ? roleMeta.darkBadge : roleMeta.lightBadge
                            }`}
                          >
                            {roleMeta.shortLabel}
                          </span>
                        </div>
                        <div className="text-[10px] cabin-text-muted truncate">{d.vehicleModel}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-emerald-500">
                        {stat.hours.toFixed(1)} hrs
                      </div>
                      <div className="text-[10px] cabin-text-muted">
                        {stat.count} {stat.count === 1 ? 'shift' : 'shifts'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Date Agenda */}
          <div className="p-5 rounded-3xl cabin-card border shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--cabin-border)' }}>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider cabin-text-muted">
                  {sl.selectedDate}
                </span>
                <h3 className="text-base font-extrabold">
                  {new Date(`${selectedDateStr}T12:00:00`).toLocaleDateString(dateLocale, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                {selectedDayShifts.length > 0 && (
                  <button
                    onClick={() => {
                      setReportScope('day');
                      setIsReportModalOpen(true);
                    }}
                    className="p-2 rounded-xl cabin-panel border text-xs cursor-pointer"
                    title={sl.print}
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => openNewShiftModal(selectedDateStr)}
                  className="px-3 py-1.5 rounded-xl cabin-primary-btn text-xs font-extrabold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{at.addBtn}</span>
                </button>
              </div>
            </div>

            {selectedDayShifts.length === 0 ? (
              <div className="p-6 text-center rounded-2xl cabin-panel border space-y-2">
                <p className="text-xs cabin-text-muted">
                  No drivers scheduled for this date yet. Drag a driver from the roster onto the calendar or tap below.
                </p>
                <button
                  onClick={() => openNewShiftModal(selectedDateStr)}
                  className="text-xs font-bold text-emerald-500 hover:underline cursor-pointer"
                >
                  + Schedule a shift for {selectedDateStr}
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                {selectedDayShifts.map((sh) => {
                  const hrs = calcShiftHours(sh.startTime, sh.endTime);
                  return (
                    <div key={sh.id} className="p-3.5 rounded-2xl cabin-panel border space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={sh.driverAvatar || '/assets/aistudio/1672373005387_54b82b85.jpg'}
                            alt={sh.driverName}
                            className="w-9 h-9 rounded-full object-cover border border-white/20 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="text-sm font-extrabold truncate">{sh.driverName}</div>
                            <div className="text-[10px] cabin-text-muted truncate flex items-center gap-1">
                              <Car className="w-3 h-3 text-sky-400" />
                              <span>{sh.vehicleModel || 'Executive SUV'}</span>
                            </div>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                            sh.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : sh.status === 'completed'
                              ? 'bg-sky-500/20 text-sky-400'
                              : sh.status === 'time_off'
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'cabin-badge border'
                          }`}
                        >
                          {sh.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-1.5 text-xs pt-1">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="font-bold">
                            {sh.startTime} – {sh.endTime}
                          </span>
                          <span className="text-[11px] cabin-text-muted">({hrs} hrs)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span className="text-[11px] cabin-text-muted truncate">{sh.timeZone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-[11px] font-semibold text-emerald-500 truncate">
                            {sh.locationZone}
                          </span>
                        </div>
                      </div>

                      {sh.notes && (
                        <p className="text-[11px] cabin-text-muted italic cabin-card p-2 rounded-xl border">
                          "{sh.notes}"
                        </p>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t text-[11px]" style={{ borderColor: 'var(--cabin-border)' }}>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openSwapRequestModal(sh)}
                            className="px-2 py-1 rounded-lg cabin-badge border flex items-center gap-1 cursor-pointer font-bold"
                            title={sl.requestSwapTitle}
                          >
                            <ArrowLeftRight className="w-3 h-3" />
                            <span>{sl.swapChange}</span>
                          </button>
                          <button
                            onClick={() => openGoogleCalendarSyncModal([sh])}
                            className="px-2 py-1 rounded-lg cabin-card border flex items-center gap-1 cursor-pointer font-bold"
                            title={sl.syncGoogleCal}
                          >
                            <CalendarPlus className="w-3 h-3 text-sky-400" />
                            <span>G-Cal</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEditShiftModal(sh)}
                            className="px-2 py-1 rounded-lg cabin-card border flex items-center gap-1 cursor-pointer font-bold"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>{at.editBtn}</span>
                          </button>
                          <button
                            onClick={() => handleDeleteShift(sh)}
                            className="px-2 py-1 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1 cursor-pointer font-bold"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Shift Change & Swap Requests Inbox */}
          <div className="p-5 rounded-3xl cabin-card border shadow-lg space-y-3">
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--cabin-border)' }}>
              <h3 className="text-sm font-extrabold flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-amber-400" />
                <span>{sl.swapInboxTitle}</span>
              </h3>
              {pendingChangeRequests.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
                  {pendingChangeRequests.length}
                </span>
              )}
            </div>

            {changeRequests.length === 0 ? (
              <p className="text-xs cabin-text-muted">
                No pending shift swap or coverage requests.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                {changeRequests.map((req) => {
                  const canApprove =
                    req.status === 'pending' &&
                    (currentRoleMeta.canApproveShifts || req.targetDriverId === currentDriver.id);

                  return (
                    <div key={req.id} className="p-3 rounded-2xl cabin-panel border space-y-1.5 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold truncate">
                          {req.requesterName} · {req.requestType.replace('_', ' ').toUpperCase()}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            req.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : req.status === 'declined'
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>

                      <div className="text-[11px] cabin-text-muted">
                        Shift: <strong className="font-bold">{req.shiftDateStr}</strong> ({req.shiftHours})
                      </div>
                      <div className="text-[11px] cabin-text-muted">
                        To:{' '}
                        <strong>
                          {req.targetRole === 'manager'
                            ? 'Operations Manager'
                            : req.targetDriverName || 'Team Driver'}
                        </strong>
                        {req.proposedStartTime && req.proposedEndTime
                          ? ` • Proposed: ${req.proposedStartTime}-${req.proposedEndTime}`
                          : ''}
                      </div>
                      <p className="text-[11px] italic cabin-text-muted">"{req.reason}"</p>

                      {canApprove && (
                        <div className="flex items-center gap-2 pt-1.5">
                          <button
                            onClick={() => handleResolveChangeRequest(req, 'approved')}
                            className="flex-1 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{sl.approve}</span>
                          </button>
                          <button
                            onClick={() => handleResolveChangeRequest(req, 'declined')}
                            className="flex-1 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>{sl.decline}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden Print-Only Clean Schedule View */}
      <div className="hidden print-only-report space-y-4">
        <h1 className="text-2xl font-black">Silvermyst Multiservices — Driver Shift Schedule</h1>
        <p className="text-sm">{monthLabel} | Generated {new Date().toLocaleString()}</p>
        <pre className="whitespace-pre-wrap font-sans text-xs border p-4 rounded-xl">
          {formattedScheduleReport}
        </pre>
      </div>

      {/* Add / Edit Shift Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 no-print">
          <div className="cabin-card border rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--cabin-border)' }}>
              <h3 className="text-base font-extrabold flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-emerald-400" />
                <span>{editingShiftId ? sl.editShiftTitle : sl.scheduleShiftTitle}</span>
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg cabin-panel border cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveShift} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block cabin-text-muted font-bold mb-1">Staff Member *</label>
                  <select
                    value={formDriverId}
                    onChange={(e) => setFormDriverId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl cabin-panel border font-bold cursor-pointer"
                  >
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({getStaffRoleMeta(d.role).shortLabel})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block cabin-text-muted font-bold mb-1">Shift Date *</label>
                  <input
                    type="date"
                    required
                    value={formDateStr}
                    onChange={(e) => setFormDateStr(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl cabin-panel border font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block cabin-text-muted font-bold mb-1">Start Hour *</label>
                  <input
                    type="time"
                    required
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl cabin-panel border font-bold"
                  />
                </div>

                <div>
                  <label className="block cabin-text-muted font-bold mb-1">End Hour *</label>
                  <input
                    type="time"
                    required
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl cabin-panel border font-bold"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl cabin-badge border flex items-center justify-between">
                <span className="font-bold">{sl.hours}:</span>
                <span className="text-emerald-500 font-black text-sm">
                  {calcShiftHours(formStartTime, formEndTime)} {sl.hours}
                </span>
              </div>

              <div>
                <label className="block cabin-text-muted font-bold mb-1">Time Zone *</label>
                <select
                  value={formTimeZone}
                  onChange={(e) => setFormTimeZone(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl cabin-panel border cursor-pointer"
                >
                  {TIME_ZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block cabin-text-muted font-bold mb-1">Location / Operating Zone *</label>
                <select
                  value={formLocationPreset}
                  onChange={(e) => setFormLocationPreset(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl cabin-panel border cursor-pointer"
                >
                  {LOCATION_ZONES.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
                {formLocationPreset === 'Custom Zone...' && (
                  <input
                    type="text"
                    required
                    value={formCustomLocation}
                    onChange={(e) => setFormCustomLocation(e.target.value)}
                    placeholder="Enter custom city, airport, or event zone..."
                    className="mt-2 w-full px-3 py-2.5 rounded-xl cabin-panel border"
                  />
                )}
              </div>

              <div>
                <label className="block cabin-text-muted font-bold mb-1">Shift Status</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['scheduled', 'active', 'completed', 'time_off'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setFormStatus(st)}
                      className={`py-2 px-2 rounded-xl font-bold capitalize border cursor-pointer transition-all ${
                        formStatus === st ? 'cabin-primary-btn' : 'cabin-panel'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block cabin-text-muted font-bold mb-1">Shift Notes</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Notre Dame football game airport pickups, VIP charter..."
                  className="w-full px-3 py-2 rounded-xl cabin-panel border"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: 'var(--cabin-border)' }}>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 rounded-xl cabin-panel border font-bold cursor-pointer"
                >
                  {at.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black flex items-center gap-1.5 cursor-pointer hover:brightness-110 shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{sl.saveShiftBtn}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print, Email & Text Schedule Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 no-print">
          <div className="cabin-card border rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--cabin-border)' }}>
              <h3 className="text-base sm:text-lg font-extrabold flex items-center gap-2">
                <Printer className="w-5 h-5 text-sky-400" />
                <span>{sl.printEmailText}</span>
              </h3>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="p-1.5 rounded-lg cabin-panel border cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scope Selector */}
            <div className="flex flex-wrap gap-2 text-xs font-bold">
              <button
                onClick={() => setReportScope('month')}
                className={`px-3 py-2 rounded-xl border cursor-pointer ${
                  reportScope === 'month' ? 'cabin-primary-btn' : 'cabin-panel'
                }`}
              >
                {monthLabel}
              </button>
              <button
                onClick={() => setReportScope('day')}
                className={`px-3 py-2 rounded-xl border cursor-pointer ${
                  reportScope === 'day' ? 'cabin-primary-btn' : 'cabin-panel'
                }`}
              >
                {selectedDateStr}
              </button>
              <button
                onClick={() => setReportScope('my_shifts')}
                className={`px-3 py-2 rounded-xl border cursor-pointer ${
                  reportScope === 'my_shifts' ? 'cabin-primary-btn' : 'cabin-panel'
                }`}
              >
                {currentDriver.name}
              </button>
            </div>

            <pre className="flex-1 overflow-y-auto p-4 rounded-2xl cabin-panel border text-xs whitespace-pre-wrap font-sans leading-relaxed max-h-72">
              {formattedScheduleReport}
            </pre>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <button
                onClick={handlePrintSchedule}
                className="py-2.5 px-3 rounded-xl cabin-primary-btn font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:brightness-110"
              >
                <Printer className="w-4 h-4" />
                <span>{sl.print}</span>
              </button>
              <button
                onClick={handleEmailSchedule}
                className="py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>{sl.emailReport}</span>
              </button>
              <button
                onClick={handleTextSchedule}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{sl.textSms}</span>
              </button>
              <button
                onClick={handleCopyReport}
                className="py-2.5 px-3 rounded-xl cabin-panel border font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:brightness-110"
              >
                <Copy className="w-4 h-4" />
                <span>{sl.copyText}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Calendar Sync Confirmation Modal */}
      {isGoogleSyncModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 no-print">
          <div className="cabin-card border rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--cabin-border)' }}>
              <h3 className="text-base font-extrabold flex items-center gap-2">
                <CalendarPlus className="w-5 h-5 text-sky-400" />
                <span>{sl.confirmGCalSync}</span>
              </h3>
              <button
                onClick={() => setIsGoogleSyncModalOpen(false)}
                className="p-1.5 rounded-lg cabin-panel border cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl cabin-panel border flex items-center justify-between gap-2">
                <div>
                  <div className="font-extrabold">Google Account Status</div>
                  <div className="cabin-text-muted">
                    {googleAccountEmail ? `Connected as ${googleAccountEmail}` : 'Not connected yet'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleConnectGoogleAccount}
                  className="px-3 py-1.5 rounded-xl cabin-primary-btn font-bold cursor-pointer hover:brightness-110"
                >
                  {googleAccountEmail ? 'Switch Account' : 'Sign In with Google'}
                </button>
              </div>

              <div className="p-3.5 rounded-2xl cabin-panel border space-y-1.5">
                <div className="font-extrabold">
                  {googleSyncTargetShifts.length}{' '}
                  {googleSyncTargetShifts.length === 1 ? 'event' : 'events'}:
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1">
                  {googleSyncTargetShifts.length === 0 ? (
                    <p className="cabin-text-muted">No scheduled shifts match the current filter.</p>
                  ) : (
                    googleSyncTargetShifts.map((s) => (
                      <div key={s.id} className="flex items-center justify-between text-[11px] py-1 border-b last:border-b-0" style={{ borderColor: 'var(--cabin-border)' }}>
                        <span className="font-bold">
                          {s.dateStr} · {s.driverName} ({s.startTime}–{s.endTime})
                        </span>
                        <a
                          href={buildGoogleCalendarQuickAddUrl(s)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-400 hover:underline font-bold"
                        >
                          Quick Link ↗
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t" style={{ borderColor: 'var(--cabin-border)' }}>
              <button
                type="button"
                onClick={() => {
                  downloadShiftsAsIcs(googleSyncTargetShifts, `silvermyst-shifts-${monthPrefix}.ics`);
                  onShowToast('Downloaded .ics calendar file for Apple/Outlook/Google Calendar');
                }}
                disabled={googleSyncTargetShifts.length === 0}
                className="px-3.5 py-2.5 rounded-xl cabin-panel border font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Download .ICS</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsGoogleSyncModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl cabin-panel border font-bold text-xs cursor-pointer"
                >
                  {at.cancel}
                </button>
                <button
                  type="button"
                  disabled={isSyncingGoogle || googleSyncTargetShifts.length === 0}
                  onClick={handleConfirmPushGoogleCalendar}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSyncingGoogle ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{isSyncingGoogle ? sl.syncing : sl.confirmAndSync}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shift Swap / Coverage / Change Request Modal */}
      {swapModalShift && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 no-print">
          <div className="cabin-card border rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--cabin-border)' }}>
              <h3 className="text-base font-extrabold flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-amber-400" />
                <span>{sl.requestSwapTitle}</span>
              </h3>
              <button
                onClick={() => setSwapModalShift(null)}
                className="p-1.5 rounded-lg cabin-panel border cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl cabin-panel border text-xs">
              <div className="font-extrabold">
                {swapModalShift.driverName} · {swapModalShift.dateStr}
              </div>
              <div className="cabin-text-muted">
                {swapModalShift.startTime} – {swapModalShift.endTime} · {swapModalShift.locationZone}
              </div>
            </div>

            <form onSubmit={handleSubmitChangeRequest} className="space-y-3 text-xs">
              <div>
                <label className="block cabin-text-muted font-bold mb-1">Request Type</label>
                <select
                  value={reqType}
                  onChange={(e) => setReqType(e.target.value as ShiftChangeRequest['requestType'])}
                  className="w-full px-3 py-2.5 rounded-xl cabin-panel border font-bold cursor-pointer"
                >
                  <option value="swap">Swap Shift with Another Driver</option>
                  <option value="cover">Request Driver Coverage</option>
                  <option value="time_change">Adjust Start / End Hours</option>
                  <option value="drop">Request Time Off / Drop Shift</option>
                </select>
              </div>

              <div>
                <label className="block cabin-text-muted font-bold mb-1">Send Request To</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReqTargetRole('driver')}
                    className={`py-2 px-3 rounded-xl border font-bold cursor-pointer ${
                      reqTargetRole === 'driver' ? 'cabin-primary-btn' : 'cabin-panel'
                    }`}
                  >
                    Another Driver
                  </button>
                  <button
                    type="button"
                    onClick={() => setReqTargetRole('manager')}
                    className={`py-2 px-3 rounded-xl border font-bold cursor-pointer ${
                      reqTargetRole === 'manager' ? 'cabin-primary-btn' : 'cabin-panel'
                    }`}
                  >
                    Manager / Admin
                  </button>
                </div>
              </div>

              {reqTargetRole === 'driver' && (
                <div>
                  <label className="block cabin-text-muted font-bold mb-1">Select Driver</label>
                  <select
                    value={reqTargetDriverId}
                    onChange={(e) => setReqTargetDriverId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl cabin-panel border font-bold cursor-pointer"
                  >
                    {drivers
                      .filter((d) => d.id !== swapModalShift.driverId)
                      .map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({getStaffRoleMeta(d.role).shortLabel})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {reqType === 'time_change' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block cabin-text-muted font-bold mb-1">Proposed Start</label>
                    <input
                      type="time"
                      value={reqProposedStart}
                      onChange={(e) => setReqProposedStart(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl cabin-panel border font-bold"
                    />
                  </div>
                  <div>
                    <label className="block cabin-text-muted font-bold mb-1">Proposed End</label>
                    <input
                      type="time"
                      value={reqProposedEnd}
                      onChange={(e) => setReqProposedEnd(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl cabin-panel border font-bold"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block cabin-text-muted font-bold mb-1">Reason / Message *</label>
                <textarea
                  rows={2}
                  required
                  value={reqReason}
                  onChange={(e) => setReqReason(e.target.value)}
                  placeholder="e.g. Airport pickup conflict — can you cover or swap this afternoon?"
                  className="w-full px-3 py-2 rounded-xl cabin-panel border"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--cabin-border)' }}>
                <button
                  type="button"
                  onClick={() => setSwapModalShift(null)}
                  className="px-4 py-2 rounded-xl cabin-panel border font-bold cursor-pointer"
                >
                  {at.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl cabin-primary-btn font-extrabold cursor-pointer hover:brightness-110"
                >
                  {sl.sendRequest}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
