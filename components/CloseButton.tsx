import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';

export default function CloseButton({ to = '/voice' }: { to?: string }) {
  const router = useRouter();

  return (
    <TouchableOpacity style={styles.button} onPress={() => router.replace(to)}>
      <Ionicons name="close" size={28} color="#111" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 12,
    position: 'absolute',
    top: 40,
    right: 16,
    zIndex: 10,
  },
});
