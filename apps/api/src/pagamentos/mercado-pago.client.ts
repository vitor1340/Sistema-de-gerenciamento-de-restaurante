import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  InvalidWebhookSignatureError,
  MercadoPagoConfig,
  OAuth,
  Payment,
  PreApproval,
  Preference,
  WebhookSignatureValidator,
} from 'mercadopago';
import { exigirVariavelAmbiente } from '../common/env.util';

interface TrocaTokenResultado {
  accessToken: string;
  refreshToken: string;
  userId: string;
  expiraEmSegundos: number;
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

interface CriarAssinaturaInput {
  precoCentavos: number;
  payerEmail: string;
  reason: string;
  externalReference: string;
  backUrl: string;
}

interface AssinaturaCriada {
  id: string;
  initPoint: string;
}

interface AssinaturaMercadoPago {
  status: string | undefined;
  externalReference: string | undefined;
  transactionAmount: number | undefined;
  bruto: unknown;
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

    if (
      !resultado.access_token ||
      !resultado.refresh_token ||
      !resultado.expires_in
    ) {
      throw new Error(
        'Resposta inesperada do Mercado Pago ao trocar o código de autorização',
      );
    }

    return {
      accessToken: resultado.access_token,
      refreshToken: resultado.refresh_token,
      userId: String(resultado.user_id ?? ''),
      expiraEmSegundos: resultado.expires_in,
    };
  }

  async renovarToken(refreshToken: string): Promise<TrocaTokenResultado> {
    const oauth = new OAuth(this.clienteConfig(this.accessTokenPlataforma));
    const resultado = await oauth.refresh({
      body: {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
      },
    });

    if (
      !resultado.access_token ||
      !resultado.refresh_token ||
      !resultado.expires_in
    ) {
      throw new Error(
        'Resposta inesperada do Mercado Pago ao renovar o token de acesso',
      );
    }

    return {
      accessToken: resultado.access_token,
      refreshToken: resultado.refresh_token,
      userId: String(resultado.user_id ?? ''),
      expiraEmSegundos: resultado.expires_in,
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

  /**
   * Assinatura da própria plataforma Comandaí (o restaurante pagando pelo
   * uso do app) — sempre cobrada com `accessTokenPlataforma`, nunca com o
   * token OAuth do restaurante (esse é só pra ele RECEBER pagamento dos
   * próprios pedidos). Sem `preapproval_plan_id`: o valor é definido direto
   * na criação, sem precisar cadastrar planos no painel do Mercado Pago.
   */
  async criarAssinatura(
    input: CriarAssinaturaInput,
  ): Promise<AssinaturaCriada> {
    const preApproval = new PreApproval(
      this.clienteConfig(this.accessTokenPlataforma),
    );
    const resultado = await preApproval.create({
      body: {
        reason: input.reason,
        external_reference: input.externalReference,
        payer_email: input.payerEmail,
        back_url: input.backUrl,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: input.precoCentavos / 100,
          currency_id: 'BRL',
        },
      },
    });

    if (!resultado.id || !resultado.init_point) {
      throw new Error(
        'Resposta inesperada do Mercado Pago ao criar a assinatura',
      );
    }

    return { id: resultado.id, initPoint: resultado.init_point };
  }

  async buscarAssinatura(
    preapprovalId: string,
  ): Promise<AssinaturaMercadoPago> {
    const preApproval = new PreApproval(
      this.clienteConfig(this.accessTokenPlataforma),
    );
    const resultado = await preApproval.get({ id: preapprovalId });

    return {
      status: resultado.status,
      externalReference: resultado.external_reference,
      transactionAmount: resultado.auto_recurring?.transaction_amount,
      bruto: resultado,
    };
  }

  // Só valor/moeda podem mudar depois de criada — frequência é imutável na
  // API do Mercado Pago. Troca de faixa é isso: 1 PUT, sem cancelar/recriar.
  async atualizarValorAssinatura(
    preapprovalId: string,
    precoCentavos: number,
  ): Promise<void> {
    const preApproval = new PreApproval(
      this.clienteConfig(this.accessTokenPlataforma),
    );
    await preApproval.update({
      id: preapprovalId,
      body: {
        auto_recurring: {
          transaction_amount: precoCentavos / 100,
          currency_id: 'BRL',
        },
      },
    });
  }

  async cancelarAssinatura(preapprovalId: string): Promise<void> {
    const preApproval = new PreApproval(
      this.clienteConfig(this.accessTokenPlataforma),
    );
    await preApproval.update({
      id: preapprovalId,
      body: { status: 'cancelled' },
    });
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
