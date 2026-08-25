'use client';

import { create } from 'zustand';

interface UiState {
  menuMobileAberto: boolean;
  abrirMenuMobile: () => void;
  fecharMenuMobile: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  menuMobileAberto: false,
  abrirMenuMobile: () => set({ menuMobileAberto: true }),
  fecharMenuMobile: () => set({ menuMobileAberto: false }),
}));
