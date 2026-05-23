import { Button } from '@/components/button';
import { Colors } from '@/constants/colors';
import { storage } from '@/services/storage';
import { formatDistance, formatPrice, formatDate, formatTime } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const STAR_COLOR = '#F5A623';

export default function OfferDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t, language } = useLocale();
  const offer = storage.getOfferById(id as string);
  const reviews = offer ? storage.getReviewsForOffer(offer.id) : [];
  const [isFavorite, setIsFavorite] = useState(offer ? storage.isFavoriteOffer(offer.id) : false);
  const [reviewsExpanded, setReviewsExpanded] = useState(false);
  const [allergensExpanded, setAllergensExpanded] = useState(false);
  console.log(offer)

  if (!offer) {
    return (
      <View style={styles.container}>
        <Text>{t('offer.offerNotFound')}</Text>
      </View>
    );
  }

  const toggleFavorite = () => {
    const newState = storage.toggleFavoriteOffer(offer.id);
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

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  // Check if offer is new (created within last 7 days)
  const isNew = () => {
    const createdDate = new Date(offer.createdAt);
    const now = new Date();
    const daysDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          {offer.photos?.[0] ? (
            <Image
              source={{ uri: offer.photos[0] }}
              style={styles.headerImage}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="fast-food-outline" size={92} color={Colors.textGray} />
            </View>
          )}

          {/* Badges */}
          <View style={styles.badgesContainer}>
            {offer.remainingQuantity <= 3 && (
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>{t('offer.popular')}</Text>
              </View>
            )}
            {isNew() && (
              <View style={[styles.statusBadge, styles.newBadge]}>
                <Text style={styles.statusBadgeText}>{t('offer.new')}</Text>
              </View>
            )}
          </View>

          {/* Favorite Button */}
          <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={28}
              color={isFavorite ? Colors.secondary : Colors.white}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Vendor Info */}
          <TouchableOpacity
            style={styles.vendorCard}
            onPress={() => router.push(`/vendor/${offer.vendor.id}`)}
          >
            {offer.vendor.logoUrl ? (
              <Image
                source={{ uri: offer.vendor.logoUrl }}
                style={styles.vendorLogoImage}
                contentFit="cover"
                transition={150}
              />
            ) : (
              <Ionicons
                name={offer.vendor.logo as any}
                size={42}
                color={Colors.text}
                style={styles.vendorLogo}
              />
            )}
            <View style={styles.vendorInfo}>
              <Text style={styles.vendorName}>{offer.vendor.name}</Text>
              <View style={styles.vendorMeta}>
                <View style={styles.ratingContainer}>
                  <Ionicons
                    name="star"
                    size={14}
                    color={STAR_COLOR}
                    style={styles.starIcon}
                  />
                  <Text style={styles.ratingText}>{offer.vendor.rating}</Text>
                </View>
                <Text style={styles.metaDivider}>•</Text>
                <Text style={styles.metaText}>{formatDistance(offer.vendor.distance)}</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Bag Details Card */}
          <View style={styles.detailsCard}>
            <Text style={styles.title}>{offer.title}</Text>
            <Text style={styles.description}>{offer.description}</Text>

            {/* Pickup Time */}
            <View style={styles.infoRow}>
              <Ionicons
                name="time-outline"
                size={20}
                color={Colors.textGray}
                style={styles.infoIcon}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('offer.pickupTimes')}</Text>
                <Text style={styles.infoValue}>
                  {offer.collectionDays && offer.collectionDays.length > 0 ? (
                    <>
                      {offer.collectionDays.map(day => t(`daysOfWeekShort.${day}`)).join(', ')}{'\n'}
                      {formatTime(offer.collectionStart)} - {formatTime(offer.collectionEnd)}
                    </>
                  ) : (
                    `${formatTime(offer.collectionStart)} - ${formatTime(offer.collectionEnd)}`
                  )}
                </Text>
              </View>
            </View>

            {/* Location */}
            <View style={styles.infoRow}>
              <Ionicons
                name="location-outline"
                size={20}
                color={Colors.textGray}
                style={styles.infoIcon}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('offer.location')}</Text>
                <Text style={styles.infoValue}>{offer.vendor.address}</Text>
              </View>
            </View>

            {/* Dietary Tags */}
            {offer.dietaryTags.length > 0 && (
              <View style={styles.dietarySection}>
                <Text style={styles.dietaryLabel}>{t('offer.dietary')}</Text>
                <View style={styles.dietaryTags}>
                  {offer.dietaryTags.map(tag => (
                    <View key={tag} style={styles.dietaryTag}>
                      <Text style={styles.dietaryTagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Created Date */}
            <View style={styles.infoRow}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={Colors.textGray}
                style={styles.infoIcon}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('offer.listed')}</Text>
                <Text style={styles.infoValue}>
                  {formatDate(offer.createdAt, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  }, language)}
                </Text>
              </View>
            </View>

            {/* Price Section */}
            <View style={styles.priceSection}>
              <View style={styles.priceLeft}>
                <Text style={styles.priceLabel}>{t('offer.price')}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>{formatPrice(offer.price)}</Text>
                  <Text style={styles.originalPrice}>{formatPrice(offer.originalValue)}</Text>
                </View>
              </View>
              <View style={styles.priceRight}>
                <Text style={styles.savingsLabel}>{t('offer.youSave')}</Text>
                <Text style={styles.savings}>
                  {formatPrice(offer.originalValue - offer.price)}
                </Text>
              </View>
            </View>
          </View>

          {/* Overall Experience Section */}
          {reviews.length > 0 && (
            <View style={styles.overallCard}>
              <Text style={styles.overallTitle}>{t('offer.overallExperience')}</Text>
              <Text style={styles.overallSubtitle}>
                {t('offer.basedOn', { count: reviews.length })}
              </Text>
              <View style={styles.overallScoreContainer}>
                <Text style={styles.overallScore}>{averageRating.toFixed(1)}</Text>
                <View style={styles.overallStarsContainer}>
                  <View style={styles.overallStars}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <Ionicons
                        key={i}
                        name={i <= Math.round(averageRating) ? 'star' : 'star-outline'}
                        size={20}
                        color={STAR_COLOR}
                      />
                    ))}
                  </View>
                  <Text style={styles.overallRatingText}>
                    {averageRating >= 4.5 ? t('review.excellent') : averageRating >= 4 ? t('offer.veryGood') : averageRating >= 3 ? t('offer.good') : t('offer.fair')}
                  </Text>
                </View>
              </View>

              {/* Collapsible Reviews Toggle */}
              <TouchableOpacity
                style={styles.reviewsToggle}
                onPress={() => setReviewsExpanded(!reviewsExpanded)}
              >
                <Text style={styles.reviewsToggleText}>
                  {t('offer.recentReviews')} ({reviews.length})
                </Text>
                <Ionicons
                  name={reviewsExpanded ? 'chevron-up' : 'chevron-down'}
                  size={24}
                  color={Colors.primary}
                />
              </TouchableOpacity>

              {/* Collapsible Reviews Content */}
              {reviewsExpanded && (
                <View style={styles.reviewsContent}>
                  {reviews.slice(0, 3).map((review, index) => (
                    <View
                      key={review.id}
                      style={[
                        styles.reviewItem,
                        index < reviews.slice(0, 3).length - 1 && styles.reviewItemBorder
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
                          <View style={styles.reviewStars}>
                            {renderStars(review.rating)}
                          </View>
                        </View>
                      </View>

                      {/* Review Metrics */}
                      <View style={styles.metricsContainer}>
                        <View style={styles.metricItem}>
                          <Text style={styles.metricLabel}>{t('orders.collection')}</Text>
                          <View style={styles.metricStars}>
                            {renderStars(review.collectionRating)}
                          </View>
                        </View>
                        <View style={styles.metricItem}>
                          <Text style={styles.metricLabel}>{t('orders.quality')}</Text>
                          <View style={styles.metricStars}>
                            {renderStars(review.qualityRating)}
                          </View>
                        </View>
                        <View style={styles.metricItem}>
                          <Text style={styles.metricLabel}>{t('orders.quantityRating')}</Text>
                          <View style={styles.metricStars}>
                            {renderStars(review.quantityRating)}
                          </View>
                        </View>
                        <View style={styles.metricItem}>
                          <Text style={styles.metricLabel}>{t('orders.variety')}</Text>
                          <View style={styles.metricStars}>
                            {renderStars(review.varietyRating)}
                          </View>
                        </View>
                      </View>

                      <Text style={styles.reviewText}>{review.text}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Directions Section */}
          <View style={styles.directionsCard}>
            <Text style={styles.directionsTitle}>{t('offer.directions')}</Text>
            <View style={styles.addressRow}>
              <Ionicons name="location" size={20} color={Colors.primary} />
              <Text style={styles.addressText}>{offer.vendor.address}</Text>
            </View>

            {/* Map Placeholder */}
            <View style={styles.mapContainer}>
              <View style={styles.mapPlaceholder}>
                <Ionicons name="map-outline" size={48} color={Colors.textGray} />
                <Text style={styles.mapPlaceholderText}>Map View</Text>
              </View>
            </View>

            {/* Get Directions Button */}
            <TouchableOpacity
              style={styles.directionsButton}
              onPress={() => {
                // Open maps app with coordinates
                // In a real app, you'd use Linking.openURL with the vendor coordinates
              }}
            >
              <Text style={styles.directionsButtonText}>{t('offer.getDirections')}</Text>
            </TouchableOpacity>
          </View>

          {/* Collection Instructions Section */}
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>{t('offer.collectionInstructions')}</Text>
            <Text style={styles.instructionsText}>
              {t('offer.collectionInsText')}
            </Text>
          </View>

          {/* Ingredients & Allergens Section */}
          <View style={styles.allergensCard}>
            <TouchableOpacity
              style={styles.allergensHeader}
              onPress={() => setAllergensExpanded(!allergensExpanded)}
            >
              <Text style={styles.allergensTitle}>{t('offer.ingredientsnallergen')}</Text>
              <Ionicons
                name={allergensExpanded ? 'chevron-up' : 'chevron-down'}
                size={24}
                color={Colors.text}
              />
            </TouchableOpacity>

            {allergensExpanded && (
              <Text style={styles.allergensText}>
                {t('offer.ingredientsnallergentext')}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Reserve Button */}
      <View style={styles.footer}>
        <Button
          title={`${t('offer.reserveFor')} ${formatPrice(offer.price)}`}
          onPress={() => router.push(`/checkout/${offer.id}`)}
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
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 250,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: 100,
  },
  badgesContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  statusBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  newBadge: {
    backgroundColor: Colors.success,
  },
  statusBadgeText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  favoriteButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    padding: 16,
  },
  vendorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  vendorLogo: {
    fontSize: 48,
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
  vendorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginRight: 4,
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
  detailsCard: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: Colors.textGray,
    lineHeight: 24,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textGray,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  dietarySection: {
    marginBottom: 20,
  },
  dietaryLabel: {
    fontSize: 14,
    color: Colors.textGray,
    marginBottom: 8,
  },
  dietaryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dietaryTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  dietaryTagText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  priceLeft: {},
  priceLabel: {
    fontSize: 14,
    color: Colors.textGray,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
  },
  originalPrice: {
    fontSize: 18,
    color: Colors.textGray,
    textDecorationLine: 'line-through',
  },
  priceRight: {
    alignItems: 'flex-end',
  },
  savingsLabel: {
    fontSize: 14,
    color: Colors.textGray,
    marginBottom: 4,
  },
  savings: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.secondary,
  },
  directionsCard: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  directionsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 16,
  },
  addressText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    lineHeight: 22,
  },
  mapContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  mapPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholderText: {
    fontSize: 14,
    color: Colors.textGray,
    marginTop: 8,
  },
  directionsButton: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  directionsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  overallCard: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overallTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  overallSubtitle: {
    fontSize: 14,
    color: Colors.textGray,
    marginBottom: 20,
  },
  overallScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  overallScore: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.primary,
  },
  overallStarsContainer: {
    flex: 1,
  },
  overallStars: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 4,
  },
  overallRatingText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  reviewsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  reviewsToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  reviewsContent: {
    marginTop: 16,
  },
  reviewItem: {
    marginBottom: 16,
  },
  reviewItemBorder: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
    marginBottom: 4,
  },
  reviewStars: {
    flexDirection: 'row',
  },
  star: {
    marginRight: 2,
  },
  reviewText: {
    fontSize: 14,
    color: Colors.textGray,
    lineHeight: 20,
  },
  instructionsCard: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  allergensCard: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  allergensHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  allergensTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  allergensText: {
    fontSize: 15,
    color: Colors.textGray,
    lineHeight: 22,
    marginTop: 16,
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
  footer: {
    padding: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
});
