export function formatCentavos(centavos: number): string {
  return (centavos / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function formatHorario(data: string | Date): string {
  return new Date(data).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatVariacao(valor: number, sufixo = '%'): string {
  const sinal = valor > 0 ? '+' : '';
  return `${sinal}${valor}${sufixo}`;
}
