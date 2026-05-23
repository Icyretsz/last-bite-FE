import { Colors } from '@/constants/colors';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
}

export function Button({ title, onPress, variant = 'primary', disabled, loading }: ButtonProps) {
  const getBackgroundColor = () => {
    if (disabled) return Colors.textGray;
    switch (variant) {
      case 'primary': return Colors.primary;
      case 'secondary': return Colors.secondary;
      case 'outline': return 'transparent';
      default: return Colors.primary;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        variant === 'outline' && styles.outline,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={Colors.white} />
      ) : (
        <Text style={[
          styles.text,
          variant === 'outline' && styles.outlineText,
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outline: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  text: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  outlineText: {
    color: Colors.primary,
  },
});
