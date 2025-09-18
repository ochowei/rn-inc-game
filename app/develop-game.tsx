import { StyleSheet, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ResourceBar } from '@/components/ResourceBar';
import { useLanguage } from '@/hooks/use-language';
import { useThemeColor } from '@/hooks/useThemeColor';
import gameSettings from '@/game_settings.json';
import { useGameContext } from '@/contexts/GameContext';

export default function DevelopGameScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { profile, updateResources, addDevelopedGame } = useGameContext();
  const tintColor = useThemeColor({}, 'tint');

  if (!profile) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
        <ThemedText>Loading Game...</ThemedText>
      </ThemedView>
    );
  }

  const canDevelop = (game: any) => {
    const cost = game.development_cost;
    return (
      profile.resources.money >= cost.funding &&
      profile.resources.creativity >= cost.creativity &&
      profile.resources.productivity >= cost.productivity
    );
  };

  const handleDevelopPress = (game: any) => {
    if (!profile || !canDevelop(game)) {
      return;
    }

    const cost = game.development_cost;
    const newResources = {
      ...profile.resources,
      money: profile.resources.money - cost.funding,
      creativity: profile.resources.creativity - cost.creativity,
      productivity: profile.resources.productivity - cost.productivity,
    };

    updateResources(newResources);
    addDevelopedGame(game.name);

    // Maybe show a confirmation message
    router.back(); // Go back to the game screen
  };

  const renderGameItem = ({ item }: { item: any }) => {
    const isEnabled = canDevelop(item);
    return (
      <ThemedView style={styles.gameContainer}>
        <ThemedText type="subtitle">{item.name}</ThemedText>
        <ThemedText>{t('developGame', 'cost')}:</ThemedText>
        <ThemedText> - {t('resources', 'money')}: {item.development_cost.funding}</ThemedText>
        <ThemedText> - {t('resources', 'creativity')}: {item.development_cost.creativity}</ThemedText>
        <ThemedText> - {t('resources', 'productivity')}: {item.development_cost.productivity}</ThemedText>
        <ThemedText>{t('developGame', 'developmentTime')}: {item.development_time_ticks} ticks</ThemedText>
        <ThemedText>{t('developGame', 'incomePerTick')}: {item.income_per_tick}</ThemedText>
        <ThemedText>{t('developGame', 'maintenanceCostPerTick')}: {item.maintenance_cost_per_tick.productivity}</ThemedText>
        <Pressable
          style={[styles.button, { backgroundColor: isEnabled ? tintColor : '#ccc' }]}
          disabled={!isEnabled}
          onPress={() => handleDevelopPress(item)}
        >
          <ThemedText style={styles.buttonText}>{t('developGame', 'develop')}</ThemedText>
        </Pressable>
      </ThemedView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: t('developGame', 'title'), headerShown: false }} />
      <ResourceBar resources={profile.resources} />
      <ThemedText type="title" style={styles.title}>{t('developGame', 'title')}</ThemedText>

      <Pressable onPress={() => router.replace('/game')} style={[styles.backButton, { borderColor: tintColor }]}>
        <ThemedText style={{ color: tintColor }}>{t('developGame', 'backToGame')}</ThemedText>
      </Pressable>

      <FlatList
        data={gameSettings.developable_games}
        renderItem={renderGameItem}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.listContainer}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60, // To avoid overlap with the resource bar
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  gameContainer: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  backButton: {
    position: 'absolute',
    top: 80,
    left: 16,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  button: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
