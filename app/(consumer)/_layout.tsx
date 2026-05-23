import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

export default function ConsumerLayout() {
    const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textGray,
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('navigation.home'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size ?? 24} />
          ),
          headerTitle: () => (
            <View style={styles.headerTitle}>
              <Ionicons name="location-outline" size={18} color={Colors.white} />
              <Text style={styles.headerTitleText}>Ho Chi Minh City</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: t('navigation.browse'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" color={color} size={size ?? 24} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: t('navigation.favorites'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" color={color} size={size ?? 24} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: t('navigation.orders'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube-outline" color={color} size={size ?? 24} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('navigation.profile'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size ?? 24} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitleText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 18,
  },
});
