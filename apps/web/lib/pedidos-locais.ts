const CHAVE_PREFIXO = 'comandai-pedidos-';
const MAX_PEDIDOS_GUARDADOS = 20;

/**
 * Sem login de cliente, "meus pedidos" é só o histórico salvo no navegador
 * de quem fez o pedido — por loja (slug), guardado no localStorage.
 */
export function salvarPedidoLocal(slug: string, pedidoId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const atuais = obterPedidosLocais(slug);
    const atualizados = [pedidoId, ...atuais.filter((id) => id !== pedidoId)].slice(
      0,
      MAX_PEDIDOS_GUARDADOS,
    );
    window.localStorage.setItem(CHAVE_PREFIXO + slug, JSON.stringify(atualizados));
  } catch {
    // localStorage indisponível (modo privado, cookies bloqueados, etc.) — ignora
  }
}

export function obterPedidosLocais(slug: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const bruto = window.localStorage.getItem(CHAVE_PREFIXO + slug);
    if (!bruto) return [];
    const lista: unknown = JSON.parse(bruto);
    return Array.isArray(lista) ? lista.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}
