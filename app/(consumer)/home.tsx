import { OfferCard } from '@/components/offer-card';
import { Colors } from '@/constants/colors';
import { storage } from '@/services/storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const offers = storage.getOffers();
  const currentUser = storage.getCurrentUser();
  const userPreferences = currentUser?.preferences;

  // Based on preferences - match food types and dietary preferences
  const preferenceMatches = userPreferences ? offers.filter(o => {
    const matchesFoodType = userPreferences.foodTypes?.length > 0 
      ? userPreferences.foodTypes.includes(o.foodType)
      : true;
    
    const matchesDietary = userPreferences.dietary?.length > 0
      ? o.dietaryTags.some(tag => userPreferences.dietary.includes(tag))
      : true;
    
    return matchesFoodType && matchesDietary;
  }) : [];

  const collectNow = offers.filter(o => {
    const start = new Date(o.collectionStart);
    const now = new Date();
    return start <= now;
  });

  const collectToday = offers.filter(o => {
    const end = new Date(o.collectionEnd);
    const now = new Date();
    const today = new Date();
    // Must end today AND not yet expired
    return end.toDateString() === today.toDateString() && end > now;
  });

  const nearest = [...offers].sort((a, b) => a.vendor.distance - b.vendor.distance);

  // Your Favorites - individual favorited offers + offers from favorited vendors
  const favoriteOfferIds = storage.getFavoriteOffers().map(o => o.id);
  const favoriteVendorIds = storage.getFavoriteVendors();
  
  // Combine and deduplicate favorites
  const allFavoriteOffers = offers.filter(o => 
    favoriteOfferIds.includes(o.id) || favoriteVendorIds.includes(o.vendorId)
  );

  // Dietary categories
  const meatOffers = offers.filter(o => o.dietaryTags.includes('Meat'));
  const vegOffers = offers.filter(o => 
    o.dietaryTags.includes('Vegetarian') || o.dietaryTags.includes('Vegan')
  );

  const handleSeeAll = (category: string) => {
    router.push(`/category/${category}`);
  };

  const renderSection = (iconName: any, title: string, data: typeof offers, category: string) => {
    if (data.length === 0) return null;
    
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name={iconName} size={18} color={Colors.text} />
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
          <TouchableOpacity 
            style={styles.seeAllButton}
            onPress={() => handleSeeAll(category)}
          >
            <Text style={styles.seeAllText}>{t('common.seeAll')}</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          {data.slice(0, 5).map(offer => (
            <View key={offer.id} style={styles.cardWrapper}>
              <OfferCard
                offer={offer}
                onPress={() => router.push(`/offer/${offer.id}`)}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {renderSection('sparkles-outline', t('home.basedOnPreferences'), preferenceMatches, 'preferences')}
        {renderSection('flame-outline', t('home.collectNow'), collectNow, 'collect-now')}
        {renderSection('calendar-outline', t('home.collectToday'), collectToday, 'collect-today')}
        {renderSection('location-outline', t('home.nearestToYou'), nearest.slice(0, 5), 'nearest')}
        {renderSection('heart-outline', t('home.yourFavorites'), allFavoriteOffers, 'favorites')}
        {renderSection('restaurant-outline', t('home.meat'), meatOffers.slice(0, 5), 'meat')}
        {renderSection('leaf-outline', t('home.vegetarian'), vegOffers.slice(0, 5), 'vegetarian')}
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
  hero: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  horizontalScroll: {
    paddingRight: 16,
  },
  cardWrapper: {
    width: 320,
    marginRight: 12,
  },
});
