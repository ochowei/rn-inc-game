import { StyleSheet, Pressable, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useGameStorage, GameProfile } from '@/hooks/use-game-storage';

export default function SavedGamesScreen() {
  const router = useRouter();
  const { profiles, loading, deleteProfile } = useGameStorage();

  const handleLoadGame = (gameProfile: GameProfile) => {
    // Navigate to game screen with the selected profile
    router.push({ pathname: '/game', params: { profile: JSON.stringify(gameProfile) } });
  };

  const handleDeleteGame = (index: number) => {
    console.log('Attempting to delete profile at index:', index);
    Alert.alert(
      "刪除存檔",
      "您確定要刪除此存檔嗎？",
      [
        {
          text: "取消",
          style: "cancel"
        },
        {
          text: "確定",
          onPress: async () => {
            console.log('User confirmed deletion for index:', index);
            try {
              await deleteProfile(index);
              Alert.alert("刪除成功", "遊戲存檔已成功刪除。");
            } catch (error) {
              console.error('刪除遊戲存檔失敗', error);
              Alert.alert("刪除失敗", "刪除遊戲存檔時發生錯誤。");
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item, index }: { item: GameProfile, index: number }) => (
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

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Saved Games' }} />
      <FlatList
        data={profiles}
        renderItem={renderItem}
        keyExtractor={(item) => item.createdAt}
        ListEmptyComponent={<ThemedText>No saved games found.</ThemedText>}
        extraData={profiles}
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
