import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Tooltip } from 'react-native-paper';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useLanguage } from '@/hooks/use-language';
import { SaveProfile } from '@/engine/types';

type ResourcesProps = SaveProfile['resources'];

interface ResourceBarProps {
  resources: ResourcesProps;
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
      <Tooltip title={t('resources', 'resource_1')}>
        <ThemedView
          style={styles.resourceItem}
          lightColor="transparent"
          darkColor="transparent"
        >
          <IconSymbol name="lightbulb.fill" size={20} color={iconColor} />
          <ThemedText style={styles.resourceText}>
            {resources.current.resource_1} / {resources.max.resource_1}
          </ThemedText>
        </ThemedView>
      </Tooltip>
      <Tooltip title={t('resources', 'resource_2')}>
        <ThemedView
          style={styles.resourceItem}
          lightColor="transparent"
          darkColor="transparent"
        >
          <IconSymbol name="gearshape.fill" size={20} color={iconColor} />
          <ThemedText style={styles.resourceText}>
            {resources.current.resource_2} / {resources.max.resource_2}
          </ThemedText>
        </ThemedView>
      </Tooltip>
      <Tooltip title={t('resources', 'resource_3')}>
        <ThemedView
          style={styles.resourceItem}
          lightColor="transparent"
          darkColor="transparent"
        >
          <IconSymbol name="dollarsign.circle.fill" size={20} color={iconColor} />
          <ThemedText style={styles.resourceText}>
            {resources.current.resource_3}
          </ThemedText>
        </ThemedView>
      </Tooltip>
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