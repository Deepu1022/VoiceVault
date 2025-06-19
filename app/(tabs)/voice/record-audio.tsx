import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RecordAudioScreen() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [duration, setDuration] = useState(0);
  const intervalRef = useRef<NodeJS.Timer | null>(null);
  const router = useRouter();

  useEffect(() => {
    startRecording();

    return () => {
      stopTimer();
      stopRecording();
    };
  }, []);

  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${mins} : ${secs}`;
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        alert('Permission to use microphone is required!');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setDuration(0);
      startTimer();
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;
      stopTimer();
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (uri) {
        router.push({
          pathname: '/review-audio',
          params: {
            uri,
            duration: duration.toString(),
          },
        });
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Your library</Text>
      <View style={styles.waveform}>
        <Text style={styles.timer}>{formatTime(duration)}</Text>
      </View>

      <TouchableOpacity onPress={stopRecording} style={styles.doneButton}>
        <Text style={styles.doneText}>● Done</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, alignItems: 'center', backgroundColor: '#fff' },
  heading: { fontSize: 16, color: '#6B7280', marginBottom: 24 },
  waveform: {
    backgroundColor: '#F3F4F6',
    width: '80%',
    height: 160,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timer: { fontSize: 32, fontWeight: '600' },
  doneButton: {
    marginTop: 32,
    backgroundColor: '#1D4ED8',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  doneText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
