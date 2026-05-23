import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Colors } from '@/constants/colors';
import { storage } from '@/services/storage';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

const STAR_COLOR = '#F5A623';

export default function ReviewScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const reservation = storage.getReservationById(id as string);
  const [collectionRating, setCollectionRating] = useState(5);
  const [qualityRating, setQualityRating] = useState(5);
  const [quantityRating, setQuantityRating] = useState(5);
  const [varietyRating, setVarietyRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  if (!reservation) {
    return (
      <View style={styles.container}>
        <Text>{t('review.reservationNotFound')}</Text>
      </View>
    );
  }

  const handleSubmit = () => {
    const user = storage.getCurrentUser();
    const avgRating = (collectionRating + qualityRating + quantityRating + varietyRating) / 4;
    storage.createReview({
      offerId: reservation.offer.id,
      userId: user?.id || 'u1',
      userName: user?.name || 'Anonymous',
      reservationId: reservation.id,
      rating: avgRating,
      collectionRating,
      qualityRating,
      quantityRating,
      varietyRating,
      text: reviewText,
      photos: [],
    });
    router.back();
  };

  const renderStarSelector = (currentRating: number, setRatingFunc: (r: number) => void) => {
    return (
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity
            key={star}
            onPress={() => setRatingFunc(star)}
          >
            <Ionicons
              name={star <= currentRating ? 'star' : 'star-outline'}
              size={32}
              color={STAR_COLOR}
              style={styles.star}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.offerInfo}>
            <Text style={styles.vendorName}>{reservation.offer.vendor.name}</Text>
            <Text style={styles.offerTitle}>{reservation.offer.title}</Text>
          </View>

          <View style={styles.ratingsSection}>
            <Text style={styles.sectionTitle}>{t('review.rateYourExperience')}</Text>
            
            <View style={styles.ratingItem}>
              <Text style={styles.ratingLabel}>{t('review.collection')}</Text>
              {renderStarSelector(collectionRating, setCollectionRating)}
            </View>

            <View style={styles.ratingItem}>
              <Text style={styles.ratingLabel}>{t('review.quality')}</Text>
              {renderStarSelector(qualityRating, setQualityRating)}
            </View>

            <View style={styles.ratingItem}>
              <Text style={styles.ratingLabel}>{t('review.quantity')}</Text>
              {renderStarSelector(quantityRating, setQuantityRating)}
            </View>

            <View style={styles.ratingItem}>
              <Text style={styles.ratingLabel}>{t('review.variety')}</Text>
              {renderStarSelector(varietyRating, setVarietyRating)}
            </View>
          </View>

          <View style={styles.textSection}>
            <Text style={styles.sectionTitle}>{t('review.tellUsMore')}</Text>
            <Input
              value={reviewText}
              onChangeText={setReviewText}
              placeholder={t('review.shareExperience')}
              multiline
              numberOfLines={4}
            />
          </View>

          <Button title={t('review.submitReview')} onPress={handleSubmit} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  content: {
    padding: 24,
  },
  offerInfo: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  vendorName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  offerTitle: {
    fontSize: 16,
    color: Colors.textGray,
  },
  ratingsSection: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  ratingItem: {
    marginBottom: 20,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  stars: {
    flexDirection: 'row',
    gap: 8,
  },
  star: {
    marginRight: 2,
  },
  textSection: {
    marginBottom: 24,
  },
});
