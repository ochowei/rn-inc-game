import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '@/hooks/use-language';
import { useGameEngineContext } from '@/contexts/GameEngineContext';
import { Button } from 'react-native-paper';

export default function TabLayout() {
  const { t } = useLanguage();
  const router = useRouter();
  const { saveCurrentProgress, unloadSave } = useGameEngineContext();

  const handleSave = async () => {
    try {
      await saveCurrentProgress();
      alert(t('game', 'saveSuccessTitle'));
    } catch (error) {
      console.error('Failed to save game', error);
      alert(t('game', 'failedToSave'));
    }
  };

  const handleBackToMenu = () => {
    unloadSave();
    router.push('/menu');
  };

  return (
    <Tabs
      screenOptions={{
        headerRight: () => (
          <Button onPress={handleSave} style={{ marginRight: 10 }}>
            {t('game', 'save')}
          </Button>
        ),
        headerLeft: () => (
          <Button onPress={handleBackToMenu} style={{ marginLeft: 10 }}>
            {t('game', 'backToMenu')}
          </Button>
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('game', 'newGameTitle'),
          tabBarIcon: ({ color }) => <MaterialIcons name="home" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="develop-game"
        options={{
          title: t('fab', 'developGame'),
          tabBarIcon: ({ color }) => <MaterialIcons name="business" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="hire-employee"
        options={{
          title: t('fab', 'hireEmployee'),
          tabBarIcon: ({ color }) => <MaterialIcons name="person-add" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}