import { OfferCard } from '@/components/offer-card';
import { Colors } from '@/constants/colors';
import { mockVendors } from '@/services/mockData';
import { storage } from '@/services/storage';
import { formatDistance } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

const STAR_COLOR = '#F5A623';

export default function FavoritesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'offers' | 'vendors'>('offers');

  const favoriteOffers = storage.getFavoriteOffers();
  const favoriteVendorIds = storage.getFavoriteVendors();
  const favoriteVendors = mockVendors.filter(v => favoriteVendorIds.includes(v.id));

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'offers' && styles.tabActive]}
          onPress={() => setActiveTab('offers')}
        >
          <Text style={[styles.tabText, activeTab === 'offers' && styles.tabTextActive]}>
            {t('favorites.bags')} ({favoriteOffers.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'vendors' && styles.tabActive]}
          onPress={() => setActiveTab('vendors')}
        >
          <Text style={[styles.tabText, activeTab === 'vendors' && styles.tabTextActive]}>
            {t('favorites.vendors')} ({favoriteVendors.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'offers' ? (
          <>
            {favoriteOffers.map(offer => (
              <View key={offer.id} style={styles.offerCardWrapper}>
                <OfferCard
                  offer={offer}
                  onPress={() => router.push(`/offer/${offer.id}`)}
                />
              </View>
            ))}

            {favoriteOffers.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="heart-outline" size={64} color={Colors.textGray} />
                <Text style={styles.emptyText}>{t('favorites.noFavoriteBags')}</Text>
                <Text style={styles.emptySubtext}>
                  {t('favorites.noFavoriteBagsSubtext')}
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            {favoriteVendors.map(vendor => (
              <TouchableOpacity
                key={vendor.id}
                style={styles.vendorCard}
                onPress={() => router.push(`/vendor/${vendor.id}`)}
              >
                {vendor.logoUrl ? (
                  <Image
                    source={{ uri: vendor.logoUrl }}
                    style={styles.vendorLogoImage}
                    contentFit="cover"
                    transition={150}
                  />
                ) : (
                  <Ionicons
                    name={vendor.logo as any}
                    size={48}
                    color={Colors.text}
                    style={styles.vendorLogo}
                  />
                )}
                <View style={styles.vendorInfo}>
                  <Text style={styles.vendorName}>{vendor.name}</Text>
                  <Text style={styles.vendorAddress}>{vendor.address}</Text>
                  <View style={styles.vendorMeta}>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={14} color={STAR_COLOR} />
                      <Text style={styles.ratingText}>{vendor.rating}</Text>
                    </View>
                    <Text style={styles.metaDivider}>•</Text>
                    <Text style={styles.metaText}>{formatDistance(vendor.distance)}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color={Colors.textGray} />
              </TouchableOpacity>
            ))}

            {favoriteVendors.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="heart-outline" size={64} color={Colors.textGray} />
                <Text style={styles.emptyText}>{t('favorites.noFavoriteVendors')}</Text>
                <Text style={styles.emptySubtext}>
                  {t('favorites.noFavoriteVendorsSubtext')}
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textGray,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  offerCardWrapper: {
    marginBottom: 16,
  },
  vendorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  vendorLogo: {
    marginRight: 12,
  },
  vendorLogoImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 12,
    backgroundColor: '#E8E8E8',
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  vendorAddress: {
    fontSize: 14,
    color: Colors.textGray,
    marginBottom: 4,
  },
  vendorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: Colors.textGray,
  },
  metaDivider: {
    marginHorizontal: 8,
    color: Colors.textGray,
  },
  metaText: {
    fontSize: 14,
    color: Colors.textGray,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textGray,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
