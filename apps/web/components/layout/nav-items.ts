import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, ClipboardList, BookOpen, Settings } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badgeKey?: 'pedidosNovos';
}

// Clientes, Entregas, Financeiro, Relatórios e Equipe saíram do menu por
// enquanto (fora de escopo) — sem lógica de backend por trás, eram só
// telas "em breve". Implementa de volta se/quando fizer sentido.
export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Visão geral', icon: LayoutDashboard },
  { href: '/pedidos', label: 'Pedidos', icon: ClipboardList, badgeKey: 'pedidosNovos' },
  { href: '/cardapio', label: 'Cardápio', icon: BookOpen },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
];
