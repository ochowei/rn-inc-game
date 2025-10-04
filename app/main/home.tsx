import { StyleSheet, ActivityIndicator, ImageBackground, ScrollView } from 'react-native';
import { useMemo } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ResourceBar } from '@/components/ResourceBar';
import { useLanguage } from '@/hooks/use-language';
import { useGameEngineContext } from '@/contexts/GameEngineContext';
import Fab from '@/components/Fab';
import gameSettings from '@/settings.json';
import { GameSettings } from '@/engine/types';

const settings = gameSettings as GameSettings;

export default function GameScreen() {
  const { t } = useLanguage();
  const { profile } = useGameEngineContext();

  const gameCounts = useMemo(() => {
    const counts = { novel_game: 0, puzzle_game: 0 };
    if (profile) {
      profile.assets.forEach((asset) => {
        if (asset.id === 'novel_game') {
          counts.novel_game += asset.count;
        } else if (asset.id === 'puzzle_game') {
          counts.puzzle_game += asset.count;
        }
      });
    }
    return counts;
  }, [profile]);

  if (!profile) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
        <ThemedText>Loading Game...</ThemedText>
      </ThemedView>
    );
  }

  const acquiredGames = profile.assets.filter((asset) => asset.type === 'asset_group_1');
  const employees = profile.assets.filter((asset) => asset.type === 'asset_group_2');
  const inProgressAssets = profile.inProgressAssets || [];

  return (
    <ImageBackground
      source={require('@/assets/images/background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <ThemedView style={styles.container}>
        <ResourceBar resources={profile.resources} />
        <ScrollView contentContainerStyle={styles.scrollContentContainer}>
          <ThemedView style={styles.sectionContainer}>
            <ThemedText type="subtitle">{t('game', 'gameStatus')}</ThemedText>
            <ThemedText>Novel Games: {gameCounts.novel_game}</ThemedText>
            <ThemedText>Puzzle Games: {gameCounts.puzzle_game}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.sectionContainer}>
            <ThemedText type="subtitle">{t('game', 'employees')}</ThemedText>
            {employees.map((asset, index) => {
              const employeeInfo = settings.assets_group_2.assets.find((e) => e.id === asset.id);
              return (
                <ThemedText key={index}>
                  {t('employees', employeeInfo?.id as any) || asset.id}：{asset.count}{' '}
                  {t('game', 'peopleClassifier')}
                </ThemedText>
              );
            })}
          </ThemedView>

          {acquiredGames.length > 0 && (
            <ThemedView style={styles.sectionContainer}>
              <ThemedText type="subtitle">{t('game', 'acquiredGames')}</ThemedText>
              {acquiredGames.map((asset, index) => {
                const gameInfo = settings.assets_group_1.assets.find((g) => g.id === asset.id);
                return <ThemedText key={index}>{t('games', gameInfo?.id as any) || asset.id}</ThemedText>;
              })}
            </ThemedView>
          )}

          {inProgressAssets.length > 0 && (
            <ThemedView style={styles.sectionContainer}>
              <ThemedText type="subtitle">{t('game', 'inProgressGames')}</ThemedText>
              {inProgressAssets.map((asset, index) => {
                const gameInfo = settings.assets_group_1.assets.find((g) => g.id === asset.id);
                const progress = gameInfo
                  ? Math.round((asset.development_progress_ticks / gameInfo.time_cost_ticks) * 100)
                  : 0;
                return (
                  <ThemedText key={index}>
                    {t('games', gameInfo?.id as any) || asset.id}: {progress}%
                  </ThemedText>
                );
              })}
            </ThemedView>
          )}
        </ScrollView>
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
    paddingTop: 60,
    backgroundColor: 'transparent',
  },
  scrollContentContainer: {
    alignItems: 'center',
    padding: 16,
    width: '100%',
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