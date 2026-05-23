import { Colors } from '@/constants/colors';
import { storage } from '@/services/storage';
import { formatPrice } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

export default function VendorDashboardScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const vendorId = 'v1'; // Mock vendor ID
  const reservations = storage.getVendorReservations(vendorId);
  const navigation = useNavigation();
  const todayOrders = reservations.filter(r => {
    const today = new Date().toDateString();
    return new Date(r.createdAt).toDateString() === today;
  });

  const monthlyEarnings = reservations
    .filter(r => r.status === 'Collected')
    .reduce((sum, r) => sum + r.offer.price * 0.9, 0);

  const trustScore = 4.8; // Hardcoded as requested

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeTitleRow}>
            <Text style={styles.welcomeText}>{t('vendor.welcomeBack')}</Text>
            <Ionicons name="hand-left-outline" size={22} color={Colors.white} />
          </View>
          <Text style={styles.welcomeSubtext}>{t('vendor.businessOverview')}</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{todayOrders.length}</Text>
            <Text style={styles.statLabel}>{t('vendor.todayOrders')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatPrice(monthlyEarnings)}</Text>
            <Text style={styles.statLabel}>{t('vendor.monthlyEarnings')}</Text>
          </View>
        </View>

        <View style={styles.trustScoreCard}>
          <View style={styles.trustScoreHeader}>
            <Text style={styles.trustScoreTitle}>{t('vendor.trustScore')}</Text>
            <View style={styles.trustScoreValue}>
              <Ionicons name="shield-checkmark-outline" size={18} color={Colors.secondary} />
              <Text style={styles.trustScoreValueText}>{trustScore.toFixed(1)}</Text>
            </View>
          </View>
          <Text style={styles.trustScoreDesc}>
            {t('vendor.trustScoreDesc')}
          </Text>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>{t('vendor.quickActions')}</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/create-bag')}
          >
            <Ionicons name="add-circle-outline" size={22} color={Colors.text} style={styles.actionIcon} />
            <Text style={styles.actionText}>{t('vendor.createNewBag')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(vendor)/incoming-orders')}
          >
            <Ionicons name="list-outline" size={22} color={Colors.text} style={styles.actionIcon} />
            <Text style={styles.actionText}>{t('vendor.viewOrders')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: '(consumer)' }],
              })
            )}
          >
            <Ionicons name="swap-horizontal-outline" size={22} color={Colors.text} style={styles.actionIcon} />
            <Text style={styles.actionText}>{t('vendor.switchToConsumer')}</Text>
          </TouchableOpacity>
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
  welcomeCard: {
    backgroundColor: Colors.secondary,
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  welcomeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textGray,
    textAlign: 'center',
  },
  trustScoreCard: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  trustScoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trustScoreTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  trustScoreValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustScoreValueText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.secondary,
  },
  trustScoreDesc: {
    fontSize: 14,
    color: Colors.textGray,
    lineHeight: 20,
  },
  quickActions: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  actionIcon: {
    marginRight: 16,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
});
