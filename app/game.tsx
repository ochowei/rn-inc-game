import { useState, useEffect } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { producibleGames } from '@/constants/Games';
import { ResourceBar } from '@/components/ResourceBar';
import { useLanguage } from '@/hooks/use-language';
import { useGameStorage } from '@/hooks/use-game-storage';

export default function GameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useLanguage();
  const { addProfile, updateProfile, profiles } = useGameStorage();
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');

  const buttonStyle = {
    borderColor: tintColor,
    backgroundColor: backgroundColor,
  };
  const buttonTextStyle = {
    color: tintColor,
  };

  const [resources, setResources] = useState({
    creativity: 10,
    productivity: 10,
    money: 100,
  });
  const [employees, setEmployees] = useState([{ name: 'engineer', count: 1 }]);
  const [games, setGames] = useState<{ name: string; count: number }[]>([]);
  const [saveSlotIndex, setSaveSlotIndex] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });

  useEffect(() => {
    if (params.profile) {
      const profile = JSON.parse(params.profile as string);
      setResources(profile.resources);
      setEmployees(profile.employees);
      setGames(profile.games || []);
    }
    if (params.saveSlotIndex) {
      setSaveSlotIndex(parseInt(params.saveSlotIndex as string, 10));
    }
  }, [params.profile, params.saveSlotIndex]);

  const handleSaveGame = async () => {
    const newGameProfile = {
      resources,
      employees,
      games,
      createdAt: new Date().toISOString(),
    };

    try {
      if (saveSlotIndex !== null) {
        await updateProfile(saveSlotIndex, newGameProfile);
        setModalContent({ title: t('game', 'gameSaved'), message: t('game', 'gameSavedSuccess') });
        setIsModalVisible(true);
      } else {
        if (profiles.length < 5) {
          await addProfile(newGameProfile);
          setModalContent({ title: t('game', 'gameSaved'), message: t('game', 'gameSavedSuccess') });
          setIsModalVisible(true);
        } else {
          setModalContent({ title: t('game', 'saveLimitReached'), message: t('game', 'saveLimitMessage') });
          setIsModalVisible(true);
        }
      }
    } catch (error) {
      console.error('Failed to save game profile', error);
      setModalContent({ title: t('game', 'error'), message: t('game', 'failedToSave') });
      setIsModalVisible(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: t('game', 'newGameTitle'), headerShown: false }} />
      <ResourceBar resources={resources} />
      <ThemedText type="title">{t('game', 'newGameTitle')}</ThemedText>

      <Pressable onPress={() => router.push('/menu')} style={[styles.backButton, buttonStyle]}>
        <ThemedText style={[styles.backButtonText, buttonTextStyle]}>{t('game', 'backToMenu')}</ThemedText>
      </Pressable>

      <Pressable onPress={handleSaveGame} style={[styles.saveButton, buttonStyle]}>
        <ThemedText style={[styles.saveButtonText, buttonTextStyle]}>{t('game', 'saveGame')}</ThemedText>
      </Pressable>

      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">{t('game', 'employees')}</ThemedText>
        {employees.map((employee, index) => (
          <ThemedText key={index}>
            {t('game', employee.name as any)}：{employee.count} {t('game', 'peopleClassifier')}
          </ThemedText>
        ))}
      </ThemedView>

      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">{t('game', 'games')}</ThemedText>
        {games.length === 0 ? (
          <ThemedText>{t('game', 'noGamesDeveloped')}</ThemedText>
        ) : (
          games.map((game, index) => (
            <ThemedText key={index}>
              {t('games', game.name as any)}：{game.count}
            </ThemedText>
          ))
        )}
      </ThemedView>

      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">{t('game', 'producibleGames')}</ThemedText>
        {producibleGames.map((game, index) => (
          <ThemedView key={index} style={styles.gameContainer}>
            <ThemedText type="defaultSemiBold">{t('games', 'miniPuzzleGame')}</ThemedText>
            <ThemedText>{t('game', 'cost')}：{game.cost} {t('game', 'currencyUnit')}</ThemedText>
            <ThemedText>{t('game', 'productivity')}：{game.productivity}</ThemedText>
            <ThemedText>{t('game', 'creativity')}：{game.creativity}</ThemedText>
            <ThemedText>{t('game', 'timeToComplete')}：{game.timeToComplete} {t('game', 'seconds')}</ThemedText>
            <ThemedText>{t('game', 'income')}：{t('game', 'per10Seconds')} {game.income} {t('game', 'currencyUnit')}</ThemedText>
          </ThemedView>
        ))}
      </ThemedView>

      {isModalVisible && (
        <ThemedView style={styles.confirmationContainer}>
          <ThemedView style={styles.confirmationBox}>
            <ThemedText type="subtitle">{modalContent.title}</ThemedText>
            <ThemedText>{modalContent.message}</ThemedText>
            <Pressable onPress={handleCloseModal} style={[styles.button, { borderColor: tintColor }]}>
              <ThemedText style={styles.buttonText}>{t('game', 'close')}</ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    paddingTop: 60, // Add padding to avoid overlap with the resource bar
  },
  sectionContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    width: '80%',
    alignItems: 'center',
  },
  gameContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    width: '100%',
    alignItems: 'center',
  },
  saveButton: {
    position: 'absolute',
    top: 100,
    right: 16,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: 100,
    left: 16,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
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
  confirmationContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  confirmationBox: {
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    gap: 15,
  },
});
