import { apiFetch } from '@/lib/api-client';
import { getSessionToken } from '@/lib/session.server';
import type { RestauranteMeDTO } from '@comandai/shared-types';
import { ConfiguracoesForm } from '@/components/configuracoes/ConfiguracoesForm';

export default async function ConfiguracoesPage() {
  const token = await getSessionToken();
  const restaurante = await apiFetch<RestauranteMeDTO>('/restaurantes/me', token);

  return <ConfiguracoesForm restaurante={restaurante} />;
}
