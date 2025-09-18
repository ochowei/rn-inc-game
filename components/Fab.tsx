import * as React from 'react';
import { Modal, Portal, Button } from 'react-native-paper';
import { FAB } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const Fab = () => {
  const [visible, setVisible] = React.useState(false);
  const router = useRouter();

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const handleDevelopGamePress = () => {
    hideModal();
    router.push('/develop-game');
  };

  return (
    <>
      <Portal>
        <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={styles.modalContainer} testID="fab-modal">
          <Button onPress={handleDevelopGamePress}>Game Develop</Button>
          <Button onPress={() => console.log('Pressed hire employee')}>Hire Employee</Button>
        </Modal>
      </Portal>
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={showModal}
        testID="fab-button"
      />
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    position: 'absolute',
    bottom: 88,
    right: 16,
  },
});

export default Fab;
