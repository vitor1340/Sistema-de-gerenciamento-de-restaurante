import type { Metadata } from 'next';
import { PricingSection } from '@/components/pricing/PricingSection';

export const metadata: Metadata = {
  title: 'Planos | Comandaí',
};

export default function PlanosPage() {
  return <PricingSection />;
}
