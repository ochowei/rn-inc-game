import React from 'react';
import { GestureResponderEvent } from 'react-native';
import { FAB } from 'react-native-paper';
import { useAudioContext } from '@/contexts/AudioContext';

type SoundFABProps = React.ComponentProps<typeof FAB>;

export const SoundFAB: React.FC<SoundFABProps> = ({ onPress, ...props }) => {
  const { playClickSound } = useAudioContext();

  const handlePress = (e: GestureResponderEvent) => {
    playClickSound();
    if (onPress) {
      onPress(e);
    }
  };

  return <FAB onPress={handlePress} {...props} />;
};
