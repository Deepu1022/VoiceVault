// import { Ionicons } from '@expo/vector-icons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useFocusEffect, useRouter } from 'expo-router';
// import React, { useCallback, useState } from 'react';
// import { FlatList, Text, TouchableOpacity, View } from 'react-native';

// type AudioItem = {
//   id: string;
//   name: string;
//   duration: string;
//   uri: string;
//   size: string;
// };

// export default function AudioLibraryScreen() {
//   const [audios, setAudios] = useState<AudioItem[]>([]);
//   const router = useRouter();

//   useFocusEffect(
//     useCallback(() => {
//       const loadData = async () => {
//         const data = await AsyncStorage.getItem('audios');
//         if (data) {
//           setAudios(JSON.parse(data));
//         }
//       };
//       loadData();
//     }, [])
//   );

//   return (
//     <View style={styles.container}>
//       <Text style={styles.heading}>Your library</Text>
//       <Text style={styles.subheading}>Audio Library</Text>

//       <FlatList
//         data={audios}
//         keyExtractor={(item) => item.id}
//         contentContainerStyle={{ paddingBottom: 100 }}
//         renderItem={({ item }) => (
//           <View style={styles.item}>
//             <Ionicons name="mic-outline" size={24} color="#4B5563" style={{ marginRight: 10 }} />
//             <View style={{ flex: 1 }}>
//               <Text style={styles.name}>{item.name}</Text>
//               <Text style={styles.meta}>{item.duration} · {item.size}</Text>
//             </View>
//             <Ionicons name="play-circle" size={28} color="#2563EB" />
//           </View>
//         )}
//         ListEmptyComponent={
//           <Text style={{ textAlign: 'center', marginTop: 24, color: '#9CA3AF' }}>
//             No audio recordings found.
//           </Text>
//         }
//       />

//       <TouchableOpacity style={styles.fab} onPress={() => router.push('/record-audio')}>
//         <Ionicons name="add" size={28} color="#fff" />
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet
