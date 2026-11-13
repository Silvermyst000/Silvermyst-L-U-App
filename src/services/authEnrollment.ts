import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  query,
  writeBatch,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import {
  ApprovedEnrollment,
  AuthorizedUserAccount,
  DriverProfile,
  DriverRole,
  EnrollmentAccessRequest,
  LicenseInquiry,
  PlatformLicense,
} from '../types/kiosk';

export const MASTER_OWNER_EMAIL = 'carlos881672@gmail.com';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export type PortalAccessResolution =
  | { status: 'public_locked' }
  | { status: 'loading' }
  | {
      status: 'authorized';
      account: AuthorizedUserAccount;
      isOwner: boolean;
      isAdminRole: boolean;
    }
  | {
      status: 'eligible_to_enroll';
      email: string;
      approvedEntry: ApprovedEnrollment;
    }
  | {
      status: 'not_on_approve_list';
      email: string;
      existingRequest?: EnrollmentAccessRequest | null;
    }
  | {
      status: 'suspended';
      account: AuthorizedUserAccount;
    }
  | {
      status: 'revoked';
      email: string;
      approvedEntry: ApprovedEnrollment;
    };

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isOwnerEmail(email?: string | null): boolean {
  return Boolean(email && normalizeEmail(email) === MASTER_OWNER_EMAIL);
}

export async function signInWithGooglePortal(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signOutPortal(): Promise<void> {
  await signOut(auth);
}

export async function resolveUserPortalAccess(
  user: User | null
): Promise<PortalAccessResolution> {
  if (!user || !user.email || !user.emailVerified) {
    return { status: 'public_locked' };
  }

  const emailLower = normalizeEmail(user.email);
  const now = Date.now();
  const isOwner = isOwnerEmail(emailLower);

  // 1. Check active authorized_users document
  const authUserPath = `authorized_users/${user.uid}`;
  let existingAccount: AuthorizedUserAccount | null = null;
  try {
    const snap = await getDoc(doc(db, 'authorized_users', user.uid));
    if (snap.exists()) {
      existingAccount = snap.data() as AuthorizedUserAccount;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, authUserPath);
  }

  // Bootstrap Master Owner automatically on first sign-in
  if (isOwner) {
    if (!existingAccount) {
      const ownerAccount: AuthorizedUserAccount = {
        uid: user.uid,
        email: emailLower,
        fullName: user.displayName || 'Carlos R.',
        title: 'Founder & Fleet Director',
        assignedPin: '0000',
        role: 'owner',
        status: 'active',
        approvedBy: MASTER_OWNER_EMAIL,
        createdAt: now,
        updatedAt: now,
      };
      try {
        const batch = writeBatch(db);
        batch.set(doc(db, 'authorized_users', user.uid), ownerAccount);
        batch.set(doc(db, 'admins', user.uid), {
          uid: user.uid,
          email: emailLower,
          role: 'owner',
          grantedAt: now,
        });
        await batch.commit();
        existingAccount = ownerAccount;
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, authUserPath);
      }
    } else {
      // Ensure admins/{uid} marker exists for Master Owner
      try {
        const adminSnap = await getDoc(doc(db, 'admins', user.uid));
        if (!adminSnap.exists()) {
          await setDoc(doc(db, 'admins', user.uid), {
            uid: user.uid,
            email: emailLower,
            role: 'owner',
            grantedAt: now,
          });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `admins/${user.uid}`);
      }
    }

    return {
      status: 'authorized',
      account: existingAccount,
      isOwner: true,
      isAdminRole: true,
    };
  }

  if (existingAccount) {
    if (existingAccount.status === 'suspended') {
      return { status: 'suspended', account: existingAccount };
    }
    const isAdminRole =
      existingAccount.role === 'owner' ||
      existingAccount.role === 'admin' ||
      existingAccount.role === 'manager';
    return {
      status: 'authorized',
      account: existingAccount,
      isOwner: false,
      isAdminRole,
    };
  }

  // 2. Not enrolled yet — verify against Owner's Approve List
  const allowPath = `approved_enrollments/${emailLower}`;
  let approvedEntry: ApprovedEnrollment | null = null;
  try {
    const allowSnap = await getDoc(doc(db, 'approved_enrollments', emailLower));
    if (allowSnap.exists()) {
      approvedEntry = allowSnap.data() as ApprovedEnrollment;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, allowPath);
  }

  if (approvedEntry) {
    if (approvedEntry.status === 'revoked') {
      return { status: 'revoked', email: emailLower, approvedEntry };
    }
    if (approvedEntry.status === 'pending_enrollment') {
      return { status: 'eligible_to_enroll', email: emailLower, approvedEntry };
    }
  }

  // 3. Not on Approve List — check if they already submitted an enrollment request
  const reqPath = `enrollment_requests/${user.uid}`;
  let existingRequest: EnrollmentAccessRequest | null = null;
  try {
    const reqSnap = await getDoc(doc(db, 'enrollment_requests', user.uid));
    if (reqSnap.exists()) {
      existingRequest = reqSnap.data() as EnrollmentAccessRequest;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, reqPath);
  }

  return {
    status: 'not_on_approve_list',
    email: emailLower,
    existingRequest,
  };
}

