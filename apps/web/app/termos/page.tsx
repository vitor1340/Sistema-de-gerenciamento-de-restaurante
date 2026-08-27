import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthBrandHeader } from '@/components/shared/AuthBrandHeader';

export const metadata: Metadata = {
  title: 'Termos de Uso | Comandaí',
};

export default function TermosDeUsoPage() {
  return (
    <main className="flex min-h-screen justify-center bg-page px-4 py-12">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <AuthBrandHeader />

        <h1 className="mb-1 text-2xl font-bold text-ink-primary">Termos de Uso</h1>
        <p className="mb-8 text-sm text-ink-secondary">Última atualização: [DATA]</p>

        <div className="space-y-8 text-sm leading-relaxed text-ink-secondary">
          <section>
            <p>
              Estes Termos de Uso regulam o acesso e uso da plataforma <strong>Comandaí</strong>,
              operada por <strong>[RAZÃO SOCIAL]</strong>, inscrita no CNPJ sob o nº{' '}
              <strong>[CNPJ]</strong> (&quot;Comandaí&quot;, &quot;nós&quot;). Ao criar uma conta ou
              usar a plataforma, você concorda com estes termos.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-ink-primary">1. Descrição do serviço</h2>
            <p>
              O Comandaí é uma plataforma de gestão de restaurantes que oferece cardápio digital,
              loja pública para recebimento de pedidos, acompanhamento de pedidos, painel
              administrativo com métricas e, opcionalmente, recebimento de pagamentos online via
              integração com o Mercado Pago.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-ink-primary">2. Cadastro e conta</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>Para usar o painel administrativo, o restaurante (&quot;Parceiro&quot;) deve criar uma conta com informações verdadeiras e atualizadas;</li>
              <li>O Parceiro é responsável por manter a confidencialidade de sua senha e, quando ativada, pelos códigos de acesso da autenticação de dois fatores;</li>
              <li>O Parceiro é responsável por toda atividade realizada em sua conta, incluindo ações de membros de sua equipe com acesso ao painel;</li>
              <li>O Comandaí pode suspender ou encerrar contas que violem estes termos ou a legislação aplicável.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-ink-primary">3. Loja pública e pedidos</h2>
            <p className="mb-2">
              Cada Parceiro tem uma loja pública com um cardápio digital, acessível por um link
              próprio, onde Clientes finais podem montar pedidos. O Comandaí atua apenas como
              provedor de tecnologia: a relação de compra e venda dos produtos (comida, bebida etc.)
              é exclusivamente entre o Cliente e o Parceiro (o restaurante).
            </p>
            <p>
              O Comandaí não se responsabiliza pela qualidade dos produtos, pelo cumprimento de
              prazos de entrega, nem por disputas entre Cliente e Parceiro relativas ao pedido em
              si.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-ink-primary">4. Pagamentos online</h2>
            <p className="mb-2">
              Quando o Parceiro conecta uma conta do Mercado Pago, os Clientes podem pagar pedidos
              diretamente pela loja pública, via Pix ou cartão. Nesses casos:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>O processamento do pagamento é feito integralmente pelo Mercado Pago, sujeito aos termos e políticas dessa empresa;</li>
              <li>O valor pago pelo Cliente é transferido diretamente para a conta Mercado Pago do Parceiro — o Comandaí não retém, custodia nem intermedeia financeiramente esses valores;</li>
              <li>Eventuais estornos, disputas de pagamento ou chargebacks são tratados diretamente entre Cliente, Parceiro e Mercado Pago.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-ink-primary">5. Planos e cobrança</h2>
            <p>
              O Comandaí pode oferecer diferentes planos de uso da plataforma, gratuitos ou pagos,
              com funcionalidades específicas para cada um. As condições comerciais vigentes de cada
              plano são apresentadas ao Parceiro no momento da contratação ou alteração de plano.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-ink-primary">6. Propriedade intelectual</h2>
            <p>
              A marca Comandaí, o software da plataforma e seus elementos visuais são de propriedade
              de <strong>[RAZÃO SOCIAL]</strong> ou licenciados a ela. O conteúdo inserido pelo
              Parceiro (nome do restaurante, cardápio, fotos, textos) permanece de propriedade do
              Parceiro, que concede ao Comandaí uma licença para exibi-lo na loja pública com a
              finalidade de operar o serviço.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-ink-primary">7. Limitação de responsabilidade</h2>
            <p>
              O Comandaí é fornecido &quot;como está&quot;. Na máxima extensão permitida por lei,
              não nos responsabilizamos por lucros cessantes, indisponibilidade temporária do
              serviço, ou danos indiretos decorrentes do uso da plataforma, ressalvados os casos de
              dolo ou culpa grave.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-ink-primary">8. Cancelamento</h2>
            <p>
              O Parceiro pode encerrar sua conta a qualquer momento, mediante solicitação pelo
              contato indicado abaixo. O Comandaí pode encerrar ou suspender contas em caso de
              violação destes termos, uso fraudulento ou inatividade prolongada, mediante aviso
              prévio quando possível.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-ink-primary">9. Alterações destes termos</h2>
            <p>
              Podemos atualizar estes Termos de Uso periodicamente. O uso continuado da plataforma
              após uma alteração publicada constitui aceite dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-ink-primary">10. Legislação aplicável e foro</h2>
            <p>
              Estes termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o
              foro da comarca de <strong>[CIDADE/UF]</strong> para dirimir eventuais controvérsias,
              com renúncia a qualquer outro, por mais privilegiado que seja.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-ink-primary">11. Contato</h2>
            <p>
              Dúvidas sobre estes Termos de Uso podem ser enviadas para{' '}
              <strong>[E-MAIL DE CONTATO]</strong>.
            </p>
          </section>
        </div>

        <p className="mt-8 text-center text-sm text-ink-secondary">
          <Link href="/" className="font-semibold text-brand hover:underline">
            Voltar ao início
          </Link>
        </p>
      </div>
    </main>
  );
}
