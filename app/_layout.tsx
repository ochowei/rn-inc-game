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
  const { playBGM, stopBGM } = useAudioContext();
  const pathname = usePathname();

  console.log('BGMManager rendering. Current pathname:', pathname);

  useEffect(() => {
    console.log('BGMManager useEffect triggered for pathname:', pathname);
    // Extract the screen name from the path, removing the leading slash
    const currentScreen = pathname.substring(1);

    // Define which screens should have BGM
    const gameScreens = ['menu', 'main', 'saved-profiles'];
    if (gameScreens.includes(currentScreen)) {
      console.log('Playing BGM for screen:', currentScreen);
      playBGM();
    } else {
      console.log('Stopping BGM for screen:', currentScreen);
      // Stop BGM on any other screen
      stopBGM();
    }
  }, [pathname, playBGM, stopBGM]);

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