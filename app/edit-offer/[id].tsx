import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Colors } from '@/constants/colors';
import { storage } from '@/services/storage';
import { BagSize, DietaryType, FoodType } from '@/types';
import { formatPrice, formatDate, formatTime } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocale } from '@/hooks/useLocale';

const STAR_COLOR = '#F5A623';

type TabType = 'details' | 'edit';

export default function VendorOfferScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t, language } = useLocale();
  const offer = storage.getOfferById(id as string);
  const reviews = offer ? storage.getReviewsForOffer(offer.id) : [];
  
  const [activeTab, setActiveTab] = useState<TabType>('details');

  // Edit form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalValue, setOriginalValue] = useState('');
  const [quantity, setQuantity] = useState('');
  const [bagSize, setBagSize] = useState<BagSize>('Medium');
  const [foodType, setFoodType] = useState<FoodType>('Meals');
  const [dietary, setDietary] = useState<DietaryType[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [collectionStartHour, setCollectionStartHour] = useState('18');
  const [collectionStartMinute, setCollectionStartMinute] = useState('00');
  const [collectionEndHour, setCollectionEndHour] = useState('20');
  const [collectionEndMinute, setCollectionEndMinute] = useState('00');
  const [collectionDays, setCollectionDays] = useState<string[]>([]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const bagSizes: BagSize[] = ['Small', 'Medium', 'Large'];
  const foodTypes: FoodType[] = ['Meals', 'Pastries', 'Drinks', 'Grocery'];
  const dietaryOptions: DietaryType[] = ['Meat', 'Vegetarian', 'Vegan'];

  useEffect(() => {
    if (offer) {
      setTitle(offer.title);
      setDescription(offer.description);
      setPrice(offer.price.toString());
      setOriginalValue(offer.originalValue.toString());
      setQuantity(offer.quantity.toString());
      setBagSize(offer.bagSize);
      setFoodType(offer.foodType);
      setDietary(offer.dietaryTags);
      setIsActive(offer.isActive);
      setCollectionDays(offer.collectionDays || []);

      const startDate = new Date(offer.collectionStart);
      const endDate = new Date(offer.collectionEnd);
      setCollectionStartHour(startDate.getHours().toString().padStart(2, '0'));
      setCollectionStartMinute(startDate.getMinutes().toString().padStart(2, '0'));
      setCollectionEndHour(endDate.getHours().toString().padStart(2, '0'));
      setCollectionEndMinute(endDate.getMinutes().toString().padStart(2, '0'));
    }
  }, [offer]);

  if (!offer) {
    return (
      <View style={styles.container}>
        <Text>{t('offer.offerNotFound')}</Text>
      </View>
    );
  }

  const toggleDietary = (type: DietaryType) => {
    setDietary(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleDay = (day: string) => {
    setCollectionDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSave = () => {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setHours(parseInt(collectionStartHour), parseInt(collectionStartMinute), 0, 0);
    
    const endDate = new Date(now);
    endDate.setHours(parseInt(collectionEndHour), parseInt(collectionEndMinute), 0, 0);

    storage.updateOffer(offer.id, {
      title,
      description,
      price: parseFloat(price),
      originalValue: parseFloat(originalValue),
      quantity: parseInt(quantity),
      bagSize,
      foodType,
      dietaryTags: dietary,
      isActive,
      collectionStart: startDate.toISOString(),
      collectionEnd: endDate.toISOString(),
      collectionDays,
    });

    router.back();
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map(star => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={14}
            color={STAR_COLOR}
          />
        ))}
      </View>
    );
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'details' && styles.tabActive]}
          onPress={() => setActiveTab('details')}
        >
          <Text style={[styles.tabText, activeTab === 'details' && styles.tabTextActive]}>
            {t('offer.details')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'edit' && styles.tabActive]}
          onPress={() => setActiveTab('edit')}
        >
          <Text style={[styles.tabText, activeTab === 'edit' && styles.tabTextActive]}>
            {t('common.edit')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {activeTab === 'details' ? (
          <View style={styles.content}>
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
            </View>

            {/* Bag Details */}
            <View style={styles.detailsCard}>
              <Text style={styles.title}>{offer.title}</Text>
              <Text style={styles.description}>{offer.description}</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('offer.pickupTimes')}:</Text>
                <Text style={styles.infoValue}>
                  {offer.collectionDays && offer.collectionDays.length > 0 && (
                    <>{offer.collectionDays.map(day => t(`daysOfWeekShort.${day}`)).join(', ')}{'\n'}</>
                  )}
                  {formatTime(offer.collectionStart, { hour: '2-digit', minute: '2-digit', hour12: false }, language)} - {formatTime(offer.collectionEnd, { hour: '2-digit', minute: '2-digit', hour12: false }, language)}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('offer.bagSize')}:</Text>
                <Text style={styles.infoValue}>{offer.bagSize}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('offer.foodType')}:</Text>
                <Text style={styles.infoValue}>{t(`foodTypes.${offer.foodType.toLowerCase()}`)}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('offer.listed')}:</Text>
                <Text style={styles.infoValue}>
                  {formatDate(offer.createdAt, { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  }, language)}
                </Text>
              </View>

              {offer.dietaryTags.length > 0 && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{t('offer.dietary')}:</Text>
                  <View style={styles.dietaryTags}>
                    {offer.dietaryTags.map(tag => (
                      <View key={tag} style={styles.dietaryTag}>
                        <Text style={styles.dietaryTagText}>{t(`dietary.${tag.toLowerCase()}`)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.priceSection}>
                <View>
                  <Text style={styles.priceLabel}>{t('offer.price')}</Text>
                  <Text style={styles.price}>{formatPrice(offer.price)}</Text>
                </View>
                <View>
                  <Text style={styles.priceLabel}>{t('offer.originalValue')}</Text>
                  <Text style={styles.originalPrice}>{formatPrice(offer.originalValue)}</Text>
                </View>
                <View>
                  <Text style={styles.priceLabel}>{t('common.quantity')}</Text>
                  <Text style={styles.quantityText}>{offer.remainingQuantity}/{offer.quantity}</Text>
                </View>
              </View>
            </View>

            {/* Reviews Section */}
            {reviews.length > 0 && (
              <View style={styles.reviewsCard}>
                <Text style={styles.reviewsTitle}>{t('offer.customerReviews')}</Text>
                <Text style={styles.reviewsSubtitle}>
                  {reviews.length === 1 
                    ? t('offer.basedOnReviews', { count: reviews.length })
                    : t('offer.basedOnReviewsPlural', { count: reviews.length })
                  }
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
                      {averageRating >= 4.5 ? t('offer.excellent') : averageRating >= 4 ? t('offer.veryGood') : averageRating >= 3 ? t('offer.good') : t('offer.fair')}
                    </Text>
                  </View>
                </View>

                {reviews.map((review, index) => (
                  <View 
                    key={review.id} 
                    style={[
                      styles.reviewItem,
                      index < reviews.length - 1 && styles.reviewItemBorder
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
                        {renderStars(review.rating)}
                      </View>
                    </View>

                    <View style={styles.metricsContainer}>
                      <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>{t('orders.collection')}: {review.collectionRating}/5</Text>
                      </View>
                      <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>{t('orders.quality')}: {review.qualityRating}/5</Text>
                      </View>
                      <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>{t('orders.quantityRating')}: {review.quantityRating}/5</Text>
                      </View>
                      <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>{t('orders.variety')}: {review.varietyRating}/5</Text>
                      </View>
                    </View>

                    {review.text && (
                      <Text style={styles.reviewText}>{review.text}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.content}>
            <Input
              label={t('offer.title')}
              value={title}
              onChangeText={setTitle}
              placeholder={t('offer.titlePlaceholder')}
            />

            <Input
              label={t('offer.description')}
              value={description}
              onChangeText={setDescription}
              placeholder={t('offer.descriptionPlaceholder')}
              multiline
              numberOfLines={3}
            />

            <Input
              label={`${t('offer.price')} (VND)`}
              value={price}
              onChangeText={setPrice}
              placeholder={t('offer.pricePlaceholder')}
              keyboardType="numeric"
            />

            <Input
              label={`${t('offer.originalValue')} (VND)`}
              value={originalValue}
              onChangeText={setOriginalValue}
              placeholder={t('offer.originalValuePlaceholder')}
              keyboardType="numeric"
            />

            <Input
              label={t('common.quantity')}
              value={quantity}
              onChangeText={setQuantity}
              placeholder={t('offer.quantityPlaceholder')}
              keyboardType="numeric"
            />

            <View style={styles.section}>
              <Text style={styles.label}>{t('offer.collectionDays')}</Text>
              <View style={styles.chipContainer}>
                {daysOfWeek.map(day => (
                  <TouchableOpacity
                    key={day}
                    style={[styles.chip, collectionDays.includes(day) && styles.chipSelected]}
                    onPress={() => toggleDay(day)}
                  >
                    <Text style={[styles.chipText, collectionDays.includes(day) && styles.chipTextSelected]}>
                      {t(`daysOfWeekShort.${day}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>{t('offer.collectionTime')}</Text>
              <View style={styles.timeRow}>
                <View style={styles.timeGroup}>
                  <Text style={styles.timeLabel}>{t('offer.startTime')}</Text>
                  <View style={styles.timeInputs}>
                    <Input
                      value={collectionStartHour}
                      onChangeText={setCollectionStartHour}
                      placeholder="18"
                      keyboardType="numeric"
                    />
                    <Text style={styles.timeSeparator}>:</Text>
                    <Input
                      value={collectionStartMinute}
                      onChangeText={setCollectionStartMinute}
                      placeholder="00"
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                <View style={styles.timeGroup}>
                  <Text style={styles.timeLabel}>{t('offer.endTime')}</Text>
                  <View style={styles.timeInputs}>
                    <Input
                      value={collectionEndHour}
                      onChangeText={setCollectionEndHour}
                      placeholder="20"
                      keyboardType="numeric"
                    />
                    <Text style={styles.timeSeparator}>:</Text>
                    <Input
                      value={collectionEndMinute}
                      onChangeText={setCollectionEndMinute}
                      placeholder="00"
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>{t('offer.bagSize')}</Text>
              <View style={styles.chipContainer}>
                {bagSizes.map(size => (
                  <TouchableOpacity
                    key={size}
                    style={[styles.chip, bagSize === size && styles.chipSelected]}
                    onPress={() => setBagSize(size)}
                  >
                    <Text style={[styles.chipText, bagSize === size && styles.chipTextSelected]}>
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>{t('offer.foodType')}</Text>
              <View style={styles.chipContainer}>
                {foodTypes.map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.chip, foodType === type && styles.chipSelected]}
                    onPress={() => setFoodType(type)}
                  >
                    <Text style={[styles.chipText, foodType === type && styles.chipTextSelected]}>
                      {t(`foodTypes.${type.toLowerCase()}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>{t('offer.dietaryTags')}</Text>
              <View style={styles.chipContainer}>
                {dietaryOptions.map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.chip, dietary.includes(type) && styles.chipSelected]}
                    onPress={() => toggleDietary(type)}
                  >
                    <Text style={[styles.chipText, dietary.includes(type) && styles.chipTextSelected]}>
                      {t(`dietary.${type.toLowerCase()}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setIsActive(!isActive)}
            >
              <Text style={styles.toggleLabel}>{t('offer.active')}</Text>
              <View style={[styles.toggle, isActive && styles.toggleActive]}>
                <View style={[styles.toggleThumb, isActive && styles.toggleThumbActive]} />
              </View>
            </TouchableOpacity>

            <Button title={t('offer.saveChanges')} onPress={handleSave} />
          </View>
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
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
  detailsCard: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
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
    marginBottom: 12,
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
  dietaryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
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
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  priceLabel: {
    fontSize: 12,
    color: Colors.textGray,
    marginBottom: 4,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  originalPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textGray,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  reviewsCard: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  reviewsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  reviewsSubtitle: {
    fontSize: 14,
    color: Colors.textGray,
    marginBottom: 20,
  },
  overallScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
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
    marginBottom: 4,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  metricItem: {
    backgroundColor: Colors.backgroundGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.textGray,
    fontWeight: '600',
  },
  reviewText: {
    fontSize: 14,
    color: Colors.textGray,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 16,
  },
  timeGroup: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    color: Colors.textGray,
    marginBottom: 8,
  },
  timeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeSeparator: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: '#E5E5E5',
  },
  chipSelected: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  chipTextSelected: {
    color: Colors.white,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.textGray,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: Colors.primary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.white,
  },
  toggleThumbActive: {
    transform: [{ translateX: 22 }],
  },
});
