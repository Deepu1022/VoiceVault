import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function RecordScreen() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const router = useRouter();

  const startRecording = async () => {
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

    const rec = new Audio.Recording();
    await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await rec.startAsync();
    setRecording(rec);
  };

 const stopRecording = async () => {
  if (!recording) return;

  await recording.stopAndUnloadAsync();
  const uri = recording.getURI();
  const status = await recording.getStatusAsync();

  const newPath = `${FileSystem.documentDirectory}audio_${Date.now()}.m4a`;
  await FileSystem.moveAsync({ from: uri!, to: newPath });

  const duration = (status.durationMillis || 0) / 1000;

  setRecording(null);

  router.push({
    pathname: '/voice/review',
    params: { uri: newPath, duration: duration.toFixed(1) },
  });
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎙 {recording ? 'Recording...' : 'Ready to Record'}</Text>
      <Button title={recording ? 'Stop' : 'Start'} onPress={recording ? stopRecording : startRecording} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, marginBottom: 20 },
});
