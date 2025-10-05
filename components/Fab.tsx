import React, { useState } from 'react';
import { Modal, Portal } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useGameEngineContext } from '@/contexts/GameEngineContext';
import { useLanguage } from '@/hooks/use-language';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SoundButton } from './ui/SoundButton';
import { SoundFAB } from './ui/SoundFAB';
import { SoundPressable } from './ui/SoundPressable';

const Fab: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });
  const router = useRouter();
  const { profile, saveCurrentProgress, unloadSave } = useGameEngineContext();
  const { t } = useLanguage();
  const tintColor = useThemeColor({}, 'tint');

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const handleBackToMenu = () => {
    hideModal();
    unloadSave();
    router.push('/menu');
  };

  const handleSavePress = async () => {
    hideModal();
    try {
      await saveCurrentProgress();
      setModalContent({ title: t('game', 'saveSuccessTitle'), message: t('game', 'saveSuccessMessage') });
      setIsConfirmationVisible(true);
    } catch (error) {
      console.error('Failed to save game', error);
      setModalContent({ title: t('game', 'error'), message: t('game', 'failedToSave') });
      setIsConfirmationVisible(true);
    }
  };

  const handleCloseConfirmation = () => {
    setIsConfirmationVisible(false);
  };

  // Do not render the FAB if there is no active game profile
  if (!profile) {
    return null;
  }

  return (
    <>
      <Portal>
        <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={styles.modalContainer} testID="fab-modal">
          <SoundButton onPress={handleSavePress}>{t('game', 'save')}</SoundButton>
          <SoundButton onPress={handleBackToMenu}>{t('game', 'backToMenu')}</SoundButton>
        </Modal>
      </Portal>
      <SoundFAB style={styles.fab} icon="plus" onPress={showModal} testID="fab-button" />

      {isConfirmationVisible && (
        <ThemedView style={styles.confirmationContainer}>
          <ThemedView
            style={styles.confirmationBox}
            lightColor="rgba(255, 255, 255, 0.9)"
            darkColor="rgba(21, 23, 24, 0.9)">
            <ThemedText type="subtitle">{modalContent.title}</ThemedText>
            <ThemedText>{modalContent.message}</ThemedText>
            <SoundPressable onPress={handleCloseConfirmation} style={[styles.button, { borderColor: tintColor }]}>
              <ThemedText style={styles.buttonText}>{t('game', 'close')}</ThemedText>
            </SoundPressable>
          </ThemedView>
        </ThemedView>
      )}
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
  confirmationContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  confirmationBox: {
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    gap: 15,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Fab;