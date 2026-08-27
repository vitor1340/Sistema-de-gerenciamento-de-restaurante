/**
 * `AuthService.login()`/`loginOuRegistrarComGoogle()` retornam uma união com
 * `{ requiresTwoFactor: true; tempToken }` quando a conta tem 2FA ativo.
 * Nos specs que não testam 2FA, nenhuma conta criada tem 2FA ativo — este
 * helper só existe para satisfazer o TypeScript e falhar alto (em vez de dar
 * um erro de tipagem confuso) se essa suposição um dia deixar de ser válida.
 */
export function assertTokensCompletos<T>(
  resultado: T,
): asserts resultado is Exclude<T, { requiresTwoFactor: true }> {
  if (
    typeof resultado === 'object' &&
    resultado !== null &&
    'requiresTwoFactor' in resultado
  ) {
    throw new Error(
      'Esperava tokens completos, mas a conta exige verificação de 2FA',
    );
  }
}
