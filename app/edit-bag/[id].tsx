import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Colors } from '@/constants/colors';
import { storage } from '@/services/storage';
import { BagSize, DietaryType, FoodType } from '@/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function EditOfferScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const offer = storage.getOfferById(id as string);

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

      // Parse collection times
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
        <Text>Offer not found</Text>
      </View>
    );
  }

  const bagSizes: BagSize[] = ['Small', 'Medium', 'Large'];
  const foodTypes: FoodType[] = ['Meals', 'Pastries', 'Drinks', 'Grocery'];
  const dietaryOptions: DietaryType[] = ['Meat', 'Vegetarian', 'Vegan'];

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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Input
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., Surprise Bánh Mì Bag"
        />

        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="What's inside the bag?"
          multiline
          numberOfLines={3}
        />

        <Input
          label="Price (VND)"
          value={price}
          onChangeText={setPrice}
          placeholder="25000"
          keyboardType="numeric"
        />

        <Input
          label="Original Value (VND)"
          value={originalValue}
          onChangeText={setOriginalValue}
          placeholder="60000"
          keyboardType="numeric"
        />

        <Input
          label="Quantity"
          value={quantity}
          onChangeText={setQuantity}
          placeholder="10"
          keyboardType="numeric"
        />

        {/* Collection Days */}
        <View style={styles.section}>
          <Text style={styles.label}>Collection Days</Text>
          <View style={styles.chipContainer}>
            {daysOfWeek.map(day => (
              <TouchableOpacity
                key={day}
                style={[styles.chip, collectionDays.includes(day) && styles.chipSelected]}
                onPress={() => toggleDay(day)}
              >
                <Text style={[styles.chipText, collectionDays.includes(day) && styles.chipTextSelected]}>
                  {day.substring(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Collection Time</Text>
          <View style={styles.timeRow}>
            <View style={styles.timeGroup}>
              <Text style={styles.timeLabel}>Start</Text>
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
              <Text style={styles.timeLabel}>End</Text>
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
          <Text style={styles.label}>Bag Size</Text>
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
          <Text style={styles.label}>Food Type</Text>
          <View style={styles.chipContainer}>
            {foodTypes.map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.chip, foodType === type && styles.chipSelected]}
                onPress={() => setFoodType(type)}
              >
                <Text style={[styles.chipText, foodType === type && styles.chipTextSelected]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Dietary Tags</Text>
          <View style={styles.chipContainer}>
            {dietaryOptions.map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.chip, dietary.includes(type) && styles.chipSelected]}
                onPress={() => toggleDietary(type)}
              >
                <Text style={[styles.chipText, dietary.includes(type) && styles.chipTextSelected]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.toggleRow}
          onPress={() => setIsActive(!isActive)}
        >
          <Text style={styles.toggleLabel}>Active</Text>
          <View style={[styles.toggle, isActive && styles.toggleActive]}>
            <View style={[styles.toggleThumb, isActive && styles.toggleThumbActive]} />
          </View>
        </TouchableOpacity>

        <Button title="Save Changes" onPress={handleSave} />
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
    padding: 24,
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
