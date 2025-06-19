import CloseButton from '@/components/CloseButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
export default function ReviewAudioScreen() {
  const { uri, duration } = useLocalSearchParams<{ uri: string; duration: string }>();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const router = useRouter();

 useEffect(() => {
  const loadSound = async () => {
    try {
      if (!uri) {
        console.warn('No URI found');
        return;
      }

      console.log('Loading sound from URI:', uri);

      const { sound, status } = await Audio.Sound.createAsync(
        { uri: uri as string },
        { shouldPlay: false }
      );

      console.log('Sound status:', status);
      setSound(sound);
    } catch (error) {
      console.error('Error loading sound:', error);
    }
  };

  loadSound();

  return () => {
    sound?.unloadAsync();
  };
}, []);

  const saveAudio = async () => {
    const newAudio = {
      id: Date.now().toString(),
      name: `audio_${Date.now()}.mp3`,
      uri,
      duration,
    };

    const existing = await AsyncStorage.getItem('audios');
    const parsed = existing ? JSON.parse(existing) : [];
    parsed.push(newAudio);
    await AsyncStorage.setItem('audios', JSON.stringify(parsed));
    router.replace('/voice');
  };

  return (
    <View style={styles.container}>
      <CloseButton to="/voice" />
      <Text style={styles.title}>Review</Text>
      <Button title="Play" onPress={() => sound?.replayAsync()} />
      <Button title="Save Audio" onPress={saveAudio} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 16 },
});
