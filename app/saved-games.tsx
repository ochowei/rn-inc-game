import React, { useState } from 'react';
import { StyleSheet, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useGameStorage, GameProfile } from '@/hooks/use-game-storage';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function SavedGamesScreen() {
  const router = useRouter();
  const { profiles, loading, deleteProfile } = useGameStorage();
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border'); // 假設有一個 'border' color

  // --- 新增狀態來管理自定義確認視窗 ---
  const [isConfirming, setIsConfirming] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<number | null>(null);

  const handleLoadGame = (gameProfile: GameProfile) => {
    router.push({ pathname: '/game', params: { profile: JSON.stringify(gameProfile) } });
  };

  const handleDeleteGame = (index: number) => {
    // 點擊刪除按鈕時，設定狀態以顯示自定義視窗
    setProfileToDelete(index);
    setIsConfirming(true);
  };

  const handleConfirmDelete = async () => {
    if (profileToDelete !== null) {
      await deleteProfile(profileToDelete);
      setIsConfirming(false);
      setProfileToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsConfirming(false);
    setProfileToDelete(null);
  };
  // ------------------------------------

  const renderItem = ({ item, index }: { item: GameProfile, index: number }) => (
    <ThemedView style={styles.saveItem}>
      <ThemedText>Save Slot {index + 1}</ThemedText>
      <ThemedText>{new Date(item.createdAt).toLocaleString()}</ThemedText>
      <ThemedView style={styles.buttonsContainer}>
        <Pressable onPress={() => handleLoadGame(item)} style={[styles.button, { borderColor: tintColor }]}>
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
        data={[...profiles].reverse()}
        renderItem={renderItem}
        keyExtractor={(item) => item.createdAt}
        ListEmptyComponent={<ThemedText>No saved games found.</ThemedText>}
        extraData={profiles}
      />

      {/* --- 自定義確認視窗 UI --- */}
      {isConfirming && (
        <ThemedView style={styles.confirmationContainer}>
          <ThemedView style={styles.confirmationBox}>
            <ThemedText type="subtitle">確認刪除</ThemedText>
            <ThemedText>您確定要刪除此存檔嗎？</ThemedText>
            <ThemedView style={styles.confirmationButtons}>
              <Pressable onPress={handleCancelDelete} style={[styles.button, { borderColor: tintColor }]}>
                <ThemedText style={styles.buttonText}>取消</ThemedText>
              </Pressable>
              <Pressable onPress={handleConfirmDelete} style={[styles.button, styles.deleteButton]}>
                <ThemedText style={styles.buttonText}>確定</ThemedText>
              </Pressable>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      )}
      {/* --------------------------- */}
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
  confirmationContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  confirmationBox: {
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    gap: 15,
  },
  confirmationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
});
