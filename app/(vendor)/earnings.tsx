import { Colors } from '@/constants/colors';
import { storage } from '@/services/storage';
import { formatPrice, formatDate } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocale } from '@/hooks/useLocale';

export default function EarningsScreen() {
  const { t, language } = useLocale();
  const vendorId = 'v1'; // Mock vendor ID
  const reservations = storage.getVendorReservations(vendorId);
  
  const collectedOrders = reservations.filter(r => r.status === 'Collected');
  const monthlyEarnings = collectedOrders.reduce((sum, r) => sum + r.offer.price * 0.9, 0);
  const platformFee = collectedOrders.reduce((sum, r) => sum + r.offer.price * 0.1, 0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{t('vendor.monthlyEarningsPercent')}</Text>
          <Text style={styles.summaryValue}>{formatPrice(monthlyEarnings)}</Text>
          <Text style={styles.summaryNote}>
            {t('vendor.platformFee')}: {formatPrice(platformFee)} (10%)
          </Text>
        </View>

        <View style={styles.payoutCard}>
          <Text style={styles.sectionTitle}>{t('vendor.nextPayout')}</Text>
          <View style={styles.payoutRow}>
            <Text style={styles.payoutLabel}>{t('vendor.scheduledDate')}</Text>
            <Text style={styles.payoutValue}>{t('vendor.endOfMonth')}</Text>
          </View>
          <View style={styles.payoutRow}>
            <Text style={styles.payoutLabel}>{t('vendor.amount')}</Text>
            <Text style={styles.payoutValue}>{formatPrice(monthlyEarnings)}</Text>
          </View>
          <View style={styles.payoutNote}>
            <Ionicons name="bulb-outline" size={14} color={Colors.textGray} />
            <Text style={styles.payoutNoteText}>
              {t('vendor.payoutNote')}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('vendor.orderBreakdown')}</Text>
          {collectedOrders.map(reservation => (
            <View key={reservation.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderTitle}>{reservation.offer.title}</Text>
                <Text style={styles.orderDate}>
                  {formatDate(reservation.collectedAt || '', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  }, language)}
                </Text>
              </View>
              <View style={styles.orderRow}>
                <Text style={styles.orderLabel}>{t('vendor.salePrice')}</Text>
                <Text style={styles.orderValue}>{formatPrice(reservation.offer.price)}</Text>
              </View>
              <View style={styles.orderRow}>
                <Text style={styles.orderLabel}>{t('vendor.yourEarnings')}</Text>
                <Text style={styles.orderEarnings}>
                  {formatPrice(reservation.offer.price * 0.9)}
                </Text>
              </View>
            </View>
          ))}

          {collectedOrders.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="cash-outline" size={60} color={Colors.textGray} style={styles.emptyIcon} />
              <Text style={styles.emptyTitle}>{t('vendor.noEarningsYet')}</Text>
              <Text style={styles.emptyText}>
                {t('vendor.startSellingEarn')}
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  content: {
    padding: 16,
  },
  summaryCard: {
    backgroundColor: Colors.secondary,
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 8,
  },
  summaryNote: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.8,
  },
  payoutCard: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  payoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  payoutLabel: {
    fontSize: 14,
    color: Colors.textGray,
  },
  payoutValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  payoutNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 8,
  },
  payoutNoteText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textGray,
    lineHeight: 18,
  },
  section: {
    marginTop: 8,
  },
  orderCard: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  orderDate: {
    fontSize: 14,
    color: Colors.textGray,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderLabel: {
    fontSize: 14,
    color: Colors.textGray,
  },
  orderValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  orderEarnings: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.secondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: Colors.white,
    borderRadius: 12,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textGray,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