export async function completeApprovedEmployeeEnrollment(params: {
  user: User;
  approvedEntry: ApprovedEnrollment;
  fullName: string;
  title: string;
  phone: string;
  vehicleModel: string;
  assignedPin: string;
}): Promise<AuthorizedUserAccount> {
  const { user, approvedEntry, fullName, title, phone, vehicleModel, assignedPin } = params;
  const emailLower = normalizeEmail(user.email || approvedEntry.email);
  const now = Date.now();
  const safePin = /^\d{4}$/.test(assignedPin) ? assignedPin : '0000';

  const account: AuthorizedUserAccount = {
    uid: user.uid,
    email: emailLower,
    fullName: fullName.trim().slice(0, 100),
    title: title.trim().slice(0, 100) || `${approvedEntry.role.toUpperCase()} Member`,
    phone: phone.trim().slice(0, 40),
    vehicleModel:
      vehicleModel.trim().slice(0, 100) ||
      approvedEntry.vehicleAssignment ||
      'Silvermyst Executive Fleet',
    assignedPin: safePin,
    role: approvedEntry.role,
    status: 'active',
    approvedBy: approvedEntry.addedByEmail,
    createdAt: now,
    updatedAt: now,
  };

  const batch = writeBatch(db);
  batch.set(doc(db, 'authorized_users', user.uid), account);
  if (approvedEntry.role === 'admin' || approvedEntry.role === 'manager') {
    batch.set(doc(db, 'admins', user.uid), {
      uid: user.uid,
      email: emailLower,
      role: approvedEntry.role,
      grantedAt: now,
    });
  }
  batch.update(doc(db, 'approved_enrollments', emailLower), {
    status: 'enrolled',
    enrolledUid: user.uid,
    updatedAt: now,
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `authorized_users/${user.uid}`);
  }

  // Also register/sync their Driver Profile into the fleet roster if not present
  const safeDriverId = `emp-${user.uid.replace(/[^a-zA-Z0-9_-]/g, '')}`.slice(0, 80);
  const newDriverProfile: DriverProfile = {
    id: safeDriverId,
    name: account.fullName,
    avatarUrl:
      user.photoURL ||
      'https://ui-avatars.com/api/?name=' +
        encodeURIComponent(account.fullName) +
        '&background=d97706&color=ffffff&size=256',
    title: account.title || 'Enrolled Staff Member',
    companyName: 'Silvermyst Multiservices',
    tagline: 'Authorized Silvermyst Fleet & Multiservice Team',
    rating: 5.0,
    totalTrips: 0,
    yearsDriving: 1,
    languages: ['English'],
    vehicleModel: account.vehicleModel || 'Executive Fleet',
    vehicleYear: String(new Date().getFullYear()),
    cleanlinessScore: '5.0 / 5.0',
    phone: account.phone || '',
    email: account.email,
    website: 'https://silvermyst.com/',
    instagram: '',
    linktree: '',
    whatsapp: account.phone || '',
    bio: `Authorized Silvermyst employee (${account.role}). Enrolled via portal allowlist.`,
    funFact: 'Enrolled member of the Silvermyst operations team.',
    role: account.role,
    availability: 'available',
    isVisibleToPassengers: account.role === 'driver' || account.role === 'owner' || account.role === 'manager',
    adminPin: safePin,
  };

  try {
    await setDoc(doc(db, 'drivers', safeDriverId), {
      ...newDriverProfile,
      updatedAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `drivers/${safeDriverId}`);
  }

  return account;
}

export async function submitEmployeeAccessRequest(params: {
  user: User;
  fullName: string;
  phone: string;
  requestedRole: Exclude<DriverRole, 'owner'>;
  reason: string;
}): Promise<EnrollmentAccessRequest> {
  const { user, fullName, phone, requestedRole, reason } = params;
  const emailLower = normalizeEmail(user.email || '');
  const now = Date.now();
  const payload: EnrollmentAccessRequest = {
    id: user.uid,
    uid: user.uid,
    email: emailLower,
    fullName: fullName.trim().slice(0, 100),
    phone: phone.trim().slice(0, 40),
    requestedRole,
    reason: reason.trim().slice(0, 500),
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, 'enrollment_requests', user.uid), payload);
    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `enrollment_requests/${user.uid}`);
  }
}

