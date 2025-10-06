import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ProgressBar, Text } from 'react-native-paper';
import { Asset } from 'expo-asset';

const assetsToLoad = [
  require('../assets/images/adaptive-icon.png'),
  require('../assets/images/background.png'),
  require('../assets/images/favicon.png'),
  require('../assets/images/icon.png'),
  require('../assets/images/splash-icon.png'),
  require('../assets/audio/click.mp3'),
  require('../assets/audio/lofi-terra-233036.mp3'),
  require('../assets/audio/lofineputunus-244088.mp3'),
  require('../assets/audio/lofiuranus-240148.mp3'),
  require('../assets/fonts/SpaceMono-Regular.ttf'),
];

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const loadResources = async () => {
      const totalAssets = assetsToLoad.length;
      for (let i = 0; i < totalAssets; i++) {
        await Asset.loadAsync(assetsToLoad[i]);
        setProgress((i + 1) / totalAssets);
      }
    };

    loadResources();
  }, []);

  useEffect(() => {
    if (progress >= 1) {
      // Use a timeout to give a moment for the user to see the completed bar
      const timer = setTimeout(() => {
        router.replace('/press-to-start');
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [progress]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>資源載入中...</Text>
      <ProgressBar progress={progress} style={styles.progressBar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  progressBar: {
    width: '80%',
    height: 10,
  },
  text: {
    marginBottom: 10,
  },
});