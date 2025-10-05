import { StyleSheet, ImageBackground, View } from 'react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { Checkbox } from 'react-native-paper';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useLanguage } from '@/hooks/use-language';
import { useAudioContext } from '@/contexts/AudioContext';
import { SoundPressable } from '@/components/ui/SoundPressable';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function OptionsScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isMuted, toggleMute } = useAudioContext();
  const color = useThemeColor({}, 'text');

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
            <ThemedText style={styles.label}>{t('options', 'toggleBGM')}</ThemedText>
            <Checkbox
              status={isMuted ? 'checked' : 'unchecked'}
              onPress={toggleMute}
              color={color}
            />
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