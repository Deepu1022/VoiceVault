import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type FileItem = {
  id: string;
  name: string;
  type: string;
  uri: string;
};

export default function FileListScreen() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const loadFiles = async () => {
        const data = await AsyncStorage.getItem('files');
        if (data) setFiles(JSON.parse(data));
      };
      loadFiles();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Files</Text>

      <FlatList
        data={files}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Ionicons name={getIcon(item.type)} size={24} color="#4B5563" style={{ marginRight: 10 }} />
            <Text>{item.name}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 24, color: '#9CA3AF' }}>No files found.</Text>}
      />

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/files/pick')}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const getIcon = (type: string) => {
  if (type.includes('image')) return 'image-outline';
  if (type.includes('video')) return 'videocam-outline';
  if (type.includes('pdf')) return 'document-outline';
  return 'document';
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#1D4ED8',
    borderRadius: 28,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
});
