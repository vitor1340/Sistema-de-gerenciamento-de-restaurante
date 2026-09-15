import { Suspense } from 'react';
import { Logo } from '@/components/shared/Logo';
import { testeGratis, funcionalidades } from '@/lib/pricing-data';
import { PricingCard } from './PricingCard';
import { PlanoProCard } from './PlanoProCard';
import { FeatureListItem } from './FeatureListItem';
import { ExpiredNotice } from './ExpiredNotice';

export function PricingSection() {
  return (
    <div className="pricing-page min-h-screen bg-(--pp-bg) px-4 py-16">
      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        <div className="mb-6 flex items-center gap-2.5">
          <Logo className="h-10 w-10" />
          <span className="text-xl font-bold text-(--pp-ink)">Comandaí</span>
        </div>

        <span className="mb-4 rounded-full bg-terracotta/10 px-3 py-1 text-xs font-semibold text-terracotta">
          Planos
        </span>
        <h1 className="max-w-xl text-3xl font-extrabold tracking-tight text-(--pp-ink) md:text-4xl">
          Comece grátis, continue no seu ritmo
        </h1>
        <p className="mt-3 max-w-md text-(--pp-ink)/70">
          7 dias de teste completo, depois um único plano Pro que escala com o volume de pedidos.
        </p>
      </div>

      <Suspense fallback={null}>
        <ExpiredNotice />
      </Suspense>

      <div className="mx-auto mt-4 grid max-w-4xl grid-cols-1 items-stretch gap-6 md:grid-cols-2">
        <PricingCard
          titulo="Teste grátis"
          descricao={testeGratis.descricao}
          preco={testeGratis.preco}
          nota={testeGratis.nota}
          features={testeGratis.features}
          ctaLabel={testeGratis.cta}
          ctaHref="/registrar"
          ctaVariante="contorno"
        />
        <PlanoProCard />
      </div>

      <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-(--pp-ink)/60">
        As taxas de pagamento online dos pedidos dos seus clientes seguem as tarifas do Mercado
        Pago, cobradas direto na conta do restaurante — isso é diferente da assinatura do
        Comandaí em si.
      </p>

      <div className="mx-auto mt-14 max-w-4xl rounded-2xl border border-(--pp-ink)/10 bg-white p-8">
        <h2 className="mb-6 text-center text-xl font-bold text-(--pp-ink)">
          Tudo o que o Comandaí oferece
        </h2>
        <ul className="grid grid-cols-1 gap-x-8 gap-y-3 md:grid-cols-2">
          {funcionalidades.map((texto) => (
            <FeatureListItem key={texto} texto={texto} variante="circular" />
          ))}
        </ul>
      </div>
    </div>
  );
}
