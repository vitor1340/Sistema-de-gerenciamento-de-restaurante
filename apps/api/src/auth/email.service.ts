import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { exigirVariavelAmbiente } from '../common/env.util';

@Injectable()
export class EmailService {
  private readonly resend = new Resend(
    exigirVariavelAmbiente('RESEND_API_KEY'),
  );
  private readonly remetente = exigirVariavelAmbiente('RESEND_FROM_EMAIL');

  async enviarEmailRedefinicaoSenha(
    destinatario: string,
    link: string,
  ): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: this.remetente,
      to: destinatario,
      subject: 'Redefinição de senha - Comandaí',
      text: [
        'Recebemos uma solicitação para redefinir sua senha.',
        '',
        `Clique no link abaixo (válido por 30 minutos):`,
        link,
        '',
        'Se você não pediu isso, pode ignorar este e-mail.',
      ].join('\n'),
    });

    if (error) {
      throw new Error(
        `Falha ao enviar e-mail via Resend: ${error.name} - ${error.message}`,
      );
    }
  }
}
