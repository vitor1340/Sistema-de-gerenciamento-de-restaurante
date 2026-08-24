import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { exigirVariavelAmbiente } from '../common/env.util';
import { UsuarioGoogle } from './google.types';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: exigirVariavelAmbiente('GOOGLE_CLIENT_ID'),
      clientSecret: exigirVariavelAmbiente('GOOGLE_CLIENT_SECRET'),
      callbackURL: exigirVariavelAmbiente('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      done(
        new UnauthorizedException('Conta do Google sem e-mail disponível'),
        false,
      );
      return;
    }

    const usuarioGoogle: UsuarioGoogle = {
      googleId: profile.id,
      email,
      nome: profile.displayName || email,
    };

    done(null, usuarioGoogle);
  }
}
