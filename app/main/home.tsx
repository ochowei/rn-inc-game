import { StyleSheet, ActivityIndicator, ImageBackground } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ResourceBar } from '@/components/ResourceBar';
import { useLanguage } from '@/hooks/use-language';
import { useGameEngineContext } from '@/contexts/GameEngineContext';
import Fab from '@/components/Fab';

export default function GameScreen() {
  const { t } = useLanguage();
  const { profile } = useGameEngineContext();

  if (!profile) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
        <ThemedText>Loading Game...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ImageBackground
      source={require('@/assets/images/background.png')}
      style={styles.background}
      resizeMode="cover">
      <ThemedView style={styles.container}>
        <ResourceBar resources={profile.resources} />
        <ThemedView style={styles.sectionContainer}>
          <ThemedText type="subtitle">{t('game', 'employees')}</ThemedText>
          {profile.employees.map((employee, index) => (
            <ThemedText key={index}>
              {t('game', employee.name as any)}：{employee.count} {t('game', 'peopleClassifier')}
            </ThemedText>
          ))}
        </ThemedView>
        <Fab />
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
    paddingTop: 60,
    backgroundColor: 'transparent',
  },
  sectionContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    width: '80%',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
});
