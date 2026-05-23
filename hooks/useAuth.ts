import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { authService, LoginRequest, RegisterRequest } from '@/services/authService';
import { tokenStorage } from '@/services/tokenStorage';

export function useRegister() {
  const router = useRouter();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: async (result) => {
      await tokenStorage.setTokens(result.access_token, result.refresh_token);
      router.replace('/(auth)/preferences');
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
    onSuccess: async (result) => {
      await tokenStorage.setTokens(result.access_token, result.refresh_token);
      router.replace('/(consumer)/home');
    },
    onError: (error: Error) => {
      Alert.alert(t('common.error'), error.message);
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
