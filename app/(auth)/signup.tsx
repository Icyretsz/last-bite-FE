import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Colors } from '@/constants/colors';
import { useRegister } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

type SignupFormData = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

export default function SignupScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { mutate: register, isPending } = useRegister();

  const { control, handleSubmit, formState: { errors } } = useForm<SignupFormData>({
    defaultValues: { name: '', email: '', phone: '', password: '' },
  });

  const onSubmit = (data: SignupFormData) => {
    console.log('[Signup] Submitting:', data.email);
    register({ email: data.email, password: data.password, fullName: data.name, phone: data.phone });
  };

  return (
    <>
      <LoadingSpinner visible={isPending} />

      <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Ionicons name="bag-handle-outline" size={60} color={Colors.primary} style={styles.logo} />
          <Text style={styles.title}>{t('auth.signupTitle')}</Text>
          <Text style={styles.subtitle}>{t('auth.signupSubtitle')}</Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="name"
            rules={{ required: t('validation.required') }}
            render={({ field: { onChange, value } }) => (
              <Input
                label={t('auth.name')}
                value={value}
                onChangeText={onChange}
                placeholder={t('auth.namePlaceholder')}
                error={errors.name?.message}
              />
            )}
          />

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
            name="phone"
            rules={{
              required: t('validation.required'),
              pattern: { value: /^[0-9]{9,11}$/, message: t('validation.phoneInvalid') },
            }}
            render={({ field: { onChange, value } }) => (
              <Input
                label={t('auth.phone')}
                value={value}
                onChangeText={onChange}
                placeholder={t('auth.phonePlaceholder')}
                keyboardType="numeric"
                error={errors.phone?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            rules={{
              required: t('validation.required'),
              minLength: { value: 8, message: t('validation.passwordMinLength') },
            }}
            render={({ field: { onChange, value } }) => (
              <Input
                label={t('auth.password')}
                value={value}
                onChangeText={onChange}
                placeholder={t('auth.passwordRequirement')}
                secureTextEntry
                error={errors.password?.message}
              />
            )}
          />

          <Button
            title={t('auth.signUp')}
            onPress={handleSubmit(onSubmit)}
            disabled={isPending}
          />
        </View>
      </ScrollView>
      </KeyboardAvoidingView>

      <Button
        title={t('auth.alreadyHaveAccount')}
        onPress={() => router.back()}
        variant="outline"
      />
    </>
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
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
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
