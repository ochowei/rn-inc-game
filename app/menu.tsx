import { StyleSheet, Pressable, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useGameStorage } from '@/hooks/use-game-storage';

export default function GameMenuScreen() {
  const router = useRouter();
  const { profiles, addProfile, fetchProfiles } = useGameStorage();
  const hasSavedGames = profiles.length > 0;
  const tintColor = useThemeColor({}, 'tint');

  const [isLimitModalVisible, setIsLimitModalVisible] = useState(false);

  const disabledBackgroundColor = useThemeColor({}, 'disabledBackground');
  const disabledBorderColor = useThemeColor({}, 'disabledBorder');

  // 使用 useFocusEffect 在螢幕被聚焦時重新載入存檔
  useFocusEffect(
    useCallback(() => {
      fetchProfiles();
    }, [fetchProfiles])
  );

  const handleNewGame = async () => {
    if (profiles.length >= 5) {
      setIsLimitModalVisible(true);
      return;
    }

    const newGameProfile = {
      resources: { creativity: 10, productivity: 10, money: 100 },
      assets: [{ name: '工程師', count: 1 }],
      createdAt: new Date().toISOString(),
    };

    await addProfile(newGameProfile);
    router.push('/game');
  };

  const handleLoadGame = () => {
    router.push('/saved-games');
  };

  const handleGoToSaves = () => {
    setIsLimitModalVisible(false);
    router.push('/saved-games');
  };

  const handleCloseModal = () => {
    setIsLimitModalVisible(false);
  };

  const disabledButtonStyle = {
    backgroundColor: disabledBackgroundColor,
    borderColor: disabledBorderColor,
    ...Platform.select({
      web: {
        cursor: 'not-allowed',
      },
    }),
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
          style={[styles.button, !hasSavedGames && disabledButtonStyle]}
          disabled={!hasSavedGames}
        >
          <ThemedText style={styles.buttonText}>Saved Game</ThemedText>
        </Pressable>
      </ThemedView>

      {isLimitModalVisible && (
        <ThemedView style={styles.confirmationContainer}>
          <ThemedView style={styles.confirmationBox}>
            <ThemedText type="subtitle">存檔已達上限</ThemedText>
            <ThemedText>請先刪除多餘的存檔，最多只能有 5 個存檔。</ThemedText>
            <ThemedView style={styles.confirmationButtons}>
              <Pressable onPress={handleCloseModal} style={[styles.button, { borderColor: tintColor }]}>
                <ThemedText style={styles.buttonText}>關閉</ThemedText>
              </Pressable>
              <Pressable onPress={handleGoToSaves} style={[styles.button, { borderColor: tintColor }]}>
                <ThemedText style={styles.buttonText}>前往存檔</ThemedText>
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
    minWidth: 120,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
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
