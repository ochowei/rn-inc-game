import { StyleSheet, View, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import React from 'react';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useLanguage } from '@/hooks/use-language';
import { SoundPressable } from '@/components/ui/SoundPressable';

export default function PressToStartScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  const handlePressToStart = () => {
    router.push('/menu');
  };

  return (
    <ImageBackground
      source={require('../assets/images/background.png')}
      style={styles.background}
      resizeMode="cover">
      <ThemedView style={styles.container}>
        <ThemedText type="title">{t('menu', 'title')}</ThemedText>
        <ThemedView style={styles.buttonsContainer}>
          <SoundPressable onPress={handlePressToStart} style={styles.button}>
            <ThemedText style={styles.buttonText}>Press to Start</ThemedText>
          </SoundPressable>
        </ThemedView>
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
});