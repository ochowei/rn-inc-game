import { StyleSheet, ImageBackground, View, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import React from 'react';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useLanguage } from '@/hooks/use-language';
import { useAudioContext } from '@/contexts/AudioContext';
import { SoundPressable } from '@/components/ui/SoundPressable';

export default function OptionsScreen() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { playBGM, setPlayBGM, playSoundEffect, setPlaySoundEffect } = useAudioContext();

  const handleBack = () => {
    router.back();
  };

  return (
    <ImageBackground
      source={require('../assets/images/background.png')}
      style={styles.background}
      resizeMode="cover">
      <ThemedView style={styles.container}>
        <ThemedText type="title">{t('options', 'title')}</ThemedText>
        <View style={styles.optionsContainer}>
          <View style={styles.optionRow}>
            <ThemedText style={styles.label}>{t('options', 'playBGM')}</ThemedText>
            <Switch value={playBGM} onValueChange={setPlayBGM} />
          </View>
          <View style={styles.optionRow}>
            <ThemedText style={styles.label}>{t('options', 'playSoundEffect')}</ThemedText>
            <Switch value={playSoundEffect} onValueChange={setPlaySoundEffect} />
          </View>
          <View style={styles.optionRow}>
            <ThemedText style={styles.label}>{t('options', 'language')}</ThemedText>
            <View style={styles.languageButtons}>
              <SoundPressable
                onPress={() => setLanguage('zh')}
                style={[styles.langButton, language === 'zh' && styles.langButtonActive]}
              >
                <ThemedText>{t('settings', 'chinese')}</ThemedText>
              </SoundPressable>
              <SoundPressable
                onPress={() => setLanguage('en')}
                style={[styles.langButton, language === 'en' && styles.langButtonActive]}
              >
                <ThemedText>{t('settings', 'english')}</ThemedText>
              </SoundPressable>
            </View>
          </View>
        </View>
        <SoundPressable onPress={handleBack} style={styles.button}>
          <ThemedText style={styles.buttonText}>{t('options', 'back')}</ThemedText>
        </SoundPressable>
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
  optionsContainer: {
    marginTop: 32,
    gap: 16,
    backgroundColor: 'transparent',
    width: '80%',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  languageButtons: {
    flexDirection: 'row',
    gap: 10,
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
  button: {
    marginTop: 32,
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
});