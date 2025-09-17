import { useState, useEffect } from 'react';
import { StyleSheet, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function GameMenuScreen() {
  const router = useRouter();
  const [hasSavedGames, setHasSavedGames] = useState(false);

  useEffect(() => {
    const checkSavedGames = async () => {
      try {
        let profiles = null;
        if (Platform.OS === 'web') {
          profiles = localStorage.getItem('game_profiles');
        } else {
          profiles = await AsyncStorage.getItem('game_profiles');
        }
        if (profiles) {
          setHasSavedGames(JSON.parse(profiles).length > 0);
        } else {
          setHasSavedGames(false);
        }
      } catch (error) {
        console.error('Failed to check saved games', error);
        setHasSavedGames(false);
      }
    };

    checkSavedGames();
  }, []);

  const handleNewGame = () => {
    const newGameProfile = {
      resources: { creativity: 10, productivity: 10, money: 100 },
      assets: [{ name: '工程師', count: 1 }],
      createdAt: new Date().toISOString(),
    };

    try {
      if (Platform.OS === 'web') {
        const gameProfilesStr = localStorage.getItem('game_profiles');
        let gameProfiles = gameProfilesStr ? JSON.parse(gameProfilesStr) : [];
        if (gameProfiles.length < 5) {
          gameProfiles.push(newGameProfile);
          localStorage.setItem('game_profiles', JSON.stringify(gameProfiles));
          if (gameProfiles.length > 0) {
            setHasSavedGames(true);
          }
        }
      } else {
        AsyncStorage.getItem('game_profiles').then(gameProfilesStr => {
          let gameProfiles = gameProfilesStr ? JSON.parse(gameProfilesStr) : [];
          if (gameProfiles.length < 5) {
            gameProfiles.push(newGameProfile);
            AsyncStorage.setItem('game_profiles', JSON.stringify(gameProfiles));
            if (gameProfiles.length > 0) {
              setHasSavedGames(true);
            }
          }
        });
      }
    } catch (error) {
      console.error('Failed to handle game profiles', error);
    }

    router.push('/game');
  };

  const handleLoadGame = () => {
    router.push('/saved-games');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Game Menu</ThemedText>
      <ThemedView style={styles.buttonsContainer}>
        <Pressable onPress={handleNewGame} style={styles.button}>
          <ThemedText style={styles.buttonText}>New Game</ThemedText>
        </Pressable>
        <Pressable
          onPress={handleLoadGame}
          style={[styles.button, !hasSavedGames && styles.disabledButton]}
          disabled={!hasSavedGames}
        >
          <ThemedText style={styles.buttonText}>Saved Game</ThemedText>
        </Pressable>
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
  buttonsContainer: {
    marginTop: 32,
    gap: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ddd',
  },
});
