import { OfferCard } from '@/components/offer-card';
import { Colors } from '@/constants/colors';
import { storage } from '@/services/storage';
import { Offer } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function CategoryListScreen() {
  const { type } = useLocalSearchParams();
  const router = useRouter();
  const allOffers = storage.getOffers();
  const currentUser = storage.getCurrentUser();
  const userPreferences = currentUser?.preferences;

  const getCategoryData = (categoryType: string): { title: string; icon: any; offers: Offer[] } => {
    switch (categoryType) {
      case 'preferences':
        const preferenceMatches = userPreferences ? allOffers.filter(o => {
          const matchesFoodType = userPreferences.foodTypes?.length > 0 
            ? userPreferences.foodTypes.includes(o.foodType)
            : true;
          
          const matchesDietary = userPreferences.dietary?.length > 0
            ? o.dietaryTags.some(tag => userPreferences.dietary.includes(tag))
            : true;
          
          return matchesFoodType && matchesDietary;
        }) : [];
        return { title: 'Based on Your Preferences', icon: 'sparkles-outline', offers: preferenceMatches };
      
      case 'collect-now':
        const collectNow = allOffers.filter(o => {
          const start = new Date(o.collectionStart);
          const now = new Date();
          return start <= now;
        });
        return { title: 'Collect Now', icon: 'flame-outline', offers: collectNow };
      
      case 'collect-today':
        const collectToday = allOffers.filter(o => {
          const end = new Date(o.collectionEnd);
          const today = new Date();
          return end.toDateString() === today.toDateString();
        });
        return { title: 'Collect Today', icon: 'calendar-outline', offers: collectToday };
      
      case 'nearest':
        const nearest = [...allOffers].sort((a, b) => a.vendor.distance - b.vendor.distance);
        return { title: 'Nearest to You', icon: 'location-outline', offers: nearest };
      
      case 'favorites':
        const favoriteOfferIds = storage.getFavoriteOffers().map(o => o.id);
        const favoriteVendorIds = storage.getFavoriteVendors();
        const allFavoriteOffers = allOffers.filter(o => 
          favoriteOfferIds.includes(o.id) || favoriteVendorIds.includes(o.vendorId)
        );
        return { title: 'Your Favorites', icon: 'heart-outline', offers: allFavoriteOffers };
      
      case 'meat':
        const meatOffers = allOffers.filter(o => o.dietaryTags.includes('Meat'));
        return { title: 'Meat', icon: 'restaurant-outline', offers: meatOffers };
      
      case 'vegetarian':
        const vegOffers = allOffers.filter(o => 
          o.dietaryTags.includes('Vegetarian') || o.dietaryTags.includes('Vegan')
        );
        return { title: 'Vegetarian', icon: 'leaf-outline', offers: vegOffers };
      
      default:
        return { title: 'All Bags', icon: 'grid-outline', offers: allOffers };
    }
  };

  const categoryData = getCategoryData(type as string);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Ionicons name={categoryData.icon} size={24} color={Colors.primary} />
            <Text style={styles.title}>{categoryData.title}</Text>
          </View>
          <Text style={styles.count}>
            {categoryData.offers.length} {categoryData.offers.length === 1 ? 'bag' : 'bags'} available
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          {categoryData.offers.map(offer => (
            <OfferCard
              key={offer.id}
              offer={offer}
              onPress={() => router.push(`/offer/${offer.id}`)}
            />
          ))}
        </View>

        {categoryData.offers.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="bag-outline" size={60} color={Colors.textGray} />
            <Text style={styles.emptyTitle}>No bags available</Text>
            <Text style={styles.emptyText}>Check back later for new surprise bags</Text>
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
  content: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  count: {
    fontSize: 14,
    color: Colors.textGray,
    fontWeight: '600',
  },
  cardsContainer: {
    padding: 16,
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textGray,
    textAlign: 'center',
  },
});
