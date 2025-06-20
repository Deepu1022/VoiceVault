import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';

import {
    FlatList,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type FileItem = {
    id: string;
    name: string;
    uri: string;
    type: string;
    date: string;
};

export default function VaultScreen() {
    const [files, setFiles] = useState<FileItem[]>([]);

    useEffect(() => {
        (async () => {
            const stored = await AsyncStorage.getItem('files');
            const parsed = stored ? JSON.parse(stored) : [];
            console.log('Loaded:', parsed);
            setFiles(parsed);
        })();
    }, []);

    const pickFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({});
            if (result.canceled) {
                console.log('File picking cancelled');
                return;
            }

            const file = result.assets[0];

            const newFile = {
                id: Date.now().toString(),
                name: file.name,
                uri: file.uri,
                type: file.mimeType || 'unknown',
                date: new Date().toISOString(),
            };

            const existing = await AsyncStorage.getItem('files');
            const parsed = existing ? JSON.parse(existing) : [];
            const updated = [...parsed, newFile];

            await AsyncStorage.setItem('files', JSON.stringify(updated));
            setFiles(updated);
        } catch (err) {
        }
    };

    const getMimeType = (uri: string) => {
        const ext = uri.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'pdf': return 'application/pdf';
            case 'jpg':
            case 'jpeg': return 'image/jpeg';
            case 'png': return 'image/png';
            case 'mp4': return 'video/mp4';
            case 'mp3': return 'audio/mpeg';
            case 'wav': return 'audio/wav';
            default: return '*/*';
        }
    };


    const openFile = async (uri: string) => {
        try {
            const mimeType = getMimeType(uri) || '*/*';

            if (Platform.OS === 'android') {
                const contentUri = await FileSystem.getContentUriAsync(uri);

                await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                    data: contentUri,
                    flags: 1,
                    type: mimeType,
                });
            } else {
                await WebBrowser.openBrowserAsync(uri); 
            }
        } catch (error) {
            console.error('Failed to open file:', error);
        }
    };

    const renderItem = ({ item }: { item: FileItem }) => (
        <TouchableOpacity style={styles.card} onPress={() => openFile(item.uri)}>
            <Ionicons name="document-text-outline" size={24} color="#3B82F6" />
            <View style={{ marginLeft: 10 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>{item.type}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Vault</Text>

            <FlatList
                data={files}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListEmptyComponent={<Text style={{ textAlign: 'center' }}>No files yet</Text>}
                contentContainerStyle={{ paddingBottom: 80 }}
            />

            <TouchableOpacity style={styles.fab} onPress={pickFile}>
                <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 16 , marginTop:20},
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    name: { fontSize: 16, fontWeight: '500' },
    meta: { fontSize: 12, color: '#6B7280' },
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#3B82F6',
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
    },
});
