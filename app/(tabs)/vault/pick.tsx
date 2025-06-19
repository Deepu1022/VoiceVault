import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function PickFileScreen() {
  const router = useRouter();

  useEffect(() => {
    const pickFile = async () => {
      const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });

      if (result.type === 'success') {
        const newFile = {
          id: Date.now().toString(),
          name: result.name,
          uri: result.uri,
          type: result.mimeType || 'unknown',
        };

        const existing = await AsyncStorage.getItem('files');
        const parsed = existing ? JSON.parse(existing) : [];
        parsed.push(newFile);
        await AsyncStorage.setItem('files', JSON.stringify(parsed));
      }

      router.replace('/files'); // go back to list
    };

    pickFile();
  }, []);

  return null;
}
