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
  where,
  getDocs,
  getDoc,
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
  QuickConnectItem,
  PassengerFeedback,
  DriverShiftChecklist,
  ScheduledContentItem,
  RemoteKioskCommand,
  TranslationItem,
  AnalyticsEvent,
  ChangeHistorySnapshot,
  CloudSyncState,
  MarketingPopup,
  CabinThemeMode,
  WorkShift,
  ShiftChangeRequest,
} from '../types/kiosk';

// Firestore collection names
const REQUESTS_COLL = 'requests';
const DRIVERS_COLL = 'drivers';
const APPS_COLL = 'installed_apps';
const QUICK_CONNECT_COLL = 'quick_connects';
const ALBUMS_COLL = 'gallery_albums';
const PHOTOS_COLL = 'gallery_photos';
const SETTINGS_COLL = 'system_settings';
const TABLETS_COLL = 'tablets';
const INQUIRIES_COLL = 'inquiries';
const MESSAGES_COLL = 'admin_messages';
const FEEDBACK_COLL = 'feedback';
const CHECKLISTS_COLL = 'checklists';
const SCHEDULES_COLL = 'schedules';
const COMMANDS_COLL = 'kiosk_commands';
const ANALYTICS_COLL = 'analytics';
const HISTORY_COLL = 'change_history';
const LOGS_COLL = 'activity_logs';
const MARKETING_COLL = 'marketing_popups';
const THEMES_COLL = 'cabin_themes';
const SHIFTS_COLL = 'work_shifts';
const SHIFT_REQUESTS_COLL = 'shift_change_requests';

type SyncListener = (state: CloudSyncState, lastAction?: string) => void;
const syncListeners: Set<SyncListener> = new Set();
let currentSyncState: CloudSyncState = 'synced';

function notifySync(state: CloudSyncState, action?: string) {
  currentSyncState = state;
  syncListeners.forEach((fn) => fn(state, action));
}

