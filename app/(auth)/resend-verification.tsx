import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Colors } from '@/constants/colors';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { authService } from '@/services/authService';

export default function ResendVerificationScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleResend = async () => {
    if (!email.trim()) {
      setError(t('validation.required'));
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t('validation.emailInvalid'));
      return;
    }

    setLoading(true);
    setError('');
    try {
      await authService.resendVerificationLink({ email: email.trim() });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || t('common.hasError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LoadingSpinner visible={loading} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>{t('emailVerification.resendTitle')}</Text>
          <Text style={styles.subtitle}>{t('emailVerification.resendSubtitle')}</Text>

          {success ? (
            <View style={styles.successContainer}>
              <Text style={styles.successIcon}>✓</Text>
              <Text style={styles.successText}>{t('emailVerification.resendSuccess')}</Text>
              <Button
                title={t('common.back')}
                variant="outline"
                onPress={() => router.back()}
              />
            </View>
          ) : (
            <View style={styles.form}>
              <Input
                label={t('auth.email')}
                value={email}
                onChangeText={(text) => { setEmail(text); setError(''); }}
                placeholder={t('auth.emailPlaceholder')}
                keyboardType="email-address"
                error={error}
              />
              <Button
                title={t('emailVerification.resendButton')}
                onPress={handleResend}
              />
              <Button
                title={t('common.back')}
                variant="outline"
                onPress={() => router.back()}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 24,
  },
  title: {
    fontSize: 28,
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
  },
  form: {
    gap: 16,
  },
  successContainer: {
    alignItems: 'center',
    gap: 20,
  },
  successIcon: {
    fontSize: 64,
    color: Colors.success,
  },
  successText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
  },
});
