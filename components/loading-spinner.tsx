import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/colors';

interface LoadingSpinnerProps {
  visible: boolean;
}

export function LoadingSpinner({ visible }: LoadingSpinnerProps) {
  if (!visible) return null;

  return (
    <Modal animationType="fade" transparent visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.spinnerContainer}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerContainer: {
    backgroundColor: Colors.white,
    padding: 24,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
});
