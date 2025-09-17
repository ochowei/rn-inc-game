import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';

interface Resources {
  creativity: number;
  productivity: number;
  money: number;
}

interface ResourceBarProps {
  resources: Resources;
}

export function ResourceBar({ resources }: ResourceBarProps) {
  const iconColor = useThemeColor({}, 'text');

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.resourceItem}>
        <IconSymbol name="lightbulb.fill" size={20} color={iconColor} />
        <ThemedText style={styles.resourceText}>{resources.creativity}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.resourceItem}>
        <IconSymbol name="gearshape.fill" size={20} color={iconColor} />
        <ThemedText style={styles.resourceText}>{resources.productivity}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.resourceItem}>
        <IconSymbol name="dollarsign.circle.fill" size={20} color={iconColor} />
        <ThemedText style={styles.resourceText}>{resources.money}</ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 16,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resourceText: {
    fontSize: 16,
  },
});
