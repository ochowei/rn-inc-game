import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { Pressable, StyleSheet } from 'react-native';
import { LoginButton } from '@/components/LoginButton';

export default function SettingsScreen() {
  const { theme, setTheme } = useTheme();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Settings</ThemedText>
      <ThemedView style={styles.optionsContainer}>
        <ThemedText type="subtitle">Theme</ThemedText>
        <Pressable
          style={[styles.button, theme === 'light' && styles.buttonActive]}
          onPress={() => setTheme('light')}>
          <ThemedText style={theme === 'light' && styles.buttonTextActive}>Light</ThemedText>
        </Pressable>
        <Pressable
          style={[styles.button, theme === 'dark' && styles.buttonActive]}
          onPress={() => setTheme('dark')}>
          <ThemedText style={theme === 'dark' && styles.buttonTextActive}>Dark</ThemedText>
        </Pressable>
        <Pressable
          style={[styles.button, theme === 'system' && styles.buttonActive]}
          onPress={() => setTheme('system')}>
          <ThemedText style={theme === 'system' && styles.buttonTextActive}>System</ThemedText>
        </Pressable>
      </ThemedView>
      <LoginButton />
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
  optionsContainer: {
    marginTop: 20,
    alignItems: 'center',
    gap: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  buttonActive: {
    backgroundColor: '#0a7ea4',
    borderColor: '#0a7ea4',
  },
  buttonTextActive: {
    color: 'white',
  },
});
