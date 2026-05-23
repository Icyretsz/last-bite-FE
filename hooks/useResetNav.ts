import { useNavigation } from 'expo-router';
import { CommonActions } from '@react-navigation/native';

export const useResetNav = () => {
  const navigation = useNavigation();

  const resetTo = (routeName: string, params?: Record<string, unknown>) => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: routeName, params }],
      })
    );
  };

  return { resetTo };
};