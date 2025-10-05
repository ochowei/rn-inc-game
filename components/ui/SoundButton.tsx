import React from 'react';
import { GestureResponderEvent } from 'react-native';
import { Button } from 'react-native-paper';
import { useAudioContext } from '@/contexts/AudioContext';

type SoundButtonProps = React.ComponentProps<typeof Button>;

export const SoundButton: React.FC<SoundButtonProps> = ({ onPress, ...props }) => {
  const { playClickSound } = useAudioContext();

  const handlePress = (e: GestureResponderEvent) => {
    playClickSound();
    if (onPress) {
      onPress(e);
    }
  };

  return <Button onPress={handlePress} {...props} />;
};
