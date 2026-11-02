import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";

export type Member = {
  id: string;
  staticId: string;
  username: string;
  status: string;
  role: string;
};

export type AuthState = {
  member: Member | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (member: Member, accessToken: string, refreshToken: string) => void;
  clearSession: () => void;
  setLoading: (loading: boolean) => void;
};

const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return SecureStore.getItemAsync(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await SecureStore.deleteItemAsync(name);
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      member: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,
      setSession: (member, accessToken, refreshToken) => {
        void SecureStore.setItemAsync("thestatic:auth:access", accessToken);
        void SecureStore.setItemAsync("thestatic:auth:refresh", refreshToken);
        set({ member, accessToken, isAuthenticated: true, isLoading: false });
      },
      clearSession: async () => {
        await SecureStore.deleteItemAsync("thestatic:auth:access");
        await SecureStore.deleteItemAsync("thestatic:auth:refresh");
        set({ member: null, accessToken: null, isAuthenticated: false, isLoading: false });
      },
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "thestatic-auth",
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({ member: state.member, accessToken: state.accessToken }),
    },
  ),
);
