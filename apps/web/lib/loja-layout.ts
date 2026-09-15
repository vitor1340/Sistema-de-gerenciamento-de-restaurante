// Pilha de z-index da loja pública, centralizada — header, chips, botão do
// carrinho, drawer e o overlay do menu mobile disputam a mesma pilha visual.
// Ordem: chips < header (chips ficam ancorados abaixo dele, nunca por cima)
// < botão fixo do carrinho < drawer < menu mobile (o mais "modal" de todos).
export const Z_INDEX_LOJA = {
  chips: 10,
  header: 20,
  carrinhoBotao: 30,
  drawer: 40,
  menuMobile: 45,
} as const;
