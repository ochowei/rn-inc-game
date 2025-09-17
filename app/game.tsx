import { useState, useEffect } from 'react';
import { StyleSheet, Pressable, Platform, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { producibleGames } from '@/constants/Games';
import { ResourceBar } from '@/components/ResourceBar';
import { useLanguage } from '@/hooks/use-language';

export default function GameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useLanguage();
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
    { name: 'engineer', count: 1 },
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
        Alert.alert(t('game', 'gameSaved'), t('game', 'gameSavedSuccess'));
      } else {
        Alert.alert(t('game', 'saveLimitReached'), t('game', 'saveLimitMessage'));
      }
    } catch (error) {
      console.error('Failed to save game profile', error);
      Alert.alert(t('game', 'error'), t('game', 'failedToSave'));
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: t('game', 'newGameTitle'), headerShown: false }} />
      <ResourceBar resources={resources} />
      <ThemedText type="title">{t('game', 'newGameTitle')}</ThemedText>

      <Pressable onPress={() => router.push('/menu')} style={[styles.backButton, buttonStyle]}>
        <ThemedText style={[styles.backButtonText, buttonTextStyle]}>{t('game', 'backToMenu')}</ThemedText>
      </Pressable>

      <Pressable onPress={handleSaveGame} style={[styles.saveButton, buttonStyle]}>
        <ThemedText style={[styles.saveButtonText, buttonTextStyle]}>{t('game', 'saveGame')}</ThemedText>
      </Pressable>

      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">{t('game', 'assets')}</ThemedText>
        {assets.map((asset, index) => (
          <ThemedText key={index}>
            {t('game', asset.name as any)}：{asset.count} {t('game', 'peopleClassifier')}
          </ThemedText>
        ))}
      </ThemedView>

      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">{t('game', 'producibleGames')}</ThemedText>
        {producibleGames.map((game, index) => (
          <ThemedView key={index} style={styles.gameContainer}>
            <ThemedText type="defaultSemiBold">{t('games', 'miniPuzzleGame')}</ThemedText>
            <ThemedText>{t('game', 'cost')}：{game.cost} {t('game', 'currencyUnit')}</ThemedText>
            <ThemedText>{t('game', 'productivity')}：{game.productivity}</ThemedText>
            <ThemedText>{t('game', 'creativity')}：{game.creativity}</ThemedText>
            <ThemedText>{t('game', 'timeToComplete')}：{game.timeToComplete} {t('game', 'seconds')}</ThemedText>
            <ThemedText>{t('game', 'income')}：{t('game', 'per10Seconds')} {game.income} {t('game', 'currencyUnit')}</ThemedText>
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
