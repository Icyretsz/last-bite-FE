import { getErrorMessage } from '@/utils/apiError';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

// Ensure API_URL ends with /
const getApiUrl = (path: string) => `${API_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

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
  refresh_token?: string;
  expires_in: number;
}

export interface VerifyEmailRequest {
  email: string;
  otpCode: string;
}

export interface ResendOtpRequest {
  email: string;
}

// Custom error class that includes status code for proper retry handling
export class ApiError extends Error {
  status: number;
  code: number;

  constructor(message: string, status: number, code: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (data.code !== 1000) {
    throw new ApiError(getErrorMessage(data.code), res.status, data.code);
  }
  return data.result as T;
}

export const authService = {
  register: (body: RegisterRequest): Promise<void> => {
    console.log('[authService] POST /api/v1/auth/register', body);
    return fetch(getApiUrl('/api/v1/auth/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(async (res) => {
      console.log('[authService] Response status:', res.status);
      const data = await res.json();
      console.log('[authService] Response data:', JSON.stringify(data));
      if (data.code !== 1000) {
        throw new ApiError(getErrorMessage(data.code), res.status, data.code);
      }
      return; // register returns 201 with no body
    });
  },

  login: (body: LoginRequest): Promise<LoginResult> =>
    fetch(getApiUrl('/api/v1/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(handleResponse<LoginResult>),

  verifyEmailLink: (token: string): Promise<LoginResult> =>
    fetch(getApiUrl(`/api/v1/auth/verify-email-link?token=${encodeURIComponent(token)}`), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }).then(handleResponse<LoginResult>),

  verifyEmail: (body: VerifyEmailRequest): Promise<LoginResult> =>
    fetch(getApiUrl('/api/v1/auth/verify-email'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(handleResponse<LoginResult>),

  resendOtp: (body: ResendOtpRequest): Promise<void> =>
    fetch(getApiUrl('/api/v1/auth/resend-otp'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(handleResponse<void>),

  resendVerificationLink: (body: ResendOtpRequest): Promise<void> =>
    fetch(getApiUrl('/api/v1/auth/resend-verification-link'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(handleResponse<void>),

  googleAuth: (idToken: string): Promise<LoginResult> =>
    fetch(getApiUrl('/api/v1/auth/google'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    }).then(handleResponse<LoginResult>),

  logout: (refreshToken: string): Promise<void> =>
    fetch(getApiUrl('/api/v1/auth/logout'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    }).then(handleResponse<void>),
};
