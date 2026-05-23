import { Button } from '@/components/button';
import { Colors } from '@/constants/colors';
import { storage } from '@/services/storage';
import { Voucher } from '@/types';
import { formatCollectionTime, formatPrice, formatDate } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocale } from '@/hooks/useLocale';

function calculateVoucherDiscount(voucher: Voucher, subtotal: number): number {
  if (!voucher.isActive) return 0;
  if (voucher.minOrder && subtotal < voucher.minOrder) return 0;

  let discount = 0;
  if (voucher.discountType === 'fixed') {
    discount = voucher.amount;
  } else {
    discount = Math.round((subtotal * voucher.amount) / 100);
    if (typeof voucher.maxDiscount === 'number') {
      discount = Math.min(discount, voucher.maxDiscount);
    }
  }

  return Math.max(0, Math.min(discount, subtotal));
}

export default function CheckoutScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t, language } = useLocale();
  const offer = storage.getOfferById(id as string);
  const vouchers = storage.getVouchers();
  const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedCollectionDate, setSelectedCollectionDate] = useState<string | null>(null);

  // Calculate available collection dates (next 7 days that match collection days)
  const availableDates = useMemo(() => {
    if (!offer) return [];
    
    const dates: { date: Date; dateStr: string; dayName: string }[] = [];
    const today = new Date();
    const locale = language === 'en' ? 'en-US' : 'vi-VN';
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      
      if (offer.collectionDays.includes(dayName)) {
        dates.push({
          date,
          dateStr: date.toISOString().split('T')[0],
          dayName: formatDate(date, { weekday: 'short', month: 'short', day: 'numeric' }, language)
        });
      }
      
      if (dates.length >= 5) break; // Show max 5 upcoming dates
    }
    
    return dates;
  }, [offer, language]);

  // Auto-select first available date
  useMemo(() => {
    if (availableDates.length > 0 && !selectedCollectionDate) {
      setSelectedCollectionDate(availableDates[0].dateStr);
    }
  }, [availableDates, selectedCollectionDate]);

  const subtotal = offer ? offer.price * quantity : 0;

  const selectedVoucher = useMemo(
    () => vouchers.find(v => v.id === selectedVoucherId) ?? null,
    [selectedVoucherId, vouchers]
  );

  const voucherDiscount = useMemo(() => {
    if (!selectedVoucher) return 0;
    return calculateVoucherDiscount(selectedVoucher, subtotal);
  }, [selectedVoucher, subtotal]);

  const finalTotal = Math.max(0, subtotal - voucherDiscount);

  const baseSavings = offer ? offer.originalValue - offer.price : 0;
  const totalSavings = baseSavings + voucherDiscount;

  const handlePay = () => {
    if (!selectedCollectionDate) return;
    const url = `/payment/${id}?total=${finalTotal}&quantity=${quantity}&collectionDate=${selectedCollectionDate}&voucherId=${encodeURIComponent(selectedVoucherId ?? '')}`;
    router.push(url as any);
  };

  if (!offer) {
    return (
      <View style={styles.container}>
        <Text>{t('checkout.offerNotFound')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('checkout.orderSummary')}</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>{t('checkout.vendor')}</Text>
            <Text style={styles.value}>{offer.vendor.name}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>{t('checkout.item')}</Text>
            <Text style={styles.value}>{offer.title}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>{t('common.quantity')}</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Ionicons name="remove" size={20} color={quantity <= 1 ? Colors.textGray : Colors.primary} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.min(offer.remainingQuantity, quantity + 1))}
                disabled={quantity >= offer.remainingQuantity}
              >
                <Ionicons name="add" size={20} color={quantity >= offer.remainingQuantity ? Colors.textGray : Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>{t('checkout.collectionTime')}</Text>
            <Text style={styles.value}>
              {formatCollectionTime(offer.collectionStart, offer.collectionEnd, offer.collectionDays, t, language)}
            </Text>
          </View>

          <View style={styles.dateSection}>
            <Text style={styles.dateLabel}>{t('checkout.selectCollectionDate')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
              {availableDates.map((dateOption) => (
                <TouchableOpacity
                  key={dateOption.dateStr}
                  style={[
                    styles.dateCard,
                    selectedCollectionDate === dateOption.dateStr && styles.dateCardSelected
                  ]}
                  onPress={() => setSelectedCollectionDate(dateOption.dateStr)}
                >
                  <Text style={[
                    styles.dateText,
                    selectedCollectionDate === dateOption.dateStr && styles.dateTextSelected
                  ]}>
                    {dateOption.dayName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>{t('checkout.location')}</Text>
            <Text style={styles.value}>{offer.vendor.address}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('checkout.vouchers')}</Text>

          <TouchableOpacity
            style={[styles.voucherCard, !selectedVoucherId && styles.voucherCardSelected]}
            onPress={() => setSelectedVoucherId(null)}
            activeOpacity={0.85}
          >
            <View style={styles.voucherLeft}>
              <Ionicons name="ticket-outline" size={20} color={Colors.text} />
              <View style={styles.voucherInfo}>
                <Text style={styles.voucherTitle}>{t('checkout.noVoucher')}</Text>
                <Text style={styles.voucherDesc}>{t('checkout.payFullPrice')}</Text>
              </View>
            </View>
            {!selectedVoucherId && <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />}
          </TouchableOpacity>

          {vouchers.map(voucher => {
            const discount = calculateVoucherDiscount(voucher, subtotal);
            const eligible = discount > 0;
            const isSelected = selectedVoucherId === voucher.id;

            return (
              <TouchableOpacity
                key={voucher.id}
                style={[
                  styles.voucherCard,
                  isSelected && styles.voucherCardSelected,
                  !eligible && styles.voucherCardDisabled,
                ]}
                onPress={() => eligible && setSelectedVoucherId(voucher.id)}
                activeOpacity={0.85}
                disabled={!eligible}
              >
                <View style={styles.voucherLeft}>
                  <Ionicons
                    name="ticket-outline"
                    size={20}
                    color={eligible ? Colors.text : Colors.textGray}
                  />
                  <View style={styles.voucherInfo}>
                    <View style={styles.voucherTitleRow}>
                      <Text style={[styles.voucherTitle, !eligible && styles.voucherTextDisabled]}>
                        {voucher.title}
                      </Text>
                      <View style={styles.voucherCodePill}>
                        <Text style={styles.voucherCodeText}>{voucher.code}</Text>
                      </View>
                    </View>
                    <Text style={[styles.voucherDesc, !eligible && styles.voucherTextDisabled]}>
                      {voucher.description}
                    </Text>
                    {!eligible && voucher.minOrder ? (
                      <Text style={styles.voucherHint}>
                        {t('checkout.minOrder')} {formatPrice(voucher.minOrder)}
                      </Text>
                    ) : (
                      <Text style={styles.voucherHint}>{t('checkout.save')} {formatPrice(discount)}</Text>
                    )}
                  </View>
                </View>
                {isSelected ? (
                  <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                ) : (
                  <Ionicons name="chevron-forward" size={18} color={Colors.textGray} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('checkout.paymentMethod')}</Text>
          <View style={styles.paymentOption}>
            <Ionicons name="card-outline" size={18} color={Colors.text} />
            <Text style={styles.paymentText}>MoMo / ZaloPay / VNPay</Text>
          </View>
        </View>

        <View style={styles.totalSection}>
          <View style={styles.totalBreakdownRow}>
            <Text style={styles.breakdownLabel}>{t('checkout.subtotal')}</Text>
            <Text style={styles.breakdownValue}>{formatPrice(subtotal)}</Text>
          </View>

          <View style={styles.totalBreakdownRow}>
            <Text style={styles.breakdownLabel}>{t('checkout.voucher')}</Text>
            <Text style={[styles.breakdownValue, voucherDiscount > 0 && styles.discountValue]}>
              {voucherDiscount > 0 ? `- ${formatPrice(voucherDiscount)}` : formatPrice(0)}
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t('checkout.total')}</Text>
            <Text style={styles.totalPrice}>{formatPrice(finalTotal)}</Text>
          </View>
          <Text style={styles.savings}>
            {t('checkout.youSave', { amount: formatPrice(totalSavings) })}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title={t('checkout.confirmPay')} onPress={handlePay} />
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
  },
  section: {
    backgroundColor: Colors.white,
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: Colors.textGray,
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgroundGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    minWidth: 30,
    textAlign: 'center',
  },
  dateSection: {
    marginVertical: 16,
  },
  dateLabel: {
    fontSize: 14,
    color: Colors.textGray,
    marginBottom: 12,
  },
  dateScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  dateCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.backgroundGray,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 120,
  },
  dateCardSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: Colors.primary,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  dateTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    backgroundColor: Colors.backgroundGray,
    borderRadius: 12,
  },
  paymentText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  totalSection: {
    backgroundColor: Colors.white,
    padding: 16,
  },
  totalBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    color: Colors.textGray,
    fontWeight: '600',
  },
  breakdownValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '700',
  },
  discountValue: {
    color: Colors.success,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  savings: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: '600',
  },
  voucherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundGray,
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 10,
  },
  voucherCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#E8F5E9',
  },
  voucherCardDisabled: {
    opacity: 0.6,
  },
  voucherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 8,
  },
  voucherInfo: {
    flex: 1,
  },
  voucherTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  voucherTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  voucherDesc: {
    fontSize: 13,
    color: Colors.textGray,
  },
  voucherHint: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  voucherCodePill: {
    backgroundColor: Colors.white,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  voucherCodeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  voucherTextDisabled: {
    color: Colors.textGray,
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
});
