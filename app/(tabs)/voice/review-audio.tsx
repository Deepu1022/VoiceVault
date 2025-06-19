import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider'; // ✅ correct import
import { Audio } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ReviewAudioScreen() {
  const { uri, duration } = useLocalSearchParams<{ uri: string; duration: string }>();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const router = useRouter();

  useEffect(() => {
    loadSound();
    return () => {
      sound?.unloadAsync();
    };
  }, []);

  const loadSound = async () => {
    if (!uri) return;
    const { sound } = await Audio.Sound.createAsync({ uri });
    setSound(sound);
    const status = await sound.getStatusAsync();
    if (status.isLoaded) {
      setTotalDuration(status.durationMillis || 0);
    }

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.positionMillis !== undefined) {
        setPosition(status.positionMillis);
        setIsPlaying(status.isPlaying);
      }
    });
  };

  const togglePlayback = async () => {
    if (!sound) return;
    const status = await sound.getStatusAsync();
    if (status.isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const saveAudio = async () => {
    const newAudio = {
      id: Date.now().toString(),
      name: `audio_${Date.now()}.mp3`,
      uri,
      duration,
      size: 'unknown', // will improve later
    };

    const existing = await AsyncStorage.getItem('audios');
    const parsed = existing ? JSON.parse(existing) : [];
    parsed.push(newAudio);
    await AsyncStorage.setItem('audios', JSON.stringify(parsed));

    router.replace('/audio-library');
  };

  const formatMillis = (ms: number) => {
    const sec = Math.floor(ms / 1000);
    const mins = String(Math.floor(sec / 60)).padStart(2, '0');
    const secs = String(sec % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Audio Generated!</Text>
      <Text style={styles.filename}>{uri?.split('/').pop()}</Text>

      <Slider
        style={{ width: '100%', marginTop: 20 }}
        value={position}
        minimumValue={0}
        maximumValue={totalDuration}
        minimumTrackTintColor="#60A5FA"
        maximumTrackTintColor="#E5E7EB"
        onSlidingComplete={async (val) => {
          if (sound) await sound.setPositionAsync(val);
        }}
      />
      <View style={styles.times}>
        <Text>{formatMillis(position)}</Text>
        <Text>{formatMillis(totalDuration)}</Text>
      </View>

      <TouchableOpacity onPress={togglePlayback} style={styles.playButton}>
        <Ionicons name={isPlaying ? 'pause' : 'play'} size={32} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveButton} onPress={saveAudio}>
        <Text style={styles.saveText}>Save audio</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  filename: { fontSize: 16, color: '#6B7280', marginBottom: 20 },
  times: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  playButton: {
    marginVertical: 24,
    backgroundColor: '#60A5FA',
    padding: 18,
    borderRadius: 50,
  },
  saveButton: {
    backgroundColor: '#1D4ED8',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
