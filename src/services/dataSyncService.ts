import { FamilyMember, ClanInfo, AppUser } from '../types/family';
import { CustomThemeSettings } from '../types/theme';

export interface AppSyncData {
  members: FamilyMember[];
  clanInfo: ClanInfo;
  users: AppUser[];
  currentUser: AppUser;
  themeSettings: CustomThemeSettings;
  version: number;
  lastUpdated: string;
}

const STORAGE_KEYS = {
  MEMBERS: 'giapha_members_v2',
  CLAN_INFO: 'giapha_clan_info_v2',
  USERS: 'giapha_users_v2',
  CURRENT_USER: 'giapha_current_user_v2',
  THEME_SETTINGS: 'giapha_theme_settings_v2',
  SNAPSHOTS: 'giapha_snapshots_history_v2',
};

// BroadcastChannel for instant cross-tab / multi-window synchronization
let syncChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    syncChannel = new BroadcastChannel('giapha_realtime_sync_channel');
  }
} catch (e) {
  console.warn('BroadcastChannel not supported or sandboxed', e);
}

export const DataSyncService = {
  /**
   * Lưu toàn bộ trạng thái vào LocalStorage và phát sóng đồng bộ cho các tab
   */
  saveState(
    members: FamilyMember[],
    clanInfo: ClanInfo,
    users: AppUser[],
    currentUser: AppUser,
    themeSettings: CustomThemeSettings
  ) {
    try {
      if (typeof window === 'undefined') return;

      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
      localStorage.setItem(STORAGE_KEYS.CLAN_INFO, JSON.stringify(clanInfo));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      localStorage.setItem(STORAGE_KEYS.THEME_SETTINGS, JSON.stringify(themeSettings));

      // Broadcast update event to all other open tabs
      if (syncChannel) {
        syncChannel.postMessage({
          type: 'GIAPHA_DATA_UPDATED',
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error saving state to localStorage', error);
    }
  },

  /**
   * Lắng nghe cập nhật từ các tab khác
   */
  subscribeToCrossTabSync(callback: () => void): () => void {
    if (!syncChannel) return () => {};

    const handler = (event: MessageEvent) => {
      if (event.data && event.data.type === 'GIAPHA_DATA_UPDATED') {
        callback();
      }
    };

    syncChannel.addEventListener('message', handler);
    return () => {
      syncChannel?.removeEventListener('message', handler);
    };
  },

  /**
   * Tạo bản sao lưu dự phòng (Snapshot)
   */
  createBackupSnapshot(
    members: FamilyMember[],
    clanInfo: ClanInfo,
    description: string = 'Tự động lưu'
  ) {
    try {
      if (typeof window === 'undefined') return;

      const raw = localStorage.getItem(STORAGE_KEYS.SNAPSHOTS);
      const snapshots: Array<{ id: string; timestamp: string; desc: string; count: number; data: string }> = raw
        ? JSON.parse(raw)
        : [];

      const newSnapshot = {
        id: `snap_${Date.now()}`,
        timestamp: new Date().toISOString(),
        desc: description,
        count: members.length,
        data: JSON.stringify({ members, clanInfo }),
      };

      // Giữ tối đa 15 bản sao lưu gần nhất
      const updatedSnapshots = [newSnapshot, ...snapshots].slice(0, 15);
      localStorage.setItem(STORAGE_KEYS.SNAPSHOTS, JSON.stringify(updatedSnapshots));
    } catch (e) {
      console.error('Error creating snapshot', e);
    }
  },

  /**
   * Đọc danh sách bản sao lưu
   */
  getBackupSnapshots() {
    try {
      if (typeof window === 'undefined') return [];
      const raw = localStorage.getItem(STORAGE_KEYS.SNAPSHOTS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },
};
