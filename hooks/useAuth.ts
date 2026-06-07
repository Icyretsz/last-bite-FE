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
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: () => {
      router.replace('/(auth)/email-verification-pending');
    },
    onError: (error: Error) => {
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
      router.replace('/(consumer)/home');
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
