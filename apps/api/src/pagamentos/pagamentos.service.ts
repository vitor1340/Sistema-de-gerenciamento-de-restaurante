import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Cron, CronExpression } from '@nestjs/schedule';
import { StatusPagamento, StatusPedido } from '../../generated/prisma/client';
import { criptografar, descriptografar } from '../common/crypto.util';
import { exigirVariavelAmbiente } from '../common/env.util';
import { PedidosService } from '../pedidos/pedidos.service';
import { PrismaService } from '../prisma/prisma.service';
import { MercadoPagoClient } from './mercado-pago.client';

interface EstadoConexaoMercadoPago {
  restauranteId: string;
}

function mapearStatusMercadoPago(status: string | undefined): StatusPagamento {
  switch (status) {
    case 'approved':
      return StatusPagamento.APROVADO;
    case 'rejected':
      return StatusPagamento.RECUSADO;
    case 'cancelled':
    case 'refunded':
    case 'charged_back':
      return StatusPagamento.CANCELADO;
    default:
      return StatusPagamento.PENDENTE;
  }
}

@Injectable()
export class PagamentosService {
  private readonly logger = new Logger(PagamentosService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mercadoPago: MercadoPagoClient,
    private readonly pedidosService: PedidosService,
  ) {}

  private urlCallback(): string {
    return `${exigirVariavelAmbiente('URL_PUBLICA_API')}/pagamentos/callback`;
  }

  async gerarLinkConexao(restauranteId: string): Promise<string> {
    const state = await this.jwtService.signAsync(
      { restauranteId } satisfies EstadoConexaoMercadoPago,
      { expiresIn: '5m' },
    );
    return this.mercadoPago.gerarUrlAutorizacao(state, this.urlCallback());
  }

  async tratarCallback(code: string, state: string): Promise<void> {
    let payload: EstadoConexaoMercadoPago;
    try {
      payload =
        await this.jwtService.verifyAsync<EstadoConexaoMercadoPago>(state);
    } catch {
      throw new UnauthorizedException(
        'Estado de conexão com o Mercado Pago inválido ou expirado',
      );
    }

    const resultado = await this.mercadoPago.trocarCodigoPorToken(
      code,
      this.urlCallback(),
    );

    await this.prisma.restaurante.update({
      where: { id: payload.restauranteId },
      data: {
        mercadoPagoAccessToken: criptografar(resultado.accessToken),
        mercadoPagoRefreshToken: criptografar(resultado.refreshToken),
        mercadoPagoUserId: resultado.userId,
        mercadoPagoConectadoEm: new Date(),
        mercadoPagoTokenExpiraEm: new Date(
          Date.now() + resultado.expiraEmSegundos * 1000,
        ),
      },
    });
  }

  private static readonly DIAS_ANTECEDENCIA_RENOVACAO_TOKEN = 15;

