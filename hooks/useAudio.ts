import { Audio } from 'expo-av';
import { useEffect, useState, useCallback, useRef } from 'react';

const bgmPlaylist = [
  require('../assets/audio/lofiuranus-240148.mp3'),
  require('../assets/audio/lofineputunus-244088.mp3'),
  require('../assets/audio/lofi-terra-233036.mp3'),
];

export const useAudio = () => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playlist, setPlaylist] = useState<Audio.Sound[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [playBGM, setPlayBGM] = useState(true);
  const [playSoundEffect, setPlaySoundEffect] = useState(true);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    let localSound: Audio.Sound | null = null;
    const loadedPlaylist: Audio.Sound[] = [];

    const loadSounds = async () => {
      try {
        // Load click sound
        const { sound: clickSound } = await Audio.Sound.createAsync(
          require('../assets/audio/click.mp3')
        );
        localSound = clickSound;
        setSound(clickSound);

        // Load BGM playlist
        for (const track of bgmPlaylist) {
          const { sound: bgmSound } = await Audio.Sound.createAsync(track);
          loadedPlaylist.push(bgmSound);
        }
        setPlaylist(loadedPlaylist);
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
    if (playlist.length === 0 || !playBGM || isPlayingRef.current) return;

    isPlayingRef.current = true;
    const sound = playlist[currentTrackIndex];

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.setOnPlaybackStatusUpdate(null);
        const nextTrackIndex = (currentTrackIndex + 1) % playlist.length;
        setCurrentTrackIndex(nextTrackIndex);
        isPlayingRef.current = false;
      }
    });

    const status = await sound.getStatusAsync();
    if (status.isLoaded && !status.isPlaying) {
      await sound.playAsync();
    }
  }, [playlist, currentTrackIndex, playBGM]);

  const stopBGM_func = useCallback(async () => {
    if (playlist.length === 0) return;
    isPlayingRef.current = false;
    const sound = playlist[currentTrackIndex];
    const status = await sound.getStatusAsync();
    if (status.isLoaded && status.isPlaying) {
      await sound.stopAsync();
    }
  }, [playlist, currentTrackIndex]);

  useEffect(() => {
    if (playBGM) {
      playBGM_func();
    } else {
      stopBGM_func();
    }
  }, [playBGM, playBGM_func, stopBGM_func]);

  // Auto-play next track
  useEffect(() => {
    if(playBGM) {
      playBGM_func();
    }
  }, [currentTrackIndex, playBGM_func, playBGM]);


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