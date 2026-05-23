import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Colors } from '@/constants/colors';
import { storage } from '@/services/storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocale } from '@/hooks/useLocale';

export default function VerifyCollectionScreen() {
  const { code } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useLocale();
  const [inputCode, setInputCode] = useState((code as string) || '');
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  // Reset state when code parameter changes
  React.useEffect(() => {
    setInputCode((code as string) || '');
    setVerified(false);
    setError('');
  }, [code]);

  const handleVerify = () => {
    const success = storage.markCollected(inputCode.toUpperCase());
    if (success) {
      setVerified(true);
      setError('');
    } else {
      setError(t('vendor.invalidCode'));
    }
  };

  const handleBackToOrders = () => {
    // Always navigate back to vendor orders to avoid cross-context navigation issues
    router.replace('/(vendor)/incoming-orders');
  };

  if (verified) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.successIcon}>
            <Text style={styles.checkmark}>✓</Text>
          </View>

          <Text style={styles.title}>{t('vendor.collectionVerified')}</Text>
          <Text style={styles.subtitle}>{t('vendor.orderMarkedCollected')}</Text>

          <View style={styles.footer}>
            <Button
              title={t('vendor.backToOrders')}
              onPress={handleBackToOrders}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('vendor.verifyCollection')}</Text>
        <Text style={styles.subtitle}>{t('vendor.enterCustomerCode')}</Text>

        <Input
          label={t('vendor.pickupCode')}
          value={inputCode}
          onChangeText={(text) => {
            setInputCode(text.toUpperCase());
            setError('');
          }}
          placeholder="ABC123"
        />

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Button title={t('vendor.verifyMarkCollected')} onPress={handleVerify} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textGray,
    marginBottom: 32,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: '600',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
  checkmark: {
    fontSize: 48,
    color: Colors.white,
    fontWeight: '700',
  },
  footer: {
    marginTop: 'auto',
  },
});
