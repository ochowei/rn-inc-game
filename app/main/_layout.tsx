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
        name="home"
        options={{
          title: t('screen', 'screen_1'),
          tabBarIcon: ({ color }) => <MaterialIcons name="home" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="develop-game"
        options={{
          title: t('screen', 'screen_2'),
          tabBarIcon: ({ color }) => <MaterialIcons name="business" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="hire-employee"
        options={{
          title: t('screen', 'screen_3'),
          tabBarIcon: ({ color }) => <MaterialIcons name="person-add" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}