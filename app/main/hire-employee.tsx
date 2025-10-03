import React from 'react';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useLanguage } from '@/hooks/use-language';

export default function HireEmployeeTab() {
  const { t } = useLanguage();
  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText type="title">{t('hireEmployee', 'title')}</ThemedText>
      <ThemedText>{t('hireEmployee', 'comingSoon')}</ThemedText>
    </ThemedView>
  );
}