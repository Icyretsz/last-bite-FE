import { Colors } from '@/constants/colors';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Text as SvgText } from 'react-native-svg';
import { router } from 'expo-router';
import { storage } from '@/services/storage';
import { tokenStorage } from '@/services/tokenStorage';

SplashScreen.preventAutoHideAsync();

export default function AppSplashScreen() {
  const [fontsLoaded] = useFonts({
    'amoresa': require('@/assets/fonts/amoresa-regular.otf'),
    'perandory': require('@/assets/fonts/perandory-semicondensed.otf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      const initializeApp = async () => {
        // Small delay to ensure fonts are rendered
        await new Promise(resolve => setTimeout(resolve, 100));
        await SplashScreen.hideAsync();

        const user = storage.getCurrentUser();
        let pendingEmail = null;
        try {
          pendingEmail = await tokenStorage.getItem('pending_verification_email');
        } catch {
          // AsyncStorage not ready, continue without pending email
        }

        if (user) {
          if (user.isVendor) {
            router.replace('/(vendor)/offers');
          } else {
            router.replace('/(consumer)/home');
          }
        } else if (pendingEmail) {
          router.replace('/(auth)/email-verification-pending');
        } else {
          router.replace('/(auth)/welcome');
        }
      };

      initializeApp();
    }
  }, [fontsLoaded]);

  // Keep splash screen visible until fonts are loaded
  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Svg width="320" height="180" viewBox="0 0 320 180">
        <SvgText
          fontFamily="amoresa"
          fontSize="80"
          x="120" y="105"
          textAnchor="middle"
          fill="#e8c97a"
          opacity="0.93"
        >
          The
        </SvgText>
        <SvgText
          fontFamily="perandory"
          fontSize="65"
          x="215" y="155"
          textAnchor="middle"
          letterSpacing="3"
          fill="#e8c97a"
          opacity="0.92"
        >
          LASTBITE
        </SvgText>
      </Svg>
      <Text style={styles.tagline}>Save the last. Share the good</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 500,
    height: 250,
    resizeMode: 'contain',
    marginBottom: -20
  },
  tagline: {
    fontSize: 26,
    color: '#f6d698',
    opacity: 0.9,
  },
});
