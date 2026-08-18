import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CargoUsuario, PlanoRestaurante } from '../../generated/prisma/client';
import { gerarSlugUnico } from '../common/slugify.util';
import { PrismaService } from '../prisma/prisma.service';
import { RegistrarDto } from './dto/registrar.dto';
import { JwtPayload } from './jwt.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, senha: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email,
      restauranteId: usuario.restauranteId,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo,
      },
    };
  }

  async registrar(dto: RegistrarDto) {
    const emailEmUso = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });
    if (emailEmUso) {
      throw new ConflictException('Já existe uma conta com este e-mail');
    }

    const slug = await gerarSlugUnico(dto.nomeRestaurante, async (candidato) => {
      const existente = await this.prisma.restaurante.findUnique({
        where: { slug: candidato },
      });
      return existente !== null;
    });

    const senhaHash = await bcrypt.hash(dto.senha, 10);

    const usuario = await this.prisma.$transaction(async (tx) => {
      const restaurante = await tx.restaurante.create({
        data: {
          nome: dto.nomeRestaurante,
          slug,
          plano: PlanoRestaurante.FREE,
        },
      });

      return tx.usuario.create({
        data: {
          nome: dto.nomeDono,
          email: dto.email,
          senhaHash,
          cargo: CargoUsuario.DONO,
          restauranteId: restaurante.id,
        },
      });
    });

    const payload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email,
      restauranteId: usuario.restauranteId,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo,
      },
    };
  }

  async me(userId: string) {
    const usuario = await this.prisma.usuario.findUniqueOrThrow({
      where: { id: userId },
    });
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      cargo: usuario.cargo,
      restauranteId: usuario.restauranteId,
    };
  }
}
