import React from 'react';
import { Pressable, PressableProps } from 'react-native';
import { useAudioContext } from '@/contexts/AudioContext';

export const SoundPressable: React.FC<PressableProps> = ({ onPress, ...props }) => {
  const { playClickSound } = useAudioContext();

  const handlePress = (e: any) => {
    playClickSound();
    if (onPress) {
      onPress(e);
    }
  };

  return <Pressable onPress={handlePress} {...props} />;
};
