import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/button';
import { LoadingSpinner } from '@/components/loading-spinner';
import { authService } from '@/services/authService';
import { tokenStorage } from '@/services/tokenStorage';

export default function VerifyOtpScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

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

  const handleOtpChange = (value: string, index: number) => {
    const sanitized = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = sanitized;
    setOtp(newOtp);

    if (sanitized && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (code?: string) => {
    const otpCode = code || otp.join('');
    if (otpCode.length !== 6) return;

    setLoading(true);
    try {
      const result = await authService.verifyEmail({ email, otpCode });
      await tokenStorage.setTokens(result.access_token, result.refresh_token);
      await tokenStorage.removeItem('pending_verification_email');
      router.replace('/(consumer)/home');
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message || t('emailVerification.verificationFailed'));
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setResending(true);
    try {
      await authService.resendOtp({ email });
      setCountdown(60);
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message || t('common.hasError'));
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LoadingSpinner visible={loading} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="mail-unread-outline" size={80} color={Colors.primary} />
          </View>

          <Text style={styles.title}>{t('emailVerification.otpTitle')}</Text>
          <Text style={styles.subtitle}>{t('emailVerification.otpSubtitle')}</Text>

          {email && (
            <Text style={styles.emailText}>
              {t('emailVerification.sentTo')}: <Text style={styles.emailHighlight}>{email}</Text>
            </Text>
          )}

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
                value={digit}
                onChangeText={(v) => handleOtpChange(v, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                autoFocus={index === 0}
              />
            ))}
          </View>

          {resending && (
            <Text style={styles.sendingText}>{t('emailVerification.sending')}</Text>
          )}

          <Pressable
            style={styles.resendContainer}
            onPress={handleResend}
            disabled={countdown > 0 || resending}
          >
            <Text style={styles.resendText}>
              {countdown > 0
                ? t('emailVerification.resendIn', { seconds: countdown })
                : t('emailVerification.resendCode')}
            </Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Button
            title={t('emailVerification.verifyButton')}
            onPress={() => handleVerify()}
            disabled={otp.join('').length !== 6 || loading}
          />
          <Button
            title={t('common.back')}
            variant="outline"
            onPress={() => router.back()}
          />
        </View>
      </KeyboardAvoidingView>
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
  subtitle: {
    fontSize: 16,
    color: Colors.textGray,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  emailText: {
    fontSize: 14,
    color: Colors.textGray,
    textAlign: 'center',
    marginBottom: 24,
  },
  emailHighlight: {
    color: Colors.primary,
    fontWeight: '600',
  },
  otpContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    backgroundColor: Colors.white,
  },
  otpInputFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  sendingText: {
    fontSize: 14,
    color: Colors.textGray,
    marginBottom: 16,
  },
  resendContainer: {
    padding: 8,
  },
  resendText: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    gap: 12,
  },
});
