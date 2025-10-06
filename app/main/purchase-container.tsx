import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useLanguage } from '@/hooks/use-language';
import { Card, Title, Paragraph } from 'react-native-paper';
import { SoundButton } from '@/components/ui/SoundButton';
import gameSettings from '@/settings.json';
import { useGameEngineContext } from '@/contexts/GameEngineContext';

const PurchaseContainerScreen = () => {
  const { profile, purchaseContainer } = useGameEngineContext();
  const { t } = useLanguage();

  const canPurchase = (cost: Array<{ resource_id: string; amount: number }>) => {
    if (!profile) return false;
    return cost.every((c) => {
      const resourceKey = c.resource_id as keyof typeof profile.resources.current;
      return profile.resources.current[resourceKey] >= c.amount;
    });
  };

  const ownedContainers = profile?.owned_containers.reduce(
    (acc, container) => {
      acc[container.typeId] = (acc[container.typeId] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>{t('purchaseContainer', 'ownedContainers')}</Title>
      <Card style={styles.card}>
        <Card.Content>
          {ownedContainers && Object.keys(ownedContainers).length > 0 ? (
            Object.entries(ownedContainers).map(([typeId, count]) => (
              <Paragraph key={typeId}>
                {t('containers', typeId)}: {count}
              </Paragraph>
            ))
          ) : (
            <Paragraph>{t('purchaseContainer', 'noOwnedContainers')}</Paragraph>
          )}
        </Card.Content>
      </Card>

      <Title style={styles.title}>{t('purchaseContainer', 'availableContainers')}</Title>
      {gameSettings.container_types.map((container) => (
        <Card key={container.id} style={styles.card}>
          <Card.Content>
            <Title>{t('containers', container.id)}</Title>
            <Paragraph>
              {t('purchaseContainer', 'cost')}:{' '}
              {container.cost.map((c) => `${t('resources', c.resource_id as any)}: ${c.amount}`).join(', ')}
            </Paragraph>
            <Paragraph>
              {t('purchaseContainer', 'capacity')}:{' '}
              {Object.entries(container.capacities)
                .map(([key, value]) => `${t('assets', key as any)}: ${value}`)
                .join(', ')}
            </Paragraph>
          </Card.Content>
          <Card.Actions>
            <SoundButton
              mode="contained"
              onPress={() => purchaseContainer(container.id)}
              disabled={!canPurchase(container.cost)}
            >
              {t('purchaseContainer', 'purchase')}
            </SoundButton>
          </Card.Actions>
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    paddingLeft: 5,
  },
  card: {
    marginBottom: 10,
  },
});

export default PurchaseContainerScreen;