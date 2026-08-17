export interface JwtPayload {
  sub: string;
  email: string;
  restauranteId: string;
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
  restauranteId: string;
}
