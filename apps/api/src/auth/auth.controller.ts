import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { exigirVariavelAmbiente } from '../common/env.util';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegistrarDto } from './dto/registrar.dto';
import { TrocarCodigoGoogleDto } from './dto/trocar-codigo-google.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import type { AuthenticatedUser } from './jwt.types';
import type { UsuarioGoogle } from './google.types';

const LIMITE_TENTATIVAS_AUTH = { default: { limit: 5, ttl: 60_000 } };

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle(LIMITE_TENTATIVAS_AUTH)
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.senha);
  }

  @Throttle(LIMITE_TENTATIVAS_AUTH)
  @Post('registrar')
  registrar(@Body() dto: RegistrarDto) {
    return this.authService.registrar(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.me(user.userId);
  }

  @UseGuards(AuthGuard('google'))
  @Get('google')
  iniciarGoogle() {
    // Passport intercepta a requisição antes daqui e redireciona pro Google.
  }

  @UseGuards(AuthGuard('google'))
  @Get('google/callback')
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const usuarioGoogle = req.user as UsuarioGoogle;
    const { accessToken, usuario } =
      await this.authService.loginOuRegistrarComGoogle(usuarioGoogle);
    const codigo = this.authService.criarCodigoTrocaTemporario(
      accessToken,
      usuario,
    );

    const origemFrontend = exigirVariavelAmbiente('CORS_ORIGIN');
    res.redirect(`${origemFrontend}/auth/google/callback?code=${codigo}`);
  }

  @Throttle(LIMITE_TENTATIVAS_AUTH)
  @Post('google/exchange')
  trocarCodigoGoogle(@Body() dto: TrocarCodigoGoogleDto) {
    return this.authService.trocarCodigoTemporario(dto.codigo);
  }
}
