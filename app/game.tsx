import { StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function GameScreen() {
  // TODO: 在此處定義遊戲狀態 (state)，例如資源和資產
  const resources = {
    creativity: 10,
    productivity: 10,
    money: 100,
  };
  const assets = [
    { name: '工程師', count: 1 },
  ];

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: '新遊戲', headerShown: false }} />
      <ThemedText type="title">新遊戲</ThemedText>

      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">資源</ThemedText>
        <ThemedText>創意：{resources.creativity}</ThemedText>
        <ThemedText>生產力：{resources.productivity}</ThemedText>
        <ThemedText>金錢：{resources.money}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">資產</ThemedText>
        {assets.map((asset, index) => (
          <ThemedText key={index}>
            {asset.name}：{asset.count} 名
          </ThemedText>
        ))}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  sectionContainer: {
    marginTop: 32,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    width: '80%',
    alignItems: 'center',
  },
});
