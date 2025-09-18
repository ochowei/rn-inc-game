import 'react-native-reanimated';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { PaperProvider } from 'react-native-paper';
import { ThemeProvider } from '@/hooks/useTheme';
import { LanguageProvider } from '@/hooks/use-language';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <LanguageProvider>
      <ThemeProvider>
        <PaperProvider>
          <Stack>
            <Stack.Screen name="menu" options={{ headerShown: false }} />
            <Stack.Screen name="game" options={{ headerShown: false }} />
            <Stack.Screen name="saved-games" options={{ title: 'Saved Games' }} />
            <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </PaperProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
