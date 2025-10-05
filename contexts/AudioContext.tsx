import React, { createContext, useContext, ReactNode } from 'react';
import { useAudio } from '../hooks/useAudio';

// Define the shape of the context data
interface AudioContextType {
  playClickSound: () => Promise<void>;
  playBGM: () => Promise<void>;
  stopBGM: () => Promise<void>;
  toggleBGM: () => Promise<void>;
  toggleSfx: () => Promise<void>;
  isBgmOn: boolean;
  isSfxOn: boolean;
}

// Create the context with a default undefined value
const AudioContext = createContext<AudioContextType | undefined>(undefined);

// Create the provider component
export const AudioProvider = ({ children }: { children: ReactNode }) => {
  // `useAudio` provides all the necessary functions and state
  const audio = useAudio();

  // The value provided to the context consumers
  const contextValue = {
    playClickSound: audio.playClickSound,
    playBGM: audio.playBGM,
    stopBGM: audio.stopBGM,
    toggleBGM: audio.toggleBGM,
    toggleSfx: audio.toggleSfx,
    isBgmOn: audio.isBgmOn,
    isSfxOn: audio.isSfxOn,
  };

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  );
};

// Create a custom hook for easy consumption of the context
export const useAudioContext = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    // This error is helpful for developers to know they've used the hook outside of the provider
    throw new Error('useAudioContext must be used within an AudioProvider');
  }
  return context;
};