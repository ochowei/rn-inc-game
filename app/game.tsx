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
import { GameProfile, updateGameProfile } from '../utils/game_logic';
import Fab from '@/components/Fab';
import gameSettings from '@/game_settings.json';

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

  const [resources, setResources] = useState<GameProfile['resources']>({
    creativity: 10,
    productivity: 10,
    money: 100,
    creativity_max: 100,
    productivity_max: 100,
    creativity_per_tick: 0,
    productivity_per_tick: 0,
    money_per_tick: 0,
  });
  const [employees, setEmployees] = useState([{ name: 'engineer', count: 1 }]);
  const [games, setGames] = useState<{ name: string; count: number }[]>([]);
  const [saveId, setSaveId] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });

  useEffect(() => {
    if (params.profile) {
      const profile: GameProfile = JSON.parse(params.profile as string);
      const now = new Date();
      const createdAt = new Date(profile.createdAt);
      const elapsedMilliseconds = now.getTime() - createdAt.getTime();
      const ticks = Math.floor(elapsedMilliseconds / gameSettings.gameTickInterval);

      const updatedProfile = updateGameProfile(profile, ticks);

      setResources(updatedProfile.resources);
      setEmployees(updatedProfile.employees);
      setGames(updatedProfile.games || []);
    }
    if (params.saveId) {
      setSaveId(params.saveId as string);
    }
  }, [params.profile, params.saveId]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setResources((prevResources) => {
        const currentProfile: GameProfile = {
          resources: prevResources,
          employees,
          games,
          createdAt: new Date().toISOString(),
        };
        const updatedProfile = updateGameProfile(currentProfile, 1);
        return updatedProfile.resources;
      });
    }, gameSettings.gameTickInterval);

    return () => clearInterval(intervalId);
  }, [employees, games]);

  const handleSaveGame = async () => {
    const gameProfileData = {
      resources,
      employees,
      games,
      createdAt: new Date().toISOString(),
    };

    try {
      if (saveId) {
        const fullProfile: GameProfile = {
          ...gameProfileData,
          id: saveId,
        };
        await updateProfile(saveId, fullProfile);
        setModalContent({ title: t('game', 'gameSaved'), message: t('game', 'gameSavedSuccess') });
        setIsModalVisible(true);
      } else {
        if (profiles.length < 5) {
          await addProfile(gameProfileData);
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
      <Fab resources={resources} />
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
