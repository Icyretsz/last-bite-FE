import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { LoadingSpinner } from '@/components/loading-spinner';
import { GoogleSignInButton } from '@/components/google-sign-in-button';
import { Colors } from '@/constants/colors';
import { useLogin } from '@/hooks/useAuth';
import { useGoogleSignIn } from '@/hooks/useGoogleSignIn';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFonts } from 'expo-font';
import Svg, { Text as SvgText } from 'react-native-svg';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

type LoginFormData = {
  email: string;
  password: string;
};

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { mutate: login, isPending: isLoginPending } = useLogin();
  const { mutate: googleSignIn, isPending: isGooglePending } = useGoogleSignIn();
  const [fontsLoaded] = useFonts({
    'amoresa': require('@/assets/fonts/amoresa-regular.otf'),
    'perandory': require('@/assets/fonts/perandory-semicondensed.otf'),
  });


  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (data: LoginFormData) => {
    console.log('Login attempt:', data.email);
    console.log('API URL:', `${API_URL}api/v1/auth/login`);
    login({ email: data.email, password: data.password });
  };

  const onGooglePress = () => {
    // TODO: integrate with expo-auth-session Google provider
    // For now, this logs a placeholder — full implementation requires:
    // 1. Configure Google OAuth in Google Cloud Console
    // 2. Set app.google.client-id in BE application.yaml
    // 3. Install expo-auth-session and configure the request
    console.log('Google Sign-In pressed — configure expo-auth-session to enable');
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <LoadingSpinner visible={isLoginPending || isGooglePending} />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Svg width="320" height="180" viewBox="0 0 320 180">
                <SvgText
                  fontFamily="amoresa"
                  fontSize="80"
                  x="90" y="105"
                  textAnchor="middle"
                  fill="#e8c97a"
                  opacity="0.93"
                >
                  The
                </SvgText>
                <SvgText
                  fontFamily="perandory"
                  fontSize="65"
                  x="185" y="155"
                  textAnchor="middle"
                  letterSpacing="3"
                  fill="#e8c97a"
                  opacity="0.92"
                >
                  LASTBITE
                </SvgText>
              </Svg>
            </View>
            <Text style={styles.title}>{t('auth.welcomeBack')}</Text>
            <Text style={styles.subtitle}>{t('auth.loginSubtitle')}</Text>
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              name="email"
              rules={{
                required: t('validation.required'),
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: t('validation.emailInvalid') },
              }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('auth.email')}
                  value={value}
                  onChangeText={onChange}
                  placeholder={t('auth.emailPlaceholder')}
                  keyboardType="email-address"
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              rules={{ required: t('validation.required') }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('auth.password')}
                  value={value}
                  onChangeText={onChange}
                  placeholder={t('auth.passwordPlaceholder')}
                  secureTextEntry
                  error={errors.password?.message}
                />
              )}
            />

            <Button title={t('auth.login')} onPress={() => {
              console.log('Button pressed');
              handleSubmit(
                (data) => {
                  console.log('Form valid, submitting:', data);
                  onSubmit(data);
                },
                (errors) => {
                  console.log('Form validation errors:', errors);
                }
              )();
            }} disabled={isLoginPending} />

            <GoogleSignInButton
              onPress={onGooglePress}
              loading={isGooglePending}
              disabled={isLoginPending || isGooglePending}
            />

            <Button
              title={t('auth.createAccount')}
              onPress={() => router.push('/(auth)/signup')}
              variant="outline"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textGray,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textGray,
  },
  form: {
    gap: 16,
  },
});
