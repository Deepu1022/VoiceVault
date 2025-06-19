import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AudioListScreen() {
    const [audios, setAudios] = useState([]);
    const router = useRouter();
    useFocusEffect(
        useCallback(() => {
            const load = async () => {
                const stored = await AsyncStorage.getItem('audios');
                const parsed = stored ? JSON.parse(stored) : [];
                setAudios(parsed.reverse());
            };
            load();
        }, [])
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Voice Library</Text>

            <FlatList
                data={audios}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={<Text>No recordings found</Text>}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => router.push({ pathname: '/voice/play', params: item })}
                    >
                        <Ionicons name="musical-notes-outline" size={24} color="#4B5563" style={{ marginRight: 12 }} />
                        <View>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.meta}>Duration: {item.duration} sec</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />

            <TouchableOpacity style={styles.fab} onPress={() => router.push('/voice/record')}>
                <Ionicons name="add" size={32} color="white" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#fff' },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginBottom: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
    },
    name: { fontSize: 16, fontWeight: '600' },
    meta: { fontSize: 14, color: '#6B7280' },

    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        backgroundColor: '#3B82F6',
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
});
