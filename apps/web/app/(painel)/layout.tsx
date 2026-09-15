import { apiFetch } from '@/lib/api-client';
import { getSessionToken } from '@/lib/session.server';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { AuthBootstrap } from '@/components/shared/AuthBootstrap';
import { PlanoStatusBanner } from '@/components/shared/PlanoStatusBanner';
import type { RestauranteMeDTO } from '@comandai/shared-types';

// Sem plano ativo (EXPIRED/CANCELED), o usuário continua entrando no painel
// normalmente — só ações de escrita (salvar, criar, etc.) são bloqueadas
// pelo PlanoAtivoGuard no backend (402). O PlanoStatusBanner deixa o motivo
// visível o tempo todo, em vez de expulsar pra /planos antes de mostrar
// qualquer coisa.
export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const token = await getSessionToken();
  const restaurante = await apiFetch<RestauranteMeDTO>('/restaurantes/me', token);

  return (
    <div className="flex">
      <AuthBootstrap />
      <Sidebar
        restauranteNome={restaurante.nome}
        restaurantePlano={restaurante.plano}
        pedidosNovosCount={restaurante.pedidosNovosCount}
      />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Header lojaAberta={restaurante.aberto} />
        <PlanoStatusBanner
          statusPlano={restaurante.statusPlano}
          diasRestantesTeste={restaurante.diasRestantesTeste}
        />
        <main className="min-w-0 flex-1 bg-page p-6">{children}</main>
      </div>
    </div>
  );
}
