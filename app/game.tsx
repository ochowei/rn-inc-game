import { useState, useEffect } from 'react';
import { StyleSheet, Pressable, Platform, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { producibleGames } from '@/constants/Games';
import { ResourceBar } from '@/components/ResourceBar';

export default function GameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');

  const buttonStyle = {
    borderColor: tintColor,
    backgroundColor: backgroundColor,
  };
  const buttonTextStyle = {
    color: tintColor,
  };

  const [resources, setResources] = useState({
    creativity: 10,
    productivity: 10,
    money: 100,
  });
  const [assets, setAssets] = useState([
    { name: '工程師', count: 1 },
  ]);

  useEffect(() => {
    if (params.profile) {
      const profile = JSON.parse(params.profile as string);
      setResources(profile.resources);
      setAssets(profile.assets);
    }
  }, [params.profile]);

  const handleSaveGame = async () => {
    const newGameProfile = {
      resources,
      assets,
      createdAt: new Date().toISOString(),
    };

    try {
      let gameProfiles = [];
      if (Platform.OS === 'web') {
        const gameProfilesStr = localStorage.getItem('game_profiles');
        gameProfiles = gameProfilesStr ? JSON.parse(gameProfilesStr) : [];
      } else {
        const gameProfilesStr = await AsyncStorage.getItem('game_profiles');
        gameProfiles = gameProfilesStr ? JSON.parse(gameProfilesStr) : [];
      }

      if (gameProfiles.length < 5) {
        gameProfiles.push(newGameProfile);
        if (Platform.OS === 'web') {
          localStorage.setItem('game_profiles', JSON.stringify(gameProfiles));
        } else {
          await AsyncStorage.setItem('game_profiles', JSON.stringify(gameProfiles));
        }
        Alert.alert("Game Saved", "Your game has been saved successfully.");
      } else {
        Alert.alert("Save Limit Reached", "You can only have up to 5 saved games.");
      }
    } catch (error) {
      console.error('Failed to save game profile', error);
      Alert.alert("Error", "Failed to save the game.");
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: '新遊戲', headerShown: false }} />
      <ResourceBar resources={resources} />
      <ThemedText type="title">新遊戲</ThemedText>

      <Pressable onPress={() => router.push('/menu')} style={[styles.backButton, buttonStyle]}>
        <ThemedText style={[styles.backButtonText, buttonTextStyle]}>返回主選單</ThemedText>
      </Pressable>

      <Pressable onPress={handleSaveGame} style={[styles.saveButton, buttonStyle]}>
        <ThemedText style={[styles.saveButtonText, buttonTextStyle]}>Save Game</ThemedText>
      </Pressable>

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
    marginTop: 16,
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
  saveButton: {
    position: 'absolute',
    top: 100,
    right: 16,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: 100,
    left: 16,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
