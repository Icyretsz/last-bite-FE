import { Colors } from '@/constants/colors';
import { storage } from '@/services/storage';
import { formatCollectionTime, formatPrice, formatDate } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocale } from '@/hooks/useLocale';

type StatusFilter = 'All' | 'Reserved' | 'Collected' | 'Cancelled';
type DateFilter = 'All' | 'Today' | 'This Week' | 'This Month';

export default function IncomingOrdersScreen() {
  const router = useRouter();
  const { t, language } = useLocale();
  const vendorId = 'v1'; // Mock vendor ID
  const [reservations, setReservations] = useState(storage.getVendorReservations(vendorId));
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [dateFilter, setDateFilter] = useState<DateFilter>('All');

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setReservations(storage.getVendorReservations(vendorId));
    }, [vendorId])
  );

  // Filter by date
  const filterByDate = (reservation: typeof reservations[0]) => {
    if (dateFilter === 'All') return true;
    
    const orderDate = new Date(reservation.reservedAt || reservation.createdAt);
    const now = new Date();
    
    if (dateFilter === 'Today') {
      return orderDate.toDateString() === now.toDateString();
    }
    
    if (dateFilter === 'This Week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return orderDate >= weekAgo;
    }
    
    if (dateFilter === 'This Month') {
      return orderDate.getMonth() === now.getMonth() && 
             orderDate.getFullYear() === now.getFullYear();
    }
    
    return true;
  };

  // Filter by status
  const filterByStatus = (reservation: typeof reservations[0]) => {
    if (statusFilter === 'All') return true;
    return reservation.status === statusFilter;
  };

  // Apply filters
  const filteredReservations = reservations
    .filter(filterByDate)
    .filter(filterByStatus);

  const activeOrders = filteredReservations.filter(r => r.status === 'Reserved');
  const pastOrders = filteredReservations.filter(r => r.status !== 'Reserved');

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map(star => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={14}
            color="#F5A623"
          />
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Filters */}
        <View style={styles.filtersSection}>
          <Text style={styles.filterLabel}>{t('orders.status')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {(['All', 'Reserved', 'Collected', 'Cancelled'] as StatusFilter[]).map(status => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterChip,
                  statusFilter === status && styles.filterChipActive
                ]}
                onPress={() => setStatusFilter(status)}
              >
                <Text style={[
                  styles.filterChipText,
                  statusFilter === status && styles.filterChipTextActive
                ]}>
                  {t(`orders.${status.toLowerCase()}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.filterLabel}>{t('orders.date')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {(['All', 'Today', 'This Week', 'This Month'] as DateFilter[]).map(date => (
              <TouchableOpacity
                key={date}
                style={[
                  styles.filterChip,
                  dateFilter === date && styles.filterChipActive
                ]}
                onPress={() => setDateFilter(date)}
              >
                <Text style={[
                  styles.filterChipText,
                  dateFilter === date && styles.filterChipTextActive
                ]}>
                  {date === 'All' ? t('orders.all') : 
                   date === 'Today' ? t('orders.today') :
                   date === 'This Week' ? t('orders.thisWeek') :
                   t('orders.thisMonth')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {activeOrders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('vendor.activeOrders')} ({activeOrders.length})</Text>
            {activeOrders.map(reservation => (
              <TouchableOpacity
                key={reservation.id}
                style={styles.orderCard}
                onPress={() => router.push(`/verify-collection/${reservation.code}`)}
              >
                <View style={styles.orderHeader}>
                  <Text style={styles.customerName}>{t('vendor.customerName')} #{reservation.userId.slice(-4)}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{t(`orders.${reservation.status.toLowerCase()}`)}</Text>
                  </View>
                </View>

                <View style={styles.codeSection}>
                  <Text style={styles.codeLabel}>{t('vendor.pickupCode')}</Text>
                  <Text style={styles.code}>{reservation.code}</Text>
                </View>

                <Text style={styles.offerTitle}>{reservation.offer.title}</Text>

                <Text style={styles.collectionTime}>
                  <Ionicons name="time-outline" size={14} color={Colors.textGray} />{' '}
                  {formatCollectionTime(
                    reservation.offer.collectionStart,
                    reservation.offer.collectionEnd,
                    reservation.offer.collectionDays,
                    t,
                    language
                  )}
                </Text>

                <Text style={styles.tapToVerify}>{t('vendor.tapToVerify')}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {pastOrders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('vendor.pastOrders')}</Text>
            {pastOrders.map(reservation => {
              const review = storage.getReviewByReservation(reservation.id);
              
              return (
                <TouchableOpacity 
                  key={reservation.id} 
                  style={styles.orderCard}
                  onPress={() => router.push(`/order-details/${reservation.id}`)}
                >
                  <View style={styles.orderHeader}>
                    <Text style={styles.customerName}>{t('vendor.customerName')} #{reservation.userId.slice(-4)}</Text>
                    <View style={[
                      styles.statusBadge,
                      reservation.status === 'Collected' ? styles.statusCollected : styles.statusCancelled
                    ]}>
                      <Text style={styles.statusText}>{t(`orders.${reservation.status.toLowerCase()}`)}</Text>
                    </View>
                  </View>

                  <Text style={styles.offerTitle}>{reservation.offer.title}</Text>
                  
                  <View style={styles.priceRow}>
                    <Text style={styles.quantity}>{t('common.quantity')}: {reservation.quantity}</Text>
                    <Text style={styles.price}>{formatPrice(reservation.paidPrice || reservation.offer.price * reservation.quantity)}</Text>
                  </View>

                  {reservation.status === 'Collected' && reservation.collectedAt && (
                    <Text style={styles.collectedDate}>
                      <Ionicons name="checkmark-circle-outline" size={14} color={Colors.success} />{' '}
                      {t('vendor.collected')}: {formatDate(reservation.collectedAt, { 
                        month: 'short', 
                        day: 'numeric'
                      }, language)}
                    </Text>
                  )}

                  {reservation.status === 'Cancelled' && reservation.cancelledAt && (
                    <Text style={styles.cancelledDate}>
                      <Ionicons name="close-circle-outline" size={14} color={Colors.textGray} />{' '}
                      {t('vendor.cancelled')}: {formatDate(reservation.cancelledAt, { 
                        month: 'short', 
                        day: 'numeric'
                      }, language)}
                    </Text>
                  )}

                  {review && (
                    <View style={styles.reviewSection}>
                      <View style={styles.reviewHeader}>
                        <Text style={styles.reviewLabel}>{t('vendor.customerReview')}</Text>
                        {renderStars(review.rating)}
                      </View>
                      {review.text && (
                        <Text style={styles.reviewText} numberOfLines={2}>{review.text}</Text>
                      )}
                      <View style={styles.reviewDetails}>
                        <Text style={styles.reviewDetailItem}>{t('orders.collection')}: {review.collectionRating}/5</Text>
                        <Text style={styles.reviewDetailItem}>{t('orders.quality')}: {review.qualityRating}/5</Text>
                        <Text style={styles.reviewDetailItem}>{t('orders.quantityRating')}: {review.quantityRating}/5</Text>
                        <Text style={styles.reviewDetailItem}>{t('orders.variety')}: {review.varietyRating}/5</Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {reservations.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="list-outline" size={60} color={Colors.textGray} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>{t('vendor.noOrdersYet')}</Text>
            <Text style={styles.emptyText}>
              {t('vendor.ordersWillAppearHere')}
            </Text>
          </View>
        )}

        {reservations.length > 0 && filteredReservations.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="filter-outline" size={60} color={Colors.textGray} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>{t('vendor.noOrdersFound')}</Text>
            <Text style={styles.emptyText}>
              {t('vendor.tryAdjustingFilters')}
            </Text>
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
  filtersSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    marginTop: 8,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.textGray,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  filterChipText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  orderCard: {
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
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
    fontSize: 12,
    fontWeight: '600',
  },
  codeSection: {
    backgroundColor: Colors.backgroundGray,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  codeLabel: {
    fontSize: 12,
    color: Colors.textGray,
    marginBottom: 4,
  },
  code: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.secondary,
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  offerTitle: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 8,
  },
  collectionTime: {
    fontSize: 14,
    color: Colors.textGray,
    marginBottom: 8,
  },
  collectedDate: {
    fontSize: 14,
    color: Colors.success,
    marginTop: 8,
    fontWeight: '600',
  },
  cancelledDate: {
    fontSize: 14,
    color: Colors.textGray,
    marginTop: 8,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quantity: {
    fontSize: 14,
    color: Colors.textGray,
    fontWeight: '600',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.secondary,
  },
  reviewSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.backgroundGray,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewText: {
    fontSize: 14,
    color: Colors.textGray,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  reviewDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reviewDetailItem: {
    fontSize: 12,
    color: Colors.textGray,
    backgroundColor: Colors.backgroundGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tapToVerify: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: '600',
    textAlign: 'center',
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
});
