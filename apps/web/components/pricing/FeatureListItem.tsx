import { Check, CheckCircle2 } from 'lucide-react';

interface FeatureListItemProps {
  texto: string;
  variante?: 'simples' | 'circular';
}

export function FeatureListItem({ texto, variante = 'simples' }: FeatureListItemProps) {
  const Icone = variante === 'circular' ? CheckCircle2 : Check;

  return (
    <li className="flex items-start gap-2.5 text-sm text-(--pp-ink)/80">
      <Icone aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
      <span>{texto}</span>
    </li>
  );
}
