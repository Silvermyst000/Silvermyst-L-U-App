import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import {
  ArrowRight,
  Calendar,
  Car,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
  HardDriveDownload,
  KeyRound,
  Layers,
  Lock,
  LogOut,
  Mail,
  MessageSquare,
  Moon,
  Music,
  Palette,
  Phone,
  QrCode,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Smartphone,
  Sun,
  Tablet,
  TrendingUp,
  Tv,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { DriverRole, LicenseInquiry, PlatformLicense } from '../types/kiosk';
import {
  PortalAccessResolution,
  completeApprovedEmployeeEnrollment,
  signInWithGooglePortal,
  signOutPortal,
  submitEmployeeAccessRequest,
  submitLicenseInquiry,
  verifyLicenseKey,
} from '../services/authEnrollment';
import { AdminEnrollmentManager } from './admin/AdminEnrollmentManager';
import { DashboardClockButton } from './DashboardClockButton';

interface PublicAccessPortalProps {
  isDark: boolean;
  onToggleDark: () => void;
  firebaseUser: User | null;
  accessResolution: PortalAccessResolution;
  onRefreshAccess: () => Promise<void>;
  onLaunchKiosk: () => void;
  onOpenAdmin: () => void;
}

const FRONT_SIDE_CAPABILITIES = [
  {
    index: '01',
    icon: Tv,
    title: 'Entertainment Apps & Games Dock',
    summary:
      'Give passengers 1-tap launching for Spotify, YouTube, Netflix, Google Maps, Chrome, and touchscreen games in a dedicated full-screen rear-cabin dock.',
  },
  {
    index: '02',
    icon: Music,
    title: 'Built-In Jukebox & Song Requests',
    summary:
      'Riders browse curated vehicle playlists, test ambient soundscapes, or queue custom song requests that chime immediately on the driver console.',
  },
  {
    index: '03',
    icon: MessageSquare,
    title: 'Draggable Chat Bubble & Comfort Taps',
    summary:
      'A sleek floating bubble sits in the bottom corner—drag it to the center X to tuck it away cleanly—combining A/C, volume, water, charger taps, voice notes, and driver chat.',
  },
  {
    index: '04',
    icon: QrCode,
    title: 'Quick Connect & Tap-to-Scan QR Pay',
    summary:
      'Oversized Venmo, CashApp, WhatsApp, Booking URL, Instagram, and Linktree QR modals keep the main tablet uncluttered with an expandable More drawer.',
  },
  {
    index: '05',
    icon: Layers,
    title: 'City Dining Guide, Galleries & Screensaver',
    summary:
      'Display local restaurant picks, multi-album vehicle photo galleries, and an idle advertising screensaver featuring scannable QR booking promotions.',
  },
  {
    index: '06',
    icon: Globe,
    title: 'Instant 4-Language & 6-Theme Cabin UI',
    summary:
      'Passengers switch seamlessly between English, Spanish, French, and German plus 6 curated light and dark palettes without altering the driver dashboard.',
  },
] as const;

const BACK_SIDE_CAPABILITIES = [
  {
    index: '01',
    icon: ShieldCheck,
    title: 'Live Pop-Up Request Alerts & Voice Readout',
    summary:
      'Receive chime + modal alerts for every incoming comfort tap, voice note, or song request with 1-tap text-to-speech readout so drivers keep eyes on the road.',
  },
  {
    index: '02',
    icon: Calendar,
    title: 'Drag-and-Drop Shift Calendar & Google Sync',
    summary:
      'Drag drivers onto weekly shift slots, define time & location zones, print/email/SMS shift rosters, handle swap requests, and push schedules straight to Google Calendar.',
  },
  {
    index: '03',
    icon: TrendingUp,
    title: 'Fleet Analytics & Printable CSV Reports',
    summary:
      'Track top passenger app launches, song requests, comfort taps, and star ratings with instant date-range filters, printable summaries, and audit visibility.',
  },
  {
    index: '04',
    icon: UserCheck,
    title: 'Staff Roles, Driver Profiles & 4-Digit PINs',
    summary:
      'Configure Owner, Manager, Admin, Driver, and Editor roles, upload driver portraits, customize QR links, and gate admin controls with profile-specific 4-digit PINs.',
  },
  {
    index: '05',
    icon: Sliders,
    title: 'Experience Controller & Remote Tablet Recovery',
    summary:
      'Monitor connected tablets, trigger remote reloads, toggle kiosk locks, run pre-shift vehicle checklists, publish scheduled pop-ups, and roll back config snapshots.',
  },
  {
    index: '06',
    icon: HardDriveDownload,
    title: 'Full Config / Cloud Backups & Driver Quick Apps',
    summary:
      'Preserve and restore complete fleet configuration and historical records across cloud snapshots, plus customize quick-launch apps for on-duty drivers.',
  },
] as const;

const LICENSE_TIERS: Array<{
  id: LicenseInquiry['packageTier'];
  name: string;
  monthlyPrice: string;
  annualPrice: string;
  cadenceMonthly: string;
  cadenceAnnual: string;
  audience: string;
  deliverables: string[];
}> = [
  {
    id: 'single_vehicle',
    name: 'Single Vehicle Operator',
    monthlyPrice: '$29',
    annualPrice: '$278',
    cadenceMonthly: 'per month · 1 vehicle license',
    cadenceAnnual: 'per year (save 20%) · 1 vehicle',
    audience: 'Independent black-car chauffeurs, limos, and private rideshare operators.',
    deliverables: [
      'Full Passenger Kiosk & Admin Command Center',
      '4-Language Passenger & Independent Admin UI',
      'Quick Connect QR Pay Dock & Custom Galleries',
      'Managed Portal Provisioning & Owner PIN Security',
    ],
  },
  {
    id: 'fleet_pro',
    name: 'Fleet Pro Commercial',
    monthlyPrice: '$99',
    annualPrice: '$950',
    cadenceMonthly: 'per month · up to 10 vehicles',
    cadenceAnnual: 'per year (save 20%) · 10 vehicles',
    audience: 'Executive car services, campus shuttles, and multi-driver VIP fleets.',
    deliverables: [
      'Everything in Single Vehicle across up to 10 vehicles',
      'Drag-and-Drop Shift Calendar + Google Calendar Sync',
      'Owner Approve List Enrollment & Role Permissions',
      'Fleet Analytics, Checklists & Managed Cloud Rollout',
    ],
  },
  {
    id: 'enterprise_whitelabel',
    name: 'Enterprise White-Label',
    monthlyPrice: 'Custom',
    annualPrice: 'Custom',
    cadenceMonthly: 'unlimited vehicles · dedicated setup',
    cadenceAnnual: 'unlimited vehicles · annual contract',
    audience: 'Hospitality groups, regional transit contractors, and multi-city luxury fleets.',
    deliverables: [
      'Unlimited Vehicle Licenses & Custom Domain Branding',
      'Dedicated Firebase Cloud Provisioning & Onboarding',
      'Turnkey Fleet Kiosk Lockdown & Hardware Consultation',
      'Priority Support by Silvermyst Engineering (South Bend, IN)',
    ],
  },
];

export const PublicAccessPortal: React.FC<PublicAccessPortalProps> = ({
  isDark,
  onToggleDark,
  firebaseUser,
  accessResolution,
  onRefreshAccess,
  onLaunchKiosk,
  onOpenAdmin,
}) => {
  // Suppress automatic browser install prompts on the public storefront side
  useEffect(() => {
    const suppressInstallPrompt = (e: Event) => {
      e.preventDefault();
    };
    window.addEventListener('beforeinstallprompt', suppressInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', suppressInstallPrompt);
    };
  }, []);

  // Commercial License Verification Lookup State
  const [licenseKeyInput, setLicenseKeyInput] = useState('');
  const [verifyingLicense, setVerifyingLicense] = useState(false);
  const [licenseVerifyError, setLicenseVerifyError] = useState<string | null>(null);
  const [verifiedLicense, setVerifiedLicense] = useState<PlatformLicense | null>(null);

  // Showcase filter: both, front, or back
  const [platformView, setPlatformView] = useState<'all' | 'front' | 'back'>('all');

  // Access Portal & Employee Enrollment state
  const [portalTab, setPortalTab] = useState<'signin' | 'enroll'>('signin');
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showOwnerAllowlist, setShowOwnerAllowlist] = useState(false);

  // Image fallbacks (Zero-Broken-Image Policy)
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [cabinImgFailed, setCabinImgFailed] = useState(false);
  const [adminImgFailed, setAdminImgFailed] = useState(false);
  const [hardwareImgFailed, setHardwareImgFailed] = useState(false);

  // Enrollment completion state (when email IS on Approve List)
  const [enrollName, setEnrollName] = useState('');
  const [enrollTitle, setEnrollTitle] = useState('Executive Chauffeur');
  const [enrollPhone, setEnrollPhone] = useState('');
  const [enrollVehicle, setEnrollVehicle] = useState('');
  const [enrollPin, setEnrollPin] = useState('0000');
  const [showPin, setShowPin] = useState(false);
  const [enrollSaving, setEnrollSaving] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  // Employee Access Request form state (when email is NOT on Approve List)
  const [reqName, setReqName] = useState('');
  const [reqPhone, setReqPhone] = useState('');
  const [reqRole, setReqRole] = useState<Exclude<DriverRole, 'owner'>>('driver');
  const [reqReason, setReqReason] = useState('');
  const [reqSaving, setReqSaving] = useState(false);
  const [reqSubmittedNotice, setReqSubmittedNotice] = useState<string | null>(null);

  // Commercial License Order & Purchase Form state
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedTier, setSelectedTier] = useState<LicenseInquiry['packageTier']>('fleet_pro');
  const [fleetSize, setFleetSize] = useState<LicenseInquiry['fleetSize']>('2-5');
  const [buyerCompany, setBuyerCompany] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerNotes, setBuyerNotes] = useState('');
  const [acceptedOrderTerms, setAcceptedOrderTerms] = useState(false);
  const [buyerSubmitting, setBuyerSubmitting] = useState(false);
  const [buyerError, setBuyerError] = useState<string | null>(null);
  const [submittedLead, setSubmittedLead] = useState<LicenseInquiry | null>(null);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleVerifyLicenseKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setLicenseVerifyError(null);
    const cleaned = licenseKeyInput.trim().toUpperCase();
    if (!/^SLV-[A-Z0-9-]+$/.test(cleaned)) {
      setLicenseVerifyError(
        'Enter the valid License Key provided after purchase completion (format: SLV-XXX-XXXX-XXXX).'
      );
      return;
    }
    setVerifyingLicense(true);
    try {
      const found = await verifyLicenseKey(cleaned);
      if (!found) {
        setLicenseVerifyError(
          'No active paid license matched that key. Complete your purchase below or contact Silvermyst support.'
        );
        setVerifiedLicense(null);
        return;
      }
      setVerifiedLicense(found);
      setLicenseKeyInput('');
    } catch (err: any) {
      setLicenseVerifyError(err?.message || 'Unable to verify license key right now.');
    } finally {
      setVerifyingLicense(false);
    }
  };

  const handleGoogleAuth = async (intendedTab: 'signin' | 'enroll') => {
    setPortalTab(intendedTab);
    setAuthBusy(true);
    setAuthError(null);
    try {
      const signedIn = await signInWithGooglePortal();
      if (signedIn.displayName && !enrollName) {
        setEnrollName(signedIn.displayName);
      }
      if (signedIn.displayName && !reqName) {
        setReqName(signedIn.displayName);
      }
      await onRefreshAccess();
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setAuthError(
          err?.message || 'Unable to verify Google account. Please allow pop-ups and try again.'
        );
      }
    } finally {
      setAuthBusy(false);
    }
  };

  const handleCompleteEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || accessResolution.status !== 'eligible_to_enroll') return;
    if (!enrollName.trim()) {
      setEnrollError('Please enter your full name.');
      return;
    }
    if (!/^\d{4}$/.test(enrollPin)) {
      setEnrollError('Personal PIN must be exactly 4 digits (e.g. 0000 or your chosen 4 numbers).');
      return;
    }
    setEnrollSaving(true);
    setEnrollError(null);
    try {
      await completeApprovedEmployeeEnrollment({
        user: firebaseUser,
        approvedEntry: accessResolution.approvedEntry,
        fullName: enrollName,
        title: enrollTitle,
        phone: enrollPhone,
        vehicleModel: enrollVehicle || accessResolution.approvedEntry.vehicleAssignment || '',
        assignedPin: enrollPin,
      });
      await onRefreshAccess();
    } catch (err: any) {
      setEnrollError(
        err?.message || 'Enrollment could not be completed. Please contact your administrator.'
      );
    } finally {
      setEnrollSaving(false);
    }
  };

  const handleRequestApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;
    if (!reqName.trim() || !reqPhone.trim() || !reqReason.trim()) {
      setAuthError('Please complete your name, phone number, and reason for access.');
      return;
    }
    setReqSaving(true);
    setAuthError(null);
    try {
      await submitEmployeeAccessRequest({
        user: firebaseUser,
        fullName: reqName,
        phone: reqPhone,
        requestedRole: reqRole,
        reason: reqReason,
      });
      setReqSubmittedNotice(
        'Your access request has been logged for administrator review. Once your email is added to the Approve List, click Refresh Status.'
      );
      await onRefreshAccess();
    } catch (err: any) {
      setAuthError(err?.message || 'Could not submit access request.');
    } finally {
      setReqSaving(false);
    }
  };

  const handleLicenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBuyerError(null);

    const trimmedEmail = buyerEmail.trim();
    if (!buyerCompany.trim() || !buyerName.trim()) {
      setBuyerError('Please enter your company or fleet name and your contact name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setBuyerError('Please enter a valid work email address.');
      return;
    }
    if (buyerPhone.trim().length < 7) {
      setBuyerError('Please provide a valid phone number so we can finalize your order.');
      return;
    }
    if (!acceptedOrderTerms) {
      setBuyerError('Please confirm the commercial fleet license order terms before submitting.');
      return;
    }

    setBuyerSubmitting(true);
    try {
      const saved = await submitLicenseInquiry({
        companyName: buyerCompany,
        contactName: buyerName,
        email: trimmedEmail,
        phone: buyerPhone,
        fleetSize,
        packageTier: selectedTier,
        billingCycle,
        notes:
          buyerNotes ||
          `Purchase order for ${selectedTier.replace('_', ' ')} (${billingCycle}).`,
      });
      setSubmittedLead(saved);
      setBuyerCompany('');
      setBuyerName('');
      setBuyerEmail('');
      setBuyerPhone('');
      setBuyerNotes('');
      setAcceptedOrderTerms(false);
    } catch (err: any) {
      setBuyerError(
        err?.message || 'Unable to submit order right now. Please call (574) 387-6229 directly.'
      );
    } finally {
      setBuyerSubmitting(false);
    }
  };

  // Cohesive Light / Dark Surface Tokens
  const bgCanvas = isDark ? 'bg-[#090d16] text-slate-100' : 'bg-slate-50 text-slate-900';
  const headerSurface = isDark
    ? 'bg-[#090d16]/90 border-slate-800/80'
    : 'bg-white/90 border-slate-200';
  const cardSurface = isDark
    ? 'bg-[#111827] border-slate-800 text-slate-100'
    : 'bg-white border-slate-200 text-slate-900';
  const subtleSurface = isDark
    ? 'bg-slate-950/75 border-slate-800 text-slate-200'
    : 'bg-slate-100/85 border-slate-200 text-slate-800';
  const dividerBorder = isDark ? 'border-slate-800/80' : 'border-slate-200';
  const mutedText = isDark ? 'text-slate-400' : 'text-slate-600';
  const inputSurface = isDark
    ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-amber-500'
    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-600';

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${bgCanvas}`}>
      {/* Strict 3-Zone Top Navigation Contract (Zero public download/install buttons) */}
      <header className={`sticky top-0 z-30 border-b backdrop-blur-md ${headerSurface}`}>
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <a
            href="#portal-top"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('portal-top');
            }}
            className="text-lg font-bold tracking-tight whitespace-nowrap shrink-0"
          >
            Silvermyst CabinOS
          </a>

          {/* Zone 2: 5 concise single-line text nav links */}
          <nav className={`hidden md:flex items-center gap-6 text-sm font-medium ${mutedText}`}>
            <button
              type="button"
              onClick={() => {
                setPlatformView('front');
                scrollToSection('front-side');
              }}
              className="hover:text-amber-500 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Front Side
            </button>
            <button
              type="button"
              onClick={() => {
                setPlatformView('back');
                scrollToSection('back-side');
              }}
              className="hover:text-amber-500 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Back Side
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('managed-provisioning')}
              className="hover:text-amber-500 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Provisioning
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('pricing-licensing')}
              className="hover:text-amber-500 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Licensing
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('portal-access-desk')}
              className="hover:text-amber-500 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Access Desk
            </button>
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => scrollToSection('pricing-licensing')}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Purchase License</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main id="portal-top" className="flex-1">
        {/* HERO SECTION: Commercial Value Proposition + Visual + Preserved Access Desk */}
        <section className="max-w-[1440px] mx-auto px-6 pt-8 pb-12 lg:pb-16">
          {/* Sub-header Utility Strip */}
          <div
            className={`flex flex-wrap items-center justify-between gap-4 pb-6 border-b ${dividerBorder}`}
          >
            <div className={`text-xs font-medium flex flex-wrap items-center gap-2 ${mutedText}`}>
              <span>Silvermyst Multiservices</span>
              <span aria-hidden="true">·</span>
              <span>In-Cabin Tablet Kiosk &amp; Remote Fleet OS</span>
              <span aria-hidden="true">·</span>
              <span>License-Provisioned Vehicle Deployment</span>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 flex-wrap">
              <DashboardClockButton
                className={
                  isDark
                    ? '!bg-slate-900 !border-slate-800 !text-slate-200'
                    : '!bg-white !border-slate-300 !text-slate-800'
                }
              />
              {firebaseUser && (
                <button
                  type="button"
                  onClick={signOutPortal}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                    isDark
                      ? 'border-slate-800 bg-slate-900 text-slate-300 hover:text-white'
                      : 'border-slate-300 bg-white text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              )}
              <button
                type="button"
                onClick={onToggleDark}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                  isDark
                    ? 'border-slate-800 bg-slate-900 text-slate-300 hover:text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:text-slate-900'
                }`}
              >
                {isDark ? (
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-slate-700" />
                )}
                <span>{isDark ? 'Daylight Theme' : 'Night Obsidian'}</span>
              </button>
            </div>
          </div>

          {/* Balanced 12-Col Hero Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 pt-8 items-stretch">
            {/* Left 7 Cols: Commercial Sales Pitch + 16:9 Flagship Visual */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-7">
              <div className="space-y-5">
                <h1
                  className="font-bold tracking-tight leading-[1.08]"
                  style={{ fontSize: 'clamp(2.25rem, 3.8vw, 3.35rem)', textWrap: 'balance' }}
                >
                  Turn Any Vehicle Cabin Into a Passenger Lounge &amp; Fleet Command System
                </h1>

                <p className={`text-base sm:text-lg max-w-2xl leading-relaxed ${mutedText}`}>
                  Silvermyst CabinOS pairs a bilingual rear-seat passenger tablet with a remote
                  driver and dispatcher command center. Purchase a commercial license for your
                  fleet, let Silvermyst provision your hardware, and keep customer data strictly
                  locked to your approved roster.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <button
                    type="button"
                    onClick={() => scrollToSection('pricing-licensing')}
                    className="px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>Purchase Fleet License</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToSection('front-side')}
                    className={`px-5 py-3 rounded-lg border text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      isDark
                        ? 'border-slate-700 text-slate-200 hover:border-amber-500'
                        : 'border-slate-300 text-slate-800 hover:border-amber-600'
                    }`}
                  >
                    Explore Front &amp; Back Side
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToSection('managed-provisioning')}
                    className={`text-sm font-semibold hover:underline underline-offset-4 cursor-pointer whitespace-nowrap shrink-0 ${
                      isDark ? 'text-amber-400' : 'text-amber-700'
                    }`}
                  >
                    Verify Purchased License &rarr;
                  </button>
                </div>
              </div>

              {/* 16:9 Architectural Hero Image with Scrim */}
              <div className={`relative rounded-xl overflow-hidden border aspect-video ${cardSurface}`}>
                {!heroImgFailed ? (
                  <img
                    src="/src/assets/images/portal_hero_vehicle_1794530721943.jpg"
                    alt="Silvermyst executive SUV cabin outfitted with commercial passenger tablet kiosk"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgFailed(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 flex flex-col items-center justify-center p-6 text-center">
                    <Car className="w-10 h-10 text-amber-400 mb-2" />
                    <span className="text-sm font-semibold text-white">
                      Silvermyst CabinOS — Dual-Sided Vehicle Kiosk Platform
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex items-end p-5">
                  <div className="flex flex-wrap items-center justify-between w-full gap-2 text-xs text-slate-200">
                    <span className="font-semibold">
                      Front-Side Passenger Experience · Back-Side Fleet Dispatch
                    </span>
                    <span className="font-mono text-amber-300">
                      Turnkey Provisioned Hardware
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Preserved Portal Access, Launch & Allowlist Enrollment Desk */}
            <div id="portal-access-desk" className="lg:col-span-5 flex flex-col">
              <div
                className={`flex-1 rounded-xl border p-6 sm:p-8 flex flex-col justify-between space-y-6 ${cardSurface}`}
              >
                {/* STATE: LOADING AUTH CHECK */}
                {accessResolution.status === 'loading' && (
                  <div className="py-12 text-center space-y-3">
                    <RefreshCw className="w-7 h-7 text-amber-500 animate-spin mx-auto" />
                    <div className="text-base font-bold">Verifying Portal Authorization</div>
                    <p className={`text-xs ${mutedText}`}>
                      Checking your verified identity against the Owner Approve List...
                    </p>
                  </div>
                )}

                {/* STATE: PUBLIC LOCKED (UNAUTHENTICATED VISITOR) */}
                {accessResolution.status === 'public_locked' && (
                  <div className="space-y-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-bold tracking-tight">
                          Live Operator Access Desk
                        </h2>
                        <p className={`text-xs mt-1 leading-relaxed ${mutedText}`}>
                          Sign in with an approved staff account to launch live vehicle cabins and
                          command centers, or request onboarding to your organization&apos;s Approve
                          List.
                        </p>
                      </div>
                      <Lock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    </div>

                    {/* Interactive Mode Switcher */}
                    <div
                      className={`grid grid-cols-2 gap-1 p-1 rounded-lg border text-xs font-semibold ${subtleSurface}`}
                    >
                      <button
                        type="button"
                        onClick={() => setPortalTab('signin')}
                        className={`py-2 px-3 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                          portalTab === 'signin'
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : `${mutedText} hover:text-amber-500`
                        }`}
                      >
                        Operator Sign In
                      </button>
                      <button
                        type="button"
                        onClick={() => setPortalTab('enroll')}
                        className={`py-2 px-3 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                          portalTab === 'enroll'
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : `${mutedText} hover:text-amber-500`
                        }`}
                      >
                        Employee Enroll
                      </button>
                    </div>

                    {authError && (
                      <div className="p-3 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-400 text-xs flex items-start gap-2">
                        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{authError}</span>
                      </div>
                    )}

                    {portalTab === 'signin' ? (
                      <div className="space-y-4">
                        <div className={`p-4 rounded-lg border space-y-2.5 text-xs ${subtleSurface}`}>
                          <div className="font-semibold flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                            <span>Three-Mode Workspace Once Verified</span>
                          </div>
                          <ul className={`space-y-1.5 ${mutedText}`}>
                            <li className="flex items-center gap-2">
                              <Tablet className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span>Launch Passenger Cabin Kiosk for backseat riders</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <KeyRound className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span>Open Admin Command Center behind 4-digit PIN gate</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <UserPlus className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span>Manage Employee Approve List &amp; Enrollment Requests</span>
                            </li>
                          </ul>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleGoogleAuth('signin')}
                          disabled={authBusy}
                          className="w-full py-3 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-bold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>
                            {authBusy ? 'Opening Google Sign-In...' : 'Sign In with Google Account'}
                          </span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div
                          className={`p-4 rounded-lg border space-y-2 text-xs leading-relaxed ${subtleSurface}`}
                        >
                          <div className="font-semibold flex items-center gap-2">
                            <UserPlus className="w-4 h-4 text-amber-500 shrink-0" />
                            <span>Allowlist-Only Employee Onboarding</span>
                          </div>
                          <p className={mutedText}>
                            Only pre-approved emails can register an employee account. Verify your
                            Google identity below to unlock your onboarding form or submit an
                            approval request to the fleet owner.
                          </p>
                        </div>

                        <ol className={`space-y-2 text-xs ${mutedText}`}>
                          <li className="flex items-start gap-2">
                            <span className="font-mono font-bold text-amber-500">01.</span>
                            <span>Authenticate your Google email via Google Sign-In.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="font-mono font-bold text-amber-500">02.</span>
                            <span>System verifies your email against the Owner Approve List.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="font-mono font-bold text-amber-500">03.</span>
                            <span>Set your driver profile and personal 4-digit PIN to begin.</span>
                          </li>
                        </ol>

                        <button
                          type="button"
                          onClick={() => handleGoogleAuth('enroll')}
                          disabled={authBusy}
                          className="w-full py-3 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-bold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>
                            {authBusy ? 'Verifying Email...' : 'Verify Email & Check Approve List'}
                          </span>
                        </button>
                      </div>
                    )}

                    {/* Clean commercial bridge without downloads */}
                    <div className={`pt-4 border-t ${dividerBorder} space-y-2`}>
                      <div className="text-xs font-semibold">
                        Ready to license CabinOS for your own vehicles?
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => scrollToSection('pricing-licensing')}
                          className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                            isDark
                              ? 'border-slate-700 hover:border-amber-500 text-amber-400'
                              : 'border-slate-300 hover:border-amber-600 text-amber-700'
                          }`}
                        >
                          Purchase License
                        </button>
                        <button
                          type="button"
                          onClick={() => scrollToSection('managed-provisioning')}
                          className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                            isDark
                              ? 'border-slate-700 hover:border-amber-500 text-slate-200'
                              : 'border-slate-300 hover:border-amber-600 text-slate-800'
                          }`}
                        >
                          Check License Key
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STATE: ON APPROVE LIST -> COMPLETE EMPLOYEE ENROLLMENT */}
                {accessResolution.status === 'eligible_to_enroll' && (
                  <form onSubmit={handleCompleteEnrollment} className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-emerald-500 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Email Pre-Approved for Enrollment</span>
                        </div>
                        <h2 className="text-xl font-bold tracking-tight mt-1">
                          Create Your Employee Account
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={signOutPortal}
                        className={`text-xs font-medium hover:underline cursor-pointer ${mutedText}`}
                      >
                        Switch Account
                      </button>
                    </div>

                    <div
                      className={`p-3 rounded-lg border text-xs flex flex-wrap items-center justify-between gap-2 ${subtleSurface}`}
                    >
                      <span className="font-mono truncate">{accessResolution.email}</span>
                      <span className="font-mono font-bold uppercase text-amber-500">
                        Role: {accessResolution.approvedEntry.role}
                      </span>
                    </div>

                    {enrollError && (
                      <div className="p-3 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-400 text-xs">
                        {enrollError}
                      </div>
                    )}

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className={`block font-semibold mb-1 ${mutedText}`}>
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={enrollName}
                          onChange={(e) => setEnrollName(e.target.value)}
                          placeholder={
                            accessResolution.approvedEntry.displayName || 'Your Full Name'
                          }
                          className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none ${inputSurface}`}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={`block font-semibold mb-1 ${mutedText}`}>
                            Title / Position
                          </label>
                          <input
                            type="text"
                            value={enrollTitle}
                            onChange={(e) => setEnrollTitle(e.target.value)}
                            placeholder="Executive Chauffeur"
                            className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none ${inputSurface}`}
                          />
                        </div>
                        <div>
                          <label className={`block font-semibold mb-1 ${mutedText}`}>
                            Contact Phone *
                          </label>
                          <input
                            type="tel"
                            required
                            value={enrollPhone}
                            onChange={(e) => setEnrollPhone(e.target.value)}
                            placeholder="(574) 555-0192"
                            className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none ${inputSurface}`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={`block font-semibold mb-1 ${mutedText}`}>
                            Vehicle Model
                          </label>
                          <input
                            type="text"
                            value={enrollVehicle}
                            onChange={(e) => setEnrollVehicle(e.target.value)}
                            placeholder={
                              accessResolution.approvedEntry.vehicleAssignment ||
                              'Cadillac Escalade ESV'
                            }
                            className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none ${inputSurface}`}
                          />
                        </div>
                        <div>
                          <label className={`block font-semibold mb-1 ${mutedText}`}>
                            Personal 4-Digit PIN *
                          </label>
                          <div className="relative">
                            <input
                              type={showPin ? 'text' : 'password'}
                              maxLength={4}
                              required
                              value={enrollPin}
                              onChange={(e) =>
                                setEnrollPin(e.target.value.replace(/[^0-9]/g, ''))
                              }
                              placeholder="0000"
                              className={`w-full px-3 py-2.5 rounded-lg border font-mono tracking-widest focus:outline-none ${inputSurface}`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPin((p) => !p)}
                              className={`absolute right-2.5 top-2.5 cursor-pointer ${mutedText}`}
                              aria-label="Toggle PIN visibility"
                            >
                              {showPin ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={enrollSaving}
                        className="w-full py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold text-sm cursor-pointer transition-colors flex items-center justify-center gap-2"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>
                          {enrollSaving ? 'Creating Account...' : 'Complete Employee Enrollment'}
                        </span>
                      </button>
                    </div>
                  </form>
                )}

                {/* STATE: NOT ON APPROVE LIST (BLOCKED + REQUEST APPROVAL FORM) */}
                {accessResolution.status === 'not_on_approve_list' && (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-amber-500 flex items-center gap-1.5">
                          <ShieldAlert className="w-4 h-4" />
                          <span>Authorization Required — Not on Approve List</span>
                        </div>
                        <h2 className="text-xl font-bold tracking-tight mt-1">
                          Account Creation Restricted
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={signOutPortal}
                        className={`text-xs font-medium hover:underline cursor-pointer ${mutedText}`}
                      >
                        Sign Out
                      </button>
                    </div>

                    <div className={`p-3.5 rounded-lg border text-xs space-y-1 ${subtleSurface}`}>
                      <div className="font-mono font-semibold">{accessResolution.email}</div>
                      <p className={mutedText}>
                        This email is not currently on the Owner&apos;s Approve List, so an account
                        cannot be created yet and operational tools remain locked.
                      </p>
                    </div>

                    {reqSubmittedNotice && (
                      <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs">
                        {reqSubmittedNotice}
                      </div>
                    )}

                    {authError && (
                      <div className="p-3 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-400 text-xs">
                        {authError}
                      </div>
                    )}

                    {accessResolution.existingRequest ? (
                      <div className={`p-4 rounded-lg border space-y-3 text-xs ${subtleSurface}`}>
                        <div className="font-bold flex items-center justify-between">
                          <span>Enrollment Request Submitted</span>
                          <span
                            className={`uppercase font-mono ${
                              accessResolution.existingRequest.status === 'approved'
                                ? 'text-emerald-500'
                                : accessResolution.existingRequest.status === 'declined'
                                ? 'text-rose-500'
                                : 'text-amber-500'
                            }`}
                          >
                            {accessResolution.existingRequest.status}
                          </span>
                        </div>
                        <p className={mutedText}>
                          Requested Role:{' '}
                          <strong>{accessResolution.existingRequest.requestedRole}</strong>
                          {accessResolution.existingRequest.reviewNote
                            ? ` · Note: ${accessResolution.existingRequest.reviewNote}`
                            : ''}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={onRefreshAccess}
                            className="flex-1 py-2.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Refresh Approval Status</span>
                          </button>
                          <button
                            type="button"
                            onClick={signOutPortal}
                            className={`py-2.5 px-3 rounded-lg border font-semibold cursor-pointer ${
                              isDark
                                ? 'border-slate-700 text-slate-300'
                                : 'border-slate-300 text-slate-700'
                            }`}
                          >
                            Sign Out
                          </button>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleRequestApproval} className="space-y-3 text-xs">
                        <div className="font-semibold">Request Addition to Approve List</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            required
                            value={reqName}
                            onChange={(e) => setReqName(e.target.value)}
                            placeholder="Your Full Name *"
                            className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none ${inputSurface}`}
                          />
                          <input
                            type="tel"
                            required
                            value={reqPhone}
                            onChange={(e) => setReqPhone(e.target.value)}
                            placeholder="Phone Number *"
                            className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none ${inputSurface}`}
                          />
                        </div>

                        <select
                          value={reqRole}
                          onChange={(e) => setReqRole(e.target.value as any)}
                          className={`w-full px-3 py-2.5 rounded-lg border cursor-pointer focus:outline-none ${inputSurface}`}
                        >
                          <option value="driver">Request Role: Driver / Chauffeur</option>
                          <option value="editor">Request Role: Content Editor</option>
                          <option value="manager">Request Role: Operations Manager</option>
                          <option value="admin">Request Role: Fleet Administrator</option>
                        </select>

                        <textarea
                          rows={2}
                          required
                          value={reqReason}
                          onChange={(e) => setReqReason(e.target.value)}
                          placeholder="Brief note (e.g. Hired driver for executive weekend fleet)"
                          className={`w-full px-3 py-2 rounded-lg border focus:outline-none resize-none ${inputSurface}`}
                        />

                        <button
                          type="submit"
                          disabled={reqSaving}
                          className="w-full py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-bold text-xs cursor-pointer transition-colors"
                        >
                          {reqSaving ? 'Submitting Request...' : 'Submit Request to Administrator'}
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* STATE: SUSPENDED OR REVOKED */}
                {(accessResolution.status === 'suspended' ||
                  accessResolution.status === 'revoked') && (
                  <div className="space-y-4 py-4">
                    <div className="text-rose-500 flex items-center gap-2 font-bold text-sm">
                      <ShieldAlert className="w-5 h-5" />
                      <span>Portal Access Suspended or Revoked</span>
                    </div>
                    <p className={`text-xs leading-relaxed ${mutedText}`}>
                      Your enrollment status is currently restricted by the Silvermyst administrator.
                      Contact (574) 387-6229 or your fleet manager if you believe this is an error.
                    </p>
                    <button
                      type="button"
                      onClick={signOutPortal}
                      className="w-full py-2.5 px-4 rounded-lg border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 font-bold text-xs cursor-pointer flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out &amp; Return to Public View</span>
                    </button>
                  </div>
                )}

                {/* STATE: AUTHORIZED USER HUB (3 CORE ACTIONS PRESERVED — NO DOWNLOAD BUTTONS) */}
                {accessResolution.status === 'authorized' && (
                  <div className="space-y-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-emerald-500 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Authorized Portal Session</span>
                        </div>
                        <h2 className="text-xl font-bold tracking-tight mt-1">
                          {accessResolution.account.fullName}
                        </h2>
                        <div className={`text-xs font-mono mt-0.5 ${mutedText}`}>
                          {accessResolution.account.email} ·{' '}
                          {accessResolution.account.role.toUpperCase()}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={signOutPortal}
                        className={`p-2 rounded-lg border cursor-pointer ${
                          isDark
                            ? 'border-slate-800 text-slate-400 hover:text-white'
                            : 'border-slate-200 text-slate-600'
                        }`}
                        title="Sign Out & Lock Portal"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      <button
                        type="button"
                        onClick={onLaunchKiosk}
                        className="w-full py-3.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <span className="flex items-center gap-2.5">
                          <Tablet className="w-4 h-4" />
                          <span>Launch Passenger Cabin Kiosk</span>
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={onOpenAdmin}
                        className={`w-full py-3 px-4 rounded-lg border font-semibold text-sm cursor-pointer flex items-center justify-between transition-colors ${
                          isDark
                            ? 'bg-slate-950 border-slate-700 hover:border-amber-500 text-white'
                            : 'bg-slate-50 border-slate-300 hover:border-amber-600 text-slate-900'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <KeyRound className="w-4 h-4 text-amber-500" />
                          <span>Open Admin Command Center (PIN Gate)</span>
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      {accessResolution.isAdminRole && (
                        <button
                          type="button"
                          onClick={() => setShowOwnerAllowlist((v) => !v)}
                          className={`w-full py-2.5 px-4 rounded-lg border font-semibold text-xs cursor-pointer flex items-center justify-between transition-colors ${
                            showOwnerAllowlist
                              ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                              : `${subtleSurface} hover:border-amber-500/50`
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <UserPlus className="w-4 h-4" />
                            <span>
                              {showOwnerAllowlist
                                ? 'Hide Employee Approve List Manager'
                                : 'Manage Employee Approve List & Requests'}
                            </span>
                          </span>
                          <span>{showOwnerAllowlist ? 'Close' : 'Open'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Card Footer */}
                <div
                  className={`pt-4 border-t text-xs flex flex-wrap items-center justify-between gap-2 ${dividerBorder} ${mutedText}`}
                >
                  <span>Direct Fleet &amp; Sales Desk</span>
                  <span className="font-mono tabular-nums font-semibold">
                    (574) 387-6229 · carlos881672@gmail.com
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Inline Owner Approve List Workspace */}
          {accessResolution.status === 'authorized' &&
            accessResolution.isAdminRole &&
            showOwnerAllowlist && (
              <div className={`mt-8 p-6 sm:p-8 rounded-xl border ${cardSurface}`}>
                <AdminEnrollmentManager
                  currentUser={firebaseUser}
                  isMasterOwner={accessResolution.isOwner}
                  isDark={isDark}
                />
              </div>
            )}

          {/* Full-Width Quantitative Proof Strip */}
          <div
            className={`mt-10 grid grid-cols-2 lg:grid-cols-4 border rounded-xl overflow-hidden divide-y lg:divide-y-0 lg:divide-x ${dividerBorder} ${cardSurface}`}
          >
            <div className="p-5 space-y-1">
              <div className="text-2xl font-bold font-mono tabular-nums text-amber-500">
                4 Languages
              </div>
              <div className="text-xs font-semibold">EN · ES · FR · DE Live Switch</div>
              <div className={`text-xs ${mutedText}`}>
                Independent passenger &amp; admin language separation.
              </div>
            </div>
            <div className="p-5 space-y-1">
              <div className="text-2xl font-bold font-mono tabular-nums text-amber-500">
                6 Themes
              </div>
              <div className="text-xs font-semibold">Integrated Daylight &amp; Dark</div>
              <div className={`text-xs ${mutedText}`}>
                Full-system palette themes across cabin &amp; admin panels.
              </div>
            </div>
            <div className="p-5 space-y-1">
              <div className="text-2xl font-bold font-mono tabular-nums text-amber-500">
                Turnkey Setup
              </div>
              <div className="text-xs font-semibold">Provisioned After Purchase</div>
              <div className={`text-xs ${mutedText}`}>
                Dedicated fleet workspace configured directly by our team.
              </div>
            </div>
            <div className="p-5 space-y-1">
              <div className="text-2xl font-bold font-mono tabular-nums text-amber-500">
                Allowlist Lock
              </div>
              <div className="text-xs font-semibold">Role-Verified Firestore Gate</div>
              <div className={`text-xs ${mutedText}`}>
                Public visitors never access internal fleet operations.
              </div>
            </div>
          </div>
        </section>

        {/* DUAL-SIDED PLATFORM EXPLORER: FRONT SIDE VS. BACK SIDE */}
        <section id="front-side" className={`border-t py-14 ${dividerBorder}`}>
          <div className="max-w-[1440px] mx-auto px-6 space-y-12">
            {/* Section Header + Interactive View Filter */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="max-w-2xl space-y-3">
                <h2
                  className="text-2xl sm:text-3xl font-bold tracking-tight"
                  style={{ textWrap: 'balance' }}
                >
                  One Platform, Two Synchronized Worlds: Front-Side Cabin &amp; Back-Side Command
                </h2>
                <p className={`text-sm leading-relaxed ${mutedText}`}>
                  Built from real black-car and shuttle operations, every feature works across
                  headrest tablets, driver smartphones, dispatch laptops, and large terminal
                  monitors.
                </p>
              </div>

              <div
                className={`inline-flex items-center gap-1 p-1 rounded-lg border text-xs font-semibold self-start lg:self-auto ${subtleSurface}`}
              >
                <button
                  type="button"
                  onClick={() => setPlatformView('all')}
                  className={`px-3.5 py-2 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    platformView === 'all'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : `${mutedText} hover:text-amber-500`
                  }`}
                >
                  View Both Sides
                </button>
                <button
                  type="button"
                  onClick={() => setPlatformView('front')}
                  className={`px-3.5 py-2 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    platformView === 'front'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : `${mutedText} hover:text-amber-500`
                  }`}
                >
                  Front Side · Passenger
                </button>
                <button
                  type="button"
                  onClick={() => setPlatformView('back')}
                  className={`px-3.5 py-2 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    platformView === 'back'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : `${mutedText} hover:text-amber-500`
                  }`}
                >
                  Back Side · Admin
                </button>
              </div>
            </div>

            {/* CHAPTER 1: FRONT SIDE — PASSENGER CABIN KIOSK */}
            {(platformView === 'all' || platformView === 'front') && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Left Visual Story (5 Cols) */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                  <div className={`rounded-xl border overflow-hidden ${cardSurface}`}>
                    <div className="aspect-4/3 w-full overflow-hidden relative">
                      {!cabinImgFailed ? (
                        <img
                          src="/src/assets/images/portal_cabin_tablet_1794530721041.jpg"
                          alt="Rear-seat Android tablet mounted on executive leather headrest showing Silvermyst passenger kiosk"
                          referrerPolicy="no-referrer"
                          onError={() => setCabinImgFailed(true)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                          <Tablet className="w-10 h-10 text-amber-500" />
                        </div>
                      )}
                    </div>
                    <div className="p-6 space-y-2">
                      <div className="text-xs font-mono font-bold text-amber-500">
                        Front Side · Passenger Cabin Kiosk
                      </div>
                      <h3 className="text-xl font-bold tracking-tight">
                        Rear-Seat Lounge Built for Zero Friction
                      </h3>
                      <p className={`text-xs leading-relaxed ${mutedText}`}>
                        Mounted in landscape orientation behind the front headrest, passengers
                        immediately enjoy entertainment, music controls, local recommendations,
                        language selection, and silent requests without needing a personal login.
                      </p>
                      <div className={`pt-3 flex items-center gap-3 text-xs font-medium ${mutedText}`}>
                        <span className="inline-flex items-center gap-1.5">
                          <Palette className="w-3.5 h-3.5 text-amber-500" />
                          <span>6 Coordinated Color Themes</span>
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>Touchscreen Sized</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right 6 Feature Grid (7 Cols) */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {FRONT_SIDE_CAPABILITIES.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.index}
                        className={`p-5 rounded-xl border flex flex-col justify-between space-y-3 ${cardSurface}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-amber-500">
                            {item.index}. Front Cabin
                          </span>
                          <Icon className={`w-4 h-4 ${mutedText}`} />
                        </div>
                        <div className="space-y-1.5">
                          <h4 className="text-sm font-bold">{item.title}</h4>
                          <p className={`text-xs leading-relaxed ${mutedText}`}>{item.summary}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CHAPTER 2: BACK SIDE — REMOTE ADMIN COMMAND CENTER */}
            {(platformView === 'all' || platformView === 'back') && (
              <div
                id="back-side"
                className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch ${
                  platformView === 'all' ? `pt-10 border-t ${dividerBorder}` : ''
                }`}
              >
                {/* Left 6 Feature Grid (7 Cols) */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 order-2 lg:order-1">
                  {BACK_SIDE_CAPABILITIES.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.index}
                        className={`p-5 rounded-xl border flex flex-col justify-between space-y-3 ${cardSurface}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-amber-500">
                            {item.index}. Back Command
                          </span>
                          <Icon className={`w-4 h-4 ${mutedText}`} />
                        </div>
                        <div className="space-y-1.5">
                          <h4 className="text-sm font-bold">{item.title}</h4>
                          <p className={`text-xs leading-relaxed ${mutedText}`}>{item.summary}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right Admin Command Visual (5 Cols) */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-6 order-1 lg:order-2">
                  <div
                    className={`rounded-xl border overflow-hidden h-full flex flex-col justify-between ${cardSurface}`}
                  >
                    <div className="aspect-4/3 w-full overflow-hidden relative">
                      {!adminImgFailed ? (
                        <img
                          src="/src/assets/images/portal_admin_console_1794539617060.jpg"
                          alt="Fleet operations laptop and tablet displaying Silvermyst shift calendar, driver availability, and passenger analytics"
                          referrerPolicy="no-referrer"
                          onError={() => setAdminImgFailed(true)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                          <Sliders className="w-10 h-10 text-amber-500" />
                        </div>
                      )}
                    </div>
                    <div className="p-6 space-y-2">
                      <div className="text-xs font-mono font-bold text-amber-500">
                        Back Side · Admin Fleet Command
                      </div>
                      <h3 className="text-xl font-bold tracking-tight">
                        Schedule Drivers, Control Tablets &amp; Guard Staff Access
                      </h3>
                      <p className={`text-xs leading-relaxed ${mutedText}`}>
                        Protected behind Google Sign-In + Allowlist verification + 4-digit driver
                        PINs. Manage weekly shift assignments synced with Google Calendar, review
                        fleet analytics, customize driver quick apps, and approve new staff in
                        seconds.
                      </p>
                      <div className={`pt-3 flex items-center gap-3 text-xs font-medium ${mutedText}`}>
                        <span className="inline-flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Role-Gated Allowlist</span>
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>Real-Time Cloud Sync</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* MANAGED HARDWARE PROVISIONING & PAID LICENSE VERIFICATION (ZERO PUBLIC DOWNLOADS OR APKs) */}
        <section id="managed-provisioning" className={`border-t py-14 ${dividerBorder}`}>
          <div className="max-w-[1440px] mx-auto px-6 space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Left 5 Cols: Studio Hardware Photo */}
              <div
                className={`lg:col-span-5 rounded-xl border overflow-hidden flex flex-col justify-between ${cardSurface}`}
              >
                <div className="aspect-4/3 w-full overflow-hidden">
                  {!hardwareImgFailed ? (
                    <img
                      src="/src/assets/images/portal_install_kit_1794539617137.jpg"
                      alt="10-inch Android tablet in vehicle headrest bracket next to smartphone provisioned for Silvermyst CabinOS"
                      referrerPolicy="no-referrer"
                      onError={() => setHardwareImgFailed(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                      <Smartphone className="w-10 h-10 text-amber-500" />
                    </div>
                  )}
                </div>
                <div className="p-6 space-y-2">
                  <div className="text-xs font-mono font-bold text-amber-500">
                    Managed Rollout · Private Provisioning
                  </div>
                  <h3 className="text-lg font-bold">
                    Professionally Provisioned on Completed License Purchase
                  </h3>
                  <p className={`text-xs leading-relaxed ${mutedText}`}>
                    To protect your branding and fleet security, Silvermyst does not offer public
                    downloads or open package files on the web. After your purchase settles, our
                    engineering team directly provisions your tablets and administrator access.
                  </p>
                </div>
              </div>

              {/* Right 7 Cols: License Status Checker + Managed Rollout Steps */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                <div className={`p-6 sm:p-8 rounded-xl border space-y-6 ${cardSurface}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="text-xs font-mono font-bold text-amber-500 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Commercial Purchase Verification Desk</span>
                      </div>
                      <h2 className="text-2xl font-bold tracking-tight">
                        Verify Your Active Fleet License &amp; Provisioning Status
                      </h2>
                      <p className={`text-xs leading-relaxed ${mutedText}`}>
                        Already completed your purchase? Enter your{' '}
                        <span className="font-mono">SLV-</span> License Key below to confirm your
                        paid vehicle quota and provisioning standing. No files are publicly
                        downloadable on this site.
                      </p>
                    </div>
                    <ShieldCheck className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                  </div>

                  {verifiedLicense && (
                    <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 space-y-2 text-xs">
                      <div className="flex items-center justify-between font-bold text-emerald-400">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Active Paid License Confirmed</span>
                        </span>
                        <span className="font-mono">{verifiedLicense.id}</span>
                      </div>
                      <p className={mutedText}>
                        Licensed Organization: <strong>{verifiedLicense.companyName}</strong> ·
                        Tier:{' '}
                        <strong className="uppercase">
                          {verifiedLicense.packageTier.replace('_', ' ')}
                        </strong>{' '}
                        · Vehicle Allowance: <strong>{verifiedLicense.maxVehicles}</strong>.
                        Sign in above via Operator Access Desk or call{' '}
                        <strong className="font-mono tabular-nums">(574) 387-6229</strong> for
                        managed tablet onboarding.
                      </p>
                    </div>
                  )}

                  {licenseVerifyError && (
                    <div className="p-3 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-400 text-xs flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{licenseVerifyError}</span>
                    </div>
                  )}

                  <form onSubmit={handleVerifyLicenseKey} className="space-y-3">
                    <label className={`block text-xs font-semibold ${mutedText}`}>
                      Check Commercial License Key Status
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <input
                        type="text"
                        required
                        value={licenseKeyInput}
                        onChange={(e) => setLicenseKeyInput(e.target.value.toUpperCase())}
                        placeholder="SLV-FLT-XXXX-XXXX"
                        className={`flex-1 px-3.5 py-2.5 rounded-lg border font-mono text-xs tracking-wider focus:outline-none ${inputSurface}`}
                      />
                      <button
                        type="submit"
                        disabled={verifyingLicense}
                        className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-bold text-xs cursor-pointer whitespace-nowrap transition-colors"
                      >
                        {verifyingLicense ? 'Checking...' : 'Verify License Status'}
                      </button>
                    </div>
                  </form>

                  <div
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${subtleSurface}`}
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-bold">
                        Looking to deploy CabinOS across your fleet?
                      </div>
                      <p className={`text-xs ${mutedText}`}>
                        Submit your commercial license order below. Our team handles billing,
                        tenant setup, and hardware commissioning directly with you.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => scrollToSection('pricing-licensing')}
                      className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5"
                    >
                      <span>Purchase License</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 3 Managed Provisioning Steps (No download buttons or APKs) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-5 rounded-xl border space-y-1.5 ${cardSurface}`}>
                    <div className="text-xs font-mono font-bold text-amber-500">Step 01</div>
                    <h4 className="text-sm font-bold">Purchase Fleet License</h4>
                    <p className={`text-xs leading-relaxed ${mutedText}`}>
                      Select Single Vehicle, Fleet Pro, or Enterprise capacity and submit your
                      commercial order request below.
                    </p>
                  </div>
                  <div className={`p-5 rounded-xl border space-y-1.5 ${cardSurface}`}>
                    <div className="text-xs font-mono font-bold text-amber-500">Step 02</div>
                    <h4 className="text-sm font-bold">Billing &amp; Allowlist Setup</h4>
                    <p className={`text-xs leading-relaxed ${mutedText}`}>
                      Once payment is confirmed, Silvermyst issues your{' '}
                      <span className="font-mono">SLV-</span> key and pre-approves your staff email
                      accounts.
                    </p>
                  </div>
                  <div className={`p-5 rounded-xl border space-y-1.5 ${cardSurface}`}>
                    <div className="text-xs font-mono font-bold text-amber-500">Step 03</div>
                    <h4 className="text-sm font-bold">Managed Hardware Hand-Off</h4>
                    <p className={`text-xs leading-relaxed ${mutedText}`}>
                      Our onboarding engineer commissions your in-cabin tablets directly so kiosk
                      locks and fleet controls are turnkey ready.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COMMERCIAL LICENSING TIERS & PURCHASE ORDER FORM */}
        <section id="pricing-licensing" className={`border-t py-14 ${dividerBorder}`}>
          <div className="max-w-[1440px] mx-auto px-6 space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="max-w-2xl space-y-3">
                <h2
                  className="text-2xl sm:text-3xl font-bold tracking-tight"
                  style={{ textWrap: 'balance' }}
                >
                  Purchase Silvermyst CabinOS for Your Vehicle or Fleet
                </h2>
                <p className={`text-sm leading-relaxed ${mutedText}`}>
                  Select your license package below and submit your commercial purchase order. Once
                  payment is confirmed, Silvermyst issues your{' '}
                  <span className="font-mono">SLV-</span> License Key and coordinates your managed
                  tablet onboarding.
                </p>
              </div>

              {/* Billing Cycle Toggle */}
              <div
                className={`inline-flex items-center gap-1 p-1 rounded-lg border text-xs font-semibold self-start ${subtleSurface}`}
              >
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-3.5 py-2 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    billingCycle === 'monthly'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : `${mutedText} hover:text-amber-500`
                  }`}
                >
                  Monthly Plan
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('annual')}
                  className={`px-3.5 py-2 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    billingCycle === 'annual'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : `${mutedText} hover:text-amber-500`
                  }`}
                >
                  Annual (Save 20%)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left 7 Cols: 3 Commercial Tiers */}
              <div className="lg:col-span-7 space-y-4">
                {LICENSE_TIERS.map((tier) => {
                  const isSelected = selectedTier === tier.id;
                  const activePrice =
                    billingCycle === 'annual' ? tier.annualPrice : tier.monthlyPrice;
                  const activeCadence =
                    billingCycle === 'annual' ? tier.cadenceAnnual : tier.cadenceMonthly;
                  return (
                    <div
                      key={tier.id}
                      className={`p-6 rounded-xl border transition-colors ${cardSurface} ${
                        isSelected ? 'border-amber-500 ring-1 ring-amber-500/40' : ''
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/30 dark:border-slate-800">
                        <div>
                          <h3 className="text-lg font-bold">{tier.name}</h3>
                          <p className={`text-xs mt-0.5 ${mutedText}`}>{tier.audience}</p>
                        </div>
                        <div className="text-left sm:text-right shrink-0">
                          <div className="text-2xl font-bold font-mono tabular-nums text-amber-500">
                            {activePrice}
                          </div>
                          <div className={`text-xs ${mutedText}`}>{activeCadence}</div>
                        </div>
                      </div>

                      <div className="pt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <ul className={`space-y-1.5 text-xs ${mutedText}`}>
                          {tier.deliverables.map((line) => (
                            <li key={line} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTier(tier.id);
                            if (tier.id === 'single_vehicle') setFleetSize('1');
                            else if (tier.id === 'fleet_pro') setFleetSize('2-5');
                            else setFleetSize('21+');
                          }}
                          className={`px-4 py-2.5 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950'
                              : isDark
                              ? 'border border-slate-700 text-slate-200 hover:border-amber-500'
                              : 'border border-slate-300 text-slate-800 hover:border-amber-600'
                          }`}
                        >
                          {isSelected ? 'Selected Plan' : 'Select This Plan'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right 5 Cols: Validated Commercial Purchase Order Form */}
              <div className={`lg:col-span-5 p-6 sm:p-8 rounded-xl border ${cardSurface}`}>
                {submittedLead ? (
                  <div className="space-y-4 py-4">
                    <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Order Logged — Payment Confirmation Pending</span>
                    </div>
                    <h3 className="text-xl font-bold">
                      Thank you, {submittedLead.contactName}.
                    </h3>
                    <p className={`text-xs leading-relaxed ${mutedText}`}>
                      Your purchase order for <strong>{submittedLead.companyName}</strong> (
                      <span className="font-mono">
                        {submittedLead.packageTier.replace('_', ' ')} ·{' '}
                        {submittedLead.billingCycle || 'monthly'}
                      </span>
                      , {submittedLead.fleetSize} vehicles) is queued for billing settlement.
                    </p>
                    <div className={`p-3.5 rounded-lg border text-xs space-y-1.5 ${subtleSurface}`}>
                      <div className="font-mono font-bold">Order Ref: {submittedLead.id}</div>
                      <p className={mutedText}>
                        Once payment is settled with Silvermyst Billing (
                        <strong>(574) 387-6229</strong> · <strong>carlos881672@gmail.com</strong>),
                        you will receive your <span className="font-mono">SLV-</span> License Key
                        and scheduled tablet provisioning directly from our engineering team.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => scrollToSection('managed-provisioning')}
                        className="flex-1 py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer transition-colors"
                      >
                        Check License Verification
                      </button>
                      <button
                        type="button"
                        onClick={() => setSubmittedLead(null)}
                        className={`py-2.5 px-4 rounded-lg border text-xs font-semibold cursor-pointer ${
                          isDark
                            ? 'border-slate-700 text-slate-300'
                            : 'border-slate-300 text-slate-700'
                        }`}
                      >
                        New Order
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleLicenseSubmit} className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold tracking-tight">
                        Complete License Order
                      </h3>
                      <p className={`text-xs mt-1 ${mutedText}`}>
                        Submit your fleet details to finalize billing and schedule managed
                        provisioning.
                      </p>
                    </div>

                    {buyerError && (
                      <div className="p-3 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-400 text-xs flex items-start gap-2">
                        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{buyerError}</span>
                      </div>
                    )}

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className={`block font-semibold mb-1 ${mutedText}`}>
                          Company / Fleet Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={buyerCompany}
                          onChange={(e) => setBuyerCompany(e.target.value)}
                          placeholder="e.g. Lakeview Executive Car Service"
                          className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none ${inputSurface}`}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={`block font-semibold mb-1 ${mutedText}`}>
                            Your Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={buyerName}
                            onChange={(e) => setBuyerName(e.target.value)}
                            placeholder="Jordan Alvarez"
                            className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none ${inputSurface}`}
                          />
                        </div>
                        <div>
                          <label className={`block font-semibold mb-1 ${mutedText}`}>
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            required
                            value={buyerPhone}
                            onChange={(e) => setBuyerPhone(e.target.value)}
                            placeholder="(574) 555-0148"
                            className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none ${inputSurface}`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={`block font-semibold mb-1 ${mutedText}`}>
                          Work Email Address (License Key Delivery) *
                        </label>
                        <input
                          type="email"
                          required
                          value={buyerEmail}
                          onChange={(e) => setBuyerEmail(e.target.value)}
                          placeholder="owner@yourfleet.com"
                          className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none ${inputSurface}`}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={`block font-semibold mb-1 ${mutedText}`}>
                            Selected Package
                          </label>
                          <select
                            value={selectedTier}
                            onChange={(e) =>
                              setSelectedTier(e.target.value as LicenseInquiry['packageTier'])
                            }
                            className={`w-full px-3 py-2.5 rounded-lg border cursor-pointer focus:outline-none ${inputSurface}`}
                          >
                            <option value="single_vehicle">
                              Single Vehicle ({billingCycle === 'annual' ? '$278/yr' : '$29/mo'})
                            </option>
                            <option value="fleet_pro">
                              Fleet Pro ({billingCycle === 'annual' ? '$950/yr' : '$99/mo'})
                            </option>
                            <option value="enterprise_whitelabel">
                              Enterprise White-Label (Custom)
                            </option>
                          </select>
                        </div>

                        <div>
                          <label className={`block font-semibold mb-1 ${mutedText}`}>
                            Fleet Size
                          </label>
                          <select
                            value={fleetSize}
                            onChange={(e) =>
                              setFleetSize(e.target.value as LicenseInquiry['fleetSize'])
                            }
                            className={`w-full px-3 py-2.5 rounded-lg border cursor-pointer focus:outline-none ${inputSurface}`}
                          >
                            <option value="1">1 Vehicle</option>
                            <option value="2-5">2 – 5 Vehicles</option>
                            <option value="6-20">6 – 20 Vehicles</option>
                            <option value="21+">21+ Vehicles</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className={`block font-semibold mb-1 ${mutedText}`}>
                          Deployment Notes / Customizations (Optional)
                        </label>
                        <textarea
                          rows={2}
                          value={buyerNotes}
                          onChange={(e) => setBuyerNotes(e.target.value)}
                          placeholder="Tablet hardware models, bilingual needs, custom QR booking links..."
                          className={`w-full px-3 py-2 rounded-lg border focus:outline-none resize-none ${inputSurface}`}
                        />
                      </div>

                      <label className={`flex items-start gap-2.5 pt-1 cursor-pointer ${mutedText}`}>
                        <input
                          type="checkbox"
                          checked={acceptedOrderTerms}
                          onChange={(e) => setAcceptedOrderTerms(e.target.checked)}
                          className="mt-0.5 rounded border-slate-600 accent-amber-500 cursor-pointer"
                        />
                        <span>
                          I understand software provisioning and device licensing occur strictly
                          after completed order billing and authorization.
                        </span>
                      </label>

                      <button
                        type="submit"
                        disabled={buyerSubmitting}
                        className="w-full py-3 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-bold text-sm cursor-pointer transition-colors flex items-center justify-center gap-2"
                      >
                        <span>
                          {buyerSubmitting ? 'Submitting Purchase Order...' : 'Submit Purchase Order'}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Commercial Footer */}
      <footer id="portal-contact" className={`border-t py-8 ${dividerBorder}`}>
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <div className="font-bold">Silvermyst CabinOS · Silvermyst Multiservices</div>
            <div className={mutedText}>
              South Bend, Indiana · Passenger Cabin Kiosk &amp; Fleet Operations Platform
            </div>
          </div>
          <div className={`flex flex-wrap items-center gap-4 font-mono tabular-nums ${mutedText}`}>
            <span className="inline-flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-500" />
              <span>(574) 387-6229</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-500" />
              <span>carlos881672@gmail.com</span>
            </span>
            <a
              href="https://silvermyst.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-500 underline underline-offset-4"
            >
              silvermyst.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
