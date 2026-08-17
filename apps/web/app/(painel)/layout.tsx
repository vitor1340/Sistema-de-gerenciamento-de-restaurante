import { apiFetch } from '@/lib/api-client';
import { getSessionToken } from '@/lib/session.server';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import type { RestauranteMeDTO } from '@comandai/shared-types';

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const token = await getSessionToken();
  const restaurante = await apiFetch<RestauranteMeDTO>('/restaurantes/me', token);

  return (
    <div className="flex">
      <Sidebar
        restauranteNome={restaurante.nome}
        restaurantePlano={restaurante.plano}
        pedidosNovosCount={restaurante.pedidosNovosCount}
      />
      <div className="flex min-h-screen flex-1 flex-col">
        <Header lojaAberta={restaurante.aberto} />
        <main className="flex-1 bg-page p-6">{children}</main>
      </div>
    </div>
  );
}
