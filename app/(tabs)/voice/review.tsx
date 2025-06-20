import CloseButton from '@/components/CloseButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ReviewAudioScreen() {
  const { uri, duration } = useLocalSearchParams<{ uri: string; duration: string }>();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [position, setPosition] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const loadSound = async () => {
      if (!uri) return;
      const { sound } = await Audio.Sound.createAsync({ uri: uri as string });
      setSound(sound);

      const status = await sound.getStatusAsync();
      if (isMounted && status.isLoaded) {
        setTotalDuration(status.durationMillis ?? 0);
      }

      sound.setOnPlaybackStatusUpdate((status) => {
        if (!isMounted || !status.isLoaded) return;
        setPosition(status.positionMillis ?? 0);
        setIsPlaying(status.isPlaying ?? false);
      });
    };

    loadSound();

    return () => {
      isMounted = false;
      sound?.unloadAsync();
    };
  }, []);

  const togglePlay = async () => {
    if (!sound) return;

    const status = await sound.getStatusAsync();
    if (!status.isLoaded) {
      return;
    }

    if (status.isPlaying) {
      await sound.pauseAsync();
    } else {
      if (status.positionMillis >= status?.durationMillis) {
        await sound.setPositionAsync(0);
      }
      await sound.playAsync();
    }
  };

  const handleSeek = async (value: number) => {
    if (sound) {
      await sound.setPositionAsync(value);
    }
  };

  const saveAudio = async () => {
    const newAudio = {
      id: Date.now().toString(),
      name: `audio_${Date.now()}.m4a`,
      uri,
      duration,
    };

    const existing = await AsyncStorage.getItem('audios');
    const parsed = existing ? JSON.parse(existing) : [];
    parsed.push(newAudio);
    await AsyncStorage.setItem('audios', JSON.stringify(parsed));
    router.replace('/voice');
  };

  const formatTime = (ms: number) => {
    const sec = Math.floor(ms / 1000);
    const min = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${String(min).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Review Audio</Text>
      <CloseButton to='/voice'></CloseButton>
      <Text style={styles.timeText}>
        {formatTime(position)} / {formatTime(totalDuration)}
      </Text>

      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={totalDuration}
        value={position}
        onSlidingComplete={handleSeek}
        minimumTrackTintColor="#1EB1FC"
        maximumTrackTintColor="#ddd"
        thumbTintColor="#1EB1FC"
      />

      <TouchableOpacity style={styles.button} onPress={togglePlay}>
        <Text style={styles.buttonText}>{isPlaying ? 'Pause' : 'Play'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={saveAudio}>
        <Text style={styles.buttonText}>Save Audio</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  timeText: { fontSize: 16, marginBottom: 8 },
  slider: { width: '100%', height: 40, marginBottom: 24 },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    width: '80%',
  },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
