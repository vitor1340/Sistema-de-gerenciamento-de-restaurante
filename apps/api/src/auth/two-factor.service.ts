import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import * as QRCode from 'qrcode';
import { authenticator } from 'otplib';
import { criptografar, descriptografar } from '../common/crypto.util';
import { hashToken } from '../common/token.util';
import { PrismaService } from '../prisma/prisma.service';
import { RefreshTokenService } from './refresh-token.service';

const EMISSOR_TOTP = 'Comandaí';
// 1 passo (janela de 30s) pra cada lado — tolera pequena diferença de
// relógio entre o servidor e o celular do usuário.
authenticator.options = { window: 1 };
const QUANTIDADE_CODIGOS_BACKUP = 10;
// Sem caracteres ambíguos (0/O, 1/I/L) para reduzir erro de digitação.
const CHARSET_CODIGO_BACKUP = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function gerarCodigoBackup(): string {
  const bytes = randomBytes(8);
  let codigo = '';
  for (let i = 0; i < bytes.length; i++) {
    codigo += CHARSET_CODIGO_BACKUP[bytes[i] % CHARSET_CODIGO_BACKUP.length];
  }
  return `${codigo.slice(0, 4)}-${codigo.slice(4)}`;
}

function normalizarCodigoBackup(codigo: string): string {
  return codigo.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/**
 * `verify()` do otplib pode lançar em vez de retornar `false` quando o
 * token não tem o formato esperado (ex.: um código de backup com hífen, de
 * tamanho diferente de 6 dígitos) — aqui isso só significa "não é um TOTP
 * válido", não um erro de verdade.
 */
function verificarTotpSemLancar(secret: string, token: string): boolean {
  try {
    return authenticator.verify({ token, secret });
  } catch {
    return false;
  }
}

@Injectable()
export class TwoFactorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async gerarSetup(
    usuarioId: string,
  ): Promise<{ otpauthUri: string; qrCodeDataUrl: string }> {
    const usuario = await this.prisma.usuario.findUniqueOrThrow({
      where: { id: usuarioId },
    });

    const secret = authenticator.generateSecret();
    await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: { totpSecret: criptografar(secret) },
    });

    const otpauthUri = authenticator.keyuri(
      usuario.email,
      EMISSOR_TOTP,
      secret,
    );
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUri);

    return { otpauthUri, qrCodeDataUrl };
  }

  async confirmarAtivacao(
    usuarioId: string,
    codigo: string,
  ): Promise<{ backupCodes: string[] }> {
    const usuario = await this.prisma.usuario.findUniqueOrThrow({
      where: { id: usuarioId },
    });

    if (!usuario.totpSecret) {
      throw new ConflictException(
        'Nenhuma configuração de 2FA pendente para este usuário',
      );
    }

    const secret = descriptografar(usuario.totpSecret);
    const valido = verificarTotpSemLancar(secret, codigo);

    if (!valido) {
      throw new UnauthorizedException('Código de verificação inválido');
    }

    const backupCodes = Array.from(
      { length: QUANTIDADE_CODIGOS_BACKUP },
      gerarCodigoBackup,
    );

    await this.prisma.$transaction([
      this.prisma.codigoBackupDoisFatores.deleteMany({
        where: { usuarioId },
      }),
      this.prisma.codigoBackupDoisFatores.createMany({
        data: backupCodes.map((codigoBackup) => ({
          usuarioId,
          codigoHash: hashToken(normalizarCodigoBackup(codigoBackup)),
        })),
      }),
      this.prisma.usuario.update({
        where: { id: usuarioId },
        data: { doisFatoresAtivo: true },
      }),
    ]);

    return { backupCodes };
  }

  async verificarCodigo(usuarioId: string, codigo: string): Promise<void> {
    const usuario = await this.prisma.usuario.findUniqueOrThrow({
      where: { id: usuarioId },
    });

    if (!usuario.doisFatoresAtivo || !usuario.totpSecret) {
      throw new ConflictException('2FA não está ativo para este usuário');
    }

    const secret = descriptografar(usuario.totpSecret);
    if (verificarTotpSemLancar(secret, codigo)) {
      return;
    }

    const codigoHash = hashToken(normalizarCodigoBackup(codigo));
    const backupCode = await this.prisma.codigoBackupDoisFatores.findFirst({
      where: { usuarioId, codigoHash, usadoEm: null },
    });

    if (!backupCode) {
      throw new UnauthorizedException('Código de verificação inválido');
    }

    await this.prisma.codigoBackupDoisFatores.update({
      where: { id: backupCode.id },
      data: { usadoEm: new Date() },
    });
  }

  async desativar(usuarioId: string, senha: string): Promise<void> {
    const usuario = await this.prisma.usuario.findUniqueOrThrow({
      where: { id: usuarioId },
    });

    if (!usuario.senhaHash) {
      throw new ConflictException(
        'Defina uma senha para esta conta antes de desativar o 2FA',
      );
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
    if (!senhaValida) {
      throw new UnauthorizedException('Senha incorreta');
    }

    await this.prisma.$transaction([
      this.prisma.codigoBackupDoisFatores.deleteMany({
        where: { usuarioId },
      }),
      this.prisma.usuario.update({
        where: { id: usuarioId },
        data: { doisFatoresAtivo: false, totpSecret: null },
      }),
    ]);

    await this.refreshTokenService.revogarTodosDoUsuario(usuarioId);
  }
}
