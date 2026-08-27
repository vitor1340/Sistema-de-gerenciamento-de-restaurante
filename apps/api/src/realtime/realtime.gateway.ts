import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import type { JwtPayload } from '../auth/jwt.types';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  },
})
export class RealtimeGateway implements OnGatewayConnection {
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  private readonly server!: Server;

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket): Promise<void> {
    const token = client.handshake.auth?.token as string | undefined;
    if (!token) {
      client.disconnect(true);
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      if (payload.tipo) {
        // Token de sessão parcial (aguardando 2FA) não autentica o socket.
        client.disconnect(true);
        return;
      }
      await client.join(payload.restauranteId);
    } catch (erro) {
      this.logger.debug(`Conexão de socket rejeitada: ${String(erro)}`);
      client.disconnect(true);
    }
  }

  emitirParaRestaurante(
    restauranteId: string,
    evento: string,
    payload: unknown,
  ): void {
    this.server.to(restauranteId).emit(evento, payload);
  }
}
