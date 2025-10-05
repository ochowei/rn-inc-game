import 'react-native-reanimated';
import { useFonts } from 'expo-font';
import { Stack, useRouterState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { PaperProvider } from 'react-native-paper';
import { ThemeProvider } from '@/hooks/useTheme';
import { LanguageProvider } from '@/hooks/use-language';
import { GameEngineProvider } from '@/contexts/GameEngineContext';
import { AudioProvider, useAudioContext } from '@/contexts/AudioContext';

// BGM Manager Component to handle background music across different screens
const BGMManager = () => {
  const { playBGM, stopBGM } = useAudioContext();
  // Get the current route name
  const route = useRouterState().routes.at(-1);
  const routeName = route?.name;

  useEffect(() => {
    // Define which screens should have BGM
    const gameScreens = ['menu', 'main', 'saved-profiles'];
    if (routeName && gameScreens.includes(routeName)) {
      playBGM();
    } else {
      // Stop BGM on any other screen
      stopBGM();
    }
  }, [routeName, playBGM, stopBGM]);

  return null; // This component does not render anything
};

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <AudioProvider>
      <LanguageProvider>
        <ThemeProvider>
          <PaperProvider>
            <GameEngineProvider>
              <BGMManager />
              <Stack>
                <Stack.Screen name="menu" options={{ headerShown: false }} />
                <Stack.Screen name="main" options={{ headerShown: false }} />
                <Stack.Screen name="saved-profiles" />
                <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
              <StatusBar style="auto" />
            </GameEngineProvider>
          </PaperProvider>
        </ThemeProvider>
      </LanguageProvider>
    </AudioProvider>
  );
}