const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export async function apiFetch<T>(
  path: string,
  token: string | undefined,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new ApiError(`Falha ao chamar ${path} (${response.status})`, response.status);
  }

  return response.json() as Promise<T>;
}

export async function apiUpload<T>(
  path: string,
  token: string | undefined,
  formData: FormData,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new ApiError(`Falha ao chamar ${path} (${response.status})`, response.status);
  }

  return response.json() as Promise<T>;
}
