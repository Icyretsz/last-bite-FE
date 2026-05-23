import { Button } from '@/components/button';
import { Colors } from '@/constants/colors';
import { storage } from '@/services/storage';
import { DietaryType, FoodType } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

export default function PreferencesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [foodTypes, setFoodTypes] = useState<FoodType[]>([]);
  const [dietary, setDietary] = useState<DietaryType[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [locationEnabled, setLocationEnabled] = useState(false);

  const pickupTimes = [
    t('preferences.morningTime'),
    t('preferences.afternoonTime'),
    t('preferences.eveningTime'),
    t('preferences.lateNightTime'),
  ];

  const foodTypeOptions: FoodType[] = ['Meals', 'Pastries', 'Drinks', 'Grocery'];
  const dietaryOptions: DietaryType[] = ['Meat', 'Vegetarian', 'Vegan'];

  const toggleFoodType = (type: FoodType) => {
    setFoodTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleDietary = (type: DietaryType) => {
    setDietary(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleTime = (time: string) => {
    setSelectedTimes(prev =>
      prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]
    );
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      storage.updateUserPreferences({
        foodTypes,
        dietary,
        preferredTimes: selectedTimes,
        locationEnabled,
      });
      router.replace('/(consumer)/home');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {[1, 2, 3].map(i => (
          <View
            key={i}
            style={[
              styles.progressBar,
              i <= step && styles.progressBarActive,
            ]}
          />
        ))}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Step 1: Food Types */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>{t('preferences.whatFoodLike')}</Text>
            <Text style={styles.subtitle}>{t('preferences.selectFavoriteTypes')}</Text>

            <View style={styles.chipContainer}>
              {foodTypeOptions.map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.chip,
                    foodTypes.includes(type) && styles.chipSelected,
                  ]}
                  onPress={() => toggleFoodType(type)}
                >
                  <Text style={[
                    styles.chipText,
                    foodTypes.includes(type) && styles.chipTextSelected,
                  ]}>
                    {t(`foodTypes.${type.toLowerCase()}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 2: Dietary Preferences */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>{t('preferences.dietaryPreferences')}</Text>
            <Text style={styles.subtitle}>{t('preferences.letUsKnowRestrictions')}</Text>

            <View style={styles.chipContainer}>
              {dietaryOptions.map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.chip,
                    dietary.includes(type) && styles.chipSelected,
                  ]}
                  onPress={() => toggleDietary(type)}
                >
                  <Text style={[
                    styles.chipText,
                    dietary.includes(type) && styles.chipTextSelected,
                  ]}>
                    {t(`dietary.${type.toLowerCase()}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 3: Pickup Times & Location */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>{t('preferences.pickupTimes')}</Text>
            <Text style={styles.subtitle}>{t('preferences.whenCanCollect')}</Text>

            <View style={styles.timeContainer}>
              {pickupTimes.map(time => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeButton,
                    selectedTimes.includes(time) && styles.timeButtonSelected,
                  ]}
                  onPress={() => toggleTime(time)}
                >
                  <Text style={[
                    styles.timeButtonText,
                    selectedTimes.includes(time) && styles.timeButtonTextSelected,
                  ]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Location Card */}
            <View style={styles.locationCard}>
              <View style={styles.locationContent}>
                <Ionicons name="location-outline" size={28} color={Colors.primary} />
                <View style={styles.locationTextContainer}>
                  <Text style={styles.locationTitle}>{t('preferences.enableLocation')}</Text>
                  <Text style={styles.locationSubtitle}>{t('preferences.findVendorsNear')}</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.locationButton,
                    locationEnabled && styles.locationButtonEnabled,
                  ]}
                  onPress={() => setLocationEnabled(!locationEnabled)}
                >
                  <Text style={styles.locationButtonText}>
                    {locationEnabled ? t('preferences.enabled') : t('preferences.allow')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <Button
          title={step === 3 ? t('preferences.getStarted') : t('preferences.continue')}
          onPress={handleNext}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: Colors.backgroundGray,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E5E5',
  },
  progressBarActive: {
    backgroundColor: Colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  stepContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textGray,
    marginBottom: 32,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: '#E5E5E5',
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  chipTextSelected: {
    color: Colors.white,
  },
  timeContainer: {
    gap: 12,
    marginBottom: 32,
  },
  timeButton: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: '#E5E5E5',
  },
  timeButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'left',
  },
  timeButtonTextSelected: {
    color: Colors.white,
  },
  locationCard: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  locationSubtitle: {
    fontSize: 14,
    color: Colors.textGray,
  },
  locationButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  locationButtonEnabled: {
    backgroundColor: Colors.secondary,
  },
  locationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
});
