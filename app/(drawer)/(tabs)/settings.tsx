import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { Pressable, StyleSheet } from 'react-native';
import { LoginButton } from '@/components/LoginButton';
import { useLanguage } from '@/hooks/use-language';
import { useAudioContext } from '@/contexts/AudioContext';

export default function SettingsScreen() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { isMuted, toggleMute, playClickSound } = useAudioContext();

  const handleSetTheme = (newTheme: 'light' | 'dark' | 'system') => {
    playClickSound();
    setTheme(newTheme);
  };

  const handleSetLanguage = (newLang: 'zh' | 'en') => {
    playClickSound();
    setLanguage(newLang);
  };

  const handleToggleMute = () => {
    playClickSound();
    toggleMute();
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">{t('settings', 'title')}</ThemedText>
      <ThemedView style={styles.optionsContainer}>
        <ThemedText type="subtitle">{t('settings', 'theme')}</ThemedText>
        <Pressable
          style={[styles.button, theme === 'light' && styles.buttonActive]}
          onPress={() => handleSetTheme('light')}>
          <ThemedText style={theme === 'light' && styles.buttonTextActive}>{t('settings', 'light')}</ThemedText>
        </Pressable>
        <Pressable
          style={[styles.button, theme === 'dark' && styles.buttonActive]}
          onPress={() => handleSetTheme('dark')}>
          <ThemedText style={theme === 'dark' && styles.buttonTextActive}>{t('settings', 'dark')}</ThemedText>
        </Pressable>
        <Pressable
          style={[styles.button, theme === 'system' && styles.buttonActive]}
          onPress={() => handleSetTheme('system')}>
          <ThemedText style={theme === 'system' && styles.buttonTextActive}>{t('settings', 'system')}</ThemedText>
        </Pressable>
      </ThemedView>
      <ThemedView style={styles.optionsContainer}>
        <ThemedText type="subtitle">{t('settings', 'language')}</ThemedText>
        <Pressable
          style={[styles.button, language === 'zh' && styles.buttonActive]}
          onPress={() => handleSetLanguage('zh')}>
          <ThemedText style={language === 'zh' && styles.buttonTextActive}>{t('settings', 'chinese')}</ThemedText>
        </Pressable>
        <Pressable
          style={[styles.button, language === 'en' && styles.buttonActive]}
          onPress={() => handleSetLanguage('en')}>
          <ThemedText style={language === 'en' && styles.buttonTextActive}>{t('settings', 'english')}</ThemedText>
        </Pressable>
      </ThemedView>
      <ThemedView style={styles.optionsContainer}>
        <ThemedText type="subtitle">{t('settings', 'sound')}</ThemedText>
        <Pressable
          style={[styles.button, isMuted && styles.buttonActive]}
          onPress={handleToggleMute}>
          <ThemedText style={isMuted ? styles.buttonTextActive : {}}>
            {isMuted ? t('settings', 'unmute') : t('settings', 'mute')}
          </ThemedText>
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
