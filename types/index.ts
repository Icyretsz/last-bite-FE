export type UserRole = 'consumer' | 'vendor';

export type FoodType = 'Meals' | 'Pastries' | 'Drinks' | 'Grocery';
export type DietaryType = 'Meat' | 'Vegetarian' | 'Vegan';
export type BagSize = 'Small' | 'Medium' | 'Large';
export type OrderStatus = 'Reserved' | 'Collected' | 'Cancelled' | 'Refunded';

export type VoucherDiscountType = 'fixed' | 'percent';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isVendor: boolean;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  foodTypes: FoodType[];
  dietary: DietaryType[];
  preferredTimes: string[];
  locationEnabled: boolean;
}

export interface Favorites {
  offerIds: string[];
  vendorIds: string[];
}

export interface Vendor {
  id: string;
  name: string;
  logo: string;
  logoUrl?: string;
  address: string;
  distance: number;
  rating: number;
  reviewCount: number;
  trustScore: number;
  latitude: number;
  longitude: number;
}

export interface Voucher {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: VoucherDiscountType;
  amount: number; // fixed: VND, percent: 1-100
  maxDiscount?: number; // VND, only for percent
  minOrder?: number; // VND
  expiresAt?: string; // ISO string
  isActive: boolean;
}

export interface Offer {
  id: string;
  vendorId: string;
  vendor: Vendor;
  title: string;
  description: string;
  price: number;
  originalValue: number;
  quantity: number;
  remainingQuantity: number;
  collectionStart: string;
  collectionEnd: string;
  collectionDays: string[]; // Days of week: ['Monday', 'Tuesday', etc.]
  bagSize: BagSize;
  dietaryTags: DietaryType[];
  foodType: FoodType;
  photos: string[];
  isActive: boolean;
  createdAt: string;
}

export interface Reservation {
  id: string;
  code: string;
  offerId: string;
  offer: Offer;
  userId: string;
  status: OrderStatus;
  quantity: number;
  collectionDate: string; // ISO string - the actual date user will collect
  collectionTimeStart: string; // ISO string - actual collection time window start
  collectionTimeEnd: string; // ISO string - actual collection time window end
  reservedAt: string;
  createdAt: string;
  collectedAt?: string;
  cancelledAt?: string;
  voucherId?: string;
  discountAmount?: number;
  paidPrice?: number;
}

export interface Review {
  id: string;
  offerId: string;
  userId: string;
  userName: string;
  reservationId?: string;
  rating: number;
  collectionRating: number;
  qualityRating: number;
  quantityRating: number;
  varietyRating: number;
  text: string;
  photos: string[];
  createdAt: string;
}
