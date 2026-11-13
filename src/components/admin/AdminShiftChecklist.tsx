import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  CheckCircle2,
  Clock,
  Battery,
  Wifi,
  Sparkles,
  Car,
  Coffee,
  ShieldCheck,
  AlertCircle,
  Plus,
  Trash2,
  Calendar,
} from 'lucide-react';
import { DriverProfile, DriverShiftChecklist, ChecklistTask, SupportedLanguage } from '../../types/kiosk';
import { cloudSync } from '../../services/cloudSync';
import { playCabinChime } from '../../utils/cabinAudio';
import { getAdminTranslations, getAdminSubLabels } from '../../data/adminTranslations';

interface AdminShiftChecklistProps {
  drivers: DriverProfile[];
  currentDriver: DriverProfile;
  onShowToast: (msg: string) => void;
  adminLanguage?: SupportedLanguage;
}

const DEFAULT_TASKS: ChecklistTask[] = [
  { id: 't1', label: 'Samsung 10-inch Tablet Charged (> 85%) & Mounted', category: 'tablet', isChecked: true },
  { id: 't2', label: 'In-Cabin 5G Wi-Fi Hotspot Online & Speed Verified', category: 'connectivity', isChecked: true },
  { id: 't3', label: 'Passenger Headrest Charging Cables (Lightning & USB-C) Tested', category: 'supplies', isChecked: true },
  { id: 't4', label: 'Complimentary Bottled Waters & Refreshment Basket Stocked', category: 'supplies', isChecked: true },
  { id: 't5', label: 'Vehicle Interior Vacuumed, Windows Cleaned & Sanitized', category: 'vehicle', isChecked: false },
  { id: 't6', label: 'Tire Pressures, Washer Fluid & Fuel/EV Charge Inspected', category: 'vehicle', isChecked: false },
  { id: 't7', label: 'Kiosk App Locked in Fullscreen 1280×800 Mode', category: 'tablet', isChecked: true },
  { id: 't8', label: 'In-Cabin Climate Pre-Cooled / Warmed to 71°F Comfort', category: 'vehicle', isChecked: false },
];

