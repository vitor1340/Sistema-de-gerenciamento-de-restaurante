import { Logo } from './Logo';

export function AuthBrandHeader() {
  return (
    <div className="mb-8 flex items-center gap-2">
      <Logo className="h-9 w-9" />
      <div>
        <p className="text-base font-bold leading-tight text-ink-primary">Comandaí</p>
        <p className="text-xs text-ink-muted">Parceiros</p>
      </div>
    </div>
  );
}
