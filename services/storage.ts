import { Favorites, Offer, Reservation, Review, User, Voucher } from '@/types';
import { mockOffers, mockReservations, mockReviews, mockVouchers } from './mockData';

// Simple in-memory storage for demo
class Storage {
  private currentUser: User | null = null;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private offers: Offer[] = [...mockOffers];
  private reservations: Reservation[] = [...mockReservations];
  private reviews: Review[] = [...mockReviews];
  private vouchers: Voucher[] = [...mockVouchers];
  private favorites: Favorites = { offerIds: [], vendorIds: [] };
  private language: string = 'vi';

  // Auth
  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  login(email: string, password: string): User {
    // Mock login - accepts any credentials, always use u1 for demo
    this.currentUser = {
      id: 'u1',
      email,
      name: email.split('@')[0],
      role: 'consumer',
      isVendor: false,
    };
    return this.currentUser;
  }

  signup(email: string, password: string, name: string): User {
    // Always use u1 for demo to match mock data
    this.currentUser = {
      id: 'u1',
      email,
      name,
      role: 'consumer',
      isVendor: false,
    };
    return this.currentUser;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  logout() {
    this.currentUser = null;
    this.accessToken = null;
    this.refreshToken = null;
  }

  updateUserPreferences(preferences: any) {
    if (this.currentUser) {
      this.currentUser.preferences = preferences;
    }
  }

  // Offers
  getOffers(): Offer[] {
    const now = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = dayNames[now.getDay()]; // getDay() returns 0-6 (Sun-Sat)
    
    return this.offers.filter(o => {
      if (!o.isActive) return false;
      
      // Check if collection window has expired
      const collectionEnd = new Date(o.collectionEnd);
      if (collectionEnd < now) return false;
      
      // Check if today is a valid collection day
      if (o.collectionDays.length > 0 && !o.collectionDays.includes(currentDay)) {
        return false;
      }
      
      return true;
    });
  }

  // Get all offers including expired ones (for vendor management)
  getAllOffersIncludingExpired(): Offer[] {
    return this.offers.filter(o => o.isActive);
  }

  getOfferById(id: string): Offer | undefined {
    return this.offers.find(o => o.id === id);
  }

  createOffer(offer: Omit<Offer, 'id' | 'createdAt'>): Offer {
    const newOffer: Offer = {
      ...offer,
      id: 'o' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    this.offers.push(newOffer);
    return newOffer;
  }

  updateOffer(id: string, updates: Partial<Offer>) {
    const index = this.offers.findIndex(o => o.id === id);
    if (index !== -1) {
      this.offers[index] = { ...this.offers[index], ...updates };
    }
  }

  // Reservations
  createReservation(
    offerId: string,
    opts?: { 
      quantity?: number;
      collectionDate?: string;
      voucherId?: string; 
      discountAmount?: number; 
      paidPrice?: number;
    }
  ): Reservation {
    const offer = this.getOfferById(offerId);
    const quantity = opts?.quantity || 1;
    
    if (!offer || offer.remainingQuantity < quantity) {
      throw new Error('Offer not available');
    }

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Calculate collection date and time
    const collectionDateStr = opts?.collectionDate || new Date().toISOString().split('T')[0];
    const collectionDate = new Date(collectionDateStr);
    
    // Set collection time based on offer's collection window
    const startTime = new Date(offer.collectionStart);
    const endTime = new Date(offer.collectionEnd);
    
    const collectionTimeStart = new Date(collectionDate);
    collectionTimeStart.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);
    
    const collectionTimeEnd = new Date(collectionDate);
    collectionTimeEnd.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);
    
    const reservation: Reservation = {
      id: 'res' + Date.now(),
      code,
      offerId,
      offer,
      userId: this.currentUser?.id || 'u1',
      status: 'Reserved',
      quantity,
      collectionDate: collectionDate.toISOString(),
      collectionTimeStart: collectionTimeStart.toISOString(),
      collectionTimeEnd: collectionTimeEnd.toISOString(),
      reservedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      voucherId: opts?.voucherId,
      discountAmount: opts?.discountAmount,
      paidPrice: opts?.paidPrice ?? (offer.price * quantity),
    };

    this.reservations.push(reservation);
    
    // Decrease quantity
    offer.remainingQuantity -= quantity;
    this.updateOffer(offerId, { remainingQuantity: offer.remainingQuantity });

    return reservation;
  }

  getReservations(): Reservation[] {
    return this.reservations.filter(r => r.userId === this.currentUser?.id);
  }

  getReservationById(id: string): Reservation | undefined {
    return this.reservations.find(r => r.id === id);
  }

  markCollected(code: string): boolean {
    const reservation = this.reservations.find(r => r.code === code);
    if (reservation) {
      reservation.status = 'Collected';
      reservation.collectedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  cancelReservation(reservationId: string): boolean {
    const reservation = this.reservations.find(r => r.id === reservationId);
    if (reservation && reservation.status === 'Reserved') {
      reservation.status = 'Cancelled';
      reservation.cancelledAt = new Date().toISOString();
      
      // Restore quantity to offer
      const offer = this.offers.find(o => o.id === reservation.offerId);
      if (offer) {
        offer.remainingQuantity += reservation.quantity;
        this.updateOffer(offer.id, { remainingQuantity: offer.remainingQuantity });
      }
      
      return true;
    }
    return false;
  }

  // Reviews
  getReviewsForOffer(offerId: string): Review[] {
    return this.reviews.filter(r => r.offerId === offerId);
  }

  getReviewByReservation(reservationId: string): Review | undefined {
    return this.reviews.find(r => r.reservationId === reservationId);
  }

  createReview(review: Omit<Review, 'id' | 'createdAt'>): Review {
    const newReview: Review = {
      ...review,
      id: 'rev' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    this.reviews.push(newReview);
    return newReview;
  }

  // Vendor
  getVendorOffers(vendorId: string): Offer[] {
    // Vendors should see all their offers regardless of time/day
    return this.offers.filter(o => o.vendorId === vendorId);
  }

  getVendorReservations(vendorId: string): Reservation[] {
    return this.reservations.filter(r => r.offer.vendorId === vendorId);
  }

  // Vouchers
  getVouchers(): Voucher[] {
    return this.vouchers.filter(v => v.isActive);
  }

  // Favorites
  getFavorites(): Favorites {
    return this.favorites;
  }

  toggleFavoriteOffer(offerId: string): boolean {
    const index = this.favorites.offerIds.indexOf(offerId);
    if (index > -1) {
      this.favorites.offerIds.splice(index, 1);
      return false;
    } else {
      this.favorites.offerIds.push(offerId);
      return true;
    }
  }

  toggleFavoriteVendor(vendorId: string): boolean {
    const index = this.favorites.vendorIds.indexOf(vendorId);
    if (index > -1) {
      this.favorites.vendorIds.splice(index, 1);
      return false;
    } else {
      this.favorites.vendorIds.push(vendorId);
      return true;
    }
  }

  isFavoriteOffer(offerId: string): boolean {
    return this.favorites.offerIds.includes(offerId);
  }

  isFavoriteVendor(vendorId: string): boolean {
    return this.favorites.vendorIds.includes(vendorId);
  }

  getFavoriteOffers(): Offer[] {
    return this.offers.filter(o => this.favorites.offerIds.includes(o.id));
  }

  getFavoriteVendors() {
    return this.favorites.vendorIds;
  }

  // Language
  getLanguage(): string {
    return this.language;
  }

  setLanguage(lang: string) {
    this.language = lang;
  }
}

export const storage = new Storage();
