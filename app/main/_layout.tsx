import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '@/hooks/use-language';

export default function TabLayout() {
  const { t } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
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