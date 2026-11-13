import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import {
  CheckCircle2,
  Clock,
  MailCheck,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  UserX,
  XCircle,
} from 'lucide-react';
import {
  ApprovedEnrollment,
  AuthorizedUserAccount,
  DriverRole,
  EnrollmentAccessRequest,
} from '../../types/kiosk';
import { enrollmentAdminApi, MASTER_OWNER_EMAIL } from '../../services/authEnrollment';

interface AdminEnrollmentManagerProps {
  currentUser: User | null;
  isMasterOwner: boolean;
  isAdminAccount?: boolean;
  isDark?: boolean;
  onToast?: (msg: string) => void;
}

export const AdminEnrollmentManager: React.FC<AdminEnrollmentManagerProps> = ({
  currentUser,
  isMasterOwner,
  isAdminAccount = isMasterOwner,
  isDark = true,
  onToast,
}) => {
  const [approvedList, setApprovedList] = useState<ApprovedEnrollment[]>([]);
  const [requests, setRequests] = useState<EnrollmentAccessRequest[]>([]);
  const [enrolledAccounts, setEnrolledAccounts] = useState<AuthorizedUserAccount[]>([]);
  const [activeSection, setActiveSection] = useState<'allowlist' | 'requests' | 'accounts'>('allowlist');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending_enrollment' | 'enrolled' | 'revoked'>('all');

  // Add to Approve List form state
  const [emailInput, setEmailInput] = useState('');
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [roleInput, setRoleInput] = useState<DriverRole>('driver');
  const [vehicleInput, setVehicleInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formFeedback, setFormFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Per-request role selection before approval
  const [requestRoles, setRequestRoles] = useState<Record<string, DriverRole>>({});

  useEffect(() => {
    if (!isAdminAccount && !isMasterOwner) {
      return undefined;
    }
    const unsubApprove = enrollmentAdminApi.subscribeApprovedList(setApprovedList);
    const unsubReqs = enrollmentAdminApi.subscribeEnrollmentRequests(setRequests);
    const unsubAccounts = enrollmentAdminApi.subscribeAuthorizedUsers(setEnrolledAccounts);
    return () => {
      unsubApprove();
      unsubReqs();
      unsubAccounts();
    };
  }, [isAdminAccount, isMasterOwner]);

  const notify = (msg: string) => {
    if (onToast) onToast(msg);
  };

  const handleAddApprovedEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const trimmed = emailInput.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setFormFeedback({ type: 'err', text: 'Enter a valid email address (e.g. driver@gmail.com).' });
      return;
    }
    if (!displayNameInput.trim()) {
      setFormFeedback({ type: 'err', text: 'Enter the employee’s full name.' });
      return;
    }

    setIsSubmitting(true);
    setFormFeedback(null);
    try {
      await enrollmentAdminApi.addToApproveList({
        email: trimmed,
        role: roleInput,
        displayName: displayNameInput.trim(),
        vehicleAssignment: vehicleInput,
        notes: notesInput,
        adminUser: currentUser,
      });
      setEmailInput('');
      setDisplayNameInput('');
      setVehicleInput('');
      setNotesInput('');
      setFormFeedback({
        type: 'ok',
        text: `${trimmed} added to Approve List (${roleInput}). They can now enroll via the Public Portal.`,
      });
      notify(`Approved ${trimmed} for employee enrollment`);
    } catch (err: any) {
      setFormFeedback({
        type: 'err',
        text: err?.message || 'Unable to add email to approve list.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending');

  const filteredAllowlist = approvedList.filter((item) => {
    const matchesFilter = statusFilter === 'all' || item.status === statusFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      item.email.toLowerCase().includes(q) ||
      item.displayName.toLowerCase().includes(q) ||
      item.role.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const surfaceCls = isDark
    ? 'bg-slate-900/90 border-slate-800 text-slate-100'
    : 'bg-white border-slate-200 text-slate-900';
  const subSurfaceCls = isDark
    ? 'bg-slate-950/70 border-slate-800 text-slate-200'
    : 'bg-slate-50 border-slate-200 text-slate-800';
  const mutedTextCls = isDark ? 'text-slate-400' : 'text-slate-500';
  const inputCls = isDark
    ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-amber-500'
    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-600';

  if (!isAdminAccount && !isMasterOwner) {
    return (
      <div className={`p-6 rounded-xl border max-w-2xl mx-auto space-y-2 ${surfaceCls}`}>
        <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
          <ShieldAlert className="w-5 h-5" />
          <span>Administrator Privileges Required</span>
        </div>
        <p className={`text-xs ${mutedTextCls}`}>
          Only the Owner, Admins, or Managers can view and update the Employee Approve List and enrollment requests.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" />
            <span>Employee Enrollment & Approve List</span>
          </h2>
          <p className={`text-xs mt-1 ${mutedTextCls}`}>
            Public visitors cannot create accounts or access cabin tools unless their verified email is listed here.
          </p>
        </div>

        {/* Segmented Filter Control */}
        <div
          className={`flex items-center gap-1 p-1 rounded-lg border text-xs font-semibold ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}
        >
          <button
            type="button"
            onClick={() => setActiveSection('allowlist')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
              activeSection === 'allowlist'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : `${mutedTextCls} hover:text-amber-500`
            }`}
          >
            Approve List ({approvedList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('requests')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
              activeSection === 'requests'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : `${mutedTextCls} hover:text-amber-500`
            }`}
          >
            Pending Requests ({pendingRequests.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('accounts')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
              activeSection === 'accounts'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : `${mutedTextCls} hover:text-amber-500`
            }`}
          >
            Enrolled Accounts ({enrolledAccounts.length})
          </button>
        </div>
      </div>

      {/* Summary Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className={`p-4 rounded-xl border ${surfaceCls}`}>
          <div className={`text-xs font-medium ${mutedTextCls}`}>Approved Emails</div>
          <div className="text-2xl font-bold font-mono tabular-nums mt-1">{approvedList.length}</div>
        </div>
        <div className={`p-4 rounded-xl border ${surfaceCls}`}>
          <div className={`text-xs font-medium ${mutedTextCls}`}>Awaiting Sign-Up</div>
          <div className="text-2xl font-bold font-mono tabular-nums mt-1 text-amber-500">
            {approvedList.filter((a) => a.status === 'pending_enrollment').length}
          </div>
        </div>
        <div className={`p-4 rounded-xl border ${surfaceCls}`}>
          <div className={`text-xs font-medium ${mutedTextCls}`}>Access Requests</div>
          <div className="text-2xl font-bold font-mono tabular-nums mt-1 text-sky-500">
            {pendingRequests.length}
          </div>
        </div>
        <div className={`p-4 rounded-xl border ${surfaceCls}`}>
          <div className={`text-xs font-medium ${mutedTextCls}`}>Active Employees</div>
          <div className="text-2xl font-bold font-mono tabular-nums mt-1 text-emerald-500">
            {enrolledAccounts.filter((u) => u.status === 'active').length}
          </div>
        </div>
      </div>

      {/* SECTION 1: APPROVE LIST */}
      {activeSection === 'allowlist' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Add Employee to Approve List Form */}
          <form
            onSubmit={handleAddApprovedEmail}
            className={`lg:col-span-5 p-5 rounded-xl border space-y-4 ${surfaceCls}`}
          >
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-amber-500" />
                <span>Pre-Approve New Employee</span>
              </h3>
              <p className={`text-xs mt-0.5 ${mutedTextCls}`}>
                Add an employee’s Google email to authorize them to create an account.
              </p>
            </div>

            {formFeedback && (
              <div
                className={`p-3 rounded-lg border text-xs font-medium flex items-start gap-2 ${
                  formFeedback.type === 'ok'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}
              >
                {formFeedback.type === 'ok' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{formFeedback.text}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className={`block font-semibold mb-1 ${mutedTextCls}`}>
                  Employee Email (Google Sign-In) *
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="employee@gmail.com"
                  className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none ${inputCls}`}
                />
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${mutedTextCls}`}>
                  Employee Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={displayNameInput}
                  onChange={(e) => setDisplayNameInput(e.target.value)}
                  placeholder="e.g. Jordan Alvarez"
                  className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none ${inputCls}`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold mb-1 ${mutedTextCls}`}>
                    Assigned Staff Role *
                  </label>
                  <select
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value as DriverRole)}
                    className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none cursor-pointer ${inputCls}`}
                  >
                    <option value="driver">Driver (Chauffeur)</option>
                    <option value="editor">Editor (Gallery & Content)</option>
                    <option value="manager">Manager (Shifts & Roster)</option>
                    <option value="admin">Admin (Operations)</option>
                  </select>
                </div>

                <div>
                  <label className={`block font-semibold mb-1 ${mutedTextCls}`}>
                    Assigned Vehicle (Optional)
                  </label>
                  <input
                    type="text"
                    value={vehicleInput}
                    onChange={(e) => setVehicleInput(e.target.value)}
                    placeholder="e.g. Cadillac Escalade ESV"
                    className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none ${inputCls}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${mutedTextCls}`}>
                  Internal Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="e.g. Weekend Notre Dame game coverage"
                  className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none ${inputCls}`}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !currentUser}
                className="w-full py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs cursor-pointer transition-colors flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving...' : 'Add Email to Approve List'}</span>
              </button>
            </div>
          </form>

          {/* Approve List Directory */}
          <div className={`lg:col-span-7 p-5 rounded-xl border space-y-4 ${surfaceCls}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <MailCheck className="w-4 h-4 text-emerald-500" />
                <span>Approved Enrollment Registry</span>
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className={`w-3.5 h-3.5 absolute left-2.5 top-2.5 ${mutedTextCls}`} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search email or name..."
                    className={`pl-8 pr-3 py-1.5 rounded-lg border text-xs w-44 focus:outline-none ${inputCls}`}
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer focus:outline-none ${inputCls}`}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending_enrollment">Awaiting Enrollment</option>
                  <option value="enrolled">Enrolled</option>
                  <option value="revoked">Revoked</option>
                </select>
              </div>
            </div>

            {filteredAllowlist.length === 0 ? (
              <div className={`p-8 rounded-lg border text-center text-xs ${subSurfaceCls}`}>
                No pre-approved emails match this filter yet. Add an employee email on the left to authorize onboarding.
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredAllowlist.map((entry) => (
                  <div
                    key={entry.id}
                    className={`p-3.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${subSurfaceCls}`}
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-bold truncate">{entry.displayName}</span>
                        <span aria-hidden="true" className={mutedTextCls}>·</span>
                        <span className="font-mono text-[11px] uppercase font-semibold text-amber-500">
                          {entry.role}
                        </span>
                        <span aria-hidden="true" className={mutedTextCls}>·</span>
                        <span
                          className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                            entry.status === 'enrolled'
                              ? 'text-emerald-500'
                              : entry.status === 'revoked'
                              ? 'text-rose-500'
                              : 'text-sky-500'
                          }`}
                        >
                          {entry.status === 'enrolled' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {entry.status === 'pending_enrollment' && <Clock className="w-3.5 h-3.5" />}
                          {entry.status === 'revoked' && <XCircle className="w-3.5 h-3.5" />}
                          <span>
                            {entry.status === 'enrolled'
                              ? 'Enrolled'
                              : entry.status === 'revoked'
                              ? 'Revoked'
                              : 'Pending Sign-Up'}
                          </span>
                        </span>
                      </div>
                      <div className={`text-xs font-mono truncate ${mutedTextCls}`}>{entry.email}</div>
                      {(entry.vehicleAssignment || entry.notes) && (
                        <div className={`text-[11px] truncate ${mutedTextCls}`}>
                          {[entry.vehicleAssignment, entry.notes].filter(Boolean).join(' · ')}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 text-xs">
                      {entry.status !== 'revoked' ? (
                        <button
                          type="button"
                          onClick={async () => {
                            await enrollmentAdminApi.updateApproveListStatus(entry.id, 'revoked');
                            notify(`Revoked approval for ${entry.email}`);
                          }}
                          className="px-2.5 py-1.5 rounded-md border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 font-semibold cursor-pointer"
                        >
                          Revoke
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={async () => {
                            await enrollmentAdminApi.updateApproveListStatus(
                              entry.id,
                              entry.enrolledUid ? 'enrolled' : 'pending_enrollment'
                            );
                            notify(`Restored approval for ${entry.email}`);
                          }}
                          className="px-2.5 py-1.5 rounded-md border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 font-semibold cursor-pointer"
                        >
                          Restore
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={async () => {
                          await enrollmentAdminApi.removeFromApproveList(entry.id);
                          notify(`Removed ${entry.email} from Approve List`);
                        }}
                        className={`p-1.5 rounded-md border ${
                          isDark
                            ? 'border-slate-800 text-slate-400 hover:text-rose-400'
                            : 'border-slate-300 text-slate-500 hover:text-rose-600'
                        } cursor-pointer`}
                        title="Remove from Approve List"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: VISITOR ACCESS REQUESTS */}
      {activeSection === 'requests' && (
        <div className={`p-5 rounded-xl border space-y-4 ${surfaceCls}`}>
          <div>
            <h3 className="text-sm font-bold">Incoming Enrollment Access Requests</h3>
            <p className={`text-xs mt-0.5 ${mutedTextCls}`}>
              Signed-in visitors whose emails were not on your Approve List can submit a request here for your review.
            </p>
          </div>

          {requests.length === 0 ? (
            <div className={`p-8 rounded-lg border text-center text-xs ${subSurfaceCls}`}>
              No enrollment access requests submitted yet.
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => {
                const chosenRole = requestRoles[req.id] || req.requestedRole;
                return (
                  <div
                    key={req.id}
                    className={`p-4 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-4 ${subSurfaceCls}`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-bold text-sm">{req.fullName}</span>
                        <span aria-hidden="true" className={mutedTextCls}>·</span>
                        <span className="font-mono">{req.email}</span>
                        <span aria-hidden="true" className={mutedTextCls}>·</span>
                        <span className="font-mono tabular-nums">{req.phone}</span>
                      </div>
                      <p className={`text-xs ${mutedTextCls}`}>{req.reason}</p>
                      <div className={`text-[11px] flex items-center gap-2 ${mutedTextCls}`}>
                        <span>Requested Role: <strong className="uppercase">{req.requestedRole}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>
                          Status:{' '}
                          <strong
                            className={
                              req.status === 'approved'
                                ? 'text-emerald-500'
                                : req.status === 'declined'
                                ? 'text-rose-500'
                                : 'text-amber-500'
                            }
                          >
                            {req.status}
                          </strong>
                        </span>
                      </div>
                    </div>

                    {req.status === 'pending' && currentUser && (
                      <div className="flex flex-wrap items-center gap-2 shrink-0 text-xs">
                        <select
                          value={chosenRole}
                          onChange={(e) =>
                            setRequestRoles((prev) => ({
                              ...prev,
                              [req.id]: e.target.value as DriverRole,
                            }))
                          }
                          className={`px-2.5 py-2 rounded-lg border cursor-pointer focus:outline-none ${inputCls}`}
                        >
                          <option value="driver">Driver</option>
                          <option value="editor">Editor</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          type="button"
                          onClick={async () => {
                            await enrollmentAdminApi.approveRequestToAllowlist({
                              request: req,
                              assignedRole: chosenRole,
                              adminUser: currentUser,
                            });
                            notify(`Approved ${req.email} as ${chosenRole} and added to Approve List`);
                          }}
                          className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Approve & Allowlist</span>
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await enrollmentAdminApi.declineRequest(req.id, currentUser);
                            notify(`Declined access request from ${req.email}`);
                          }}
                          className="px-3 py-2 rounded-lg border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: ENROLLED ACCOUNTS */}
      {activeSection === 'accounts' && (
        <div className={`p-5 rounded-xl border space-y-4 ${surfaceCls}`}>
          <div>
            <h3 className="text-sm font-bold">Active Enrolled Staff Accounts</h3>
            <p className={`text-xs mt-0.5 ${mutedTextCls}`}>
              Employees who completed portal onboarding. Master Owner: <span className="font-mono">{MASTER_OWNER_EMAIL}</span>
            </p>
          </div>

          {enrolledAccounts.length === 0 ? (
            <div className={`p-8 rounded-lg border text-center text-xs ${subSurfaceCls}`}>
              No additional enrolled accounts yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {enrolledAccounts.map((acc) => {
                const isSelfOwner = acc.email.toLowerCase() === MASTER_OWNER_EMAIL;
                return (
                  <div
                    key={acc.uid}
                    className={`p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${subSurfaceCls}`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-bold text-sm">{acc.fullName}</span>
                        <span aria-hidden="true" className={mutedTextCls}>·</span>
                        <span className="font-mono text-amber-500 uppercase font-bold">{acc.role}</span>
                        <span aria-hidden="true" className={mutedTextCls}>·</span>
                        <span
                          className={`font-semibold ${
                            acc.status === 'active' ? 'text-emerald-500' : 'text-rose-500'
                          }`}
                        >
                          {acc.status === 'active' ? 'Active' : 'Suspended'}
                        </span>
                      </div>
                      <div className={`text-xs font-mono truncate ${mutedTextCls}`}>
                        {acc.email} {acc.phone ? `· ${acc.phone}` : ''} · PIN: ****
                      </div>
                    </div>

                    {!isSelfOwner && (
                      <div className="flex flex-wrap items-center gap-2 shrink-0 text-xs">
                        <select
                          value={acc.role}
                          onChange={async (e) => {
                            await enrollmentAdminApi.updateEnrolledAccount({
                              account: acc,
                              role: e.target.value as DriverRole,
                              syncAdminMarker: isMasterOwner,
                            });
                            notify(`Updated role for ${acc.fullName}`);
                          }}
                          className={`px-2.5 py-1.5 rounded-lg border cursor-pointer focus:outline-none ${inputCls}`}
                        >
                          <option value="driver">Driver</option>
                          <option value="editor">Editor</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          type="button"
                          onClick={async () => {
                            const nextStatus = acc.status === 'active' ? 'suspended' : 'active';
                            await enrollmentAdminApi.updateEnrolledAccount({
                              account: acc,
                              status: nextStatus,
                              syncAdminMarker: isMasterOwner,
                            });
                            notify(
                              nextStatus === 'active'
                                ? `Reactivated ${acc.fullName}`
                                : `Suspended access for ${acc.fullName}`
                            );
                          }}
                          className={`px-3 py-1.5 rounded-lg border font-bold cursor-pointer ${
                            acc.status === 'active'
                              ? 'border-rose-500/40 text-rose-400 hover:bg-rose-500/10'
                              : 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10'
                          }`}
                        >
                          {acc.status === 'active' ? 'Suspend Access' : 'Restore Access'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
