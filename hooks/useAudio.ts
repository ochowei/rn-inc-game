import { Audio } from 'expo-av';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Platform } from 'react-native';

const bgmPlaylist = [
  require('../assets/audio/lofiuranus-240148.mp3'),
  require('../assets/audio/lofineputunus-244088.mp3'),
  require('../assets/audio/lofi-terra-233036.mp3'),
];

export const useAudio = () => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playlist, setPlaylist] = useState<Audio.Sound[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [playBGM, setPlayBGM] = useState(true);
  const [playSoundEffect, setPlaySoundEffect] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(Platform.OS !== 'web');
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = useCallback(() => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    setPlayBGM(!newMutedState);
    setPlaySoundEffect(!newMutedState);
  }, [isMuted]);

  useEffect(() => {
    let localSound: Audio.Sound | null = null;
    const loadedPlaylist: Audio.Sound[] = [];

    const loadSounds = async () => {
      try {
        const { sound: clickSound } = await Audio.Sound.createAsync(
          require('../assets/audio/click.mp3')
        );
        localSound = clickSound;
        setSound(clickSound);

        for (const track of bgmPlaylist) {
          const { sound: bgmSound } = await Audio.Sound.createAsync(track);
          loadedPlaylist.push(bgmSound);
        }
        setPlaylist(loadedPlaylist);
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to load sounds', error);
      }
    };

    loadSounds();

    return () => {
      localSound?.unloadAsync();
      loadedPlaylist.forEach((sound) => sound.unloadAsync());
    };
  }, []);

  const playBGM_func = useCallback(async () => {
    if (playlist.length === 0 || !playBGM) return;

    const sound = playlist[currentTrackIndex];

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.setOnPlaybackStatusUpdate(null);
        const nextTrackIndex = (currentTrackIndex + 1) % playlist.length;
        setCurrentTrackIndex(nextTrackIndex);
      }
    });

    const status = await sound.getStatusAsync();
    if (status.isLoaded && !status.isPlaying) {
      await sound.playAsync();
    }
  }, [playlist, currentTrackIndex, playBGM]);

  const stopBGM_func = useCallback(async () => {
    if (playlist.length === 0) return;
    const sound = playlist[currentTrackIndex];
    const status = await sound.getStatusAsync();
    if (status.isLoaded && status.isPlaying) {
      await sound.stopAsync();
    }
  }, [playlist, currentTrackIndex]);

  useEffect(() => {
    if (Platform.OS === 'web' && !hasInteracted) {
      const handleFirstInteraction = () => {
        setHasInteracted(true);
        window.removeEventListener('click', handleFirstInteraction);
        window.removeEventListener('keydown', handleFirstInteraction);
      };

      window.addEventListener('click', handleFirstInteraction);
      window.addEventListener('keydown', handleFirstInteraction);

      return () => {
        window.removeEventListener('click', handleFirstInteraction);
        window.removeEventListener('keydown', handleFirstInteraction);
      };
    }
  }, [hasInteracted]);

  useEffect(() => {
    if (playBGM && hasInteracted) {
      playBGM_func();
    } else {
      stopBGM_func();
    }
  }, [playBGM, hasInteracted, currentTrackIndex, playBGM_func, stopBGM_func]);


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
    isLoaded,
    isMuted,
    toggleMute,
  };
};