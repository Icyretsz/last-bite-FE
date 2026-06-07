import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useTranslation } from 'react-i18next';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/button';
import { LoadingSpinner } from '@/components/loading-spinner';
import { authService } from '@/services/authService';
import { tokenStorage } from '@/services/tokenStorage';

export default function VerifyEmailScreen() {
  const { t } = useTranslation();
  const { token } = useLocalSearchParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMsg(t('emailVerification.invalidLink'));
      return;
    }

    authService.verifyEmailLink(token)
      .then(async (result) => {
        await tokenStorage.setTokens(result.access_token, result.refresh_token);
        setStatus('success');
      })
      .catch((err) => {
        setStatus('error');
        setErrorMsg(err.message || t('emailVerification.verificationFailed'));
      });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <LoadingSpinner visible={status === 'loading'} />

      <View style={styles.content}>
        {status === 'success' && (
          <>
            <View style={[styles.iconContainer, styles.iconSuccess]}>
              <Ionicons name="checkmark-circle" size={80} color={Colors.white} />
            </View>
            <Text style={styles.title}>{t('emailVerification.successTitle')}</Text>
            <Text style={styles.subtitle}>{t('emailVerification.successSubtitle')}</Text>
            <Button
              title={t('emailVerification.loginNow')}
              onPress={() => router.replace('/(auth)/login')}
            />
          </>
        )}

        {status === 'error' && (
          <>
            <View style={[styles.iconContainer, styles.iconError]}>
              <Ionicons name="alert-circle" size={80} color={Colors.white} />
            </View>
            <Text style={styles.title}>{t('emailVerification.failedTitle')}</Text>
            <Text style={styles.subtitle}>{errorMsg || t('emailVerification.failedSubtitle')}</Text>
            <View style={styles.buttonRow}>
              <Button
                title={t('common.back')}
                variant="outline"
                onPress={() => router.back()}
              />
              <Button
                title={t('emailVerification.resendLink')}
                onPress={() => router.push('/(auth)/resend-verification')}
              />
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  containerLoading: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 20,
  },
  iconContainer: {
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  iconSuccess: {
    backgroundColor: Colors.success,
  },
  iconError: {
    backgroundColor: Colors.error,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textGray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
});