// --- OWNER & ADMIN ENROLLMENT MANAGEMENT SUBSCRIPTIONS & MUTATIONS ---

export const enrollmentAdminApi = {
  subscribeApprovedList(onUpdate: (items: ApprovedEnrollment[]) => void) {
    const q = query(collection(db, 'approved_enrollments'), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snap) => {
        onUpdate(snap.docs.map((d) => d.data() as ApprovedEnrollment));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'approved_enrollments');
      }
    );
  },

  subscribeEnrollmentRequests(onUpdate: (items: EnrollmentAccessRequest[]) => void) {
    const q = query(collection(db, 'enrollment_requests'), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snap) => {
        onUpdate(snap.docs.map((d) => d.data() as EnrollmentAccessRequest));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'enrollment_requests');
      }
    );
  },

  subscribeAuthorizedUsers(onUpdate: (items: AuthorizedUserAccount[]) => void) {
    const q = query(collection(db, 'authorized_users'), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snap) => {
        onUpdate(snap.docs.map((d) => d.data() as AuthorizedUserAccount));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'authorized_users');
      }
    );
  },

  async addToApproveList(params: {
    email: string;
    role: DriverRole;
    displayName: string;
    vehicleAssignment?: string;
    notes?: string;
    adminUser: User;
  }) {
    const emailLower = normalizeEmail(params.email);
    const now = Date.now();
    const docData: ApprovedEnrollment = {
      id: emailLower,
      email: emailLower,
      role: params.role === 'owner' ? 'admin' : params.role,
      displayName: params.displayName.trim().slice(0, 100),
      ...(params.vehicleAssignment?.trim()
        ? { vehicleAssignment: params.vehicleAssignment.trim().slice(0, 120) }
        : {}),
      ...(params.notes?.trim() ? { notes: params.notes.trim().slice(0, 300) } : {}),
      status: 'pending_enrollment',
      addedByUid: params.adminUser.uid,
      addedByEmail: normalizeEmail(params.adminUser.email || MASTER_OWNER_EMAIL),
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'approved_enrollments', emailLower), docData);
      return docData;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `approved_enrollments/${emailLower}`);
    }
  },

  async updateApproveListStatus(
    emailKey: string,
    status: ApprovedEnrollment['status']
  ) {
    try {
      await setDoc(
        doc(db, 'approved_enrollments', emailKey),
        { status, updatedAt: Date.now() },
        { merge: true }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `approved_enrollments/${emailKey}`);
    }
  },

  async removeFromApproveList(emailKey: string) {
    try {
      await deleteDoc(doc(db, 'approved_enrollments', emailKey));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `approved_enrollments/${emailKey}`);
    }
  },

  async approveRequestToAllowlist(params: {
    request: EnrollmentAccessRequest;
    assignedRole: DriverRole;
    vehicleAssignment?: string;
    adminUser: User;
  }) {
    const { request, assignedRole, vehicleAssignment, adminUser } = params;
    const emailLower = normalizeEmail(request.email);
    const now = Date.now();
    const approveDoc: ApprovedEnrollment = {
      id: emailLower,
      email: emailLower,
      role: assignedRole === 'owner' ? 'admin' : assignedRole,
      displayName: request.fullName.slice(0, 100),
      ...(vehicleAssignment?.trim()
        ? { vehicleAssignment: vehicleAssignment.trim().slice(0, 120) }
        : {}),
      notes: `Approved from portal request (${request.phone})`,
      status: 'pending_enrollment',
      addedByUid: adminUser.uid,
      addedByEmail: normalizeEmail(adminUser.email || MASTER_OWNER_EMAIL),
      createdAt: now,
      updatedAt: now,
    };

    const batch = writeBatch(db);
    batch.set(doc(db, 'approved_enrollments', emailLower), approveDoc);
    batch.update(doc(db, 'enrollment_requests', request.id), {
      status: 'approved',
      reviewedBy: normalizeEmail(adminUser.email || MASTER_OWNER_EMAIL),
      reviewNote: `Added to approve list as ${approveDoc.role}`,
      updatedAt: now,
    });

    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `enrollment_requests/${request.id}`);
    }
  },

  async declineRequest(requestId: string, adminUser: User, note?: string) {
    try {
      await setDoc(
        doc(db, 'enrollment_requests', requestId),
        {
          status: 'declined',
          reviewedBy: normalizeEmail(adminUser.email || MASTER_OWNER_EMAIL),
          reviewNote: (note || 'Not approved at this time').slice(0, 300),
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `enrollment_requests/${requestId}`);
    }
  },

  async updateEnrolledAccount(params: {
    account: AuthorizedUserAccount;
    status?: 'active' | 'suspended';
    role?: DriverRole;
    syncAdminMarker?: boolean;
  }) {
    const { account, status, role, syncAdminMarker } = params;
    const nextStatus = status ?? account.status;
    const nextRole = role ?? account.role;
    const now = Date.now();

    const batch = writeBatch(db);
    batch.update(doc(db, 'authorized_users', account.uid), {
      status: nextStatus,
      role: nextRole,
      updatedAt: now,
    });

    if (syncAdminMarker) {
      if (nextStatus === 'active' && (nextRole === 'admin' || nextRole === 'manager' || nextRole === 'owner')) {
        batch.set(doc(db, 'admins', account.uid), {
          uid: account.uid,
          email: account.email,
          role: nextRole === 'owner' ? 'owner' : nextRole === 'manager' ? 'manager' : 'admin',
          grantedAt: now,
        });
      } else {
        batch.delete(doc(db, 'admins', account.uid));
      }
    }

    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `authorized_users/${account.uid}`);
    }
  },

  subscribeLicenseInquiries(onUpdate: (items: LicenseInquiry[]) => void) {
    const q = query(collection(db, 'license_inquiries'), orderBy('submittedAt', 'desc'));
    return onSnapshot(
      q,
      (snap) => {
        onUpdate(snap.docs.map((d) => d.data() as LicenseInquiry));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'license_inquiries');
      }
    );
  },

  async updateLicenseInquiryStatus(inquiryId: string, status: LicenseInquiry['status']) {
    try {
      await setDoc(
        doc(db, 'license_inquiries', inquiryId),
        { status },
        { merge: true }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `license_inquiries/${inquiryId}`);
    }
  },

  subscribePlatformLicenses(onUpdate: (items: PlatformLicense[]) => void) {
    const q = query(collection(db, 'platform_licenses'), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snap) => {
        onUpdate(snap.docs.map((d) => d.data() as PlatformLicense));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'platform_licenses');
      }
    );
  },

  async issueLicenseForInquiry(inquiry: LicenseInquiry): Promise<PlatformLicense> {
    const tierCode =
      inquiry.packageTier === 'single_vehicle'
        ? 'SGL'
        : inquiry.packageTier === 'fleet_pro'
        ? 'FLT'
        : 'ENT';
    const randA = Math.random().toString(36).slice(2, 6).toUpperCase().replace(/[^A-Z0-9]/g, '7');
    const randB = Math.random().toString(36).slice(2, 6).toUpperCase().replace(/[^A-Z0-9]/g, '9');
    const licenseKey = `SLV-${tierCode}-${randA}-${randB}`;
    const maxVehicles =
      inquiry.packageTier === 'single_vehicle'
        ? 1
        : inquiry.packageTier === 'fleet_pro'
        ? 10
        : 100;
    const now = Date.now();

    const licenseDoc: PlatformLicense = {
      id: licenseKey,
      companyName: inquiry.companyName.trim().slice(0, 120),
      packageTier: inquiry.packageTier,
      maxVehicles,
      paymentStatus: 'paid',
      createdAt: now,
      updatedAt: now,
    };

    const batch = writeBatch(db);
    batch.set(doc(db, 'platform_licenses', licenseKey), licenseDoc);
    batch.update(doc(db, 'license_inquiries', inquiry.id), {
      status: 'licensed',
      licenseKey,
    });

    try {
      await batch.commit();
      return licenseDoc;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `platform_licenses/${licenseKey}`);
    }
  },

  async revokePlatformLicense(licenseKey: string, nextStatus: PlatformLicense['paymentStatus']) {
    try {
      await setDoc(
        doc(db, 'platform_licenses', licenseKey),
        { paymentStatus: nextStatus, updatedAt: Date.now() },
        { merge: true }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `platform_licenses/${licenseKey}`);
    }
  },
};

