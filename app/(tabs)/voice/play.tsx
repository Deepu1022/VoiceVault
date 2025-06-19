import CloseButton from '@/components/CloseButton';
import WaveForm from '@/components/WaveForm';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';

export default function AudioPlayerScreen() {
  const { uri, name, id } = useLocalSearchParams<{ uri: string; name: string; id: string }>();
  const router = useRouter();

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1);

  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: uri as string },
          { shouldPlay: false },
          onPlaybackStatusUpdate
        );
        setSound(sound);
        soundRef.current = sound;
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          setDuration(status.durationMillis || 1);
        }
      } catch (e) {
        console.error('Failed to load sound:', e);
      }
    };

    load();
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 1);
    }
  };

  const toggle = async () => {
    if (!sound) return;
    const status = await sound.getStatusAsync();
    if (status.isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const formatTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = String(Math.floor(totalSecs / 60)).padStart(2, '0');
    const secs = String(totalSecs % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleSeek = async (value: number) => {
    if (sound) {
      await sound.setPositionAsync(value);
    }
  };

  const handleDelete = async () => {
    Alert.alert('Delete', 'Are you sure you want to delete this recording?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const stored = await AsyncStorage.getItem('audios');
          const audios = stored ? JSON.parse(stored) : [];
          const updated = audios.filter((audio: any) => audio.id !== id);
          await AsyncStorage.setItem('audios', JSON.stringify(updated));
          router.replace('/voice');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
        <CloseButton to="/voice" />
      <Text style={styles.title}>{name}</Text>
      <View style={styles.waveformPlaceholder}>
        <WaveForm></WaveForm>
      </View>

      <Slider
        style={{ width: '90%', height: 40 }}
        minimumValue={0}
        maximumValue={duration}
        value={position}
        onSlidingComplete={handleSeek}
        minimumTrackTintColor="#60A5FA"
        maximumTrackTintColor="#E5E7EB"
        thumbTintColor="#3B82F6"
      />

      <View style={styles.timeRow}>
        <Text>{formatTime(position)}</Text>
        <Text>{formatTime(duration)}</Text>
      </View>

      <Button title={isPlaying ? 'Pause' : 'Play'} onPress={toggle} />
      <Button title="Delete" color="red" onPress={handleDelete} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 20 },
  waveformPlaceholder: {
    width: '100%',
    height: 80,
    marginBottom: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 20,
  },
});
