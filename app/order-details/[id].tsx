import { Colors } from '@/constants/colors';
import { storage } from '@/services/storage';
import { formatPrice, formatDate, formatTime } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocale } from '@/hooks/useLocale';

const STAR_COLOR = '#F5A623';

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { t, language } = useLocale();
  const reservation = storage.getReservationById(id as string);
  const userReview = reservation ? storage.getReviewByReservation(reservation.id) : undefined;

  if (!reservation) {
    return (
      <View style={styles.container}>
        <Text>{t('offer.offerNotFound')}</Text>
      </View>
    );
  }

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={16}
          color={STAR_COLOR}
          style={styles.star}
        />
      );
    }
    return stars;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Order Status */}
        <View style={styles.statusCard}>
          <View style={[
            styles.statusBadge,
            reservation.status === 'Collected' ? styles.statusCollected : 
            reservation.status === 'Cancelled' ? styles.statusCancelled : 
            styles.statusReserved
          ]}>
            <Text style={styles.statusText}>{t(`orders.${reservation.status.toLowerCase()}`)}</Text>
          </View>
          <Text style={styles.orderNumber}>{t('vendor.orderNumber', { number: reservation.id.slice(-8).toUpperCase() })}</Text>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('vendor.customerInfo')}</Text>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color={Colors.textGray} />
            <Text style={styles.infoText}>{t('vendor.customerName')} #{reservation.userId.slice(-4)}</Text>
          </View>
          {reservation.status === 'Reserved' && (
            <View style={styles.codeSection}>
              <Text style={styles.codeLabel}>{t('vendor.pickupCode')}</Text>
              <Text style={styles.code}>{reservation.code}</Text>
            </View>
          )}
        </View>

        {/* Order Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('vendor.orderDetails')}</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('vendor.item')}</Text>
            <Text style={styles.detailValue}>{reservation.offer.title}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('common.quantity')}</Text>
            <Text style={styles.detailValue}>{reservation.quantity} {reservation.quantity === 1 ? t('vendor.bag') : t('vendor.bags')}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('common.price')}</Text>
            <Text style={styles.detailValue}>{formatPrice(reservation.paidPrice || reservation.offer.price)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('vendor.collectionDate')}</Text>
            <Text style={styles.detailValue}>
              {reservation.collectionDate 
                ? formatDate(reservation.collectionDate, { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }, language)
                : t('vendor.notSpecified')}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('vendor.collectionTime')}</Text>
            <Text style={styles.detailValue}>
              {reservation.collectionTimeStart && reservation.collectionTimeEnd
                ? `${formatTime(reservation.collectionTimeStart, { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                  }, language)} - ${formatTime(reservation.collectionTimeEnd, { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                  }, language)}`
                : formatTime(reservation.offer.collectionStart, { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                  }, language) + ' - ' + formatTime(reservation.offer.collectionEnd, { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                  }, language)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('vendor.reservedAt')}</Text>
            <Text style={styles.detailValue}>
              {formatDate(reservation.reservedAt || reservation.createdAt, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }, language)} {formatTime(reservation.reservedAt || reservation.createdAt, {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }, language)}
            </Text>
          </View>
        </View>

        {/* Customer Review */}
        {userReview && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('vendor.customerReview')}</Text>
            
            <View style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewAvatar}>
                  <Text style={styles.reviewAvatarText}>
                    {userReview.userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </Text>
                </View>
                <View style={styles.reviewHeaderInfo}>
                  <Text style={styles.reviewAuthor}>{userReview.userName}</Text>
                  <View style={styles.reviewStars}>
                    {renderStars(userReview.rating)}
                  </View>
                </View>
              </View>

              {/* Review Metrics */}
              <View style={styles.metricsContainer}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>{t('orders.collection')}</Text>
                  <View style={styles.metricStars}>
                    {renderStars(userReview.collectionRating)}
                  </View>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>{t('orders.quality')}</Text>
                  <View style={styles.metricStars}>
                    {renderStars(userReview.qualityRating)}
                  </View>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>{t('orders.quantityRating')}</Text>
                  <View style={styles.metricStars}>
                    {renderStars(userReview.quantityRating)}
                  </View>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>{t('orders.variety')}</Text>
                  <View style={styles.metricStars}>
                    {renderStars(userReview.varietyRating)}
                  </View>
                </View>
              </View>

              {userReview.text && (
                <Text style={styles.reviewText}>{userReview.text}</Text>
              )}
            </View>
          </View>
        )}
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
  statusCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusReserved: {
    backgroundColor: Colors.secondary,
  },
  statusCollected: {
    backgroundColor: Colors.success,
  },
  statusCancelled: {
    backgroundColor: Colors.textGray,
  },
  statusText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  orderNumber: {
    fontSize: 14,
    color: Colors.textGray,
    fontWeight: '600',
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
  },
  codeSection: {
    backgroundColor: Colors.backgroundGray,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  codeLabel: {
    fontSize: 12,
    color: Colors.textGray,
    marginBottom: 4,
  },
  code: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.secondary,
    letterSpacing: 3,
    fontFamily: 'monospace',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textGray,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  reviewCard: {
    backgroundColor: Colors.backgroundGray,
    borderRadius: 12,
    padding: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reviewAvatarText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  reviewHeaderInfo: {
    flex: 1,
  },
  reviewAuthor: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  reviewStars: {
    flexDirection: 'row',
  },
  star: {
    marginRight: 2,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  metricItem: {
    flex: 1,
    minWidth: '45%',
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.textGray,
    marginBottom: 4,
  },
  metricStars: {
    flexDirection: 'row',
  },
  reviewText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
});
