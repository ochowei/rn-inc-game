import { Audio } from 'expo-av';
import { useEffect, useState } from 'react';

export const useAudio = () => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [bgm, setBgm] = useState<Audio.Sound | null>(null);
  const [isBgmOn, setIsBgmOn] = useState(true);
  const [isSfxOn, setIsSfxOn] = useState(true);

  const loadSounds = async () => {
    try {
      const { sound: clickSound } = await Audio.Sound.createAsync(
        require('../assets/audio/click.mp3')
      );
      const { sound: bgmSound } = await Audio.Sound.createAsync(
        require('../assets/audio/bgm-1.mp3')
      );
      await bgmSound.setIsLoopingAsync(true);
      setSound(clickSound);
      setBgm(bgmSound);
    } catch (error) {
      console.error("Failed to load sounds", error);
    }
  };

  useEffect(() => {
    loadSounds();

    return () => {
      sound?.unloadAsync();
      bgm?.unloadAsync();
    };
  }, []);

  useEffect(() => {
    if (bgm) {
      if (isBgmOn) {
        playBGM();
      } else {
        stopBGM();
      }
    }
  }, [isBgmOn, bgm]);

  const playClickSound = async () => {
    if (sound && isSfxOn) {
      await sound.replayAsync();
    }
  };

  const playBGM = async () => {
    if (bgm) {
      const status = await bgm.getStatusAsync();
      if (status.isLoaded && !status.isPlaying) {
        await bgm.playAsync();
      }
    }
  };

  const stopBGM = async () => {
    if (bgm) {
        const status = await bgm.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
            await bgm.stopAsync();
            await bgm.setPositionAsync(0); // Reset position
        }
    }
  };

  const toggleBGM = () => {
    setIsBgmOn(previousState => !previousState);
  };

  const toggleSfx = () => {
    setIsSfxOn(previousState => !previousState);
  };

  return { playClickSound, playBGM, stopBGM, toggleBGM, toggleSfx, isBgmOn, isSfxOn, loadSounds };
};