export function EmBreve({ titulo }: { titulo: string }) {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center rounded-2xl border border-dashed border-border text-center">
      <p className="text-lg font-semibold text-ink-primary">{titulo}</p>
      <p className="mt-1 text-sm text-ink-secondary">Essa área ainda está em construção.</p>
    </div>
  );
}
