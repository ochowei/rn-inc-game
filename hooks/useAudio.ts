import { Audio } from 'expo-av';
import { useEffect, useState } from 'react';

export const useAudio = () => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [bgm, setBgm] = useState<Audio.Sound | null>(null);
  const [playBGM, setPlayBGM] = useState(true);

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

  useEffect(() => {
    const manageBgmPlayback = async () => {
      if (!bgm) return;
      const status = await bgm.getStatusAsync();
      if (!status.isLoaded) return;

      if (playBGM) {
        if (!status.isPlaying) {
          await bgm.playAsync();
        }
      } else {
        if (status.isPlaying) {
          await bgm.stopAsync();
        }
      }
    };
    manageBgmPlayback();
  }, [bgm, playBGM]);

  const playClickSound = async () => {
    if (sound) {
      await sound.replayAsync();
    }
  };

  return { playClickSound, setPlayBGM, playBGM };
};