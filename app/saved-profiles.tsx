import React, { useState } from 'react';
import { StyleSheet, Pressable, FlatList, ActivityIndicator, ImageBackground } from 'react-native';
import { useRouter, Stack } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useGameStorage, SaveProfile } from '@/hooks/use-game-storage';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useLanguage } from '@/hooks/use-language';
import { useGameEngineContext } from '@/contexts/GameEngineContext';
import { useAudioContext } from '@/contexts/AudioContext';

export default function SavedProfileScreen() {
  const router = useRouter();
  const { profiles, loading, deleteProfile } = useGameStorage();
  const { loadSave } = useGameEngineContext();
  const { t } = useLanguage();
  const { playClickSound } = useAudioContext();
  const tintColor = useThemeColor({}, 'tint');

  const [isConfirming, setIsConfirming] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);

  const handleLoadSave = (saveProfile: SaveProfile) => {
    playClickSound();
    loadSave(saveProfile);
    router.push('/main/');
  };

  const handleDeleteGame = (id: string) => {
    playClickSound();
    setProfileToDelete(id);
    setIsConfirming(true);
  };

  const handleConfirmDelete = async () => {
    playClickSound();
    if (profileToDelete !== null) {
      await deleteProfile(profileToDelete);
      setIsConfirming(false);
      setProfileToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    playClickSound();
    setIsConfirming(false);
    setProfileToDelete(null);
  };

  const renderItem = ({ item, index }: { item: SaveProfile, index: number }) => (
    <ThemedView style={styles.saveItem}>
      <ThemedText>{t('savedGames', 'saveSlot')} {index + 1}</ThemedText>
      <ThemedText>{new Date(item.createdAt).toLocaleString()}</ThemedText>
      <ThemedView style={styles.buttonsContainer}>
        <Pressable onPress={() => handleLoadSave(item)} style={[styles.button, { borderColor: tintColor }]}>
          <ThemedText style={styles.buttonText}>{t('savedGames', 'load')}</ThemedText>
        </Pressable>
        <Pressable onPress={() => handleDeleteGame(item.id)} style={[styles.button, styles.deleteButton]}>
          <ThemedText style={styles.buttonText}>{t('savedGames', 'delete')}</ThemedText>
        </Pressable>
      </ThemedView>
    </ThemedView>
  );

  if (loading) {
    return (
      <ImageBackground
        source={require('../assets/images/background.png')}
        style={styles.background}
        resizeMode="cover">
        <ThemedView style={styles.container}>
          <ActivityIndicator size="large" />
        </ThemedView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../assets/images/background.png')}
      style={styles.background}
      resizeMode="cover">
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: t('savedGames', 'title') }} />
        <FlatList
          data={[...profiles].reverse()}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<ThemedText>{t('savedGames', 'noSaves')}</ThemedText>}
          extraData={profiles}
        />

        {isConfirming && (
          <ThemedView style={styles.confirmationContainer}>
            <ThemedView
              style={styles.confirmationBox}
              lightColor="rgba(255, 255, 255, 0.9)"
              darkColor="rgba(21, 23, 24, 0.9)">
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'transparent',
  },
  saveItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    backgroundColor: 'transparent',
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
    backgroundColor: 'transparent',
  },
});
