const DIACRITICOS = /[̀-ͯ]/g;

export function slugify(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(DIACRITICOS, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function gerarSlugUnico(
  base: string,
  slugExiste: (slug: string) => Promise<boolean>,
): Promise<string> {
  const slugBase = slugify(base) || 'restaurante';
  let slug = slugBase;
  let sufixo = 2;

  while (await slugExiste(slug)) {
    slug = `${slugBase}-${sufixo}`;
    sufixo += 1;
  }

  return slug;
}
