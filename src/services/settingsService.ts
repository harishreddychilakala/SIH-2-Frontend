import type { UserSettings, NotificationItem } from '../types';

const SETTINGS_KEY = 'packsmart_settings';
const NOTIFICATIONS_KEY = 'packsmart_notifications';

export const defaultUserSettings: UserSettings = {
  userName: '',
  userRole: '',
  organization: '',
  unitSystem: 'metric',
  theme: 'light',
  autoSaveHistory: true,
  enableRespirationAlerts: true,
  enableExportWatermark: true,
};

export const settingsService = {
  getSettings(): UserSettings {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      return raw ? JSON.parse(raw) : defaultUserSettings;
    } catch {
      return defaultUserSettings;
    }
  },

  saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Could not save settings', e);
    }
  },

  getNotifications(): NotificationItem[] {
    try {
      const raw = localStorage.getItem(NOTIFICATIONS_KEY);
      if (!raw) {
        return [];
      }
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  addNotification(notification: NotificationItem): void {
    const list = [notification, ...this.getNotifications()];
    try {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn(e);
    }
  },

  markAsRead(id: string): NotificationItem[] {
    const list = this.getNotifications().map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    try {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn(e);
    }
    return list;
  },

  markAllAsRead(): NotificationItem[] {
    const list = this.getNotifications().map((n) => ({ ...n, read: true }));
    try {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn(e);
    }
    return list;
  },
};

