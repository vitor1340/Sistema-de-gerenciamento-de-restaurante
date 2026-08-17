import { HelpCircle } from 'lucide-react';

export function HelpCard() {
  return (
    <div className="rounded-xl bg-[#11131a] p-4 text-white">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
        <HelpCircle size={16} />
      </div>
      <p className="text-sm font-semibold">Precisa de ajuda?</p>
      <p className="mb-3 text-xs text-white/60">Fale com nosso suporte</p>
      <button className="text-xs font-semibold text-brand hover:underline">
        Chamar suporte
      </button>
    </div>
  );
}
