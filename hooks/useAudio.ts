import { Audio } from 'expo-av';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAudio = () => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [bgm, setBgm] = useState<Audio.Sound | null>(null);
  const [isBgmOn, setIsBgmOn] = useState(true);
  const [isSfxOn, setIsSfxOn] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAudio = async () => {
      try {
        // Load settings from AsyncStorage first
        const bgmSetting = await AsyncStorage.getItem('isBgmOn');
        const sfxSetting = await AsyncStorage.getItem('isSfxOn');

        // Use local variables to hold the loaded settings
        let bgmOn = true;
        let sfxOn = true;

        if (bgmSetting !== null) {
          bgmOn = JSON.parse(bgmSetting);
        }
        if (sfxSetting !== null) {
          sfxOn = JSON.parse(sfxSetting);
        }

        // Set state based on loaded settings
        setIsBgmOn(bgmOn);
        setIsSfxOn(sfxOn);

        // Then, load the sound assets
        const { sound: clickSound } = await Audio.Sound.createAsync(
          require('../assets/audio/click.mp3')
        );
        const { sound: bgmSound } = await Audio.Sound.createAsync(
          require('../assets/audio/bgm-1.mp3')
        );
        await bgmSound.setIsLoopingAsync(true);

        setSound(clickSound);
        setBgm(bgmSound);

        // Finally, mark as initialized
        setIsInitialized(true);

      } catch (error) {
        console.error('Failed to initialize audio', error);
      }
    };

    initializeAudio();

    return () => {
      sound?.unloadAsync();
      bgm?.unloadAsync();
    };
  }, []);

  useEffect(() => {
    if (isInitialized && bgm) {
      if (isBgmOn) {
        playBGM();
      } else {
        stopBGM();
      }
    }
  }, [isBgmOn, bgm, isInitialized]);

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

  const toggleBGM = async () => {
    const newIsBgmOn = !isBgmOn;
    setIsBgmOn(newIsBgmOn);
    try {
      await AsyncStorage.setItem('isBgmOn', JSON.stringify(newIsBgmOn));
    } catch (error) {
      console.error('Failed to save BGM setting', error);
    }
  };

  const toggleSfx = async () => {
    const newIsSfxOn = !isSfxOn;
    setIsSfxOn(newIsSfxOn);
    try {
      await AsyncStorage.setItem('isSfxOn', JSON.stringify(newIsSfxOn));
    } catch (error) {
      console.error('Failed to save SFX setting', error);
    }
  };

  return { playClickSound, playBGM, stopBGM, toggleBGM, toggleSfx, isBgmOn, isSfxOn };
};