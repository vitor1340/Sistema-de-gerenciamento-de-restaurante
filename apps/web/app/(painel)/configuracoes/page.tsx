import { apiFetch } from '@/lib/api-client';
import { getSessionToken } from '@/lib/session.server';
import type { AssinaturaAtualDTO, RestauranteMeDTO, UsuarioMeDTO } from '@comandai/shared-types';
import { ConfiguracoesForm } from '@/components/configuracoes/ConfiguracoesForm';

export default async function ConfiguracoesPage() {
  const token = await getSessionToken();
  const [restaurante, usuario, assinatura] = await Promise.all([
    apiFetch<RestauranteMeDTO>('/restaurantes/me', token),
    apiFetch<UsuarioMeDTO>('/auth/me', token),
    apiFetch<AssinaturaAtualDTO>('/assinaturas/atual', token),
  ]);

  return (
    <ConfiguracoesForm
      restaurante={restaurante}
      doisFatoresAtivoInicial={usuario.doisFatoresAtivo}
      assinaturaInicial={assinatura}
    />
  );
}
