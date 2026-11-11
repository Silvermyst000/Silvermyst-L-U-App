import { InstalledAppItem } from '../types/kiosk';
import { playCabinChime } from './cabinAudio';

interface LaunchCallbacks {
  onOpenGallery?: () => void;
  onOpenWifi?: () => void;
  onOpenComfort?: () => void;
  onSongRequest?: () => void;
  onNotifyLaunch?: (appName: string, message: string) => void;
}

export function launchTabletApp(app: InstalledAppItem, callbacks: LaunchCallbacks = {}) {
  playCabinChime('tap');

  // Handle internal app actions
  if (app.packageName === 'internal.gallery') {
    if (callbacks.onOpenGallery) callbacks.onOpenGallery();
    return;
  }
  if (app.packageName === 'internal.wifi') {
    if (callbacks.onOpenWifi) callbacks.onOpenWifi();
    return;
  }
  if (app.packageName === 'internal.comfort') {
    if (callbacks.onOpenComfort) callbacks.onOpenComfort();
    return;
  }
  if (app.packageName === 'internal.songrequest') {
    if (callbacks.onSongRequest) callbacks.onSongRequest();
    return;
  }

  // Check if running in Android Fully Kiosk Browser
  const fully = (window as any).fully;
  if (fully && typeof fully.startApplication === 'function' && app.packageName && !app.packageName.startsWith('internal.')) {
    try {
      fully.startApplication(app.packageName);
      if (callbacks.onNotifyLaunch) {
        callbacks.onNotifyLaunch(app.name, `Launching ${app.name} on tablet...`);
      }
      return;
    } catch (e) {
      console.warn('Fully kiosk startApplication failed, falling back to deep link:', e);
    }
  }

  // Notification feedback
  if (callbacks.onNotifyLaunch) {
    callbacks.onNotifyLaunch(app.name, `Opening ${app.name}...`);
  }

  const isAndroid = /android/i.test(navigator.userAgent);

  // If Android and deep link is specified, trigger deep link
  if (app.deepLinkUrl) {
    if (isAndroid) {
      // Direct intent navigation on Android
      window.location.href = app.deepLinkUrl;
      // Fallback timer if app is not installed
      setTimeout(() => {
        if (app.webFallbackUrl) {
          window.open(app.webFallbackUrl, '_blank');
        }
      }, 1200);
      return;
    } else {
      // Non-Android or desktop preview: open web fallback or deep link
      if (app.webFallbackUrl) {
        window.open(app.webFallbackUrl, '_blank');
        return;
      } else {
        window.location.href = app.deepLinkUrl;
        return;
      }
    }
  }

  // Fallback to web URL
  if (app.webFallbackUrl) {
    window.open(app.webFallbackUrl, '_blank');
  }
}
