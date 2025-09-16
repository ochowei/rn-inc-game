import { createContext, useContext, useState, useEffect, useLayoutEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useRootNavigationState } from 'expo-router';
import { ThemeProvider as ThemeProviderRN, DarkTheme, DefaultTheme } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ColorScheme = 'light' | 'dark';
type Theme = ColorScheme | 'system';

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
} | null>(null);

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error('useTheme must be wrapped in a <ThemeProvider />');
  }

  const { theme, setTheme } = value;
  const systemTheme = useColorScheme() ?? 'light';
  const colorScheme: ColorScheme = theme === 'system' ? systemTheme : theme;
  return { theme, setTheme, colorScheme };
}

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function ThemeProvider({ children }: React.PropsWithChildren) {
  const navigationState = useRootNavigationState();
  const [theme, setTheme] = useState<Theme>('system');
  const systemTheme = useColorScheme() ?? 'light';

  useIsomorphicLayoutEffect(() => {
    (async () => {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setTheme(savedTheme as Theme);
      }
    })();
  }, []);

  const themeValue = {
    theme,
    setTheme: (newTheme: Theme) => {
      setTheme(newTheme);
      AsyncStorage.setItem('theme', newTheme);
    },
  };

  const themeContextValue = theme === 'system' ? systemTheme : theme;

  return (
    <ThemeContext.Provider value={themeValue}>
      <ThemeProviderRN value={themeContextValue === 'dark' ? DarkTheme : DefaultTheme}>
        {children}
      </ThemeProviderRN>
    </ThemeContext.Provider>
  );
}
