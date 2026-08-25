import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  InvalidWebhookSignatureError,
  MercadoPagoConfig,
  OAuth,
  Payment,
  Preference,
  WebhookSignatureValidator,
} from 'mercadopago';
import { exigirVariavelAmbiente } from '../common/env.util';

interface TrocaTokenResultado {
  accessToken: string;
  refreshToken: string;
  userId: string;
}

interface PagamentoMercadoPago {
  status: string | undefined;
  externalReference: string | undefined;
  metodoPagamento: string | undefined;
}

interface CriarPreferenciaInput {
  itens: {
    produtoId: string;
    nome: string;
    quantidade: number;
    precoCentavos: number;
  }[];
  pedidoId: string;
  notificationUrl: string;
  backUrl: string;
}

interface PreferenciaCriada {
  id: string;
  initPoint: string;
}

@Injectable()
export class MercadoPagoClient {
  private readonly clientId = exigirVariavelAmbiente('MERCADOPAGO_CLIENT_ID');
  private readonly clientSecret = exigirVariavelAmbiente(
    'MERCADOPAGO_CLIENT_SECRET',
  );
  private readonly accessTokenPlataforma = exigirVariavelAmbiente(
    'MERCADOPAGO_ACCESS_TOKEN',
  );

  private clienteConfig(accessToken: string): MercadoPagoConfig {
    return new MercadoPagoConfig({ accessToken });
  }

  gerarUrlAutorizacao(state: string, redirectUri: string): string {
    const oauth = new OAuth(this.clienteConfig(this.accessTokenPlataforma));
    return oauth.getAuthorizationURL({
      options: { client_id: this.clientId, state, redirect_uri: redirectUri },
    });
  }

  async trocarCodigoPorToken(
    code: string,
    redirectUri: string,
  ): Promise<TrocaTokenResultado> {
    const oauth = new OAuth(this.clienteConfig(this.accessTokenPlataforma));
    const resultado = await oauth.create({
      body: {
        client_secret: this.clientSecret,
        client_id: this.clientId,
        code,
        redirect_uri: redirectUri,
      },
    });

    if (!resultado.access_token || !resultado.refresh_token) {
      throw new Error(
        'Resposta inesperada do Mercado Pago ao trocar o código de autorização',
      );
    }

    return {
      accessToken: resultado.access_token,
      refreshToken: resultado.refresh_token,
      userId: String(resultado.user_id ?? ''),
    };
  }

  async criarPreferencia(
    accessTokenVendedor: string,
    input: CriarPreferenciaInput,
  ): Promise<PreferenciaCriada> {
    const preference = new Preference(this.clienteConfig(accessTokenVendedor));
    const resultado = await preference.create({
      body: {
        items: input.itens.map((item) => ({
          id: item.produtoId,
          title: item.nome,
          quantity: item.quantidade,
          unit_price: item.precoCentavos / 100,
        })),
        external_reference: input.pedidoId,
        notification_url: input.notificationUrl,
        back_urls: {
          success: input.backUrl,
          pending: input.backUrl,
          failure: input.backUrl,
        },
        auto_return: 'approved',
      },
    });

    if (!resultado.id || !resultado.init_point) {
      throw new Error(
        'Resposta inesperada do Mercado Pago ao criar a preferência de pagamento',
      );
    }

    return { id: resultado.id, initPoint: resultado.init_point };
  }

  async buscarPagamento(
    accessTokenVendedor: string,
    paymentId: string,
  ): Promise<PagamentoMercadoPago> {
    const payment = new Payment(this.clienteConfig(accessTokenVendedor));
    const resultado = await payment.get({ id: paymentId });

    return {
      status: resultado.status,
      externalReference: resultado.external_reference,
      metodoPagamento: resultado.payment_method_id,
    };
  }

  validarAssinaturaWebhook(params: {
    xSignature: string | undefined;
    xRequestId: string | undefined;
    dataId: string | undefined;
    secret: string;
  }): void {
    try {
      WebhookSignatureValidator.validate({
        xSignature: params.xSignature,
        xRequestId: params.xRequestId,
        dataId: params.dataId,
        secret: params.secret,
        toleranceSeconds: 300,
      });
    } catch (erro) {
      if (erro instanceof InvalidWebhookSignatureError) {
        throw new UnauthorizedException('Assinatura de webhook inválida');
      }
      throw erro;
    }
  }
}