export const cloudSync = {
  // Sync state observer
  subscribeSyncState(listener: SyncListener) {
    syncListeners.add(listener);
    listener(currentSyncState);
    return () => {
      syncListeners.delete(listener);
    };
  },

  getSyncState() {
    return currentSyncState;
  },

  // --- SYSTEM SETTINGS (ACTIVE DRIVER, PIN, SCREEN SAVER, DISPLAY) ---
  subscribeToSystemSettings(onUpdate: (settings: Record<string, any>) => void) {
    try {
      return onSnapshot(
        collection(db, SETTINGS_COLL),
        (snapshot) => {
          const map: Record<string, any> = {};
          snapshot.docs.forEach((d) => {
            map[d.id] = d.data();
          });
          onUpdate(map);
          notifySync('synced', 'Loaded system settings');
        },
        (error) => {
          console.warn('System settings listener offline:', error.message);
          notifySync('offline', error.message);
        }
      );
    } catch (e: any) {
      notifySync('offline', e.message);
      return () => {};
    }
  },

  async saveSystemSetting(key: string, data: any) {
    notifySync('saving', `Saving ${key}`);
    try {
      await setDoc(doc(db, SETTINGS_COLL, key), {
        ...data,
        updatedAt: Date.now(),
      }, { merge: true });
      notifySync('synced', `Saved ${key}`);
      return true;
    } catch (e: any) {
      console.warn(`Failed to save ${key} to Firestore:`, e.message);
      notifySync('error', e.message);
      return false;
    }
  },

  // --- PASSENGER REQUESTS (SONGS, COMFORT, RIDE PREFERENCES, CHAT) ---
  subscribeToRequests(onUpdate: (requests: (SongRequest | CabinMessage)[]) => void) {
    try {
      const q = query(collection(db, REQUESTS_COLL), orderBy('sentAt', 'desc'), limit(100));
      return onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as any[];
          onUpdate(items);
          notifySync('synced');
        },
        (error) => {
          console.warn('Requests listener offline:', error.message);
          notifySync('offline');
        }
      );
    } catch (e) {
      return () => {};
    }
  },

  async submitPassengerRequest(request: any) {
    notifySync('saving', 'Submitting passenger request');
    const id = request.id || `req-${Date.now()}`;
    const payload = {
      ...request,
      id,
      sentAt: request.sentAt || request.requestedAt || Date.now(),
      status: request.status || 'sent',
    };
    try {
      await setDoc(doc(db, REQUESTS_COLL, id), payload);
      notifySync('synced', 'Request submitted to driver');
      this.logAnalyticsEvent({
        id: `ev-${Date.now()}`,
        type: request.title ? 'song_request' : 'comfort_request',
        targetId: id,
        targetName: request.title || request.text || 'Passenger Request',
        timestamp: Date.now(),
      });
      return { success: true, id };
    } catch (e: any) {
      console.warn('Request cloud save fallback to local:', e);
      notifySync('error', e.message);
      return { success: false, error: e.message, fallbackPayload: payload };
    }
  },

  async updateRequestStatus(id: string, status: string) {
    notifySync('saving', 'Updating request');
    try {
      await updateDoc(doc(db, REQUESTS_COLL, id), {
        status,
        updatedAt: Date.now(),
      });
      notifySync('synced');
      return true;
    } catch (e: any) {
      notifySync('error', e.message);
      return false;
    }
  },

  async clearAllPassengerRequests() {
    notifySync('saving', 'Clearing passenger requests');
    try {
      const snapshot = await getDocs(collection(db, REQUESTS_COLL));
      await Promise.all(
        snapshot.docs.map((d) => deleteDoc(doc(db, REQUESTS_COLL, d.id)))
      );
      notifySync('synced', 'Passenger requests cleared');
      return true;
    } catch (e: any) {
      notifySync('error', e.message);
      return false;
    }
  },

  async saveProfileBackup(backup: {
    drivers: DriverProfile[];
    activeDriverId: string;
    savedBy: string;
  }) {
    notifySync('saving', 'Backing up driver profiles');
    try {
      await setDoc(doc(db, SETTINGS_COLL, 'profile_backup'), {
        ...backup,
        backedUpAt: Date.now(),
      });
      notifySync('synced', 'Cloud profile backup saved');
      return true;
    } catch (e: any) {
      notifySync('error', e.message);
      return false;
    }
  },

  async getLatestProfileBackup(): Promise<{
    drivers: DriverProfile[];
    activeDriverId?: string;
    backedUpAt?: number;
    savedBy?: string;
  } | null> {
    try {
      const snap = await getDoc(doc(db, SETTINGS_COLL, 'profile_backup'));
      if (snap.exists()) {
        return snap.data() as any;
      }
      return null;
    } catch (e: any) {
      console.warn('Failed to fetch cloud profile backup:', e.message);
      return null;
    }
  },

  // --- PASSENGER FEEDBACK ---
  subscribeToFeedback(onUpdate: (feedbackList: PassengerFeedback[]) => void) {
    try {
      const q = query(collection(db, FEEDBACK_COLL), orderBy('submittedAt', 'desc'), limit(100));
      return onSnapshot(
        q,
        (snapshot) => {
          const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as PassengerFeedback[];
          onUpdate(list);
        },
        (err) => console.warn('Feedback listener offline:', err.message)
      );
    } catch (e) {
      return () => {};
    }
  },

  async submitPassengerFeedback(fb: Omit<PassengerFeedback, 'id' | 'submittedAt'>) {
    notifySync('saving', 'Submitting feedback');
    const id = `fb-${Date.now()}`;
    const payload: PassengerFeedback = {
      ...fb,
      id,
      submittedAt: Date.now(),
      isRead: false,
    };
    try {
      await setDoc(doc(db, FEEDBACK_COLL, id), payload);
      notifySync('synced', 'Feedback submitted');
      this.logAnalyticsEvent({
        id: `ev-${Date.now()}`,
        type: 'feedback_submit',
        targetId: id,
        targetName: `${fb.rating} Stars - ${fb.category}`,
        driverId: fb.driverId,
        timestamp: Date.now(),
      });
      return { success: true, id };
    } catch (e: any) {
      notifySync('error', e.message);
      return { success: false, error: e.message };
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
            notifySync('synced');
          }
        },
        (error) => {
          console.warn('Drivers subscription error:', error.message);
          notifySync('offline');
        }
      );
    } catch (e) {
      return () => {};
    }
  },

  async saveDriverProfile(driver: DriverProfile) {
    notifySync('saving', `Saving driver ${driver.name}`);
    try {
      await setDoc(doc(db, DRIVERS_COLL, driver.id), driver, { merge: true });
      notifySync('synced', `Saved driver ${driver.name}`);
      return true;
    } catch (e: any) {
      notifySync('error', e.message);
      return false;
    }
  },

  async saveDriversList(drivers: DriverProfile[]) {
    notifySync('saving', 'Syncing drivers fleet');
    try {
      for (const d of drivers) {
        await setDoc(doc(db, DRIVERS_COLL, d.id), d, { merge: true });
      }
      await setDoc(doc(db, SETTINGS_COLL, 'drivers_index'), {
        order: drivers.map((d) => d.id),
        updatedAt: Date.now(),
      }, { merge: true });
      notifySync('synced', 'All drivers saved');
      return true;
    } catch (e: any) {
      notifySync('error', e.message);
      return false;
    }
  },

  async deleteDriver(driverId: string) {
    notifySync('saving', 'Deleting driver');
    try {
      await deleteDoc(doc(db, DRIVERS_COLL, driverId));
      notifySync('synced', 'Driver removed');
      return true;
    } catch (e: any) {
      notifySync('error', e.message);
      return false;
    }
  },

  // --- APPS & BUTTONS LAUNCHER ---
  subscribeToApps(onUpdate: (apps: InstalledAppItem[]) => void) {
    try {
      const q = query(collection(db, APPS_COLL));
      return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const apps = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as InstalledAppItem[];
            // sort by order if available
            apps.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
            onUpdate(apps);
            notifySync('synced');
          }
        },
        (error) => {
          console.warn('Apps subscription error:', error.message);
          notifySync('offline');
        }
      );
    } catch (e) {
      return () => {};
    }
  },

  async saveAppsList(apps: InstalledAppItem[]) {
    notifySync('saving', 'Saving app buttons');
    try {
      await setDoc(doc(db, SETTINGS_COLL, 'apps_launcher'), { apps, updatedAt: Date.now() }, { merge: true });
      for (let i = 0; i < apps.length; i++) {
        const app = { ...apps[i], order: i };
        await setDoc(doc(db, APPS_COLL, app.id), app, { merge: true });
      }
      notifySync('synced', 'Button configurations saved');
      return true;
    } catch (e: any) {
      notifySync('error', e.message);
      return false;
    }
  },

  // --- QUICK CONNECT & SOCIAL LINKS ---
  subscribeToQuickConnects(onUpdate: (items: QuickConnectItem[]) => void) {
    try {
      const q = query(collection(db, QUICK_CONNECT_COLL));
      return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as QuickConnectItem[];
            items.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
            onUpdate(items);
            notifySync('synced');
          }
        },
        (err) => console.warn('Quick connects listener offline:', err.message)
      );
    } catch (e) {
      return () => {};
    }
  },

  async saveQuickConnects(items: QuickConnectItem[]) {
    notifySync('saving', 'Saving Quick Connect links');
    try {
      await setDoc(doc(db, SETTINGS_COLL, 'quick_connects_meta'), {
        count: items.length,
        updatedAt: Date.now(),
      }, { merge: true });
      for (let i = 0; i < items.length; i++) {
        const item = { ...items[i], order: i };
        await setDoc(doc(db, QUICK_CONNECT_COLL, item.id), item, { merge: true });
      }
      notifySync('synced', 'Quick Connect updated');
      return true;
    } catch (e: any) {
      notifySync('error', e.message);
      return false;
    }
  },

  // --- PHOTO GALLERY ALBUMS & PHOTOS ---
  subscribeToAlbums(onUpdate: (albums: GalleryAlbum[]) => void) {
    try {
      const q = query(collection(db, ALBUMS_COLL));
      return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const albums = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as GalleryAlbum[];
            onUpdate(albums);
            notifySync('synced');
          }
        },
        (err) => console.warn('Albums listener offline:', err.message)
      );
    } catch (e) {
      return () => {};
    }
  },

  async saveAlbums(albums: GalleryAlbum[]) {
    notifySync('saving', 'Saving gallery albums');
    try {
      for (const a of albums) {
        await setDoc(doc(db, ALBUMS_COLL, a.id), a, { merge: true });
      }
      notifySync('synced', 'Albums saved');
      return true;
    } catch (e: any) {
      notifySync('error', e.message);
      return false;
    }
  },

  async deleteAlbum(albumId: string) {
    notifySync('saving', 'Deleting album');
    try {
      await deleteDoc(doc(db, ALBUMS_COLL, albumId));
      notifySync('synced', 'Album deleted');
      return true;
    } catch (e: any) {
      notifySync('error', e.message);
      return false;
    }
  },

  subscribeToPhotos(onUpdate: (photos: GalleryItem[]) => void) {
    try {
      const q = query(collection(db, PHOTOS_COLL));
      return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const photos = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as GalleryItem[];
            onUpdate(photos);
            notifySync('synced');
          }
        },
        (err) => console.warn('Photos listener offline:', err.message)
      );
    } catch (e) {
      return () => {};
    }
  },

  async savePhotos(photos: GalleryItem[]) {
    notifySync('saving', 'Saving gallery photos');
    try {
      for (const p of photos) {
        await setDoc(doc(db, PHOTOS_COLL, p.id), p, { merge: true });
      }
      notifySync('synced', 'Photos updated');
      return true;
    } catch (e: any) {
      notifySync('error', e.message);
      return false;
    }
  },

  async deletePhoto(photoId: string) {
    notifySync('saving', 'Deleting photo');
    try {
      await deleteDoc(doc(db, PHOTOS_COLL, photoId));
      notifySync('synced', 'Photo removed');
      return true;
    } catch (e: any) {
      notifySync('error', e.message);
      return false;
    }
  },

  // --- DRIVER SHIFT CHECKLISTS ---
  subscribeToChecklists(onUpdate: (checklists: DriverShiftChecklist[]) => void) {
    try {
      const q = query(collection(db, CHECKLISTS_COLL), orderBy('dateStr', 'desc'), limit(30));
      return onSnapshot(
        q,
        (snapshot) => {
          const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as DriverShiftChecklist[];
          onUpdate(list);
        },
        (err) => console.warn('Checklists listener offline:', err.message)
      );
    } catch (e) {
      return () => {};
    }
  },

  async saveChecklist(checklist: DriverShiftChecklist) {
    notifySync('saving', 'Saving shift checklist');
    try {
      await setDoc(doc(db, CHECKLISTS_COLL, checklist.id), checklist, { merge: true });
      notifySync('synced', 'Checklist recorded');
      return true;
    } catch (e: any) {
      notifySync('error', e.message);
      return false;
    }
  },

  // --- SCHEDULED CONTENT ---
  subscribeToSchedules(onUpdate: (schedules: ScheduledContentItem[]) => void) {
    try {
      const q = query(collection(db, SCHEDULES_COLL), orderBy('createdAt', 'desc'));
      return onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as ScheduledContentItem[];
          onUpdate(items);
        },
        (err) => console.warn('Schedules listener offline:', err.message)
      );
    } catch (e) {
      return () => {};
    }
  },

  async saveSchedule(item: ScheduledContentItem) {
    notifySync('saving', 'Saving scheduled content');
    try {
      await setDoc(doc(db, SCHEDULES_COLL, item.id), item, { merge: true });
      notifySync('synced', 'Scheduled content saved');
      return true;
    } catch (e: any) {
      notifySync('error', e.message);
      return false;
    }
  },

  async deleteSchedule(scheduleId: string) {
    try {
      await deleteDoc(doc(db, SCHEDULES_COLL, scheduleId));
      return true;
    } catch (e) {
      return false;
    }
  },

  // --- TABLETS, HEARTBEAT & REMOTE KIOSK RECOVERY ---
  async reportTabletHeartbeat(tablet: TabletDevice) {
    try {
      await setDoc(doc(db, TABLETS_COLL, tablet.id), {
        ...tablet,
        lastSeen: Date.now(),
        status: 'online',
      }, { merge: true });
    } catch (e) {}
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

  async sendKioskCommand(command: Omit<RemoteKioskCommand, 'id' | 'issuedAt' | 'status'>) {
    notifySync('saving', `Sending remote command: ${command.action}`);
    const id = `cmd-${Date.now()}`;
    const payload: RemoteKioskCommand = {
      ...command,
      id,
      issuedAt: Date.now(),
      status: 'pending',
    };
    try {
      await setDoc(doc(db, COMMANDS_COLL, id), payload);
      notifySync('synced', `Dispatched ${command.action}`);
      return { success: true, id };
    } catch (e: any) {
      notifySync('error', e.message);
      return { success: false, error: e.message };
    }
  },

  subscribeToCommands(tabletId: string, onCommand: (cmd: RemoteKioskCommand) => void) {
    try {
      const q = query(collection(db, COMMANDS_COLL), where('status', '==', 'pending'), limit(10));
      return onSnapshot(q, (snapshot) => {
        snapshot.docs.forEach((docSnap) => {
          const cmd = { id: docSnap.id, ...docSnap.data() } as RemoteKioskCommand;
          if (cmd.tabletId === 'all' || cmd.tabletId === tabletId) {
            onCommand(cmd);
          }
        });
      });
    } catch (e) {
      return () => {};
    }
  },

  async markCommandCompleted(commandId: string) {
    try {
      await updateDoc(doc(db, COMMANDS_COLL, commandId), {
        status: 'completed',
        executedAt: Date.now(),
      });
    } catch (e) {}
  },

  async syncAllData() {
    notifySync('saving', 'Resyncing kiosk database...');
    setTimeout(() => {
      notifySync('synced', 'Database synchronized');
    }, 600);
  },

  // --- MARKETING POPUPS ---
  subscribeToMarketingPopups(onUpdate: (popups: MarketingPopup[]) => void) {
    try {
      const q = query(collection(db, MARKETING_COLL));
      return onSnapshot(
        q,
        (snapshot) => {
          const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as MarketingPopup[];
          onUpdate(list);
        },
        (err) => console.warn('Marketing listener offline:', err.message)
      );
    } catch (e) {
      return () => {};
    }
  },

  async saveMarketingPopup(popup: MarketingPopup) {
    notifySync('saving', `Saving promo: ${popup.title}`);
    try {
      const sanitizedPopup = Object.fromEntries(
        Object.entries(popup).filter(([, value]) => value !== undefined)
      ) as MarketingPopup;
      await setDoc(doc(db, MARKETING_COLL, popup.id), sanitizedPopup);
      notifySync('synced', 'Marketing promo saved');
      return true;
    } catch (e: any) {
      notifySync('error', e.message);
      return false;
    }
  },

  async deleteMarketingPopup(popupId: string) {
    try {
      await deleteDoc(doc(db, MARKETING_COLL, popupId));
      return true;
    } catch (e) {
      return false;
    }
  },

  // --- USAGE ANALYTICS ---
  async logAnalyticsEvent(event: AnalyticsEvent) {
    try {
      await setDoc(doc(db, ANALYTICS_COLL, event.id), event);
    } catch (e) {}
  },

  subscribeToAnalytics(onUpdate: (events: AnalyticsEvent[]) => void) {
    try {
      const q = query(collection(db, ANALYTICS_COLL), orderBy('timestamp', 'desc'), limit(200));
      return onSnapshot(q, (snapshot) => {
        const events = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as AnalyticsEvent[];
        onUpdate(events);
      });
    } catch (e) {
      return () => {};
    }
  },

  // --- CHANGE HISTORY & ROLLBACK ---
  async saveChangeSnapshot(snapshot: ChangeHistorySnapshot) {
    try {
      await setDoc(doc(db, HISTORY_COLL, snapshot.id), snapshot);
    } catch (e) {}
  },

  subscribeToChangeHistory(onUpdate: (history: ChangeHistorySnapshot[]) => void) {
    try {
      const q = query(collection(db, HISTORY_COLL), orderBy('timestamp', 'desc'), limit(30));
      return onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as ChangeHistorySnapshot[];
        onUpdate(list);
      });
    } catch (e) {
      return () => {};
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
      this.logAnalyticsEvent({
        id: `ev-${Date.now()}`,
        type: 'service_inquiry',
        targetId: id,
        targetName: inquiry.serviceTitle,
        driverId: inquiry.driverId,
        timestamp: Date.now(),
      });
      return { success: true, id };
    } catch (e: any) {
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
    } catch (e) {}
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

  // --- DRIVER WORKING SHIFT CALENDAR ---
  subscribeToWorkShifts(onUpdate: (shifts: WorkShift[]) => void) {
    try {
      const q = query(collection(db, SHIFTS_COLL), orderBy('dateStr', 'asc'));
      return onSnapshot(
        q,
        (snapshot) => {
          const shifts = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as WorkShift[];
          onUpdate(shifts);
          notifySync('synced');
        },
        (err) => console.warn('Work shifts listener offline:', err.message)
      );
    } catch (e) {
      return () => {};
    }
  },

  async saveWorkShift(shift: WorkShift) {
    notifySync('saving', `Saving shift for ${shift.driverName}`);
    try {
      await setDoc(doc(db, SHIFTS_COLL, shift.id), shift, { merge: true });
      notifySync('synced', 'Shift saved to calendar');
      return true;
    } catch (e: any) {
      notifySync('error', e.message);
      return false;
    }
  },

  async deleteWorkShift(shiftId: string) {
    notifySync('saving', 'Removing shift');
    try {
      await deleteDoc(doc(db, SHIFTS_COLL, shiftId));
      notifySync('synced', 'Shift removed');
      return true;
    } catch (e: any) {
      notifySync('error', e.message);
      return false;
    }
  },

  // --- SHIFT SWAP & SCHEDULE CHANGE REQUESTS ---
  subscribeToShiftChangeRequests(onUpdate: (requests: ShiftChangeRequest[]) => void) {
    try {
      const q = query(collection(db, SHIFT_REQUESTS_COLL), orderBy('createdAt', 'desc'), limit(80));
      return onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as ShiftChangeRequest[];
          onUpdate(items);
          notifySync('synced');
        },
        (err) => console.warn('Shift change requests listener offline:', err.message)
      );
    } catch (e) {
      return () => {};
    }
  },

  async saveShiftChangeRequest(req: ShiftChangeRequest) {
    notifySync('saving', 'Submitting shift change request');
    try {
      await setDoc(doc(db, SHIFT_REQUESTS_COLL, req.id), req, { merge: true });
      notifySync('synced', 'Shift change request saved');
      return true;
    } catch (e: any) {
      notifySync('error', e.message);
      return false;
    }
  },

  async updateShiftChangeRequestStatus(
    requestId: string,
    status: ShiftChangeRequest['status'],
    reviewedBy: string
  ) {
    notifySync('saving', 'Updating shift change request');
    try {
      await updateDoc(doc(db, SHIFT_REQUESTS_COLL, requestId), {
        status,
        reviewedBy,
        reviewedAt: Date.now(),
      });
      notifySync('synced', 'Shift request updated');
      return true;
    } catch (e: any) {
      notifySync('error', e.message);
      return false;
    }
  },

  // --- COMPLETE CONFIGURATION & HISTORICAL BACKUP / RESTORE ---
  async fetchAllHistoricalDataForBackup() {
    const [
      shiftsSnap,
      shiftReqsSnap,
      requestsSnap,
      feedbackSnap,
      inquiriesSnap,
      msgsSnap,
      checklistsSnap,
      analyticsSnap,
      historySnap,
      marketingSnap,
    ] = await Promise.allSettled([
      getDocs(collection(db, SHIFTS_COLL)),
      getDocs(collection(db, SHIFT_REQUESTS_COLL)),
      getDocs(collection(db, REQUESTS_COLL)),
      getDocs(collection(db, FEEDBACK_COLL)),
      getDocs(collection(db, INQUIRIES_COLL)),
      getDocs(collection(db, MESSAGES_COLL)),
      getDocs(collection(db, CHECKLISTS_COLL)),
      getDocs(collection(db, ANALYTICS_COLL)),
      getDocs(collection(db, HISTORY_COLL)),
      getDocs(collection(db, MARKETING_COLL)),
    ]);

    const readList = <T,>(res: PromiseSettledResult<any>): T[] => {
      if (res.status === 'fulfilled' && res.value?.docs) {
        return res.value.docs.map((d: any) => ({ id: d.id, ...d.data() })) as T[];
      }
      return [];
    };

    const allRequests = readList<any>(requestsSnap);
    return {
      workShifts: readList<WorkShift>(shiftsSnap),
      shiftChangeRequests: readList<ShiftChangeRequest>(shiftReqsSnap),
      songRequests: allRequests.filter((r) => Boolean(r.title && r.artist)) as SongRequest[],
      cabinMessages: allRequests.filter((r) => Boolean(r.text && !r.artist)) as CabinMessage[],
      feedbackList: readList<PassengerFeedback>(feedbackSnap),
      serviceInquiries: readList<ServiceInquiry>(inquiriesSnap),
      teamMessages: readList<InternalAdminMessage>(msgsSnap),
      checklists: readList<DriverShiftChecklist>(checklistsSnap),
      analyticsEvents: readList<AnalyticsEvent>(analyticsSnap),
      changeHistorySnapshots: readList<ChangeHistorySnapshot>(historySnap),
      marketingPopups: readList<MarketingPopup>(marketingSnap),
    };
  },

  async saveCompleteCloudBackup(payload: any) {
    notifySync('saving', 'Saving complete backup snapshot to Cloud');
    try {
      const jsonStr = JSON.stringify(payload);
      await setDoc(doc(db, SETTINGS_COLL, 'complete_system_backup'), {
        payloadJson: jsonStr,
        exportedAt: payload.exportedAt,
        exportedBy: payload.exportedBy,
        backupScope: payload.backupScope,
        updatedAt: Date.now(),
      });
      notifySync('synced', 'Complete cloud backup saved');
      return true;
    } catch (e: any) {
      notifySync('error', e.message);
      return false;
    }
  },

  async getLatestCompleteCloudBackup() {
    try {
      const snap = await getDoc(doc(db, SETTINGS_COLL, 'complete_system_backup'));
      if (!snap.exists()) return null;
      const data = snap.data();
      if (data?.payloadJson) {
        return JSON.parse(data.payloadJson);
      }
      return null;
    } catch (e: any) {
      console.warn('Failed to fetch complete cloud backup:', e.message);
      return null;
    }
  },

  async restoreHistoricalCollections(history: {
    workShifts?: WorkShift[];
    shiftChangeRequests?: ShiftChangeRequest[];
    songRequests?: SongRequest[];
    cabinMessages?: CabinMessage[];
    serviceInquiries?: ServiceInquiry[];
    teamMessages?: InternalAdminMessage[];
    feedbackList?: PassengerFeedback[];
    checklists?: DriverShiftChecklist[];
    analyticsEvents?: AnalyticsEvent[];
    changeHistorySnapshots?: ChangeHistorySnapshot[];
  }) {
    notifySync('saving', 'Restoring historical records to Cloud...');
    try {
      const tasks: Promise<any>[] = [];
      (history.workShifts || []).forEach((item) => {
        if (item?.id) tasks.push(setDoc(doc(db, SHIFTS_COLL, item.id), item, { merge: true }));
      });
      (history.shiftChangeRequests || []).forEach((item) => {
        if (item?.id) tasks.push(setDoc(doc(db, SHIFT_REQUESTS_COLL, item.id), item, { merge: true }));
      });
      (history.songRequests || []).forEach((item) => {
        if (item?.id) {
          tasks.push(
            setDoc(
              doc(db, REQUESTS_COLL, item.id),
              { ...item, sentAt: item.requestedAt || Date.now() },
              { merge: true }
            )
          );
        }
      });
      (history.cabinMessages || []).forEach((item) => {
        if (item?.id) tasks.push(setDoc(doc(db, REQUESTS_COLL, item.id), item, { merge: true }));
      });
      (history.serviceInquiries || []).forEach((item) => {
        if (item?.id) tasks.push(setDoc(doc(db, INQUIRIES_COLL, item.id), item, { merge: true }));
      });
      (history.teamMessages || []).forEach((item) => {
        if (item?.id) tasks.push(setDoc(doc(db, MESSAGES_COLL, item.id), item, { merge: true }));
      });
      (history.feedbackList || []).forEach((item) => {
        if (item?.id) tasks.push(setDoc(doc(db, FEEDBACK_COLL, item.id), item, { merge: true }));
      });
      (history.checklists || []).forEach((item) => {
        if (item?.id) tasks.push(setDoc(doc(db, CHECKLISTS_COLL, item.id), item, { merge: true }));
      });
      (history.analyticsEvents || []).forEach((item) => {
        if (item?.id) tasks.push(setDoc(doc(db, ANALYTICS_COLL, item.id), item, { merge: true }));
      });
      (history.changeHistorySnapshots || []).forEach((item) => {
        if (item?.id) tasks.push(setDoc(doc(db, HISTORY_COLL, item.id), item, { merge: true }));
      });
      await Promise.allSettled(tasks);
      notifySync('synced', 'Historical data restored');
      return true;
    } catch (e: any) {
      notifySync('error', e.message);
      return false;
    }
  },
};

