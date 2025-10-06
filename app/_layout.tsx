import 'react-native-reanimated';
import { useFonts } from 'expo-font';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { PaperProvider } from 'react-native-paper';
import { ThemeProvider } from '@/hooks/useTheme';
import { LanguageProvider } from '@/hooks/use-language';
import { GameEngineProvider } from '@/contexts/GameEngineContext';
import { AudioProvider, useAudioContext } from '@/contexts/AudioContext';

// BGM Manager Component to handle background music across different screens
const BGMManager = () => {
  const { playBGM_func, stopBGM_func } = useAudioContext();
  const pathname = usePathname();

  useEffect(() => {
    // Treat the root path as the menu screen for BGM purposes
    const currentScreen = pathname === '/' ? 'menu' : pathname.substring(1);

    // Define which screens should have BGM
    const gameScreens = ['menu', 'main', 'saved-profiles', 'options'];
    if (gameScreens.some(screen => currentScreen.startsWith(screen))) {
      playBGM_func();
    } else {
      // Stop BGM on any other screen
      stopBGM_func();
    }
  }, [pathname, playBGM_func, stopBGM_func]);

  return null; // This component does not render anything
};

export default function RootLayout() {
  console.log('RootLayout rendering');
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
                <Stack.Screen name="options" options={{ headerShown: false }} />
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