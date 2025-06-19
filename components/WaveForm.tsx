import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function WaveForm({ barCount = 40 }) {
  const bars = Array.from({ length: barCount }, () => Math.random());

  return (
    <View style={styles.container}>
      {bars.map((height, i) => (
        <View
          key={i}
          style={[
            styles.bar,
            {
              height: `${height * 100}%`,
              backgroundColor: '#3B82F6',
              opacity: 0.6 + Math.random() * 0.4,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 20,
  },
  bar: {
    width: 3,
    marginHorizontal: 1,
    borderRadius: 2,
  },
});
