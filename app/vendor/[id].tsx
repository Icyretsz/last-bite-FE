import { OfferCard } from '@/components/offer-card';
import { Colors } from '@/constants/colors';
import { mockVendors } from '@/services/mockData';
import { storage } from '@/services/storage';
import { formatDistance } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const STAR_COLOR = '#F5A623';

export default function VendorProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'offers' | 'reviews'>('offers');
  const [isFavorite, setIsFavorite] = useState(storage.isFavoriteVendor(id as string));
  
  const vendor = mockVendors.find(v => v.id === id);
  const offers = storage.getVendorOffers(id as string);
  
  // Get all reviews for this vendor's offers
  const allReviews = offers.flatMap(offer => 
    storage.getReviewsForOffer(offer.id).map(review => ({
      ...review,
      offerTitle: offer.title,
    }))
  );

  if (!vendor) {
    return (
      <View style={styles.container}>
        <Text>Vendor not found</Text>
      </View>
    );
  }

  const toggleFavorite = () => {
    const newState = storage.toggleFavoriteVendor(vendor.id);
    setIsFavorite(newState);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={14}
          color={STAR_COLOR}
          style={styles.star}
        />
      );
    }
    return stars;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {vendor.logoUrl ? (
          <Image
            source={{ uri: vendor.logoUrl }}
            style={styles.logoImage}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <Ionicons name={vendor.logo as any} size={72} color={Colors.text} style={styles.logo} />
        )}
        <Text style={styles.name}>{vendor.name}</Text>
        <Text style={styles.address}>{vendor.address}</Text>
        <Text style={styles.distance}>{formatDistance(vendor.distance)} away</Text>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <View style={styles.statValueRow}>
              <Ionicons name="star" size={16} color={STAR_COLOR} />
              <Text style={styles.statValueText}>{vendor.rating.toFixed(1)}</Text>
            </View>
            <Text style={styles.statLabel}>{vendor.reviewCount} reviews</Text>
          </View>
          <View style={styles.stat}>
            <View style={styles.statValueRow}>
              <Ionicons name="shield-checkmark-outline" size={16} color={Colors.primary} />
              <Text style={styles.statValueText}>{vendor.trustScore.toFixed(1)}</Text>
            </View>
            <Text style={styles.statLabel}>Trust Score</Text>
          </View>
        </View>

        {/* Favorite Button */}
        <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={28}
            color={isFavorite ? Colors.secondary : Colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'offers' && styles.tabActive]}
          onPress={() => setActiveTab('offers')}
        >
          <Text style={[styles.tabText, activeTab === 'offers' && styles.tabTextActive]}>
            Bags
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reviews' && styles.tabActive]}
          onPress={() => setActiveTab('reviews')}
        >
          <Text style={[styles.tabText, activeTab === 'reviews' && styles.tabTextActive]}>
            Reviews ({allReviews.length})
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'offers' ? (
          <>
            <Text style={styles.sectionTitle}>Available Bags</Text>
            {offers.filter(o => o.isActive).map(offer => (
              <View key={offer.id} style={styles.offerCardWrapper}>
                <OfferCard
                  offer={offer}
                  onPress={() => router.push(`/offer/${offer.id}`)}
                />
              </View>
            ))}

            {offers.filter(o => o.isActive).length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No bags available right now</Text>
              </View>
            )}
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>All Reviews</Text>
            {allReviews.map((review, index) => (
              <View 
                key={review.id} 
                style={[
                  styles.reviewCard,
                  index < allReviews.length - 1 && styles.reviewCardMargin
                ]}
              >
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewAvatarText}>
                      {getInitials(review.userName)}
                    </Text>
                  </View>
                  <View style={styles.reviewHeaderInfo}>
                    <Text style={styles.reviewAuthor}>{review.userName}</Text>
                    <Text style={styles.reviewOfferTitle}>{review.offerTitle}</Text>
                    <View style={styles.reviewStars}>
                      {renderStars(review.rating)}
                    </View>
                  </View>
                </View>

                {/* Review Metrics */}
                <View style={styles.metricsContainer}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Collection</Text>
                    <View style={styles.metricStars}>
                      {renderStars(review.collectionRating)}
                    </View>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Quality</Text>
                    <View style={styles.metricStars}>
                      {renderStars(review.qualityRating)}
                    </View>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Quantity</Text>
                    <View style={styles.metricStars}>
                      {renderStars(review.quantityRating)}
                    </View>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Variety</Text>
                    <View style={styles.metricStars}>
                      {renderStars(review.varietyRating)}
                    </View>
                  </View>
                </View>

                <Text style={styles.reviewText}>{review.text}</Text>
                <Text style={styles.reviewDate}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </Text>
              </View>
            ))}

            {allReviews.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No reviews yet</Text>
              </View>
            )}
          </>
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
  header: {
    position: 'relative',
    backgroundColor: Colors.white,
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  logo: {
    marginBottom: 16,
  },
  logoImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 16,
    backgroundColor: '#E8E8E8',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  address: {
    fontSize: 16,
    color: Colors.textGray,
    marginBottom: 4,
  },
  distance: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 24,
  },
  stats: {
    flexDirection: 'row',
    gap: 40,
  },
  stat: {
    alignItems: 'center',
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  statValueText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textGray,
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    padding: 16,
  },
  offerCardWrapper: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textGray,
  },
  reviewCard: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewCardMargin: {
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reviewAvatarText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  reviewHeaderInfo: {
    flex: 1,
  },
  reviewAuthor: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  reviewOfferTitle: {
    fontSize: 14,
    color: Colors.textGray,
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
    gap: 12,
    marginBottom: 12,
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
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: Colors.textGray,
  },
});
