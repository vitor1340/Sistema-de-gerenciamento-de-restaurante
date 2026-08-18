import { apiFetch } from '@/lib/api-client';
import { getSessionToken } from '@/lib/session.server';
import type { CategoriaDTO, ProdutoDTO } from '@comandai/shared-types';
import { CardapioManager } from '@/components/cardapio/CardapioManager';

export default async function CardapioPage() {
  const token = await getSessionToken();

  const [produtos, categorias] = await Promise.all([
    apiFetch<ProdutoDTO[]>('/produtos', token),
    apiFetch<CategoriaDTO[]>('/categorias', token),
  ]);

  return <CardapioManager produtosIniciais={produtos} categoriasIniciais={categorias} />;
}
