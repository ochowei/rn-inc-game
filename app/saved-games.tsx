import React, { useState } from 'react';
import { StyleSheet, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useGameStorage, GameProfile } from '@/hooks/use-game-storage';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useLanguage } from '@/hooks/use-language';

export default function SavedGamesScreen() {
  const router = useRouter();
  const { profiles, loading, deleteProfile } = useGameStorage();
  const { t } = useLanguage();
  const tintColor = useThemeColor({}, 'tint');

  const [isConfirming, setIsConfirming] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<number | null>(null);

  const handleLoadGame = (gameProfile: GameProfile, index: number) => {
    router.push({ pathname: '/game', params: { profile: JSON.stringify(gameProfile), saveSlotIndex: index } });
  };

  const handleDeleteGame = (index: number) => {
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

  const renderItem = ({ item, index }: { item: GameProfile, index: number }) => (
    <ThemedView style={styles.saveItem}>
      <ThemedText>{t('savedGames', 'saveSlot')} {index + 1}</ThemedText>
      <ThemedText>{new Date(item.createdAt).toLocaleString()}</ThemedText>
      <ThemedView style={styles.buttonsContainer}>
        <Pressable onPress={() => handleLoadGame(item, index)} style={[styles.button, { borderColor: tintColor }]}>
          <ThemedText style={styles.buttonText}>{t('savedGames', 'load')}</ThemedText>
        </Pressable>
        <Pressable onPress={() => handleDeleteGame(index)} style={[styles.button, styles.deleteButton]}>
          <ThemedText style={styles.buttonText}>{t('savedGames', 'delete')}</ThemedText>
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
      <Stack.Screen options={{ title: t('savedGames', 'title') }} />
      <FlatList
        data={[...profiles].reverse()}
        renderItem={renderItem}
        keyExtractor={(item) => item.createdAt}
        ListEmptyComponent={<ThemedText>{t('savedGames', 'noSaves')}</ThemedText>}
        extraData={profiles}
      />

      {isConfirming && (
        <ThemedView style={styles.confirmationContainer}>
          <ThemedView style={styles.confirmationBox}>
            <ThemedText type="subtitle">{t('savedGames', 'confirmDelete')}</ThemedText>
            <ThemedText>{t('savedGames', 'confirmDeleteMessage')}</ThemedText>
            <ThemedView style={styles.confirmationButtons}>
              <Pressable onPress={handleCancelDelete} style={[styles.button, { borderColor: tintColor }]}>
                <ThemedText style={styles.buttonText}>{t('savedGames', 'cancel')}</ThemedText>
              </Pressable>
              <Pressable onPress={handleConfirmDelete} style={[styles.button, styles.deleteButton]}>
                <ThemedText style={styles.buttonText}>{t('savedGames', 'confirm')}</ThemedText>
              </Pressable>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      )}
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
