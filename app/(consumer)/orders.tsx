import { Colors } from '@/constants/colors';
import { storage } from '@/services/storage';
import { formatCollectionTime, formatPrice, formatDate, formatTime } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocale } from '@/hooks/useLocale';

type StatusFilter = 'All' | 'Reserved' | 'Collected' | 'Cancelled';
type DateFilter = 'All' | 'Today' | 'This Week' | 'This Month';

export default function OrdersScreen() {
  const router = useRouter();
  const { t, language } = useLocale();
  const [reservations, setReservations] = useState(storage.getReservations());
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<typeof reservations[0] | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [dateFilter, setDateFilter] = useState<DateFilter>('All');

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setReservations(storage.getReservations());
    }, [])
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Reserved': return Colors.secondary;
      case 'Collected': return Colors.success;
      case 'Cancelled': return Colors.textGray;
      case 'Refunded': return Colors.error;
      default: return Colors.textGray;
    }
  };

  // Check if order is within pickup window
  const isInPickupWindow = (reservation: typeof reservations[0]) => {
    const now = new Date();
    const pickupStart = new Date(reservation.collectionTimeStart);
    const pickupEnd = new Date(reservation.collectionTimeEnd);
    console.log({now, pickupStart, pickupEnd})
    console.log(now >= pickupStart && now <= pickupEnd)
    return now >= pickupStart && now <= pickupEnd;
  };

  // Handle cancel button press - show modal or error
  const handleCancelPress = (reservation: typeof reservations[0]) => {
    // Show confirmation modal
    setSelectedReservation(reservation);
    setShowCancelModal(true);
  };

  // Confirm cancellation
  const confirmCancellation = () => {
    if (selectedReservation) {
      storage.cancelReservation(selectedReservation.id);
      setReservations(storage.getReservations());
    }
    setShowCancelModal(false);
    setSelectedReservation(null);
  };

  // Dismiss modal
  const dismissModal = () => {
    setShowCancelModal(false);
    setSelectedReservation(null);
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
            {(['All', 'Today', 'This Week', 'This Month'] as DateFilter[]).map(date => {
              const dateKey = date === 'All' ? 'all' : 
                             date === 'Today' ? 'today' :
                             date === 'This Week' ? 'thisWeek' : 'thisMonth';
              return (
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
                    {t(`orders.${dateKey}`)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {activeOrders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('orders.activeOrders')}</Text>
            {activeOrders.map(reservation => (
              <View key={reservation.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <Text style={styles.vendorName}>
                    {reservation.offer.vendor.name}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(reservation.status) }]}>
                    <Text style={styles.statusText}>{t(`orders.${reservation.status.toLowerCase()}`)}</Text>
                  </View>
                </View>

                <Text style={styles.offerTitle}>{reservation.offer.title}</Text>

                <View style={styles.codeSection}>
                  <Text style={styles.codeLabel}>{t('orders.pickupCode')}</Text>
                  <Text style={styles.code}>{reservation.code}</Text>
                </View>

                <Text style={styles.collectionDate}>
                  <Ionicons name="calendar-outline" size={14} color={Colors.text} />{' '}
                  {reservation.collectionDate 
                    ? formatDate(reservation.collectionDate, { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      }, language)
                    : 'Date TBD'}
                </Text>

                <Text style={styles.collectionTime}>
                  <Ionicons name="time-outline" size={14} color={Colors.text} />{' '}
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
                    : formatCollectionTime(
                        reservation.offer.collectionStart,
                        reservation.offer.collectionEnd,
                        reservation.offer.collectionDays,
                        t,
                        language
                      )}
                </Text>

                <Text style={styles.location}>
                  <Ionicons name="location-outline" size={14} color={Colors.textGray} />{' '}
                  {reservation.offer.vendor.address}
                </Text>

                <View style={styles.priceRow}>
                  <Text style={styles.quantity}>{t('orders.quantity', { count: reservation.quantity })}</Text>
                  <Text style={styles.price}>{formatPrice((reservation.paidPrice || reservation.offer.price * reservation.quantity))}</Text>
                </View>

                {/* Pickup Window Warning or Cancel Button */}
                {isInPickupWindow(reservation) ? (
                  <View style={styles.pickupWarning}>
                    <Ionicons name="time" size={16} color={Colors.secondary} />
                    <Text style={styles.pickupWarningText}>
                      This order cannot be cancelled because it is currently pickup time.
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => handleCancelPress(reservation)}
                  >
                    <Ionicons name="close-circle-outline" size={18} color={Colors.error} />
                    <Text style={styles.cancelButtonText}>{t('orders.cancelOrder')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {pastOrders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('orders.pastOrders')}</Text>
            {pastOrders.map(reservation => {
              const review = storage.getReviewByReservation(reservation.id);
              
              return (
                <TouchableOpacity
                  key={reservation.id}
                  style={styles.orderCard}
                  onPress={() => {
                    if (reservation.status === 'Collected' && !review) {
                      router.push(`/review/${reservation.id}`);
                    }
                  }}
                  disabled={reservation.status !== 'Collected' || !!review}
                >
                  <View style={styles.orderHeader}>
                    <Text style={styles.vendorName}>
                      {reservation.offer.vendor.name}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(reservation.status) }]}>
                      <Text style={styles.statusText}>{t(`orders.${reservation.status.toLowerCase()}`)}</Text>
                    </View>
                  </View>

                  <Text style={styles.offerTitle}>{reservation.offer.title}</Text>
                  
                  <Text style={styles.orderDate}>
                    <Ionicons name="calendar-outline" size={14} color={Colors.textGray} />{' '}
                    {t('orders.ordered')}: {formatDate(reservation.reservedAt || reservation.createdAt, { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    }, language)}
                  </Text>

                  {reservation.status === 'Collected' && reservation.collectedAt && (
                    <Text style={styles.collectedDate}>
                      <Ionicons name="checkmark-circle-outline" size={14} color={Colors.success} />{' '}
                      {t('orders.collected')}: {formatDate(reservation.collectedAt, { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      }, language)}
                    </Text>
                  )}

                  {reservation.status === 'Cancelled' && reservation.cancelledAt && (
                    <Text style={styles.cancelledDate}>
                      <Ionicons name="close-circle-outline" size={14} color={Colors.textGray} />{' '}
                      Cancelled: {formatDate(reservation.cancelledAt, { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      }, language)}
                    </Text>
                  )}
                  
                  <View style={styles.priceRow}>
                    <Text style={styles.quantity}>{t('orders.quantity', { count: reservation.quantity })}</Text>
                    <Text style={styles.price}>{formatPrice(reservation.paidPrice || reservation.offer.price * reservation.quantity)}</Text>
                  </View>

                  {reservation.status === 'Collected' && (
                    review ? (
                      <View style={styles.userReviewSection}>
                        <View style={styles.reviewHeader}>
                          <Text style={styles.reviewLabel}>{t('orders.yourReview')}</Text>
                          <View style={styles.starsRow}>
                            {[1, 2, 3, 4, 5].map(star => (
                              <Ionicons
                                key={star}
                                name={star <= review.rating ? 'star' : 'star-outline'}
                                size={14}
                                color="#F5A623"
                              />
                            ))}
                          </View>
                        </View>
                        {review.text && (
                          <Text style={styles.reviewText}>{review.text}</Text>
                        )}
                        <View style={styles.reviewDetails}>
                          <Text style={styles.reviewDetailItem}>{t('orders.collection')}: {review.collectionRating}/5</Text>
                          <Text style={styles.reviewDetailItem}>{t('orders.quality')}: {review.qualityRating}/5</Text>
                          <Text style={styles.reviewDetailItem}>{t('orders.quantityRating')}: {review.quantityRating}/5</Text>
                          <Text style={styles.reviewDetailItem}>{t('orders.variety')}: {review.varietyRating}/5</Text>
                        </View>
                      </View>
                    ) : (
                      <Text style={styles.reviewPrompt}>{t('orders.tapToReview')}</Text>
                    )
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {reservations.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={60} color={Colors.textGray} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>{t('orders.noOrdersYet')}</Text>
            <Text style={styles.emptyText}>
              {t('orders.noOrdersSubtext')}
            </Text>
          </View>
        )}

        {reservations.length > 0 && filteredReservations.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="filter-outline" size={60} color={Colors.textGray} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>{t('orders.noOrdersFound')}</Text>
            <Text style={styles.emptyText}>
              {t('orders.noOrdersFoundSubtext')}
            </Text>
          </View>
        )}
      </View>

      {/* Confirmation Modal */}
      <Modal
        visible={showCancelModal}
        transparent={true}
        animationType="fade"
        onRequestClose={dismissModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('orders.cancelOrderTitle')}</Text>
            <Text style={styles.modalMessage}>
              {t('orders.cancelOrderMessage')}
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={dismissModal}
              >
                <Text style={styles.modalButtonTextSecondary}>{t('orders.noKeepOrder')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={confirmCancellation}
              >
                <Text style={styles.modalButtonTextPrimary}>{t('orders.yesCancelOrder')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
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
    marginBottom: 8,
  },
  vendorName: {
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
  statusText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  offerTitle: {
    fontSize: 16,
    color: Colors.textGray,
    marginBottom: 12,
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
    color: Colors.primary,
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  collectionDate: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
    fontWeight: '600',
  },
  collectionTime: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: Colors.textGray,
    marginBottom: 8,
  },
  orderDate: {
    fontSize: 14,
    color: Colors.textGray,
    marginBottom: 4,
  },
  collectedDate: {
    fontSize: 14,
    color: Colors.success,
    marginBottom: 8,
    fontWeight: '600',
  },
  cancelledDate: {
    fontSize: 14,
    color: Colors.textGray,
    marginBottom: 8,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 14,
    color: Colors.textGray,
    fontWeight: '600',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  pickupWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E5',
    borderWidth: 1,
    borderColor: Colors.secondary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginTop: 12,
    gap: 8,
  },
  pickupWarningText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.error,
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 12,
    gap: 6,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.error,
  },
  reviewPrompt: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: '600',
    marginTop: 8,
  },
  userReviewSection: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: Colors.textGray,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonSecondary: {
    backgroundColor: Colors.backgroundGray,
    borderWidth: 1,
    borderColor: Colors.textGray,
  },
  modalButtonPrimary: {
    backgroundColor: Colors.error,
  },
  modalButtonTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  modalButtonTextPrimary: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