export const AdminShiftChecklist: React.FC<AdminShiftChecklistProps> = ({
  drivers,
  currentDriver,
  onShowToast,
  adminLanguage = 'en',
}) => {
  const at = getAdminTranslations(adminLanguage);
  const sl = getAdminSubLabels(adminLanguage);
  const [selectedDriverId, setSelectedDriverId] = useState<string>(currentDriver.id);
  const [tasks, setTasks] = useState<ChecklistTask[]>(DEFAULT_TASKS);
  const [newTaskLabel, setNewTaskLabel] = useState<string>('');
  const [newTaskCategory, setNewTaskCategory] = useState<ChecklistTask['category']>('vehicle');
  const [checklistHistory, setChecklistHistory] = useState<DriverShiftChecklist[]>([]);
  const [isSavedToday, setIsSavedToday] = useState<boolean>(false);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const unsub = cloudSync.subscribeToChecklists((lists) => {
      setChecklistHistory(lists);
      const todayEntry = lists.find(
        (l) => l.dateStr === todayStr && l.driverId === selectedDriverId
      );
      if (todayEntry) {
        setTasks(todayEntry.tasks);
        setIsSavedToday(todayEntry.isFullyCompleted);
      }
    });
    return () => unsub();
  }, [selectedDriverId, todayStr]);

  const toggleTask = (taskId: string) => {
    playCabinChime('tap');
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, isChecked: !t.isChecked } : t))
    );
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskLabel.trim()) return;

    playCabinChime('tap');
    const task: ChecklistTask = {
      id: `task-${Date.now()}`,
      label: newTaskLabel.trim(),
      category: newTaskCategory,
      isChecked: false,
    };
    setTasks((prev) => [...prev, task]);
    setNewTaskLabel('');
    onShowToast(`Added task: "${task.label}"`);
  };

  const handleDeleteTask = (taskId: string) => {
    playCabinChime('tap');
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    onShowToast('Removed task from checklist');
  };

  const handleSaveShiftRecord = async () => {
    playCabinChime('acknowledged');
    const driver = drivers.find((d) => d.id === selectedDriverId) || currentDriver;
    const completedCount = tasks.filter((t) => t.isChecked).length;
    const isFull = completedCount === tasks.length;

    const checklist: DriverShiftChecklist = {
      id: `chk-${selectedDriverId}-${todayStr}`,
      driverId: selectedDriverId,
      driverName: driver.name,
      dateStr: todayStr,
      tasks,
      isFullyCompleted: isFull,
      completedAt: Date.now(),
    };

    await cloudSync.saveChecklist(checklist);
    setIsSavedToday(true);
    onShowToast(`Shift checklist recorded for ${driver.name} (${completedCount}/${tasks.length} items checked)!`);
  };

  const completedCount = tasks.filter((t) => t.isChecked).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-800/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-600/30 text-emerald-300 border border-emerald-500/40">
              <CheckSquare className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {at.checklistsTitle}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300">
            {at.checklistsSub}
          </p>
        </div>

        {/* Driver Selector */}
        <div className="flex items-center gap-2 bg-slate-900 px-3.5 py-2 rounded-2xl border border-slate-800 text-xs shrink-0">
          <span className="text-slate-400 font-bold">{sl.driverLabel}</span>
          <select
            value={selectedDriverId}
            onChange={(e) => setSelectedDriverId(e.target.value)}
            className="bg-transparent font-extrabold text-emerald-400 focus:outline-none cursor-pointer"
          >
            {drivers.map((d) => (
              <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                {d.name} ({d.vehicleModel})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Progress & Submit Bar */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5 flex-1 w-full sm:w-auto">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-white">{sl.readinessScore}</span>
            <span className={progressPercent === 100 ? 'text-emerald-400' : 'text-amber-400'}>
              {completedCount} / {tasks.length} ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                progressPercent === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-emerald-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <button
          onClick={handleSaveShiftRecord}
          className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-600/30 shrink-0"
        >
          <CheckCircle2 className="w-4 h-4 fill-slate-950 text-slate-950" />
          <span>{sl.saveSignOff}</span>
        </button>
      </div>

      {/* Checklist Tasks List */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="font-extrabold text-sm sm:text-base text-white">{sl.todaysInspection}</h3>
          <span className="text-xs text-slate-400">{todayStr}</span>
        </div>

        <div className="space-y-2.5">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                task.isChecked
                  ? 'bg-emerald-950/30 border-emerald-500/40'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                    task.isChecked
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                      : 'border-slate-700 bg-slate-900'
                  }`}
                >
                  {task.isChecked && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                </div>

                <div>
                  <span
                    className={`text-xs sm:text-sm font-bold ${
                      task.isChecked ? 'text-white line-through opacity-80' : 'text-slate-200'
                    }`}
                  >
                    {task.label}
                  </span>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                    Category: {task.category}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteTask(task.id);
                }}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                title="Remove task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Custom Task */}
        <form onSubmit={handleAddTask} className="pt-2 flex flex-col sm:flex-row gap-2 border-t border-slate-800">
          <input
            type="text"
            value={newTaskLabel}
            onChange={(e) => setNewTaskLabel(e.target.value)}
            placeholder="Add new custom inspection item (e.g. Check auxiliary charging bank)..."
            className="flex-1 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <select
            value={newTaskCategory}
            onChange={(e) => setNewTaskCategory(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300"
          >
            <option value="tablet">Tablet & Mount</option>
            <option value="connectivity">Internet & Wi-Fi</option>
            <option value="supplies">Passenger Supplies</option>
            <option value="vehicle">Vehicle Readiness</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{sl.addItem}</span>
          </button>
        </form>
      </div>

      {/* Completion History Log */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h3 className="font-extrabold text-sm sm:text-base text-white">{sl.readinessHistory}</h3>
          </div>
          <span className="text-xs text-slate-400">{checklistHistory.length}</span>
        </div>

        {checklistHistory.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            No shift checklists recorded yet. Sign off on today's items above to start tracking history.
          </div>
        ) : (
          <div className="space-y-2">
            {checklistHistory.slice(0, 10).map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white">{item.driverName}</div>
                    <div className="text-[11px] text-slate-400">Date: {item.dateStr}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-slate-400">
                    {item.tasks.filter((t) => t.isChecked).length} / {item.tasks.length} Completed
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.isFullyCompleted
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {item.isFullyCompleted ? '100% Ready' : 'Partial'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