  /**
   * Renova o access token de cada restaurante conectado antes que expire
   * (o Mercado Pago não avisa quando isso acontece — o pagamento simplesmente
   * passa a falhar). Roda todo dia; restaurantes sem `mercadoPagoTokenExpiraEm`
   * registrado (conectados antes dessa coluna existir) também são renovados.
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async renovarTokensProximosDoVencimento(): Promise<void> {
    const limite = new Date(
      Date.now() +
        PagamentosService.DIAS_ANTECEDENCIA_RENOVACAO_TOKEN *
          24 *
          60 *
          60 *
          1000,
    );

    const restaurantes = await this.prisma.restaurante.findMany({
      where: {
        mercadoPagoAccessToken: { not: null },
        OR: [
          { mercadoPagoTokenExpiraEm: null },
          { mercadoPagoTokenExpiraEm: { lte: limite } },
        ],
      },
    });

    for (const restaurante of restaurantes) {
      if (!restaurante.mercadoPagoRefreshToken) {
        continue;
      }

      try {
        const refreshToken = descriptografar(
          restaurante.mercadoPagoRefreshToken,
        );
        const resultado = await this.mercadoPago.renovarToken(refreshToken);

        await this.prisma.restaurante.update({
          where: { id: restaurante.id },
          data: {
            mercadoPagoAccessToken: criptografar(resultado.accessToken),
            mercadoPagoRefreshToken: criptografar(resultado.refreshToken),
            mercadoPagoTokenExpiraEm: new Date(
              Date.now() + resultado.expiraEmSegundos * 1000,
            ),
          },
        });
      } catch (erro) {
        this.logger.error(
          `Falha ao renovar token do Mercado Pago do restaurante ${restaurante.id}`,
          erro,
        );
      }
    }
  }

  async desconectar(restauranteId: string): Promise<void> {
    await this.prisma.restaurante.update({
      where: { id: restauranteId },
      data: {
        mercadoPagoAccessToken: null,
        mercadoPagoRefreshToken: null,
        mercadoPagoUserId: null,
        mercadoPagoConectadoEm: null,
        mercadoPagoTokenExpiraEm: null,
      },
    });
  }

  async criarPreferenciaParaPedido(
    slug: string,
    pedidoId: string,
  ): Promise<{ initPoint: string }> {
    const restaurante = await this.prisma.restaurante.findUnique({
      where: { slug },
    });
    if (!restaurante) {
      throw new NotFoundException('Loja não encontrada');
    }
    if (!restaurante.mercadoPagoAccessToken) {
      throw new ConflictException(
        'Esta loja ainda não conectou um meio de pagamento online',
      );
    }

    const pedido = await this.prisma.pedido.findFirst({
      where: { id: pedidoId, restauranteId: restaurante.id },
      include: { itens: { include: { produto: true } } },
    });
    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado');
    }

    const urlApi = exigirVariavelAmbiente('URL_PUBLICA_API');
    const urlFrontend = exigirVariavelAmbiente('CORS_ORIGIN');
    const backUrl = `${urlFrontend}/loja/${slug}/pedido/${pedido.id}`;

    const preferencia = await this.mercadoPago.criarPreferencia(
      descriptografar(restaurante.mercadoPagoAccessToken),
      {
        itens: pedido.itens.map((item) => ({
          produtoId: item.produtoId,
          nome: item.produto.nome,
          quantidade: item.quantidade,
          precoCentavos: item.precoUnitarioCentavos,
        })),
        pedidoId: pedido.id,
        notificationUrl: `${urlApi}/pagamentos/webhook?restauranteId=${restaurante.id}`,
        backUrl,
      },
    );

    await this.prisma.pagamento.upsert({
      where: { pedidoId: pedido.id },
      create: {
        pedidoId: pedido.id,
        preferenceId: preferencia.id,
        initPoint: preferencia.initPoint,
        valorCentavos: pedido.valorTotalCentavos,
      },
      update: {
        preferenceId: preferencia.id,
        initPoint: preferencia.initPoint,
        status: StatusPagamento.PENDENTE,
      },
    });

    return { initPoint: preferencia.initPoint };
  }

  async processarNotificacaoWebhook(params: {
    restauranteId: string | undefined;
    dataId: string | undefined;
    xSignature: string | undefined;
    xRequestId: string | undefined;
  }): Promise<void> {
    const { restauranteId, dataId, xSignature, xRequestId } = params;
    if (!restauranteId || !dataId) {
      throw new UnauthorizedException('Notificação de webhook incompleta');
    }

    const restaurante = await this.prisma.restaurante.findUnique({
      where: { id: restauranteId },
    });
    if (!restaurante?.mercadoPagoAccessToken) {
      this.logger.warn(
        `Webhook do Mercado Pago recebido para restaurante sem conexão ativa: ${restauranteId}`,
      );
      return;
    }

    const webhookSecret = exigirVariavelAmbiente('MERCADOPAGO_WEBHOOK_SECRET');
    this.mercadoPago.validarAssinaturaWebhook({
      xSignature,
      xRequestId,
      dataId,
      secret: webhookSecret,
    });

    const accessToken = descriptografar(restaurante.mercadoPagoAccessToken);
    const pagamentoMp = await this.mercadoPago.buscarPagamento(
      accessToken,
      dataId,
    );

    const pedidoId = pagamentoMp.externalReference;
    if (!pedidoId) {
      return;
    }

    const pagamento = await this.prisma.pagamento.findFirst({
      where: { pedidoId, pedido: { restauranteId } },
    });
    if (!pagamento) {
      return;
    }

    const novoStatus = mapearStatusMercadoPago(pagamentoMp.status);

    await this.prisma.pagamento.update({
      where: { pedidoId },
      data: {
        mercadoPagoPaymentId: dataId,
        status: novoStatus,
        metodoPagamento: pagamentoMp.metodoPagamento,
      },
    });

    if (novoStatus === StatusPagamento.APROVADO) {
      const pedido = await this.prisma.pedido.findUnique({
        where: { id: pedidoId },
      });
      if (pedido?.status === StatusPedido.NOVO) {
        await this.pedidosService.atualizarStatus(
          restauranteId,
          pedidoId,
          StatusPedido.CONFIRMADO,
        );
      }
    }
  }
}
