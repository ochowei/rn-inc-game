import { StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function GameMenuScreen() {
  const handleNewGame = () => {
    // TODO: 在此處實作新遊戲邏輯
    console.log('Starting a new game...');
  };

  const handleLoadGame = () => {
    // TODO: 在此處實作載入遊戲邏輯
    console.log('Loading a saved game...');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Game Menu</ThemedText>
      <ThemedView style={styles.buttonsContainer}>
        <Pressable onPress={handleNewGame} style={styles.button}>
          <ThemedText style={styles.buttonText}>New Game</ThemedText>
        </Pressable>
        <Pressable onPress={handleLoadGame} style={styles.button}>
          <ThemedText style={styles.buttonText}>Load Saved Game</ThemedText>
        </Pressable>
      </ThemedView>
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
    minWidth: 200,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