export async function verifyLicenseKey(rawKey: string): Promise<PlatformLicense | null> {
  const cleaned = rawKey.trim().toUpperCase();
  if (!/^SLV-[A-Z0-9-]+$/.test(cleaned) || cleaned.length < 8 || cleaned.length > 40) {
    return null;
  }
  const path = `platform_licenses/${cleaned}`;
  try {
    const snap = await getDoc(doc(db, 'platform_licenses', cleaned));
    if (!snap.exists()) return null;
    const data = snap.data() as PlatformLicense;
    if (data.paymentStatus !== 'paid') return null;
    return data;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function submitLicenseInquiry(params: {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  fleetSize: LicenseInquiry['fleetSize'];
  packageTier: LicenseInquiry['packageTier'];
  billingCycle?: 'monthly' | 'annual';
  notes: string;
}): Promise<LicenseInquiry> {
  const safeId = `lic-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const payload: LicenseInquiry = {
    id: safeId,
    companyName: params.companyName.trim().slice(0, 120),
    contactName: params.contactName.trim().slice(0, 100),
    email: params.email.trim().toLowerCase().slice(0, 160),
    phone: params.phone.trim().slice(0, 40),
    fleetSize: params.fleetSize,
    packageTier: params.packageTier,
    billingCycle: params.billingCycle || 'monthly',
    notes: params.notes.trim().slice(0, 600),
    status: 'new',
    submittedAt: Date.now(),
  };

  try {
    await setDoc(doc(db, 'license_inquiries', safeId), payload);
    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `license_inquiries/${safeId}`);
  }
}
