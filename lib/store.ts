import { create } from "zustand";
import Cookie from "js-cookie";

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => {
    if (token) {
      Cookie.set("auth_token", token, { expires: 30 });
    } else {
      Cookie.remove("auth_token");
    }
    set({ token });
  },
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  logout: () => {
    Cookie.remove("auth_token");
    set({ user: null, token: null, isAuthenticated: false });
  },
  hydrate: () => {
    const token = Cookie.get("auth_token");
    if (token) {
      set({ token, isAuthenticated: true });
    }
  },
}));

export interface SyncState {
  isSyncing: boolean;
  lastSyncTime: string | null;
  syncStatus: "idle" | "syncing" | "error" | "success";
  pendingChanges: number;

  // Actions
  setIsSyncing: (syncing: boolean) => void;
  setLastSyncTime: (time: string) => void;
  setSyncStatus: (status: "idle" | "syncing" | "error" | "success") => void;
  setPendingChanges: (count: number) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  isSyncing: false,
  lastSyncTime: null,
  syncStatus: "idle",
  pendingChanges: 0,

  setIsSyncing: (syncing) => set({ isSyncing: syncing }),
  setLastSyncTime: (time) => set({ lastSyncTime: time }),
  setSyncStatus: (status) => set({ syncStatus: status }),
  setPendingChanges: (count) => set({ pendingChanges: count }),
}));
