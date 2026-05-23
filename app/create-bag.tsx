import { Colors } from '@/constants/colors';
import { mockVendors } from '@/services/mockData';
import { storage } from '@/services/storage';
import { BagSize, DietaryType, FoodType } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

const COMMISSION_RATE = 0.1; // 10% platform commission

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const dietaryOptions: DietaryType[] = ['Vegetarian', 'Vegan', 'Meat'];

export default function CreateOfferScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Category
  const [foodType, setFoodType] = useState<FoodType>('Meals');

  // Step 2: Details (includes basic info, size, pricing, quantity)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [bagSize, setBagSize] = useState<BagSize>('Medium');
  const [originalValue, setOriginalValue] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  // Step 3: Schedule
  const [collectionDays, setCollectionDays] = useState<string[]>([]);
  const [pickupStart, setPickupStart] = useState('18:00');
  const [pickupEnd, setPickupEnd] = useState('20:00');

  // Step 4: Dietary
  const [dietary, setDietary] = useState<DietaryType[]>([]);
  const [startDate, setStartDate] = useState('');

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

  const calculateDiscount = () => {
    if (!originalValue || !price) return 0;
    const original = parseFloat(originalValue);
    const discounted = parseFloat(price);
    return Math.round(((original - discounted) / original) * 100);
  };

  const calculateCommission = () => {
    if (!price) return 0;
    return parseFloat(price) * COMMISSION_RATE;
  };

  const calculateEarningsPerBag = () => {
    if (!price) return 0;
    return parseFloat(price) - calculateCommission();
  };

  const calculateTotalEarnings = () => {
    if (!quantity || !price) return 0;
    return calculateEarningsPerBag() * parseFloat(quantity);
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1: return true;
      case 2: return title !== '' && description !== '' && originalValue !== '' && price !== '' && 
              parseFloat(price) < parseFloat(originalValue) && quantity !== '';
      case 3: return collectionDays.length > 0 && pickupStart !== '' && pickupEnd !== '';
      case 4: return startDate !== '';
      default: return false;
    }
  };

  const handleCreate = () => {
    const vendor = mockVendors[0];
    const now = new Date();
    const [startHour, startMin] = pickupStart.split(':');
    const [endHour, endMin] = pickupEnd.split(':');
    
    const collectionStart = new Date(now);
    collectionStart.setHours(parseInt(startHour), parseInt(startMin), 0, 0);
    
    const collectionEnd = new Date(now);
    collectionEnd.setHours(parseInt(endHour), parseInt(endMin), 0, 0);

    storage.createOffer({
      vendorId: vendor.id,
      vendor,
      title,
      description,
      price: parseFloat(price),
      originalValue: parseFloat(originalValue),
      quantity: parseInt(quantity),
      remainingQuantity: parseInt(quantity),
      collectionStart: collectionStart.toISOString(),
      collectionEnd: collectionEnd.toISOString(),
      collectionDays,
      bagSize,
      dietaryTags: dietary,
      foodType: foodType as FoodType,
      photos: [],
      isActive: true,
    });

    router.back();
  };

  const foodCategories = [
    { id: 'Meals', name: t('createBag.meals'), iconName: 'restaurant-outline', description: t('createBag.mealsDesc') },
    { id: 'Pastries', name: t('createBag.pastries'), iconName: 'fast-food-outline', description: t('createBag.pastriesDesc') },
    { id: 'Drinks', name: t('createBag.drinks'), iconName: 'cafe-outline', description: t('createBag.drinksDesc') },
    { id: 'Grocery', name: t('createBag.grocery'), iconName: 'cart-outline', description: t('createBag.groceryDesc') },
  ];

  const bagSizeOptions = [
    { id: 'Small', name: t('createBag.small'), description: t('createBag.smallDesc') },
    { id: 'Medium', name: t('createBag.medium'), description: t('createBag.mediumDesc') },
    { id: 'Large', name: t('createBag.large'), description: t('createBag.largeDesc') },
  ];

  const steps = [
    { number: 1, title: t('offer.category') },
    { number: 2, title: t('offer.details') },
    { number: 3, title: t('offer.schedule') },
    { number: 4, title: t('offer.dietary') },
    { number: 5, title: t('offer.summary') },
  ];

  return (
    <View style={styles.container}>
      {/* Header with Progress */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => currentStep === 1 ? router.back() : setCurrentStep(currentStep - 1)}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('createBag.title')}</Text>
        </View>

        {/* Progress Steps */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.progressContainer}>
          {steps.map((step, idx) => (
            <View key={step.number} style={styles.stepWrapper}>
              <View style={styles.stepItem}>
                <View style={[
                  styles.stepCircle,
                  currentStep > step.number && styles.stepCircleCompleted,
                  currentStep === step.number && styles.stepCircleActive,
                ]}>
                  {currentStep > step.number ? (
                    <Text style={styles.stepCheckmark}>✓</Text>
                  ) : (
                    <Text style={[
                      styles.stepNumber,
                      currentStep === step.number && styles.stepNumberActive,
                    ]}>{step.number}</Text>
                  )}
                </View>
                <Text style={styles.stepTitle}>{step.title}</Text>
              </View>
              {idx < steps.length - 1 && (
                <View style={[
                  styles.stepLine,
                  currentStep > step.number && styles.stepLineCompleted,
                ]} />
              )}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Step 1: Category */}
        {currentStep === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepHeading}>{t('createBag.selectCategory')}</Text>
            <Text style={styles.stepSubheading}>{t('createBag.selectCategoryDesc')}</Text>
            
            <View style={styles.optionsContainer}>
              {foodCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    foodType === category.id && styles.categoryCardSelected,
                  ]}
                  onPress={() => setFoodType(category.id as FoodType)}
                >
                  <Ionicons
                    name={category.iconName as any}
                    size={32}
                    color={Colors.text}
                    style={styles.categoryIcon}
                  />
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryDescription}>{category.description}</Text>
                  </View>
                  {foodType === category.id && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 2: Details (Basic Info + Size + Pricing + Quantity) */}
        {currentStep === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepHeading}>{t('createBag.surpriseBagDetails')}</Text>
            
            <View style={styles.photoUpload}>
              <Ionicons name="camera-outline" size={32} color={Colors.textGray} style={styles.uploadIcon} />
              <Text style={styles.uploadText}>{t('createBag.uploadPhoto')}</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('createBag.surpriseBagName')}</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder={t('createBag.surpriseBagNamePlaceholder')}
                placeholderTextColor={Colors.textGray}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('createBag.description')}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder={t('createBag.descriptionPlaceholder')}
                placeholderTextColor={Colors.textGray}
                multiline
                numberOfLines={4}
              />
              <Text style={styles.charCount}>{description.length}/200</Text>
            </View>

            {/* Bag Size */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('createBag.bagSize')}</Text>
              <View style={styles.sizeButtonsRow}>
                {bagSizeOptions.map((size) => (
                  <TouchableOpacity
                    key={size.id}
                    style={[
                      styles.sizeButton,
                      bagSize === size.id && styles.sizeButtonSelected,
                    ]}
                    onPress={() => setBagSize(size.id as BagSize)}
                  >
                    <Text style={[
                      styles.sizeButtonText,
                      bagSize === size.id && styles.sizeButtonTextSelected,
                    ]}>
                      {size.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.inputHint}>
                {bagSizeOptions.find(s => s.id === bagSize)?.description}
              </Text>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('createBag.originalPrice')}</Text>
              <TextInput
                style={styles.input}
                value={originalValue}
                onChangeText={setOriginalValue}
                placeholder={t('createBag.originalPricePlaceholder')}
                placeholderTextColor={Colors.textGray}
                keyboardType="numeric"
              />
              <Text style={styles.inputHint}>{t('createBag.originalPriceHint')}</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('createBag.discountedPrice')}</Text>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                placeholder={t('createBag.discountedPricePlaceholder')}
                placeholderTextColor={Colors.textGray}
                keyboardType="numeric"
              />
              <Text style={styles.inputHint}>{t('createBag.discountedPriceHint')}</Text>
            </View>

            {originalValue && price && parseFloat(price) < parseFloat(originalValue) && (
              <View style={styles.discountCard}>
                <View style={styles.discountHeader}>
                  <Ionicons name="trending-up-outline" size={18} color={Colors.secondary} style={styles.discountIcon} />
                  <Text style={styles.discountTitle}>{t('createBag.discountCalculation')}</Text>
                </View>
                <View style={styles.discountRow}>
                  <Text style={styles.discountLabel}>{t('createBag.discount')}</Text>
                  <Text style={styles.discountValue}>{calculateDiscount()}% off</Text>
                </View>
                <View style={styles.discountRow}>
                  <Text style={styles.discountLabel}>{t('createBag.customerSaves')}</Text>
                  <Text style={styles.discountAmount}>
                    ₫{((parseFloat(originalValue) - parseFloat(price)) / 1000).toFixed(0)}k
                  </Text>
                </View>
              </View>
            )}

            {price && parseFloat(price) >= parseFloat(originalValue) && (
              <View style={styles.errorCard}>
                <Text style={styles.errorText}>{t('createBag.errorPriceTooHigh')}</Text>
              </View>
            )}

            {/* Quantity */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('createBag.numberOfBags')}</Text>
              <TextInput
                style={styles.input}
                value={quantity}
                onChangeText={setQuantity}
                placeholder={t('createBag.numberOfBagsPlaceholder')}
                placeholderTextColor={Colors.textGray}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.warningCard}>
              <Ionicons name="warning-outline" size={18} color="#E65100" style={styles.warningIcon} />
              <View style={styles.warningContent}>
                <Text style={styles.warningTitle}>{t('createBag.importantNote')}</Text>
                <Text style={styles.warningText}>
                  {t('createBag.warningMessage')}
                </Text>
              </View>
            </View>

            {price && (
              <View style={styles.commissionCard}>
                <Text style={styles.commissionTitle}>{t('createBag.platformCommission')}</Text>
                <View style={styles.commissionRow}>
                  <Text style={styles.commissionLabel}>{t('createBag.commissionRate')}</Text>
                  <Text style={styles.commissionRate}>{COMMISSION_RATE * 100}%</Text>
                </View>
                <View style={styles.commissionRow}>
                  <Text style={styles.commissionLabel}>{t('createBag.commissionPerBag')}</Text>
                  <Text style={styles.commissionAmount}>₫{(calculateCommission() / 1000).toFixed(1)}k</Text>
                </View>
                <View style={[styles.commissionRow, styles.commissionTotal]}>
                  <Text style={styles.commissionTotalLabel}>{t('createBag.youEarnPerBag')}</Text>
                  <Text style={styles.commissionTotalAmount}>₫{(calculateEarningsPerBag() / 1000).toFixed(1)}k</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Step 3: Schedule */}
        {currentStep === 3 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepHeading}>{t('createBag.collectionSchedule')}</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('createBag.daysOfWeek')}</Text>
              <View style={styles.daysGrid}>
                {daysOfWeek.map(day => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayChip,
                      collectionDays.includes(day) && styles.dayChipSelected,
                    ]}
                    onPress={() => toggleDay(day)}
                  >
                    <Text style={[
                      styles.dayChipText,
                      collectionDays.includes(day) && styles.dayChipTextSelected,
                    ]}>
                      {t(`daysOfWeekShort.${day}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.timeRow}>
              <View style={styles.timeGroup}>
                <Text style={styles.inputLabel}>{t('createBag.startTime')}</Text>
                <TextInput
                  style={styles.input}
                  value={pickupStart}
                  onChangeText={setPickupStart}
                  placeholder="18:00"
                  placeholderTextColor={Colors.textGray}
                />
              </View>
              <View style={styles.timeGroup}>
                <Text style={styles.inputLabel}>{t('createBag.endTime')}</Text>
                <TextInput
                  style={styles.input}
                  value={pickupEnd}
                  onChangeText={setPickupEnd}
                  placeholder="20:00"
                  placeholderTextColor={Colors.textGray}
                />
              </View>
            </View>

            {collectionDays.length > 0 && pickupStart && pickupEnd && (
              <View style={styles.schedulePreview}>
                <Text style={styles.schedulePreviewTitle}>{t('createBag.schedulePreview')}</Text>
                <Text style={styles.schedulePreviewText}>
                  {t('createBag.availableOn', { 
                    days: collectionDays.map(d => t(`daysOfWeek.${d}`)).join(', '), 
                    start: pickupStart, 
                    end: pickupEnd 
                  })}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Step 4: Dietary */}
        {currentStep === 4 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepHeading}>{t('createBag.additionalInfo')}</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('createBag.dietaryTags')}</Text>
              <View style={styles.dietaryContainer}>
                {dietaryOptions.map(option => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.dietaryChip,
                      dietary.includes(option) && styles.dietaryChipSelected,
                    ]}
                    onPress={() => toggleDietary(option)}
                  >
                    <Text style={[
                      styles.dietaryChipText,
                      dietary.includes(option) && styles.dietaryChipTextSelected,
                    ]}>
                      {t(`dietary.${option.toLowerCase()}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('createBag.startDate')}</Text>
              <TextInput
                style={styles.input}
                value={startDate}
                onChangeText={setStartDate}
                placeholder={t('createBag.startDatePlaceholder')}
                placeholderTextColor={Colors.textGray}
              />
              <Text style={styles.inputHint}>{t('createBag.startDateHint')}</Text>
            </View>
          </View>
        )}

        {/* Step 5: Summary */}
        {currentStep === 5 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepHeading}>{t('createBag.summary')}</Text>
            <Text style={styles.stepSubheading}>{t('createBag.summaryDesc')}</Text>
            
            {/* Earnings Card */}
            <View style={styles.earningsCard}>
              <View style={styles.earningsHeader}>
                <Ionicons name="trending-up-outline" size={22} color={Colors.white} style={styles.earningsIcon} />
                <Text style={styles.earningsTitle}>{t('createBag.earningsEstimation')}</Text>
              </View>
              <View style={styles.earningsRow}>
                <Text style={styles.earningsLabel}>{t('createBag.pricePerBag')}</Text>
                <Text style={styles.earningsPrice}>₫{(parseFloat(price) / 1000).toFixed(0)}k</Text>
              </View>
              <View style={styles.earningsRow}>
                <Text style={styles.earningsSmallLabel}>{t('createBag.commission', { rate: COMMISSION_RATE * 100 })}</Text>
                <Text style={styles.earningsSmallAmount}>-₫{(calculateCommission() / 1000).toFixed(1)}k</Text>
              </View>
              <View style={[styles.earningsRow, styles.earningsDivider]}>
                <Text style={styles.earningsLabel}>{t('createBag.youEarnPerBag')}</Text>
                <Text style={styles.earningsPrice}>₫{(calculateEarningsPerBag() / 1000).toFixed(1)}k</Text>
              </View>
              <View style={styles.earningsTotal}>
                <Text style={styles.earningsTotalLabel}>{t('createBag.totalEarnings', { count: parseInt(quantity) || 0 })}</Text>
                <Text style={styles.earningsTotalAmount}>₫{(calculateTotalEarnings() / 1000).toFixed(0)}k</Text>
              </View>
            </View>

            {/* Details Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Ionicons name="cube-outline" size={18} color={Colors.text} style={styles.summaryIcon} />
                <Text style={styles.summaryTitle}>{t('createBag.surpriseBagDetailsTitle')}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('createBag.category')}</Text>
                <Text style={styles.summaryValue}>{foodCategories.find(c => c.id === foodType)?.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('createBag.name')}</Text>
                <Text style={styles.summaryValue}>{title}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('createBag.size')}</Text>
                <Text style={styles.summaryValue}>{bagSizeOptions.find(s => s.id === bagSize)?.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('createBag.originalPriceLabel')}</Text>
                <Text style={styles.summaryStrikethrough}>₫{(parseFloat(originalValue) / 1000).toFixed(0)}k</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('createBag.discountedPriceLabel')}</Text>
                <Text style={styles.summaryHighlight}>₫{(parseFloat(price) / 1000).toFixed(0)}k</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('createBag.discountLabel')}</Text>
                <Text style={styles.summaryDiscount}>{calculateDiscount()}% off</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('createBag.quantityLabel')}</Text>
                <Text style={styles.summaryValue}>{quantity} {t('vendor.bags').toLowerCase()}</Text>
              </View>
              {dietary.length > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{t('createBag.dietaryLabel')}</Text>
                  <Text style={styles.summaryValue}>{dietary.map(d => t(`dietary.${d.toLowerCase()}`)).join(', ')}</Text>
                </View>
              )}
            </View>

            {/* Schedule Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Ionicons name="calendar-outline" size={18} color={Colors.text} style={styles.summaryIcon} />
                <Text style={styles.summaryTitle}>{t('createBag.scheduleTitle')}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('createBag.startDateLabel')}</Text>
                <Text style={styles.summaryValue}>{startDate}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('createBag.daysLabel')}</Text>
                <Text style={styles.summaryValue}>{collectionDays.map(d => t(`daysOfWeekShort.${d}`)).join(', ')}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('createBag.collectionTimeLabel')}</Text>
                <Text style={styles.summaryValue}>{pickupStart} - {pickupEnd}</Text>
              </View>
            </View>

            <View style={styles.noteCard}>
              <Text style={styles.noteText}>
                {t('createBag.publishNote')}
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        {currentStep < 5 ? (
          <>
            {currentStep > 1 && (
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => setCurrentStep(currentStep - 1)}
              >
                <Text style={styles.backBtnText}>{t('createBag.back')}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.nextBtn,
                currentStep === 1 && styles.nextBtnFull,
                !canProceedToNext() && styles.nextBtnDisabled,
              ]}
              onPress={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceedToNext()}
            >
              <Text style={styles.nextBtnText}>{t('createBag.next')}</Text>
              <Text style={styles.nextBtnIcon}>→</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => setCurrentStep(currentStep - 1)}
            >
              <Text style={styles.backBtnText}>{t('createBag.back')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.publishBtn}
              onPress={handleCreate}
            >
              <Text style={styles.publishBtnIcon}>✓</Text>
              <Text style={styles.publishBtnText}>{t('createBag.publishOffer')}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  header: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: Colors.text,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 12,
  },
  progressContainer: {
    paddingHorizontal: 16,
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepItem: {
    alignItems: 'center',
    marginRight: 8,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: Colors.secondary,
  },
  stepCircleCompleted: {
    backgroundColor: Colors.secondary,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textGray,
  },
  stepNumberActive: {
    color: Colors.white,
  },
  stepCheckmark: {
    fontSize: 16,
    color: Colors.white,
  },
  stepTitle: {
    fontSize: 10,
    color: Colors.textGray,
    marginTop: 4,
  },
  stepLine: {
    width: 20,
    height: 2,
    backgroundColor: '#E5E5E5',
    marginRight: 8,
  },
  stepLineCompleted: {
    backgroundColor: Colors.secondary,
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: 24,
  },
  stepHeading: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  stepSubheading: {
    fontSize: 16,
    color: Colors.textGray,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5E5',
  },
  categoryCardSelected: {
    borderColor: Colors.secondary,
    backgroundColor: Colors.secondaryBackground,
  },
  categoryIcon: {
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: Colors.textGray,
  },
  checkmark: {
    fontSize: 24,
    color: Colors.secondary,
  },
  photoUpload: {
    width: '100%',
    height: 192,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  uploadIcon: {
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 14,
    color: Colors.textGray,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: Colors.textGray,
    marginTop: 4,
  },
  inputHint: {
    fontSize: 12,
    color: Colors.textGray,
    marginTop: 4,
  },
  sizeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5E5',
  },
  sizeCardSelected: {
    borderColor: Colors.secondary,
    backgroundColor: Colors.secondaryBackground,
  },
  sizeInfo: {
    flex: 1,
  },
  sizeName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  sizeDescription: {
    fontSize: 14,
    color: Colors.textGray,
  },
  sizeButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sizeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  sizeButtonSelected: {
    borderColor: Colors.secondary,
    backgroundColor: Colors.secondaryBackground,
  },
  sizeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  sizeButtonTextSelected: {
    color: Colors.secondary,
  },
  discountCard: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  discountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  discountIcon: {
    marginRight: 8,
  },
  discountTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.secondary,
  },
  discountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  discountLabel: {
    fontSize: 14,
    color: '#555',
  },
  discountValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.secondary,
  },
  discountAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  errorCard: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#EF9A9A',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#C62828',
  },
  warningCard: {
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FFB74D',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
  },
  warningIcon: {
    marginRight: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: '#EF6C00',
  },
  commissionCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 16,
  },
  commissionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  commissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  commissionLabel: {
    fontSize: 14,
    color: Colors.textGray,
  },
  commissionRate: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.secondary,
  },
  commissionAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  commissionTotal: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  commissionTotalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  commissionTotalAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.secondary,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    backgroundColor: Colors.white,
  },
  dayChipSelected: {
    borderColor: Colors.secondary,
    backgroundColor: '#FEF3C7',
  },
  dayChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  dayChipTextSelected: {
    color: Colors.secondary,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 16,
  },
  timeGroup: {
    flex: 1,
  },
  schedulePreview: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#90CAF9',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  schedulePreviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1565C0',
    marginBottom: 4,
  },
  schedulePreviewText: {
    fontSize: 13,
    color: '#1976D2',
  },
  dietaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dietaryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    backgroundColor: Colors.white,
  },
  dietaryChipSelected: {
    borderColor: Colors.secondary,
    backgroundColor: '#FEF3C7',
  },
  dietaryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  dietaryChipTextSelected: {
    color: Colors.secondary,
  },
  earningsCard: {
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  earningsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  earningsIcon: {
    marginRight: 8,
  },
  earningsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  earningsLabel: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
  },
  earningsPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
  },
  earningsSmallLabel: {
    fontSize: 13,
    color: Colors.white,
    opacity: 0.9,
  },
  earningsSmallAmount: {
    fontSize: 13,
    color: Colors.white,
  },
  earningsDivider: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  earningsTotal: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earningsTotalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  earningsTotalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryIcon: {
    marginRight: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textGray,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  summaryStrikethrough: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textGray,
    textDecorationLine: 'line-through',
  },
  summaryHighlight: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.secondary,
  },
  summaryDiscount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.secondary,
  },
  noteCard: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#90CAF9',
    borderRadius: 12,
    padding: 16,
  },
  noteText: {
    fontSize: 13,
    color: '#1565C0',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  backBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.secondary,
  },
  nextBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextBtnFull: {
    flex: 2,
  },
  nextBtnDisabled: {
    opacity: 0.5,
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  nextBtnIcon: {
    fontSize: 20,
    color: Colors.white,
  },
  publishBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  publishBtnIcon: {
    fontSize: 20,
    color: Colors.white,
  },
  publishBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
});
