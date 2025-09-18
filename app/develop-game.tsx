import { StyleSheet, Pressable, View } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ResourceBar } from '@/components/ResourceBar';
import { useLanguage } from '@/hooks/use-language';
import { GameProfile } from '@/utils/game_logic';
import gameSettings from '@/game_settings.json';
import { useMemo } from 'react';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function DevelopGameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useLanguage();
  const tintColor = useThemeColor({}, 'tint');

  const resources = useMemo(() => {
    return params.resources ? JSON.parse(params.resources as string) : null;
  }, [params.resources]);

  const canDevelop = (game: any) => {
    if (!resources) return false;
    const cost = game.development_cost;
    return (
      resources.money >= cost.funding &&
      resources.creativity >= cost.creativity &&
      resources.productivity >= cost.productivity
    );
  };

  if (!resources) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: t('developGame', 'title'), headerShown: false }} />
      <ResourceBar resources={resources} />
      <ThemedText type="title">{t('developGame', 'title')}</ThemedText>

      <Pressable onPress={() => router.back()} style={[styles.backButton, { borderColor: tintColor }]}>
        <ThemedText style={{ color: tintColor }}>{t('developGame', 'backToGame')}</ThemedText>
      </Pressable>

      <View style={styles.gameList}>
        {gameSettings.developable_games.map((game, index) => (
          <Card key={index} style={styles.card}>
            <Card.Content>
              <Title>{t('games', game.name as any)}</Title>
              <Paragraph>{t('game', 'cost')}:</Paragraph>
              <Paragraph>
                - {t('resources', 'money')}: {game.development_cost.funding}
              </Paragraph>
              <Paragraph>
                - {t('resources', 'creativity')}: {game.development_cost.creativity}
              </Paragraph>
              <Paragraph>
                - {t('resources', 'productivity')}: {game.development_cost.productivity}
              </Paragraph>
              <Paragraph>
                {t('game', 'timeToComplete')}: {game.development_time_ticks} {t('game', 'seconds')}
              </Paragraph>
              <Paragraph>
                {t('game', 'income')}: {game.income_per_tick} {t('game', 'per10Seconds')}
              </Paragraph>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                onPress={() => console.log('Develop ' + game.name)}
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
