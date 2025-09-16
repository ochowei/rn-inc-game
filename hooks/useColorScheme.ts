import { useTheme } from '@/hooks/useTheme';

export function useColorScheme() {
  const { colorScheme } = useTheme();
  return colorScheme;
}
