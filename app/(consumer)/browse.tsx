import { OfferCard } from '@/components/offer-card';
import { Colors } from '@/constants/colors';
import { mockVendors } from '@/services/mockData';
import { storage } from '@/services/storage';
import { DietaryType, FoodType } from '@/types';
import { formatPrice } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

// ─── Realistic Mock Map ───────────────────────────────────────────────────────

function MockMapView({
  vendors,
  offers,
  onVendorPress,
}: {
  vendors: typeof mockVendors;
  offers: ReturnType<typeof storage.getOffers>;
  onVendorPress: (vendorId: string) => void;
}) {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  const pulseScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] });
  const pulseOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] });

  // Positions for vendor pins on the mock map (percentage-based)
  const pinPositions = [
    { top: '18%', left: '22%' },
    { top: '35%', left: '62%' },
    { top: '55%', left: '38%' },
    { top: '25%', left: '72%' },
    { top: '65%', left: '68%' },
    { top: '70%', left: '18%' },
  ];

  return (
    <View style={map.container}>
      {/* ── Map Tile Background ── */}
      <View style={map.tile}>
        {/* Base road color */}
        <View style={[map.block, { top: 0, left: 0, right: 0, height: '100%', backgroundColor: '#EAE6DF' }]} />

        {/* City blocks */}
        {[
          { top: '5%', left: '5%', width: '28%', height: '20%', color: '#D9D0C4' },
          { top: '5%', left: '42%', width: '20%', height: '15%', color: '#D9D0C4' },
          { top: '5%', left: '72%', width: '23%', height: '22%', color: '#D9D0C4' },
          { top: '32%', left: '5%', width: '22%', height: '18%', color: '#D9D0C4' },
          { top: '32%', left: '42%', width: '30%', height: '20%', color: '#D9D0C4' },
          { top: '32%', left: '78%', width: '17%', height: '28%', color: '#D9D0C4' },
          { top: '58%', left: '5%', width: '30%', height: '22%', color: '#D9D0C4' },
          { top: '58%', left: '44%', width: '22%', height: '20%', color: '#D9D0C4' },
          { top: '58%', left: '72%', width: '23%', height: '20%', color: '#D9D0C4' },
          { top: '85%', left: '5%', width: '40%', height: '12%', color: '#D9D0C4' },
          { top: '85%', left: '55%', width: '40%', height: '12%', color: '#D9D0C4' },
        ].map((b, i) => (
          <View key={i} style={[map.block, { top: b.top as any, left: b.left as any, width: b.width as any, height: b.height as any, backgroundColor: b.color }]} />
        ))}

        {/* Park / green area */}
        <View style={[map.block, { top: '32%', left: '28%', width: '12%', height: '18%', backgroundColor: '#C8DFAB', borderRadius: 4 }]} />
        <View style={[map.block, { top: '5%', left: '68%', width: '3%', height: '8%', backgroundColor: '#C8DFAB', borderRadius: 2 }]} />

        {/* Water / river */}
        <View style={[map.block, { top: '52%', left: '0%', width: '100%', height: '5%', backgroundColor: '#B3D4E8', opacity: 0.7 }]} />

        {/* Major roads (horizontal) */}
        {['28%', '52%', '57%', '80%'].map((top, i) => (
          <View key={`hr-${i}`} style={[map.road, map.roadH, { top: top as any, backgroundColor: i === 1 ? '#FFFFFF' : '#F5F1EC' }]} />
        ))}
        {/* Major road border lines */}
        <View style={[map.roadBorder, map.roadBorderH, { top: '51%' }]} />
        <View style={[map.roadBorder, map.roadBorderH, { top: '58%' }]} />

        {/* Major roads (vertical) */}
        {['27%', '40%', '63%', '76%'].map((left, i) => (
          <View key={`vr-${i}`} style={[map.road, map.roadV, { left: left as any, backgroundColor: i === 1 ? '#FFFFFF' : '#F5F1EC' }]} />
        ))}

        {/* Minor roads */}
        {['12%', '45%', '68%'].map((top, i) => (
          <View key={`mhr-${i}`} style={[map.minorRoad, map.roadH, { top: top as any }]} />
        ))}
        {['14%', '55%', '87%'].map((left, i) => (
          <View key={`mvr-${i}`} style={[map.minorRoad, map.roadV, { left: left as any }]} />
        ))}

        {/* Map labels */}
        <Text style={[map.streetLabel, { top: '26%', left: '6%' }]}>Lê Lợi</Text>
        <Text style={[map.streetLabel, { top: '50%', left: '45%', transform: [{ rotate: '90deg' }] }]}>Nguyễn Huệ</Text>
        <Text style={[map.parkLabel, { top: '38%', left: '29%' }]}>Park</Text>
        <Text style={[map.waterLabel, { top: '53.5%', left: '5%' }]}>Kênh Nhiêu Lộc</Text>
      </View>

      {/* ── User Location ── */}
      <View style={[map.pinWrapper, { top: '47%', left: '45%' }]}>
        <Animated.View
          style={[
            map.userPulse,
            { transform: [{ scale: pulseScale }], opacity: pulseOpacity },
          ]}
        />
        <View style={map.userOuter}>
          <View style={map.userInner} />
        </View>
        <Text style={map.youLabel}>You</Text>
      </View>

      {/* ── Vendor Pins ── */}
      {vendors.slice(0, pinPositions.length).map((vendor, index) => {
        const vendorOffer = offers.find(o => o.vendorId === vendor.id);
        const pos = pinPositions[index];
        const isSelected = selectedVendor === vendor.id;

        return (
          <TouchableOpacity
            key={vendor.id}
            style={[map.pinWrapper, { top: pos.top as any, left: pos.left as any }]}
            onPress={() => {
              setSelectedVendor(isSelected ? null : vendor.id);
              onVendorPress(vendor.id);
            }}
            activeOpacity={0.85}
          >
            <View style={[map.vendorBubble, isSelected && map.vendorBubbleSelected]}>
              {vendor.logoUrl ? (
                <Image
                  source={{ uri: vendor.logoUrl }}
                  style={map.vendorLogoImage}
                  contentFit="cover"
                  transition={150}
                />
              ) : (
                <Ionicons name={vendor.logo as any} size={18} color={Colors.text} style={map.vendorEmoji} />
              )}
              {vendorOffer && (
                <View style={map.pricePill}>
                  <Text style={map.priceText}>{(vendorOffer.price / 1000).toFixed(0)}k</Text>
                </View>
              )}
            </View>
            <View style={[map.bubbleTail, isSelected && map.bubbleTailSelected]} />
          </TouchableOpacity>
        );
      })}

      {/* ── Compass ── */}
      <View style={map.compass}>
        <Text style={map.compassN}>N</Text>
        <Text style={map.compassArrow}>↑</Text>
      </View>

      {/* ── Scale Bar ── */}
      <View style={map.scaleBar}>
        <View style={map.scaleBarLine} />
        <Text style={map.scaleBarText}>200 m</Text>
      </View>

      {/* ── Attribution ── */}
      <Text style={map.attribution}>© MockMaps</Text>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function BrowseScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const currentUser = storage.getCurrentUser();
  const userPreferences = currentUser?.preferences;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);

  // Initialize filters with user preferences
  const [selectedFoodType, setSelectedFoodType] = useState<FoodType | null>(
    userPreferences?.foodTypes?.[0] || null
  );
  const [selectedDietary, setSelectedDietary] = useState<DietaryType | null>(
    userPreferences?.dietary?.[0] || null
  );
  const [maxDistance, setMaxDistance] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  const allOffers = storage.getOffers();
  const selectedVendor = selectedVendorId 
    ? mockVendors.find(v => v.id === selectedVendorId) 
    : null;
  const vendorOffers = selectedVendor
    ? allOffers.filter(o => o.vendorId === selectedVendor.id).slice(0, 3)
    : [];

  const filteredOffers = allOffers.filter(offer => {
    if (
      searchQuery &&
      !offer.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !offer.vendor.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    if (selectedFoodType && offer.foodType !== selectedFoodType) return false;
    if (selectedDietary && !offer.dietaryTags.includes(selectedDietary)) return false;
    if (maxDistance && offer.vendor.distance > maxDistance) return false;
    if (maxPrice && offer.price > maxPrice) return false;
    return true;
  });

  const foodTypes: FoodType[] = ['Meals', 'Pastries', 'Drinks', 'Grocery'];
  const dietaryTypes: DietaryType[] = ['Meat', 'Vegetarian', 'Vegan'];

  const clearFilters = () => {
    setSelectedFoodType(null);
    setSelectedDietary(null);
    setMaxDistance(null);
    setMaxPrice(null);
  };

  const activeFilterCount = [selectedFoodType, selectedDietary, maxDistance, maxPrice].filter(
    Boolean
  ).length;

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={Colors.textGray} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('browse.searchPlaceholder')}
            placeholderTextColor={Colors.textGray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(true)}>
          <Ionicons name="options-outline" size={22} color={Colors.white} style={styles.filterIcon} />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'list' && styles.tabActive]}
          onPress={() => setActiveTab('list')}
        >
          <View style={styles.tabLabel}>
            <Ionicons
              name="list-outline"
              size={18}
              color={activeTab === 'list' ? Colors.primary : Colors.textGray}
            />
            <Text style={[styles.tabText, activeTab === 'list' && styles.tabTextActive]}>{t('browse.list')}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'map' && styles.tabActive]}
          onPress={() => setActiveTab('map')}
        >
          <View style={styles.tabLabel}>
            <Ionicons
              name="map-outline"
              size={18}
              color={activeTab === 'map' ? Colors.primary : Colors.textGray}
            />
            <Text style={[styles.tabText, activeTab === 'map' && styles.tabTextActive]}>{t('browse.map')}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'list' ? (
        <ScrollView style={styles.content}>
          <Text style={styles.resultCount}>{t('browse.bagsAvailable', { count: filteredOffers.length })}</Text>
          <View style={styles.cardsContainer}>
            {filteredOffers.map(offer => (
              <OfferCard
                key={offer.id}
                offer={offer}
                onPress={() => router.push(`/offer/${offer.id}`)}
              />
            ))}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.mapContainer}>
          <MockMapView
            vendors={mockVendors}
            offers={filteredOffers}
            onVendorPress={vendorId => setSelectedVendorId(vendorId)}
          />

          {/* Bottom stats bar */}
          <View style={styles.mapBottomBar}>
            <View style={styles.mapStat}>
              <Text style={styles.mapStatNum}>{filteredOffers.length}</Text>
              <Text style={styles.mapStatLabel}>{t('browse.nearbyBags')}</Text>
            </View>
            <View style={styles.mapStatDivider} />
            <View style={styles.mapStat}>
              <Text style={styles.mapStatNum}>
                {filteredOffers.length > 0
                  ? (
                    filteredOffers.reduce((s, o) => s + o.vendor.distance, 0) /
                    filteredOffers.length
                  ).toFixed(1)
                  : '—'}
                km
              </Text>
              <Text style={styles.mapStatLabel}>{t('browse.avgDistance')}</Text>
            </View>
            <View style={styles.mapStatDivider} />
            <View style={styles.mapStat}>
              <Text style={styles.mapStatNum}>
                {filteredOffers.length > 0
                  ? `${(Math.min(...filteredOffers.map(o => o.price)) / 1000).toFixed(0)}k`
                  : '—'}
              </Text>
              <Text style={styles.mapStatLabel}>{t('browse.from')}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('browse.filters')}</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterScroll}>
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>{t('browse.foodType')}</Text>
                <View style={styles.chipContainer}>
                  {foodTypes.map(type => {
                    const isUserPreference = userPreferences?.foodTypes?.includes(type);
                    return (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.chip, 
                          selectedFoodType === type && styles.chipSelected,
                          isUserPreference && !selectedFoodType && styles.chipPreferred
                        ]}
                        onPress={() =>
                          setSelectedFoodType(selectedFoodType === type ? null : type)
                        }
                      >
                        <Text
                          style={[
                            styles.chipText,
                            selectedFoodType === type && styles.chipTextSelected,
                          ]}
                        >
                          {t(`foodTypes.${type.toLowerCase()}`)}
                          {isUserPreference && ' ★'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>{t('browse.dietaryPreferences')}</Text>
                <View style={styles.chipContainer}>
                  {dietaryTypes.map(type => {
                    const isUserPreference = userPreferences?.dietary?.includes(type);
                    return (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.chip, 
                          selectedDietary === type && styles.chipSelected,
                          isUserPreference && !selectedDietary && styles.chipPreferred
                        ]}
                        onPress={() =>
                          setSelectedDietary(selectedDietary === type ? null : type)
                        }
                      >
                        <Text
                          style={[
                            styles.chipText,
                            selectedDietary === type && styles.chipTextSelected,
                          ]}
                        >
                          {t(`dietary.${type.toLowerCase()}`)}
                          {isUserPreference && ' ★'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>{t('browse.maxDistance')}</Text>
                <View style={styles.chipContainer}>
                  {[0.5, 1, 2, 5].map(distance => (
                    <TouchableOpacity
                      key={distance}
                      style={[styles.chip, maxDistance === distance && styles.chipSelected]}
                      onPress={() => setMaxDistance(maxDistance === distance ? null : distance)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          maxDistance === distance && styles.chipTextSelected,
                        ]}
                      >
                        {distance}km
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>{t('browse.maxPrice')}</Text>
                <View style={styles.chipContainer}>
                  {[20000, 30000, 40000, 50000].map(price => (
                    <TouchableOpacity
                      key={price}
                      style={[styles.chip, maxPrice === price && styles.chipSelected]}
                      onPress={() => setMaxPrice(maxPrice === price ? null : price)}
                    >
                      <Text
                        style={[styles.chipText, maxPrice === price && styles.chipTextSelected]}
                      >
                        {price / 1000}k
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                <Text style={styles.clearButtonText}>{t('common.clearAll')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.applyButtonText}>{t('browse.applyFilters')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Offer Details Drawer */}
      <Modal
        visible={selectedVendor !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedVendorId(null)}
        presentationStyle="overFullScreen"
      >
        <TouchableOpacity 
          style={styles.drawerOverlay}
          activeOpacity={1}
          onPress={() => setSelectedVendorId(null)}
        >
          {selectedVendor && (
            <TouchableOpacity 
              style={styles.drawerContent}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              {/* Drag Handle */}
              <TouchableOpacity 
                style={styles.dragHandleContainer}
                onPress={() => setSelectedVendorId(null)}
                activeOpacity={0.7}
              >
                <View style={styles.dragHandle} />
              </TouchableOpacity>

              {/* Vendor Header */}
              <View style={styles.drawerHeader}>
                {selectedVendor.logoUrl ? (
                  <Image
                    source={{ uri: selectedVendor.logoUrl }}
                    style={styles.drawerVendorLogo}
                    contentFit="cover"
                  />
                ) : (
                  <View style={styles.drawerVendorLogoPlaceholder}>
                    <Ionicons name={selectedVendor.logo as any} size={32} color={Colors.text} />
                  </View>
                )}
                <View style={styles.drawerVendorInfo}>
                  <Text style={styles.drawerVendorName}>{selectedVendor.name}</Text>
                  <Text style={styles.drawerVendorAddress}>
                    {selectedVendor.distance.toFixed(1)} km | {selectedVendor.address}
                  </Text>
                </View>
              </View>

              {/* Offers List */}
              <View style={styles.drawerOffersList}>
                {vendorOffers.map((offer) => (
                  <TouchableOpacity
                    key={offer.id}
                    style={styles.drawerOfferCard}
                    onPress={() => {
                      const offerId = offer.id;
                      setSelectedVendorId(null);
                      setTimeout(() => {
                        router.push({
                          pathname: '/offer/[id]',
                          params: { id: offerId }
                        });
                      }, 300);
                    }}
                    activeOpacity={0.7}
                  >
                    {offer.photos?.[0] && (
                      <Image
                        source={{ uri: offer.photos[0] }}
                        style={styles.drawerOfferImage}
                        contentFit="cover"
                      />
                    )}
                    <View style={styles.drawerOfferContent}>
                      <View style={styles.drawerOfferHeader}>
                        <Text style={styles.drawerOfferTitle}>{offer.title}</Text>
                        {offer.remainingQuantity <= 3 && (
                          <View style={styles.drawerPopularBadge}>
                            <Text style={styles.drawerPopularText}>Popular</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.drawerOfferTime}>
                        Collect tomorrow {new Date(offer.collectionStart).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} - {new Date(offer.collectionEnd).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </Text>
                      <View style={styles.drawerOfferFooter}>
                        <View style={styles.drawerRating}>
                          <Ionicons name="star" size={16} color="#F5A623" />
                          <Text style={styles.drawerRatingText}>{selectedVendor.rating}</Text>
                        </View>
                        <Text style={styles.drawerPrice}>{formatPrice(offer.price)}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// ─── Map Component Styles ─────────────────────────────────────────────────────

const map = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  tile: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#EAE6DF',
  },
  block: {
    position: 'absolute',
  },
  road: {
    position: 'absolute',
  },
  roadH: {
    left: 0,
    right: 0,
    height: 10,
  },
  roadV: {
    top: 0,
    bottom: 0,
    width: 10,
  },
  roadBorder: {
    position: 'absolute',
    backgroundColor: '#C8BFB0',
  },
  roadBorderH: {
    left: 0,
    right: 0,
    height: 1,
  },
  minorRoad: {
    position: 'absolute',
    backgroundColor: '#F5F1EC',
  },
  streetLabel: {
    position: 'absolute',
    fontSize: 9,
    color: '#9A8F82',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  parkLabel: {
    position: 'absolute',
    fontSize: 9,
    color: '#5A7A3A',
    fontWeight: '600',
  },
  waterLabel: {
    position: 'absolute',
    fontSize: 9,
    color: '#3A7AA8',
    fontWeight: '500',
    fontStyle: 'italic',
  },

  // User location
  pinWrapper: {
    position: 'absolute',
    alignItems: 'center',
  },
  userPulse: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    top: -10,
    left: -10,
  },
  userOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
  userInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  youLabel: {
    marginTop: 2,
    fontSize: 9,
    fontWeight: '700',
    color: Colors.primary,
    backgroundColor: Colors.white,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    overflow: 'hidden',
  },

  // Vendor pins
  vendorBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: '#E0D8CC',
  },
  vendorBubbleSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#FFF8F0',
  },
  vendorEmoji: {
    fontSize: 18,
  },
  vendorLogoImage: {
    width: 28,
    height: 28,
    borderRadius: 100,
    backgroundColor: '#E8E8E8',
  },
  pricePill: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  priceText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.white,
  },
  bubbleTail: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.white,
    marginTop: -1,
  },
  bubbleTailSelected: {
    borderTopColor: '#FFF8F0',
  },

  // Compass
  compass: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  compassN: {
    fontSize: 8,
    fontWeight: '700',
    color: '#E84B3A',
    lineHeight: 10,
  },
  compassArrow: {
    fontSize: 10,
    color: '#333',
    lineHeight: 12,
  },

  // Scale bar
  scaleBar: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    alignItems: 'flex-start',
    gap: 2,
  },
  scaleBarLine: {
    width: 60,
    height: 3,
    backgroundColor: '#555',
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#555',
  },
  scaleBarText: {
    fontSize: 9,
    color: '#555',
    fontWeight: '600',
  },

  // Attribution
  attribution: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    fontSize: 9,
    color: '#888',
    backgroundColor: 'rgba(255,255,255,0.75)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
});

// ─── Main Screen Styles ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.white,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundGray,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    paddingVertical: 12,
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterIcon: {},
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.error,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
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
  tabActive: { borderBottomColor: Colors.primary },
  tabText: { fontSize: 16, fontWeight: '600', color: Colors.textGray },
  tabTextActive: { color: Colors.primary },
  tabLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  content: { flex: 1, padding: 16 },
  resultCount: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textGray,
    marginBottom: 16,
  },
  cardsContainer: { gap: 16 },

  // Map
  mapContainer: { flex: 1 },
  mapBottomBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    alignItems: 'center',
  },
  mapStat: { 
    flex: 1,
    alignItems: 'center',
  },
  mapStatNum: { fontSize: 18, fontWeight: '700', color: Colors.text },
  mapStatLabel: { fontSize: 12, color: Colors.textGray, marginTop: 2 },
  mapStatDivider: { width: 1, height: 32, backgroundColor: '#E5E5E5' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: { fontSize: 24, fontWeight: '700', color: Colors.text },
  closeButton: { fontSize: 28, color: Colors.textGray },
  filterScroll: { padding: 20 },
  filterSection: { marginBottom: 24 },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.backgroundGray,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipPreferred: {
    borderColor: Colors.secondary,
    borderWidth: 2,
  },
  chipText: { fontSize: 14, fontWeight: '600', color: Colors.text },
  chipTextSelected: { color: Colors.white },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  clearButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
  },
  clearButtonText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  applyButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  applyButtonText: { fontSize: 16, fontWeight: '700', color: Colors.white },

  // Drawer
  drawerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  drawerContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  dragHandleContainer: {
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  drawerVendorLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    backgroundColor: '#E8E8E8',
  },
  drawerVendorLogoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    backgroundColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerVendorInfo: {
    flex: 1,
  },
  drawerVendorName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  drawerVendorAddress: {
    fontSize: 14,
    color: Colors.textGray,
  },
  drawerOffersList: {
    gap: 12,
  },
  drawerOfferCard: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundGray,
    borderRadius: 16,
    overflow: 'hidden',
  },
  drawerOfferImage: {
    width: 100,
    height: 100,
  },
  drawerOfferContent: {
    flex: 1,
    padding: 12,
  },
  drawerOfferHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  drawerOfferTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginRight: 8,
  },
  drawerPopularBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  drawerPopularText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.white,
  },
  drawerOfferTime: {
    fontSize: 12,
    color: Colors.textGray,
    marginBottom: 8,
  },
  drawerOfferFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  drawerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  drawerRatingText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  drawerPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
});
