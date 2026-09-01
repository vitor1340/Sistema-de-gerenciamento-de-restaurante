'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UsuarioDTO } from '@comandai/shared-types';

interface AuthState {
  usuario: UsuarioDTO | null;
  accessToken: string | null;
  setSession: (usuario: UsuarioDTO, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      accessToken: null,
      setSession: (usuario, accessToken) => set({ usuario, accessToken }),
      setAccessToken: (accessToken) => set({ accessToken }),
      clearSession: () => set({ usuario: null, accessToken: null }),
    }),
    {
      name: 'comandai-auth',
      // accessToken NUNCA vai pro localStorage (persistência indefinida,
      // alvo fácil de malware/extensão maliciosa) — só `usuario` fica
      // salvo entre recarregamentos. O token é reidratado em memória no
      // boot da página por `AuthBootstrap` (components/shared/AuthBootstrap.tsx).
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
);
