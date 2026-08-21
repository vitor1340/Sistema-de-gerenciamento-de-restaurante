import { Anton, Karla, Space_Mono } from 'next/font/google';

const anton = Anton({
  variable: '--font-loja-display',
  weight: '400',
  subsets: ['latin'],
});

const spaceMono = Space_Mono({
  variable: '--font-loja-mono',
  weight: ['400', '700'],
  subsets: ['latin'],
});

const karla = Karla({
  variable: '--font-loja-body',
  weight: ['400', '500', '700', '800'],
  subsets: ['latin'],
});

export default function LojaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${anton.variable} ${spaceMono.variable} ${karla.variable}`}>{children}</div>
  );
}
