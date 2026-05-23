import { Button } from '@/components/button';
import { Colors } from '@/constants/colors';
import { storage } from '@/services/storage';
import { formatCollectionTime, formatPrice } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocale } from '@/hooks/useLocale';

export default function OffersScreen() {
  const router = useRouter();
  const { t, language } = useLocale();
  const vendorId = 'v1'; // Mock vendor ID
  const offers = storage.getVendorOffers(vendorId);

  const toggleActive = (offerId: string, currentStatus: boolean) => {
    storage.updateOffer(offerId, { isActive: !currentStatus });
    router.replace('/(vendor)/offers');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {offers.map(offer => (
          <TouchableOpacity
            key={offer.id}
            style={styles.offerCard}
            onPress={() => router.push(`/edit-offer/${offer.id}`)}
          >
            <View style={styles.offerHeader}>
              <Text style={styles.offerTitle}>{offer.title}</Text>
              <TouchableOpacity
                style={[styles.statusBadge, offer.isActive ? styles.statusActive : styles.statusInactive]}
                onPress={(e) => {
                  e.stopPropagation();
                  toggleActive(offer.id, offer.isActive);
                }}
              >
                <Text style={styles.statusText}>
                  {offer.isActive ? t('vendor.active') : t('vendor.inactive')}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.offerDescription}>{offer.description}</Text>

            <View style={styles.offerDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('common.price')}:</Text>
                <Text style={styles.detailValue}>{formatPrice(offer.price)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('common.quantity')}:</Text>
                <Text style={styles.detailValue}>
                  {offer.remainingQuantity} / {offer.quantity}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('common.collection')}:</Text>
                <Text style={styles.detailValue}>
                  {formatCollectionTime(offer.collectionStart, offer.collectionEnd, offer.collectionDays, t, language)}
                </Text>
              </View>
            </View>

            <Text style={styles.tapToEdit}>{t('common.tapToEdit')}</Text>
          </TouchableOpacity>
        ))}

        {offers.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="bag-handle-outline" size={60} color={Colors.textGray} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>{t('vendor.noBagsYet')}</Text>
            <Text style={styles.emptyText}>{t('vendor.createFirstBag')}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={t('vendor.createNewBag')}
          onPress={() => router.push('/create-bag')}
          variant='secondary'
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
    padding: 16,
  },
  offerCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: Colors.success,
  },
  statusInactive: {
    backgroundColor: Colors.textGray,
  },
  statusText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  offerDescription: {
    fontSize: 14,
    color: Colors.textGray,
    marginBottom: 12,
  },
  offerDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textGray,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  tapToEdit: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
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
  footer: {
    padding: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
});
