import { Audio } from 'expo-av';
import { useEffect, useState } from 'react';

export const useAudio = () => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [bgm, setBgm] = useState<Audio.Sound | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const loadSounds = async () => {
    try {
      const { sound: clickSound } = await Audio.Sound.createAsync(
        require('../assets/audio/click.mp3')
      );
      const { sound: bgmSound } = await Audio.Sound.createAsync(
        require('../assets/audio/bgm.mp3')
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

  const playClickSound = async () => {
    if (sound && !isMuted) {
      await sound.replayAsync();
    }
  };

  const playBGM = async () => {
    if (bgm && !isMuted) {
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
        }
    }
  };

  const toggleMute = async () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    if (bgm) {
        await bgm.setIsMutedAsync(newMuteState);
    }
    if (sound) {
        await sound.setIsMutedAsync(newMuteState);
    }
    if (!newMuteState && bgm) {
        const status = await bgm.getStatusAsync();
        if(status.isLoaded && !status.isPlaying) {
            playBGM();
        }
    }
  };

  return { playClickSound, playBGM, stopBGM, toggleMute, isMuted, loadSounds };
};