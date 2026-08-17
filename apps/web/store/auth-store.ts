'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UsuarioDTO } from '@comandai/shared-types';

interface AuthState {
  usuario: UsuarioDTO | null;
  accessToken: string | null;
  setSession: (usuario: UsuarioDTO, accessToken: string) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      accessToken: null,
      setSession: (usuario, accessToken) => set({ usuario, accessToken }),
      clearSession: () => set({ usuario: null, accessToken: null }),
    }),
    { name: 'comandai-auth' },
  ),
);
