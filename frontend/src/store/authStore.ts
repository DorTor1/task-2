import { create } from 'zustand';
import { authApi } from '../api/auth';
import { usersApi, type UpdateProfilePayload } from '../api/users';
import { extractErrorMessage } from '../api/client';
import { tokenStorage } from '../lib/tokenStorage';
import type { User } from '../types/user';

interface AuthState {
  token: string | null;
  user: User | null;
  initializing: boolean;
  initialized: boolean;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<User>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: tokenStorage.get(),
  user: null,
  initializing: false,
  initialized: false,
  isLoading: false,
  error: null,

  async initialize() {
    const state = get();
    if (state.initializing || state.initialized) {
      return;
    }

    set({ initializing: true, error: null });

    try {
      const token = tokenStorage.get();
      if (!token) {
        set({ token: null, user: null });
        return;
      }

      const user = await usersApi.fetchProfile();
      set({ token, user });
    } catch (error) {
      tokenStorage.clear();
      set({ token: null, user: null, error: extractErrorMessage(error) });
    } finally {
      set({ initializing: false, initialized: true });
    }
  },

  async login(email, password) {
    set({ isLoading: true, error: null });
    try {
      const result = await authApi.login({ email, password });
      tokenStorage.set(result.token);
      set({ token: result.token, user: result.user, initialized: true });
    } catch (error) {
      set({ error: extractErrorMessage(error) });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  async register(payload) {
    set({ isLoading: true, error: null });
    try {
      await authApi.register(payload);
      await get().login(payload.email, payload.password);
    } catch (error) {
      set({ error: extractErrorMessage(error) });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout() {
    tokenStorage.clear();
    set({ token: null, user: null, initialized: true });
  },

  async refreshProfile() {
    const user = await usersApi.fetchProfile();
    set({ user });
  },

  async updateProfile(payload) {
    set({ isLoading: true, error: null });
    try {
      const user = await usersApi.updateProfile(payload);
      set({ user });
      return user;
    } catch (error) {
      const message = extractErrorMessage(error);
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  clearError() {
    set({ error: null });
  },
}));

if (typeof window !== 'undefined') {
  window.addEventListener('app:unauthorized', () => {
    const state = useAuthStore.getState();
    if (state.token) {
      state.logout();
    }
  });
}

