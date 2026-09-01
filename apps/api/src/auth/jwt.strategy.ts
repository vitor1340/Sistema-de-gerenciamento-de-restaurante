import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { exigirVariavelAmbiente } from '../common/env.util';
import { AuthenticatedUser, JwtPayload } from './jwt.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: exigirVariavelAmbiente('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    if (payload.tipo) {
      // Token de sessão parcial (ex.: aguardando 2FA) — não é um access
      // token completo e não pode autenticar nenhuma rota normal.
      throw new UnauthorizedException('Token inválido para esta operação');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      restauranteId: payload.restauranteId,
      cargo: payload.cargo,
    };
  }
}
