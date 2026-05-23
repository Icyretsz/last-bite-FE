import { Button } from '@/components/button';
import { Colors } from '@/constants/colors';
import { storage } from '@/services/storage';
import { formatPrice } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocale } from '@/hooks/useLocale';

export default function PaymentScreen() {
  const { id, total, quantity, collectionDate, voucherId } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useLocale();
  const [selectedMethod, setSelectedMethod] = useState<string>('momo');
  const [loading, setLoading] = useState(false);
  const offer = storage.getOfferById(id as string);

  if (!offer) {
    return (
      <View style={styles.container}>
        <Text>{t('checkout.offerNotFound')}</Text>
      </View>
    );
  }

  const parsedTotal = typeof total === 'string' ? Number(total) : NaN;
  const finalTotal = Number.isFinite(parsedTotal) ? Math.max(0, Math.round(parsedTotal)) : offer.price;
  const parsedQuantity = typeof quantity === 'string' ? Number(quantity) : 1;
  const collectionDateStr = typeof collectionDate === 'string' ? collectionDate : new Date().toISOString().split('T')[0];
  const appliedVoucherId = typeof voucherId === 'string' && voucherId.length > 0 ? voucherId : undefined;
  const discountAmount = Math.max(0, (offer.price * parsedQuantity) - finalTotal);

  const handlePay = () => {
    setLoading(true);
    // Mock payment - instant success
    setTimeout(() => {
      const reservation = storage.createReservation(offer.id, {
        quantity: parsedQuantity,
        collectionDate: collectionDateStr,
        voucherId: appliedVoucherId,
        discountAmount: discountAmount > 0 ? discountAmount : undefined,
        paidPrice: finalTotal,
      });
      setLoading(false);
      router.replace(`/confirmation/${reservation.id}`);
    }, 1500);
  };

  const paymentMethods = [
    { id: 'momo', name: 'MoMo', iconName: 'wallet-outline' },
    { id: 'zalopay', name: 'ZaloPay', iconName: 'card-outline' },
    { id: 'vnpay', name: 'VNPay', iconName: 'business-outline' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('checkout.selectPaymentMethod')}</Text>

        {paymentMethods.map(method => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodCard,
              selectedMethod === method.id && styles.methodCardSelected,
            ]}
            onPress={() => setSelectedMethod(method.id)}
          >
            <Ionicons name={method.iconName as any} size={26} color={Colors.text} style={styles.methodIcon} />
            <Text style={styles.methodName}>{method.name}</Text>
            {selectedMethod === method.id && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
        ))}

        <View style={styles.qrSection}>
          <Text style={styles.qrTitle}>{t('checkout.scanQrToPay')}</Text>
          <View style={styles.qrPlaceholder}>
            <Ionicons name="qr-code-outline" size={60} color={Colors.textGray} style={styles.qrIcon} />
            <Text style={styles.qrText}>{t('checkout.qrCode')}</Text>
          </View>
          <Text style={styles.amount}>{formatPrice(finalTotal)}</Text>
          {discountAmount > 0 && (
            <Text style={styles.discountNote}>{t('checkout.savedWithVoucher', { amount: formatPrice(discountAmount) })}</Text>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <Button 
          title={loading ? t('checkout.processing') : t('checkout.payNow')} 
          onPress={handlePay}
          loading={loading}
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 24,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  methodCardSelected: {
    borderColor: Colors.primary,
  },
  methodIcon: {
    marginRight: 16,
  },
  methodName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  checkmark: {
    fontSize: 24,
    color: Colors.primary,
  },
  qrSection: {
    backgroundColor: Colors.white,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: Colors.backgroundGray,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  qrIcon: {
    marginBottom: 8,
  },
  qrText: {
    fontSize: 14,
    color: Colors.textGray,
  },
  amount: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
  },
  discountNote: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.success,
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
});
