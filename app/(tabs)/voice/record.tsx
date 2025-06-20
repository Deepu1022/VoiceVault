import BackButton from '@/components/BackButton';
import WaveForm from '@/components/WaveForm';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RecordScreen() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [duration, setDuration] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const min = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const sec = String(totalSec % 60).padStart(2, '0');
    return `${min}:${sec}`;
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      recording?.stopAndUnloadAsync();
    };
  }, []);

  const startRecording = async () => {
    try {
      const permission = await Audio.getPermissionsAsync();
      if (!permission.granted) {
        const newPermission = await Audio.requestPermissionsAsync();
        if (!newPermission.granted) {
          alert('Microphone permission is required!');
          return;
        }
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await rec.startAsync();
      setRecording(rec);

      intervalRef.current = setInterval(async () => {
        const status = await rec.getStatusAsync();
        if (status.isRecording) {
          setDuration(status.durationMillis ?? 0);
        }
      }, 200);
    } catch (e) {
      console.error('Recording failed to start:', e);
      alert('Failed to start recording. Check microphone permission.');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      clearInterval(intervalRef.current!);
      await recording.stopAndUnloadAsync();

      const uri = recording.getURI();
      if (!uri) throw new Error('Recording URI is null');

      const filename = `audio_${Date.now()}.m4a`;
      const newPath = FileSystem.documentDirectory + filename;


      await FileSystem.moveAsync({
        from: uri,
        to: newPath,
      });

      const durationSec = Math.floor(duration / 1000);
      setRecording(null);


      router.push({
        pathname: '/voice/review',
        params: { uri: newPath, duration: durationSec.toString() },
      });
    } catch (e) {
      console.error('Error stopping recording:', e);
      alert('Failed to save recording.');
    }
  };

  return (
    <View style={styles.container}>
      <BackButton />
      <View>
       <View style={styles.header}>
        <Text style={styles.headerText}>Record Audio</Text>
      </View>
      </View>
      <Text style={styles.timer}>{formatTime(duration)}</Text>

      <WaveForm barCount={50} />

      <TouchableOpacity
        style={styles.button}
        onPress={recording ? stopRecording : startRecording}
      >
        <Text style={styles.buttonText}>{recording ? 'Done' : 'Start Recording'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  timer: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  slider: {
    width: '90%',
    height: 5,
    flexDirection: 'row',
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 12,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  header: {
    width: '100%',
    paddingBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
