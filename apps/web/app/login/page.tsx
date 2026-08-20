'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { LoginResponseDTO } from '@comandai/shared-types';
import { setSessionCookie } from '@/lib/auth-cookie';
import { useAuthStore } from '@/store/auth-store';
import { SignInPage } from '@/components/ui/sign-in';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '');
    const senha = String(formData.get('password') ?? '');

    setCarregando(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      if (!response.ok) {
        setErro('E-mail ou senha inválidos.');
        return;
      }

      const data: LoginResponseDTO = await response.json();
      setSessionCookie(data.accessToken);
      setSession(data.usuario, data.accessToken);
      router.push('/dashboard');
      router.refresh();
    } catch {
      setErro('Não foi possível conectar ao servidor.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <SignInPage
      title={<span className="font-light text-foreground tracking-tighter">Bem-vindo de volta</span>}
      description="Acesse com o e-mail e senha do seu restaurante."
      heroImageSrc="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=2160&q=80"
      errorMessage={erro ?? undefined}
      isLoading={carregando}
      onSignIn={handleSignIn}
      onGoogleSignIn={() => alert('Login com Google em breve.')}
      onResetPassword={() => alert('Recuperação de senha em breve.')}
      onCreateAccount={() => router.push('/registrar')}
    />
  );
}
