import { Audio } from 'expo-av';
import { useEffect, useState, useCallback } from 'react';

export const useAudio = () => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [bgm, setBgm] = useState<Audio.Sound | null>(null);
  const [playBGM, setPlayBGM] = useState(true); // User's preference
  const [playSoundEffect, setPlaySoundEffect] = useState(true); // User's preference for sound effects

  useEffect(() => {
    let localSound: Audio.Sound | null = null;
    let localBgm: Audio.Sound | null = null;

    const loadSounds = async () => {
      try {
        const { sound: clickSound } = await Audio.Sound.createAsync(
          require('../assets/audio/click.mp3')
        );
        const { sound: bgmSound } = await Audio.Sound.createAsync(
          require('../assets/audio/bgm-1.mp3')
        );
        await bgmSound.setIsLoopingAsync(true);

        localSound = clickSound;
        localBgm = bgmSound;

        setSound(clickSound);
        setBgm(bgmSound);
      } catch (error) {
        console.error('Failed to load sounds', error);
      }
    };

    loadSounds();

    return () => {
      localSound?.unloadAsync();
      localBgm?.unloadAsync();
    };
  }, []);

  const playBGM_func = useCallback(async () => {
    if (bgm && playBGM) { // Respects user's preference
      const status = await bgm.getStatusAsync();
      if (status.isLoaded && !status.isPlaying) {
        await bgm.playAsync();
      }
    }
  }, [bgm, playBGM]);

  const stopBGM_func = useCallback(async () => {
    if (bgm) {
      const status = await bgm.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        await bgm.stopAsync();
      }
    }
  }, [bgm]);

  // Effect to handle user toggling BGM on/off directly
  useEffect(() => {
    if (playBGM) {
      playBGM_func();
    } else {
      stopBGM_func();
    }
  }, [playBGM, playBGM_func, stopBGM_func]);

  const playClickSound = async () => {
    if (sound && playSoundEffect) {
      await sound.replayAsync();
    }
  };

  return {
    playClickSound,
    setPlayBGM,
    playBGM,
    playBGM_func,
    stopBGM_func,
    playSoundEffect,
    setPlaySoundEffect,
  };
};