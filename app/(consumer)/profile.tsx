import { Colors } from '@/constants/colors';
import { useLogout } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'vi' : 'en');
  };

  const menuItems = [
    { iconName: 'person-outline', title: t('profile.accountSettings'), onPress: () => { } },
    { iconName: 'notifications-outline', title: t('profile.notifications'), onPress: () => { } },
    { iconName: 'heart-outline', title: t('profile.favorites'), onPress: () => { } },
    { iconName: 'ticket-outline', title: t('profile.vouchers'), onPress: () => { } },
    { iconName: 'help-circle-outline', title: t('profile.helpSupport'), onPress: () => { } },
    {
      iconName: 'storefront-outline',
      title: t('profile.becomeVendor'),
      onPress: () => navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: '(vendor)' }],
        })
      )
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>?</Text>
        </View>
        <Text style={styles.name}>{t('common.guest')}</Text>
        <Text style={styles.email}></Text>
      </View>

      <View style={styles.content}>
        {/* Language Switcher */}
        <TouchableOpacity
          style={styles.languageItem}
          onPress={toggleLanguage}
        >
          <Ionicons name="language-outline" size={22} color={Colors.text} style={styles.menuIcon} />
          <Text style={styles.menuTitle}>
            {language === 'en' ? 'English' : 'Tiếng Việt'}
          </Text>
          <View style={styles.languageBadge}>
            <Text style={styles.languageBadgeText}>{language.toUpperCase()}</Text>
          </View>
        </TouchableOpacity>

        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <Ionicons name={item.iconName as any} size={22} color={Colors.text} style={styles.menuIcon} />
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.logoutButton} onPress={() => logout()} disabled={isLoggingOut}>
          <Text style={styles.logoutText}>{t('profile.logOut')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  header: {
    backgroundColor: Colors.primary,
    padding: 32,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.primary,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
  },
  content: {
    padding: 16,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  languageBadge: {
    backgroundColor: Colors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  languageBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  menuArrow: {
    fontSize: 24,
    color: Colors.textGray,
  },
  logoutButton: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 2,
    borderColor: Colors.error,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.error,
  },
});
