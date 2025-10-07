import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '@/hooks/use-language';
import { useAudioContext } from '@/contexts/AudioContext';
import { useGameEngineContext } from '@/contexts/GameEngineContext';
import { ResourceBar } from '@/components/ResourceBar';
import { ThemedView } from '@/components/ThemedView';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

export default function TabLayout() {
  const { t } = useLanguage();
  const { playClickSound } = useAudioContext();
  const { profile } = useGameEngineContext();

  if (!profile) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" />
        <ThemedText>Loading Game...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ResourceBar resources={profile.resources} />
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
        screenListeners={{
          tabPress: () => {
            playClickSound();
          },
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
        <Tabs.Screen
          name="purchase-container"
          options={{
            title: t('screen', 'screen_4'),
            tabBarIcon: ({ color }) => <MaterialIcons name="store" size={28} color={color} />,
          }}
        />
      </Tabs>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});