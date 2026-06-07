import { useMutation } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { authService } from '@/services/authService';
import { tokenStorage } from '@/services/tokenStorage';

export function useGoogleSignIn() {
  const router = useRouter();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (idToken: string) => {
      const result = await authService.googleAuth(idToken);
      await tokenStorage.setTokens(result.access_token, result.refresh_token);
      return result;
    },
    onSuccess: () => {
      router.replace('/(consumer)/home');
    },
    onError: (error: Error) => {
      WebBrowser.openBrowserAsync(
        `mailto:?subject=${encodeURIComponent('LastBite Support')}&body=${encodeURIComponent(error.message)}`,
      );
    },
  });
}
