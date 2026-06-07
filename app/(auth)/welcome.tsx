import { Colors } from '@/constants/colors';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Animated, Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/button';
import { useRef, useState } from 'react';

const { width: SCREEN_W } = Dimensions.get('window');

const slides = [
  {
    icon: 'storefront-outline',
    titleKey: 'welcome.step1Title',
    descKey: 'welcome.step1Desc',
    image: require('@/assets/images/step1-1.png'),
  },
  {
    icon: 'bag-handle-outline',
    titleKey: 'welcome.step2Title',
    descKey: 'welcome.step2Desc',
    image: require('@/assets/images/step2-1.png'),
  },
  {
    icon: 'leaf-outline',
    titleKey: 'welcome.step3Title',
    descKey: 'welcome.step3Desc',
    image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&q=80',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const isLast = currentIndex === slides.length - 1;

  const animateTo = (nextIndex: number) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: nextIndex > currentIndex ? 30 : -30,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentIndex(nextIndex);
      slideAnim.setValue(nextIndex > currentIndex ? -30 : 30);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const goNext = () => {
    if (!isLast) animateTo(currentIndex + 1);
  };

  const goPrev = () => {
    if (currentIndex > 0) animateTo(currentIndex - 1);
  };

  const slide = slides[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      {/* Slide */}
      <View style={styles.slide}>
        {/* Image */}
        <Animated.View
          style={[
            styles.imageContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.imageWrapper} key={slide.titleKey}>
            <Image source={slide.image} style={styles.image} resizeMode="cover" />
          </View>
        </Animated.View>

        {/* Text */}
        <Animated.View
          style={[
            styles.textContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.title}>{t(slide.titleKey)}</Text>
          <Text style={styles.desc}>{t(slide.descKey)}</Text>
        </Animated.View>
      </View>

      {/* Pagination dots */}
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentIndex === index ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>

      {/* Footer buttons */}
      <View style={styles.footer}>
        {isLast ? (
          <>
            <Button
              title={t('welcome.getStarted')}
              onPress={() => router.replace('/(auth)/login')}
            />
            <Text style={styles.footerNote}>{t('welcome.footerNote')}</Text>
          </>
        ) : (
          <View style={styles.buttonRow}>
            <Pressable onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.skipText}>{t('welcome.skip')}</Text>
            </Pressable>
            <Button title={t('welcome.next')} onPress={goNext} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  slide: {
    flex: 1,
    paddingTop: 24,
  },
  imageContainer: {
    flex: 1,
  },
  imageWrapper: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    marginHorizontal: 24,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    paddingHorizontal: 32,
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: 'center',
    minHeight: 140,
  },
  stepCount: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.dark,
    textAlign: 'center',
    marginBottom: 8,
  },
  desc: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  dotInactive: {
    width: 6,
    backgroundColor: Colors.lightGray,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray,
    paddingVertical: 12,
  },
  footerNote: {
    fontSize: 13,
    color: Colors.gray,
    textAlign: 'center',
    marginTop: 8,
  },
});
