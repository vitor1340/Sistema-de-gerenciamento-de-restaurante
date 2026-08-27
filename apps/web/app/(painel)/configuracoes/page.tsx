import { apiFetch } from '@/lib/api-client';
import { getSessionToken } from '@/lib/session.server';
import type { RestauranteMeDTO, UsuarioMeDTO } from '@comandai/shared-types';
import { ConfiguracoesForm } from '@/components/configuracoes/ConfiguracoesForm';

export default async function ConfiguracoesPage() {
  const token = await getSessionToken();
  const [restaurante, usuario] = await Promise.all([
    apiFetch<RestauranteMeDTO>('/restaurantes/me', token),
    apiFetch<UsuarioMeDTO>('/auth/me', token),
  ]);

  return (
    <ConfiguracoesForm restaurante={restaurante} doisFatoresAtivoInicial={usuario.doisFatoresAtivo} />
  );
}
