import { useState, useEffect } from 'react';
import { StyleSheet, Pressable, FlatList, Platform, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function SavedGamesScreen() {
  const router = useRouter();
  const [savedGames, setSavedGames] = useState<any[]>([]);

  useEffect(() => {
    const fetchSavedGames = async () => {
      try {
        let profiles = null;
        if (Platform.OS === 'web') {
          profiles = localStorage.getItem('game_profiles');
        } else {
          profiles = await AsyncStorage.getItem('game_profiles');
        }
        if (profiles) {
          setSavedGames(JSON.parse(profiles));
        }
      } catch (error) {
        console.error('Failed to fetch saved games', error);
      }
    };

    fetchSavedGames();
  }, []);

  const handleLoadGame = (gameProfile: any) => {
    // Navigate to game screen with the selected profile
    router.push({ pathname: '/game', params: { profile: JSON.stringify(gameProfile) } });
  };

  const handleDeleteGame = async (index: number) => {
    Alert.alert(
      "Delete Save",
      "Are you sure you want to delete this save file?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "OK",
          onPress: async () => {
            try {
              const newSavedGames = [...savedGames];
              newSavedGames.splice(index, 1);
              setSavedGames(newSavedGames);

              if (Platform.OS === 'web') {
                localStorage.setItem('game_profiles', JSON.stringify(newSavedGames));
              } else {
                await AsyncStorage.setItem('game_profiles', JSON.stringify(newSavedGames));
              }
            } catch (error) {
              console.error('Failed to delete game profile', error);
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item, index }: { item: any, index: number }) => (
    <ThemedView style={styles.saveItem}>
      <ThemedText>Save Slot {index + 1}</ThemedText>
      <ThemedText>{new Date(item.createdAt).toLocaleString()}</ThemedText>
      <ThemedView style={styles.buttonsContainer}>
        <Pressable onPress={() => handleLoadGame(item)} style={styles.button}>
          <ThemedText style={styles.buttonText}>Load</ThemedText>
        </Pressable>
        <Pressable onPress={() => handleDeleteGame(index)} style={[styles.button, styles.deleteButton]}>
          <ThemedText style={styles.buttonText}>Delete</ThemedText>
        </Pressable>
      </ThemedView>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Saved Games' }} />
      <FlatList
        data={savedGames}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={<ThemedText>No saved games found.</ThemedText>}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  saveItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    borderColor: 'red',
  },
  buttonText: {
    fontSize: 16,
  },
});
