import { getErrorMessage } from '@/utils/apiError';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResult {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (data.code !== 1000) {
    throw new Error(getErrorMessage(data.code));
  }
  return data.result as T;
}

export const authService = {
  register: (body: RegisterRequest): Promise<LoginResult> =>
    fetch(`${API_URL}api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(handleResponse<LoginResult>),

  login: (body: LoginRequest): Promise<LoginResult> =>
    fetch(`${API_URL}api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(handleResponse<LoginResult>),

  logout: (refreshToken: string): Promise<void> =>
    fetch(`${API_URL}api/v1/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    }).then(handleResponse<void>),
};
