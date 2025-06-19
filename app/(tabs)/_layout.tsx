import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="voice" options={{ title: 'Voice' }} />
      <Tabs.Screen name="vault" options={{ title: 'Vault' }} />
    </Tabs>
  );
}
