import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { authService, ApiError, LoginRequest, RegisterRequest } from '@/services/authService';
import { tokenStorage } from '@/services/tokenStorage';

export function useRegister() {
  const router = useRouter();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      console.log('[useRegister] Calling authService.register...');
      const result = await authService.register(data);
      console.log('[useRegister] Register success, saving email...');
      await tokenStorage.setItem('pending_verification_email', data.email);
      console.log('[useRegister] Done. Email saved. Redirecting...');
      return result;
    },
    retry: false,
    onSuccess: () => {
      console.log('[useRegister] onSuccess callback. Navigating to verify-otp...');
      router.replace('/(auth)/verify-otp');
    },
    onError: (error: Error) => {
      console.log('[useRegister] onError:', error.message);
      Alert.alert(t('common.error'), error.message);
    },
  });
}

export function useLogin() {
  const router = useRouter();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    retry: false,
    onSuccess: async (result) => {
      await tokenStorage.setTokens(result.access_token, result.refresh_token);
      const isFirst = await tokenStorage.isFirstLogin();
      if (isFirst) {
        await tokenStorage.setFirstLoginComplete();
        router.replace('/(auth)/preferences');
      } else {
        router.replace('/(consumer)/home');
      }
    },
    onError: (error: ApiError) => {
      const message = error.message || 'An error occurred';
      if (typeof window !== 'undefined' && window.alert) {
        window.alert(`${t('common.error')}: ${message}`);
      }
      try {
        Alert.alert(t('common.error'), message);
      } catch {
        // Ignore RN Alert errors on web
      }
    },
  });
}

export function useLogout() {
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (refreshToken) {
        await authService.logout(refreshToken).catch(() => {
          // best-effort — clear tokens locally even if BE call fails
        });
      }
      await tokenStorage.clearTokens();
    },
    onSuccess: () => {
      router.replace('/(auth)/login');
    },
  });
}
