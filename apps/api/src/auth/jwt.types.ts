export interface JwtPayload {
  sub: string;
  email: string;
  restauranteId: string;
  // Presente só em tokens intermediários (ex.: sessão parcial aguardando
  // verificação de 2FA) — nunca em um access token completo. Qualquer
  // payload com `tipo` setado é rejeitado pelo JwtStrategy.
  tipo?: 'PARCIAL_2FA';
}

export interface JwtPayloadParcial2fa {
  sub: string;
  tipo: 'PARCIAL_2FA';
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
  restauranteId: string;
}
