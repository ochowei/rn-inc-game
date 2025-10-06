import React from 'react';
import { View, Text, StyleSheet, ScrollView, Button } from 'react-native';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useLanguage } from '@/hooks/use-language';
import { Card } from '@/components/Card';
import gameSettings from '@/settings.json';

const PurchaseContainerScreen = () => {
  const { profile, purchaseContainer } = useGameEngine();
  const { t } = useLanguage();

  const canPurchase = (cost: Array<{ resource_id: string; amount: number }>) => {
    if (!profile) return false;
    return cost.every((c) => profile.resources.current[c.resource_id] >= c.amount);
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
      <Text style={styles.title}>{t('purchaseContainer', 'ownedContainers')}</Text>
      <View style={styles.ownedContainer}>
        {ownedContainers && Object.keys(ownedContainers).length > 0 ? (
          Object.entries(ownedContainers).map(([typeId, count]) => (
            <Text key={typeId}>
              {t('containers', typeId)}: {count}
            </Text>
          ))
        ) : (
          <Text>{t('purchaseContainer', 'noOwnedContainers')}</Text>
        )}
      </View>

      <Text style={styles.title}>{t('purchaseContainer', 'availableContainers')}</Text>
      {gameSettings.container_types.map((container) => (
        <Card key={container.id} style={styles.card}>
          <Text style={styles.cardTitle}>{t('containers', container.id)}</Text>
          <Text>
            {t('purchaseContainer', 'cost')}:{' '}
            {container.cost.map((c) => `${t('resources', c.resource_id)}: ${c.amount}`).join(', ')}
          </Text>
          <Text>
            {t('purchaseContainer', 'capacity')}:{' '}
            {Object.entries(container.capacities)
              .map(([key, value]) => `${t('assets', key)}: ${value}`)
              .join(', ')}
          </Text>
          <Button
            title={t('purchaseContainer', 'purchase')}
            onPress={() => purchaseContainer(container.id)}
            disabled={!canPurchase(container.cost)}
          />
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
  },
  card: {
    marginBottom: 10,
    padding: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  ownedContainer: {
    marginBottom: 20,
  },
});

export default PurchaseContainerScreen;