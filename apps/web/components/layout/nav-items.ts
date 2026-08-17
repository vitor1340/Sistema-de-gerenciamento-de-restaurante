import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  ClipboardList,
  BookOpen,
  Users,
  Bike,
  DollarSign,
  BarChart3,
  UserCog,
  Settings,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badgeKey?: 'pedidosNovos';
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Visão geral', icon: LayoutDashboard },
  { href: '/pedidos', label: 'Pedidos', icon: ClipboardList, badgeKey: 'pedidosNovos' },
  { href: '/cardapio', label: 'Cardápio', icon: BookOpen },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/entregas', label: 'Entregas', icon: Bike },
  { href: '/financeiro', label: 'Financeiro', icon: DollarSign },
  { href: '/relatorios', label: 'Relatórios', icon: BarChart3 },
  { href: '/equipe', label: 'Equipe', icon: UserCog },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
];
