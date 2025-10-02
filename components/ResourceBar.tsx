import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useLanguage } from '@/hooks/use-language';

interface Resources {
  resource_1: number;
  resource_2: number;
  resource_3: number;
  resource_1_max: number;
  resource_2_max: number;
}

interface ResourceBarProps {
  resources: Resources;
}

export function ResourceBar({ resources }: ResourceBarProps) {
  const iconColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'icon');
  const { t } = useLanguage();

  return (
    <ThemedView
      style={[styles.container, { borderBottomColor: borderColor }]}
      lightColor="rgba(255, 255, 255, 0.9)"
      darkColor="rgba(21, 23, 24, 0.9)"
    >
      <ThemedView
        style={styles.resourceItem}
        lightColor="transparent"
        darkColor="transparent"
      >
        <IconSymbol name="lightbulb.fill" size={20} color={iconColor} />
        <ThemedText style={styles.resourceText}>
          {t('resources', 'resource_1')}: {resources.resource_1} / {resources.resource_1_max}
        </ThemedText>
      </ThemedView>
      <ThemedView
        style={styles.resourceItem}
        lightColor="transparent"
        darkColor="transparent"
      >
        <IconSymbol name="gearshape.fill" size={20} color={iconColor} />
        <ThemedText style={styles.resourceText}>
          {t('resources', 'resource_2')}: {resources.resource_2} / {resources.resource_2_max}
        </ThemedText>
      </ThemedView>
      <ThemedView
        style={styles.resourceItem}
        lightColor="transparent"
        darkColor="transparent"
      >
        <IconSymbol name="dollarsign.circle.fill" size={20} color={iconColor} />
        <ThemedText style={styles.resourceText}>{t('resources', 'resource_3')}: {resources.resource_3}</ThemedText>
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
