import { Colors } from '@/constants/colors';
import { Offer } from '@/types';
import { formatDistance, formatPrice } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface OfferCardProps {
  offer: Offer;
  onPress: () => void;
}

export function OfferCard({ offer, onPress }: OfferCardProps) {
  // const getBagSizeColor = (size: string) => {
  //   switch (size) {
  //     case 'Small': return Colors.bagSmall;
  //     case 'Medium': return Colors.bagMedium;
  //     case 'Large': return Colors.bagLarge;
  //     default: return Colors.textGray;
  //   }
  // };

  // Check if offer is new (created within last 7 days)
  const isNew = () => {
    const createdDate = new Date(offer.createdAt);
    const now = new Date();
    const daysDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  };

  // Format collection time to show days and hours
  const formatTimeDisplay = (start: string, end: string, collectionDays?: string[]) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const startTime = startDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    const endTime = endDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    // if (collectionDays && collectionDays.length > 0) {
    //   const abbreviatedDays = collectionDays.map(day => day.substring(0, 3)).join(', ');
    //   return `${abbreviatedDays} ${startTime}-${endTime}`;
    // }

    return `${startTime} - ${endTime}`;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardInner}>
        {/* Image Section with Badges */}
        <View style={styles.imageContainer}>
          {offer.photos?.[0] ? (
            <Image
              source={{ uri: offer.photos[0] }}
              style={styles.image}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="fast-food-outline" size={72} color={Colors.textGray} />
            </View>
          )}

          {/* Status Badge - Top Left */}
          <View style={styles.badgesContainer}>
            {offer.remainingQuantity <= 3 && (
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>Popular</Text>
              </View>
            )}
            {isNew() && (
              <View style={[styles.statusBadge, styles.newBadge]}>
                <Text style={styles.statusBadgeText}>New</Text>
              </View>
            )}
          </View>

          {/* Bag Size Badge - Top Right */}
          {/* <View style={[styles.bagSizeBadgeTop, { backgroundColor: getBagSizeColor(offer.bagSize) }]}>
            <Text style={styles.bagSizeBadgeText}>{offer.bagSize}</Text>
          </View> */}
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          {/* Vendor Info */}
          <View style={styles.vendorRow}>
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
                size={22}
                color={Colors.text}
                style={styles.vendorLogo}
              />
            )}
            <Text style={styles.vendorName}>{offer.vendor.name}</Text>
          </View>

          {/* Offer Title */}
          <Text style={styles.title}>{offer.title}</Text>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(offer.price)}</Text>
            <Text style={styles.originalPrice}>{formatPrice(offer.originalValue)}</Text>
          </View>

          {/* Time and Distance */}
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons
                name="time-outline"
                size={18}
                color={Colors.textGray}
                style={styles.infoIcon}
              />
              <Text style={styles.infoText}>
                {formatTimeDisplay(offer.collectionStart, offer.collectionEnd, offer.collectionDays)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons
                name="location-outline"
                size={18}
                color={Colors.textGray}
                style={styles.infoIcon}
              />
              <Text style={styles.infoText}>{formatDistance(offer.vendor.distance)}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardInner: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  image: {
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
    fontSize: 80,
  },
  badgesContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
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
  bagSizeBadgeTop: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bagSizeBadgeText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    padding: 16,
  },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  vendorLogo: {
    marginRight: 8,
  },
  vendorLogoImage: {
    width: 26,
    height: 26,
    borderRadius: 13,
    marginRight: 8,
    backgroundColor: '#E8E8E8',
  },
  vendorName: {
    fontSize: 16,
    color: Colors.textGray,
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    marginRight: 12,
  },
  originalPrice: {
    fontSize: 18,
    color: Colors.textGray,
    textDecorationLine: 'line-through',
  },
  infoRow: {
    flexDirection: 'row',
    gap: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 6,
  },
  infoText: {
    fontSize: 15,
    color: Colors.textGray,
    fontWeight: '500',
  },
});
