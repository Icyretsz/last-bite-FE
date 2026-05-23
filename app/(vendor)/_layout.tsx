import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function VendorLayout() {
  const { t } = useTranslation();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.secondary,
        tabBarInactiveTintColor: Colors.textGray,
        headerStyle: {
          backgroundColor: Colors.secondary,
        },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t('vendor.dashboard'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" color={color} size={size ?? 24} />
          ),
          headerTitle: t('vendor.vendorDashboard'),
        }}
      />
      <Tabs.Screen
        name="offers"
        options={{
          title: t('vendor.bags'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bag-handle-outline" color={color} size={size ?? 24} />
          ),
        }}
      />
      <Tabs.Screen
        name="incoming-orders"
        options={{
          title: t('vendor.orders'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" color={color} size={size ?? 24} />
          ),
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: t('vendor.earnings'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cash-outline" color={color} size={size ?? 24} />
          ),
        }}
      />
    </Tabs>
  );
}
