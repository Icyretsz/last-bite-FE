import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/button';
import { LoadingSpinner } from '@/components/loading-spinner';
import { authService } from '@/services/authService';
import { tokenStorage } from '@/services/tokenStorage';

export default function EmailVerificationPendingScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    loadPendingEmail();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const loadPendingEmail = async () => {
    const pendingEmail = await tokenStorage.getItem('pending_verification_email');
    if (pendingEmail) {
      setEmail(pendingEmail);
    }
  };

  const handleResend = async () => {
    if (!email || countdown > 0) return;

    setResending(true);
    setResendSuccess(false);
    try {
      await authService.resendOtp({ email });
      setResendSuccess(true);
      setCountdown(60);
    } catch (err: any) {
      alert(err.message || t('common.hasError'));
    } finally {
      setResending(false);
    }
  };

  const handleGoToLogin = async () => {
    await tokenStorage.removeItem('pending_verification_email');
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LoadingSpinner visible={resending} />

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="mail-unread-outline" size={80} color={Colors.primary} />
        </View>

        <Text style={styles.title}>{t('emailVerification.pendingTitleOtp')}</Text>

        {email && (
          <Text style={styles.emailText}>
            {t('emailVerification.sentTo')}: <Text style={styles.emailHighlight}>{email}</Text>
          </Text>
        )}

        <Text style={styles.subtitle}>{t('emailVerification.pendingSubtitleOtp')}</Text>

        <View style={styles.stepsContainer}>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>{t('emailVerification.otpStep1')}</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>{t('emailVerification.otpStep2')}</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>{t('emailVerification.otpStep3')}</Text>
          </View>
        </View>

        {resendSuccess && (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.successText}>{t('emailVerification.resendSuccessOtp')}</Text>
          </View>
        )}

        <Text style={styles.hint}>{t('emailVerification.noEmailHint')}</Text>
      </View>

      <View style={styles.footer}>
        <Button
          title={countdown > 0
            ? t('emailVerification.resendIn', { seconds: countdown })
            : t('emailVerification.resendCode')
          }
          onPress={handleResend}
          disabled={resending || countdown > 0 || !email}
          variant="outline"
        />
        <Button
          title={t('emailVerification.goToLogin')}
          onPress={handleGoToLogin}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  emailText: {
    fontSize: 14,
    color: Colors.textGray,
    textAlign: 'center',
    marginBottom: 16,
  },
  emailHighlight: {
    color: Colors.primary,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textGray,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  stepsContainer: {
    alignSelf: 'stretch',
    gap: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    lineHeight: 20,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.success + '20',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  successText: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: '500',
  },
  hint: {
    marginTop: 24,
    fontSize: 14,
    color: Colors.textGray,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  footer: {
    padding: 20,
    gap: 12,
  },
});
