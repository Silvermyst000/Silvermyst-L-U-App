import {
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  SongRequest,
  CabinMessage,
  DriverProfile,
  InstalledAppItem,
  GalleryAlbum,
  GalleryItem,
  ScreensaverSettings,
  TabletDevice,
  ServiceInquiry,
  InternalAdminMessage,
  ActivityAuditLog,
} from '../types/kiosk';

// Collection references
const REQUESTS_COLL = 'requests';
const DRIVERS_COLL = 'drivers';
const APPS_COLL = 'installed_apps';
const ALBUMS_COLL = 'gallery_albums';
const PHOTOS_COLL = 'gallery_photos';
const SETTINGS_COLL = 'system_settings';
const TABLETS_COLL = 'tablets';
const INQUIRIES_COLL = 'inquiries';
const MESSAGES_COLL = 'admin_messages';
const LOGS_COLL = 'activity_logs';

export const cloudSync = {
  // --- REAL-TIME PASSENGER REQUESTS ---
  subscribeToRequests(onUpdate: (requests: (SongRequest | CabinMessage)[]) => void) {
    try {
      const q = query(collection(db, REQUESTS_COLL), orderBy('sentAt', 'desc'), limit(50));
      return onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as any[];
          onUpdate(items);
        },
        (error) => {
          console.warn('Live requests subscription offline fallback:', error.message);
        }
      );
    } catch (e) {
      console.warn('Cloud sync offline:', e);
      return () => {};
    }
  },

  async submitPassengerRequest(request: Omit<CabinMessage, 'id' | 'sentAt' | 'status'> & { id?: string }) {
    const id = request.id || `req-${Date.now()}`;
    const payload: CabinMessage = {
      ...request,
      id,
      sentAt: Date.now(),
      status: 'sent',
    };
    try {
      await setDoc(doc(db, REQUESTS_COLL, id), payload);
      this.logActivity('passenger', 'Passenger Kiosk', 'Submitted request', payload.text);
      return { success: true, id };
    } catch (e: any) {
      console.warn('Cloud save fallback to local:', e);
      return { success: false, error: e.message, fallbackPayload: payload };
    }
  },

  async updateRequestStatus(id: string, status: 'acknowledged' | 'completed') {
    try {
      await updateDoc(doc(db, REQUESTS_COLL, id), {
        status,
        updatedAt: Date.now(),
      });
      return true;
    } catch (e) {
      console.warn('Update request status offline fallback:', e);
      return false;
    }
  },

  // --- SERVICE INQUIRIES ---
  async submitServiceInquiry(inquiry: Omit<ServiceInquiry, 'id' | 'submittedAt' | 'status'>) {
    const id = `inq-${Date.now()}`;
    const payload: ServiceInquiry = {
      ...inquiry,
      id,
      submittedAt: Date.now(),
      status: 'new',
    };
    try {
      await setDoc(doc(db, INQUIRIES_COLL, id), payload);
      this.logActivity('passenger', 'Passenger Kiosk', 'Submitted service inquiry', inquiry.serviceTitle);
      return { success: true, id };
    } catch (e: any) {
      console.warn('Inquiry cloud save fallback:', e);
      return { success: false, error: e.message, fallbackPayload: payload };
    }
  },

  subscribeToInquiries(onUpdate: (inquiries: ServiceInquiry[]) => void) {
    try {
      const q = query(collection(db, INQUIRIES_COLL), orderBy('submittedAt', 'desc'), limit(50));
      return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as ServiceInquiry[];
        onUpdate(items);
      });
    } catch (e) {
      return () => {};
    }
  },

  async updateInquiryStatus(id: string, status: 'new' | 'contacted' | 'resolved') {
    try {
      await updateDoc(doc(db, INQUIRIES_COLL, id), { status, updatedAt: Date.now() });
      return true;
    } catch (e) {
      return false;
    }
  },

  // --- DRIVER PROFILES ---
  subscribeToDrivers(onUpdate: (drivers: DriverProfile[]) => void) {
    try {
      const q = query(collection(db, DRIVERS_COLL));
      return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const drivers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as DriverProfile[];
            onUpdate(drivers);
          }
        },
        (error) => {
          console.warn('Drivers subscription error:', error.message);
        }
      );
    } catch (e) {
      return () => {};
    }
  },

  async saveDriverProfile(driver: DriverProfile) {
    try {
      await setDoc(doc(db, DRIVERS_COLL, driver.id), driver, { merge: true });
      return true;
    } catch (e) {
      console.warn('Save driver profile offline fallback:', e);
      return false;
    }
  },

  // --- TABLET APP LAUNCHER BUTTONS ---
  subscribeToApps(onUpdate: (apps: InstalledAppItem[]) => void) {
    try {
      const q = query(collection(db, APPS_COLL));
      return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const apps = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as InstalledAppItem[];
            onUpdate(apps);
          }
        },
        (error) => {
          console.warn('Apps subscription error:', error.message);
        }
      );
    } catch (e) {
      return () => {};
    }
  },

  async saveAppsList(apps: InstalledAppItem[]) {
    try {
      // Save collection doc or batch
      await setDoc(doc(db, SETTINGS_COLL, 'apps_launcher'), { apps, updatedAt: Date.now() }, { merge: true });
      for (const app of apps) {
        await setDoc(doc(db, APPS_COLL, app.id), app, { merge: true });
      }
      return true;
    } catch (e) {
      console.warn('Save apps list offline fallback:', e);
      return false;
    }
  },

  // --- TABLET DEVICES & HEARTBEAT ---
  async reportTabletHeartbeat(tablet: TabletDevice) {
    try {
      await setDoc(doc(db, TABLETS_COLL, tablet.id), {
        ...tablet,
        lastSeen: Date.now(),
        status: 'online',
      }, { merge: true });
    } catch (e) {
      // offline heartbeat ok
    }
  },

  subscribeToTablets(onUpdate: (tablets: TabletDevice[]) => void) {
    try {
      const q = query(collection(db, TABLETS_COLL));
      return onSnapshot(q, (snapshot) => {
        const tablets = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as TabletDevice[];
        onUpdate(tablets);
      });
    } catch (e) {
      return () => {};
    }
  },

  // --- ADMINISTRATOR INTERNAL MESSAGING & ANNOUNCEMENTS ---
  subscribeToAdminMessages(onUpdate: (msgs: InternalAdminMessage[]) => void) {
    try {
      const q = query(collection(db, MESSAGES_COLL), orderBy('sentAt', 'asc'), limit(100));
      return onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as InternalAdminMessage[];
        onUpdate(msgs);
      });
    } catch (e) {
      return () => {};
    }
  },

  async sendAdminMessage(msg: Omit<InternalAdminMessage, 'id' | 'sentAt' | 'readBy'>) {
    const id = `msg-${Date.now()}`;
    const payload: InternalAdminMessage = {
      ...msg,
      id,
      sentAt: Date.now(),
      readBy: [msg.senderId],
    };
    try {
      await setDoc(doc(db, MESSAGES_COLL, id), payload);
      return { success: true, id };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  // --- AUDIT LOGS ---
  async logActivity(userId: string, userName: string, action: string, details: string) {
    try {
      const id = `log-${Date.now()}`;
      await setDoc(doc(db, LOGS_COLL, id), {
        id,
        userId,
        userName,
        action,
        details,
        timestamp: Date.now(),
      });
    } catch (e) {
      // ignore offline log
    }
  },

  subscribeToLogs(onUpdate: (logs: ActivityAuditLog[]) => void) {
    try {
      const q = query(collection(db, LOGS_COLL), orderBy('timestamp', 'desc'), limit(50));
      return onSnapshot(q, (snapshot) => {
        const logs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as ActivityAuditLog[];
        onUpdate(logs);
      });
    } catch (e) {
      return () => {};
    }
  },
};
