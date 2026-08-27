import { io, type Socket } from 'socket.io-client';

function urlSocket(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
  // O gateway de WebSocket fica na raiz do host da API — app.setGlobalPrefix('api')
  // não afeta o handshake do socket.io, só as rotas HTTP.
  return apiUrl.replace(/\/api\/?$/, '');
}

export function criarSocket(token: string): Socket {
  return io(urlSocket(), {
    auth: { token },
    autoConnect: false,
  });
}
