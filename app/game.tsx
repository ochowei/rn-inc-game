import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { producibleGames } from '@/constants/Games';
import { ResourceBar } from '@/components/ResourceBar';

export default function GameScreen() {
  const [resources, setResources] = useState({
    creativity: 10,
    productivity: 10,
    money: 100,
  });
  const [assets, setAssets] = useState([
    { name: '工程師', count: 1 },
  ]);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: '新遊戲', headerShown: false }} />
      <ResourceBar resources={resources} />
      <ThemedText type="title">新遊戲</ThemedText>

      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">資產</ThemedText>
        {assets.map((asset, index) => (
          <ThemedText key={index}>
            {asset.name}：{asset.count} 名
          </ThemedText>
        ))}
      </ThemedView>

      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">可生產的遊戲</ThemedText>
        {producibleGames.map((game, index) => (
          <ThemedView key={index} style={styles.gameContainer}>
            <ThemedText type="defaultSemiBold">{game.name}</ThemedText>
            <ThemedText>成本：{game.cost} 元</ThemedText>
            <ThemedText>生產力：{game.productivity}</ThemedText>
            <ThemedText>創意：{game.creativity}</ThemedText>
            <ThemedText>完成時間：{game.timeToComplete} 秒</ThemedText>
            <ThemedText>收入：每 10 秒 {game.income} 元</ThemedText>
          </ThemedView>
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
    paddingTop: 60, // Add padding to avoid overlap with the resource bar
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
  gameContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    width: '100%',
    alignItems: 'center',
  },
});
