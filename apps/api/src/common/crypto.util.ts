import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { exigirVariavelAmbiente } from './env.util';

const ALGORITMO = 'aes-256-gcm';
const TAMANHO_IV = 12;

function obterChave(): Buffer {
  return Buffer.from(exigirVariavelAmbiente('TOKEN_ENCRYPTION_KEY'), 'hex');
}

export function criptografar(texto: string): string {
  const iv = randomBytes(TAMANHO_IV);
  const cifra = createCipheriv(ALGORITMO, obterChave(), iv);
  const cifrado = Buffer.concat([cifra.update(texto, 'utf8'), cifra.final()]);
  const tagAutenticacao = cifra.getAuthTag();

  return [
    iv.toString('base64'),
    tagAutenticacao.toString('base64'),
    cifrado.toString('base64'),
  ].join(':');
}

export function descriptografar(valorCriptografado: string): string {
  const [ivBase64, tagBase64, cifradoBase64] = valorCriptografado.split(':');
  const decifra = createDecipheriv(
    ALGORITMO,
    obterChave(),
    Buffer.from(ivBase64, 'base64'),
  );
  decifra.setAuthTag(Buffer.from(tagBase64, 'base64'));

  const decifrado = Buffer.concat([
    decifra.update(Buffer.from(cifradoBase64, 'base64')),
    decifra.final(),
  ]);
  return decifrado.toString('utf8');
}
