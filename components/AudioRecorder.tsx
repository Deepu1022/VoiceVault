import { Audio } from 'expo-av';
import React, { useState } from 'react';
import { Alert, Button, FlatList, StyleSheet, Text, View } from 'react-native';

interface RecordingData {
  id: string;
  uri: string;
  duration: number;
}

export default function AudioRecorder() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordings, setRecordings] = useState<RecordingData[]>([]);

  const startRecording = async () => {
    console.log("🎤 Start button tapped");
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert("Permission required", "Please allow microphone access.");
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
      console.log("Recording started");
    } catch (err) {
      console.error("Error starting recording:", err);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      const status = await recording.getStatusAsync();

      console.log("Recording stopped", status);

      if (uri) {
        const newRecording: RecordingData = {
          id: Date.now().toString(),
          uri,
          duration: status.durationMillis ?? 0,
        };

        console.log("New recording:", newRecording);

        setRecordings((prev) => {
          const updated = [...prev, newRecording];
          console.log("Updated recordings:", updated);
          return updated;
        });
      }

      setRecording(null);
    } catch (err) {
      console.error("Error stopping recording:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Button
        title={recording ? 'Stop Recording' : 'Start Recording'}
        onPress={recording ? stopRecording : startRecording}
      />

      <FlatList
        data={recordings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>🎧 ID: {item.id}</Text>
            <Text>⏱ Duration: {(item.duration / 1000).toFixed(2)}s</Text>
            <Text>📁 URI: {item.uri}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 16,
    flex: 1,
  },
  item: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});
