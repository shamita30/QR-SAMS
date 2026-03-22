import { create } from 'zustand';

export type UserRole = 'STUDENT' | 'FACULTY' | 'ADMIN' | 'HOD';

interface User {
  id: string;
  name: string;
  role: UserRole;
  department?: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
