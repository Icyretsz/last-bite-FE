import { Colors } from '@/constants/colors';
import { Stack } from 'expo-router';
import { LanguageProvider } from '@/contexts/LanguageContext';
import '@/services/i18n';
import { useTranslation } from 'react-i18next';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/services/queryClient';

export default function RootLayout() {
    const { t } = useTranslation();
  return (
    <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: Colors.white,
          headerTitleStyle: {
            fontWeight: '700',
          },
          animation: 'slide_from_right',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          headerBackTitle: t('common.back'),
        }}
      >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(consumer)" options={{ headerShown: false, headerBackTitle: t('common.back') }} />
      <Stack.Screen name="(vendor)" options={{ headerShown: false }} />
      
      {/* Consumer Detail Screens */}
      <Stack.Screen 
        name="category/[type]" 
        options={{ 
          title: t('offer.category'),
          presentation: 'card',
          headerBackTitle: t('common.back'),
        }} 
      />
      <Stack.Screen 
        name="offer/[id]" 
        options={{ 
          title: t('offer.bagDetails'),
          presentation: 'card',
          headerBackTitle: t('common.back'),
        }} 
      />
      <Stack.Screen 
        name="vendor/[id]" 
        options={{ 
          title: t('vendor.vendorProfile'),
          presentation: 'card',
          headerBackTitle: t('common.back'),
        }} 
      />
      <Stack.Screen 
        name="checkout/[id]" 
        options={{ 
          title: t('checkout.checkout'),
          presentation: 'card',
          headerBackTitle: t('common.back'),
        }} 
      />
      <Stack.Screen 
        name="payment/[id]" 
        options={{ 
          title: t('checkout.payment'),
          presentation: 'card',
          headerBackTitle: t('common.back'),
        }} 
      />
      <Stack.Screen 
        name="confirmation/[id]" 
        options={{ 
          title: t('checkout.confirmed'),
          presentation: 'card',
          headerBackTitle: t('common.back'),
        }} 
      />
      <Stack.Screen 
        name="review/[id]" 
        options={{ 
          title: t('review.writeReview'),
          presentation: 'card',
          headerBackTitle: t('common.back'),
        }} 
      />
      <Stack.Screen 
        name="order-details/[id]" 
        options={{ 
          title: t('orderDetails.orderDetails'),
          presentation: 'card',
          headerBackTitle: t('common.back'),
          headerStyle: {
            backgroundColor: Colors.secondary,
          },
          headerTintColor: Colors.white,
        }} 
      />
      <Stack.Screen 
        name="verify-collection/[code]" 
        options={{ 
          title: t('orderDetails.verifyCollection'),
          presentation: 'card',
          headerBackTitle: t('common.back'),
          headerStyle: {
            backgroundColor: Colors.secondary,
          },
          headerTintColor: Colors.white,
        }} 
      />
      <Stack.Screen 
        name="create-bag" 
        options={{ 
          title: t('offer.createBag'),
          presentation: 'card',
          headerBackTitle: t('common.back'),
          headerStyle: {
            backgroundColor: Colors.secondary,
          },
          headerTintColor: Colors.white,
        }} 
      />
      <Stack.Screen 
        name="edit-bag/[id]" 
        options={{ 
          title: t('offer.editBag'),
          presentation: 'card',
          headerBackTitle: t('common.back'),
          headerStyle: {
            backgroundColor: Colors.secondary,
          },
          headerTintColor: Colors.white,
        }} 
      />
      <Stack.Screen 
        name="edit-offer/[id]" 
        options={{ 
          title: t('offer.bagDetails'),
          presentation: 'card',
          headerBackTitle: t('common.back'),
          headerStyle: {
            backgroundColor: Colors.secondary,
          },
          headerTintColor: Colors.white,
        }} 
      />
    </Stack>
    </LanguageProvider>
    </QueryClientProvider>
  );
}
