import { Button } from '@/components/button';
import { Colors } from '@/constants/colors';
import { storage } from '@/services/storage';
import { formatCollectionTime } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useLocale } from '@/hooks/useLocale';

export default function ConfirmationScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t, language } = useLocale();
  const reservation = storage.getReservationById(id as string);

  if (!reservation) {
    return (
      <View style={styles.container}>
        <Text>{t('checkout.reservationNotFound')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.successIcon}>
          <Text style={styles.checkmark}>✓</Text>
        </View>

        <Text style={styles.title}>{t('checkout.reservationConfirmed')}</Text>
        <Text style={styles.subtitle}>{t('checkout.showCodeAtPickup')}</Text>

        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>{t('checkout.reservationCode')}</Text>
          <Text style={styles.code}>{reservation.code}</Text>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('checkout.vendor')}</Text>
            <Text style={styles.detailValue}>{reservation.offer.vendor.name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('checkout.collectionTime')}</Text>
            <Text style={styles.detailValue}>
              {formatCollectionTime(
                reservation.offer.collectionStart,
                reservation.offer.collectionEnd,
                reservation.offer.collectionDays,
                t,
                language
              )}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('checkout.location')}</Text>
            <Text style={styles.detailValue}>{reservation.offer.vendor.address}</Text>
          </View>
        </View>

        <View style={styles.reminder}>
          <Ionicons name="bulb-outline" size={16} color={Colors.textGray} />
          <Text style={styles.reminderText}>{t('checkout.rememberBringBag')}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button 
          title={t('checkout.viewMyOrders')} 
          onPress={() => router.push('/(consumer)/orders')}
        />
        <Button 
          title={t('checkout.backToHome')} 
          onPress={() => router.push('/(consumer)/home')}
          variant="outline"
        />
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
    alignItems: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
  checkmark: {
    fontSize: 48,
    color: Colors.white,
    fontWeight: '700',
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
  codeCard: {
    backgroundColor: Colors.primary,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  codeLabel: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
    marginBottom: 8,
  },
  code: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 4,
    fontFamily: 'monospace',
  },
  detailsCard: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 12,
    width: '100%',
    marginBottom: 24,
  },
  detailRow: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textGray,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  reminder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  reminderText: {
    fontSize: 14,
    color: Colors.textGray,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    gap: 12,
  },
});
