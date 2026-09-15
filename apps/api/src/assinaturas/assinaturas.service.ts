import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  CargoUsuario,
  FaixaAssinatura,
  Prisma,
  StatusAssinatura,
} from '../../generated/prisma/client';
import { exigirVariavelAmbiente } from '../common/env.util';
import { MercadoPagoClient } from '../pagamentos/mercado-pago.client';
import { PrismaService } from '../prisma/prisma.service';
import {
  calcularStatusPlano,
  StatusPlanoCalculado,
} from '../restaurantes/plan-status.util';
import {
  NOME_FAIXA_ASSINATURA,
  PRECO_CENTAVOS_POR_FAIXA,
} from './faixa-assinatura.util';

export interface AssinaturaAtual {
  temAssinatura: boolean;
  faixaAssinatura: FaixaAssinatura | null;
  statusAssinatura: StatusPlanoCalculado;
  precoCentavos: number | null;
}

function mapearStatusAssinaturaMercadoPago(
  status: string | undefined,
): StatusAssinatura | null {
  switch (status) {
    case 'authorized':
      return StatusAssinatura.ACTIVE;
    case 'paused':
      return StatusAssinatura.PAST_DUE;
    case 'cancelled':
      return StatusAssinatura.CANCELED;
    default:
      // 'pending' (aguardando autorização) e outros estados transitórios
      // não mudam o status do restaurante — só authorized/paused/cancelled
      // representam uma decisão definitiva do pagador.
      return null;
  }
}

@Injectable()
export class AssinaturasService {
  private readonly logger = new Logger(AssinaturasService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mercadoPago: MercadoPagoClient,
  ) {}

  async assinaturaAtual(restauranteId: string): Promise<AssinaturaAtual> {
    const restaurante = await this.prisma.restaurante.findUniqueOrThrow({
      where: { id: restauranteId },
      select: {
        statusAssinatura: true,
        trialEndsAt: true,
        faixaAssinatura: true,
        mercadoPagoPreapprovalId: true,
      },
    });

    return {
      temAssinatura: Boolean(restaurante.mercadoPagoPreapprovalId),
      faixaAssinatura: restaurante.faixaAssinatura,
      statusAssinatura: calcularStatusPlano(restaurante),
      precoCentavos: restaurante.faixaAssinatura
        ? PRECO_CENTAVOS_POR_FAIXA[restaurante.faixaAssinatura]
        : null,
    };
  }

  async iniciarAssinatura(
    restauranteId: string,
    faixa: FaixaAssinatura,
  ): Promise<{ initPoint: string }> {
    const restaurante = await this.prisma.restaurante.findUniqueOrThrow({
      where: { id: restauranteId },
    });

    if (
      restaurante.mercadoPagoPreapprovalId &&
      (restaurante.statusAssinatura === StatusAssinatura.ACTIVE ||
        restaurante.statusAssinatura === StatusAssinatura.PAST_DUE)
    ) {
      throw new ConflictException(
        'Este restaurante já tem uma assinatura em andamento. Use a troca de faixa para mudar o valor.',
      );
    }

    const dono = await this.prisma.usuario.findFirst({
      where: { restauranteId, cargo: CargoUsuario.DONO },
      orderBy: { createdAt: 'asc' },
    });
    if (!dono) {
      throw new NotFoundException(
        'Nenhum usuário dono encontrado para este restaurante',
      );
    }

    const urlFrontend = exigirVariavelAmbiente('CORS_ORIGIN');
    const resultado = await this.mercadoPago.criarAssinatura({
      precoCentavos: PRECO_CENTAVOS_POR_FAIXA[faixa],
      payerEmail: dono.email,
      reason: `Comandaí Pro — ${NOME_FAIXA_ASSINATURA[faixa]}`,
      externalReference: restauranteId,
      backUrl: `${urlFrontend}/planos/retorno`,
    });

    await this.prisma.restaurante.update({
      where: { id: restauranteId },
      data: {
        mercadoPagoPreapprovalId: resultado.id,
        faixaAssinatura: faixa,
      },
    });

    return { initPoint: resultado.initPoint };
  }

  async trocarFaixa(
    restauranteId: string,
    faixa: FaixaAssinatura,
  ): Promise<AssinaturaAtual> {
    const restaurante = await this.prisma.restaurante.findUniqueOrThrow({
      where: { id: restauranteId },
    });
    if (!restaurante.mercadoPagoPreapprovalId) {
      throw new ConflictException(
        'Este restaurante ainda não tem uma assinatura para trocar de faixa',
      );
    }

    await this.mercadoPago.atualizarValorAssinatura(
      restaurante.mercadoPagoPreapprovalId,
      PRECO_CENTAVOS_POR_FAIXA[faixa],
    );

    await this.prisma.restaurante.update({
      where: { id: restauranteId },
      data: { faixaAssinatura: faixa },
    });

    return this.assinaturaAtual(restauranteId);
  }

  async cancelarAssinatura(restauranteId: string): Promise<void> {
    const restaurante = await this.prisma.restaurante.findUniqueOrThrow({
      where: { id: restauranteId },
    });
    if (!restaurante.mercadoPagoPreapprovalId) {
      throw new ConflictException(
        'Este restaurante não tem uma assinatura ativa para cancelar',
      );
    }

    await this.mercadoPago.cancelarAssinatura(
      restaurante.mercadoPagoPreapprovalId,
    );

    await this.prisma.restaurante.update({
      where: { id: restauranteId },
      data: { statusAssinatura: StatusAssinatura.CANCELED },
    });
  }

  async processarWebhookAssinatura(params: {
    dataId: string | undefined;
    xSignature: string | undefined;
    xRequestId: string | undefined;
  }): Promise<void> {
    const { dataId, xSignature, xRequestId } = params;
    if (!dataId) {
      throw new UnauthorizedException('Notificação de webhook incompleta');
    }

    const webhookSecret = exigirVariavelAmbiente('MERCADOPAGO_WEBHOOK_SECRET');
    this.mercadoPago.validarAssinaturaWebhook({
      xSignature,
      xRequestId,
      dataId,
      secret: webhookSecret,
    });

    // Nunca confia no payload da notificação pra mudar estado — busca o
    // recurso autoritativo direto na API antes de gravar qualquer coisa.
    // Isso também torna o handler idempotente por construção: reenviar a
    // mesma notificação (o Mercado Pago faz isso) só regrava o mesmo estado.
    const assinaturaMp = await this.mercadoPago.buscarAssinatura(dataId);

    const restaurante = await this.prisma.restaurante.findFirst({
      where: { mercadoPagoPreapprovalId: dataId },
    });
    if (!restaurante) {
      this.logger.warn(
        `Webhook de assinatura recebido para preapproval desconhecido: ${dataId}`,
      );
      return;
    }

    if (
      assinaturaMp.externalReference &&
      assinaturaMp.externalReference !== restaurante.id
    ) {
      this.logger.warn(
        `external_reference do preapproval ${dataId} (${assinaturaMp.externalReference}) diverge do restaurante encontrado (${restaurante.id})`,
      );
    }

    await this.prisma.eventoAssinatura.create({
      data: {
        restauranteId: restaurante.id,
        tipo: assinaturaMp.status ?? 'desconhecido',
        payloadBruto: assinaturaMp.bruto as Prisma.InputJsonValue,
      },
    });

    const novoStatus = mapearStatusAssinaturaMercadoPago(assinaturaMp.status);
    if (novoStatus) {
      await this.prisma.restaurante.update({
        where: { id: restaurante.id },
        data: { statusAssinatura: novoStatus },
      });
    }
  }
}
