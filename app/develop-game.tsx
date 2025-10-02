import { StyleSheet, Pressable, View, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ResourceBar } from '@/components/ResourceBar';
import { useLanguage } from '@/hooks/use-language';
import { useGameEngineContext } from '@/contexts/GameEngineContext';
import gameSettings from '@/settings.json';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { useThemeColor } from '@/hooks/useThemeColor';
import { GameSettings } from '@/engine/types';

const settings = gameSettings as GameSettings;

export default function DevelopGameScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { profile, developGame } = useGameEngineContext();
  const tintColor = useThemeColor({}, 'tint');

  const canDevelop = (game: (typeof settings.developable_games)[0]) => {
    if (!profile) return false;
    const cost = game.development_cost;
    return (
      profile.resources.current.resource_3 >= cost.resource_3 &&
      profile.resources.current.resource_1 >= cost.resource_1 &&
      profile.resources.current.resource_2 >= cost.resource_2
    );
  };

  if (!profile) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
        <ThemedText>Loading Game...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: t('developGame', 'title'), headerShown: false }} />
      <ResourceBar resources={profile.resources} />
      <ThemedText type="title">{t('developGame', 'title')}</ThemedText>

      <Pressable onPress={() => router.back()} style={[styles.backButton, { borderColor: tintColor }]}>
        <ThemedText style={{ color: tintColor }}>{t('developGame', 'backToGame')}</ThemedText>
      </Pressable>

      <View style={styles.gameList}>
        {settings.developable_games.map((game, index) => (
          <Card key={index} style={styles.card}>
            <Card.Content>
              <Title>{t('games', game.name as any)}</Title>
              <Paragraph>{t('game', 'cost')}:</Paragraph>
              <Paragraph>
                - {t('resources', 'resource_3')}: {game.development_cost.resource_3}
              </Paragraph>
              <Paragraph>
                - {t('resources', 'resource_1')}: {game.development_cost.resource_1}
              </Paragraph>
              <Paragraph>
                - {t('resources', 'resource_2')}: {game.development_cost.resource_2}
              </Paragraph>
              <Paragraph>
                {t('game', 'timeToComplete')}: {game.development_time_ticks} {t('game', 'seconds')}
              </Paragraph>
              <Paragraph>
                {t('game', 'income')}: {game.income_per_tick.resource_3} ({t('resources', 'resource_3')}) {t('game', 'per10Seconds')}
              </Paragraph>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                onPress={() => developGame(game.name)}
                disabled={!canDevelop(game)}
              >
                {t('developGame', 'develop')}
              </Button>
            </Card.Actions>
          </Card>
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 60,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 16,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  gameList: {
    marginTop: 60,
  },
  card: {
    marginBottom: 16,
  },
});