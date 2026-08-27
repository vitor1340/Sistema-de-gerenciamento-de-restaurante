'use client';

import { useEffect, useRef } from 'react';
import type { PedidoResumoDTO, StatusPedido } from '@comandai/shared-types';
import { criarSocket } from '@/lib/socket';

interface PedidoStatusAtualizadoEvento {
  id: string;
  status: StatusPedido;
}

interface UsePedidosRealtimeOpcoes {
  token: string | undefined;
  onPedidoCriado: (pedido: PedidoResumoDTO) => void;
  onStatusAtualizado: (evento: PedidoStatusAtualizadoEvento) => void;
  onConectar: () => void;
}

/**
 * Sem replay de eventos perdidos: em toda conexão (inicial ou após queda de
 * rede), `onConectar` dispara um refetch completo da lista de pedidos — mais
 * simples que reconstruir o histórico de eventos perdido durante a queda.
 */
export function usePedidosRealtime({
  token,
  onPedidoCriado,
  onStatusAtualizado,
  onConectar,
}: UsePedidosRealtimeOpcoes) {
  const callbacksRef = useRef({ onPedidoCriado, onStatusAtualizado, onConectar });
  useEffect(() => {
    callbacksRef.current = { onPedidoCriado, onStatusAtualizado, onConectar };
  });

  useEffect(() => {
    if (!token) return;

    const socket = criarSocket(token);

    socket.on('connect', () => callbacksRef.current.onConectar());
    socket.on('pedido.criado', (pedido: PedidoResumoDTO) =>
      callbacksRef.current.onPedidoCriado(pedido),
    );
    socket.on('pedido.status_atualizado', (evento: PedidoStatusAtualizadoEvento) =>
      callbacksRef.current.onStatusAtualizado(evento),
    );

    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, [token]);
}
