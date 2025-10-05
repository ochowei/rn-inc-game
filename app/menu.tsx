import { StyleSheet, Pressable, Platform, View, ImageBackground } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useCallback, useState, useEffect } from 'react';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useGameStorage } from '@/hooks/use-game-storage';
import { useLanguage } from '@/hooks/use-language';
import { useGameEngineContext } from '@/contexts/GameEngineContext';
import { useAudioContext } from '@/contexts/AudioContext';

export default function GameMenuScreen() {
  const router = useRouter();
  const { profiles, fetchProfiles } = useGameStorage();
  const { createNewSave } = useGameEngineContext();
  const { language, setLanguage, t } = useLanguage();
  const { playBGM, stopBGM, playClickSound } = useAudioContext();
  const hasSavedGames = profiles.length > 0;
  const tintColor = useThemeColor({}, 'tint');

  const [isLimitModalVisible, setIsLimitModalVisible] = useState(false);

  const disabledBackgroundColor = useThemeColor({}, 'disabledBackground');
  const disabledBorderColor = useThemeColor({}, 'disabledBorder');

  useFocusEffect(
    useCallback(() => {
      fetchProfiles();
      playBGM();

      return () => {
        stopBGM();
      };
    }, [fetchProfiles, playBGM, stopBGM])
  );

  const handleNewGame = async () => {
    playClickSound();
    const newProfile = await createNewSave();
    if (newProfile) {
      router.push('/main/');
    } else {
      // The modal is shown if creating a new game fails, which indicates the save limit has been reached.
      setIsLimitModalVisible(true);
    }
  };

  const handleLoadGame = () => {
    playClickSound();
    router.push('/saved-profiles');
  };

  const handleGoToSaves = () => {
    playClickSound();
    setIsLimitModalVisible(false);
    router.push('/saved-profiles');
  };

  const handleCloseModal = () => {
    playClickSound();
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
    <ImageBackground
      source={require('../assets/images/background.png')}
      style={styles.background}
      resizeMode="cover">
      <ThemedView style={styles.container}>
        <View style={styles.languageButtons}>
          <Pressable
            onPress={() => setLanguage('zh')}
            style={[styles.langButton, language === 'zh' && styles.langButtonActive]}
          >
            <ThemedText>{t('settings', 'chinese')}</ThemedText>
          </Pressable>
          <Pressable
            onPress={() => setLanguage('en')}
            style={[styles.langButton, language === 'en' && styles.langButtonActive]}
          >
            <ThemedText>{t('settings', 'english')}</ThemedText>
          </Pressable>
        </View>
        <ThemedText type="title">{t('menu', 'title')}</ThemedText>
        <ThemedView style={styles.buttonsContainer}>
          <Pressable onPress={handleNewGame} style={styles.button}>
            <ThemedText style={styles.buttonText}>{t('menu', 'newGame')}</ThemedText>
          </Pressable>
          <Pressable
            onPress={handleLoadGame}
            style={[styles.button, !hasSavedGames && disabledButtonStyle]}
            disabled={!hasSavedGames}
          >
            <ThemedText style={styles.buttonText}>{t('menu', 'savedGame')}</ThemedText>
          </Pressable>
        </ThemedView>

        {isLimitModalVisible && (
          <ThemedView style={styles.confirmationContainer}>
            <ThemedView
              style={styles.confirmationBox}
              lightColor="rgba(255, 255, 255, 0.9)"
              darkColor="rgba(21, 23, 24, 0.9)">
              <ThemedText type="subtitle">{t('menu', 'saveLimitReached')}</ThemedText>
              <ThemedText>{t('menu', 'saveLimitMessage')}</ThemedText>
              <ThemedView style={styles.confirmationButtons}>
                <Pressable onPress={handleCloseModal} style={[styles.button, { borderColor: tintColor }]}>
                  <ThemedText style={styles.buttonText}>{t('menu', 'close')}</ThemedText>
                </Pressable>
                <Pressable onPress={handleGoToSaves} style={[styles.button, { borderColor: tintColor }]}>
                  <ThemedText style={styles.buttonText}>{t('menu', 'goToSaves')}</ThemedText>
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'transparent',
  },
  languageButtons: {
    flexDirection: 'row',
    gap: 10,
    position: 'absolute',
    top: 40,
    right: 16,
  },
  langButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  langButtonActive: {
    backgroundColor: '#0a7ea4',
    borderColor: '#0a7ea4',
  },
  buttonsContainer: {
    marginTop: 32,
    gap: 16,
    backgroundColor: 'transparent',
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
    backgroundColor: 'transparent',
  },
});
