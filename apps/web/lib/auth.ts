import { create } from "zustand";

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

export const useAuthStore = create<AuthState>((set) => ({
  member: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  setSession: (member, accessToken, refreshToken) => {
    set({ member, accessToken, isAuthenticated: true, isLoading: false });
  },
  clearSession: () => {
    set({ member: null, accessToken: null, isAuthenticated: false, isLoading: false });
  },
  setLoading: (loading) => set({ isLoading: loading }),
}));
