'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Mede a altura real do elemento referenciado (via ResizeObserver — nome de
 * categoria longo, fonte escalada por acessibilidade, ou o conteúdo do
 * header mudando de altura no responsivo tudo isso muda o valor real, então
 * não dá pra cravar um número fixo). Escreve o resultado numa CSS custom
 * property em `document.documentElement` (consumida por `scroll-margin-top`
 * e pelo `sticky top` de outros elementos) e também retorna o número, pra
 * cálculos em JS (ex.: rootMargin de um IntersectionObserver).
 */
export function useAlturaMedida(cssVarName: string) {
  const ref = useRef<HTMLElement>(null);
  const [altura, setAltura] = useState(0);

  useEffect(() => {
    const elemento = ref.current;
    if (!elemento) return;

    const observer = new ResizeObserver(([entry]) => {
      const novaAltura = Math.round(entry.contentRect.height);
      setAltura(novaAltura);
      document.documentElement.style.setProperty(cssVarName, `${novaAltura}px`);
    });
    observer.observe(elemento);

    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty(cssVarName);
    };
  }, [cssVarName]);

  return { ref, altura };
}
