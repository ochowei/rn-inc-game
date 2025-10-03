import { StyleSheet, View, ActivityIndicator, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useLanguage } from '@/hooks/use-language';
import { useGameEngineContext } from '@/contexts/GameEngineContext';
import gameSettings from '@/settings.json';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { GameSettings } from '@/engine/types';

const settings = gameSettings as GameSettings;

export default function HireEmployeeScreen() {
  const { t } = useLanguage();
  const { profile, hireEmployee } = useGameEngineContext();

  const canHire = (employee: (typeof settings.assets_increasing_method_2.assets)[0]) => {
    if (!profile) return false;
    const cost = employee.hiring_cost;
    return (
      profile.resources.current.resource_3 >= cost.resource_3 &&
      profile.resources.current.resource_1 >= cost.resource_1 &&
      profile.resources.current.resource_2 >= cost.resource_2
    );
  };

  if (!profile) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
        <ThemedText>Loading Game...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        <View style={styles.employeeList}>
          {settings.assets_increasing_method_2.assets.map((employee, index) => (
            <Card key={index} style={styles.card}>
              <Card.Content>
                <Title>{t('employees', employee.name as any)}</Title>
                <Paragraph>{t('employee', 'cost')}:</Paragraph>
                <Paragraph>
                  - {t('resources', 'resource_3')}: {employee.hiring_cost.resource_3}
                </Paragraph>
                <Paragraph>
                  - {t('resources', 'resource_1')}: {employee.hiring_cost.resource_1}
                </Paragraph>
                <Paragraph>
                  - {t('resources', 'resource_2')}: {employee.hiring_cost.resource_2}
                </Paragraph>
              </Card.Content>
              <Card.Actions>
                <Button
                  mode="contained"
                  onPress={() => hireEmployee(employee.name)}
                  disabled={!canHire(employee)}
                >
                  {t('hireEmployee', 'hire')}
                </Button>
              </Card.Actions>
            </Card>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  employeeList: {
    marginTop: 20,
  },
  card: {
    marginBottom: 16,
  },
});