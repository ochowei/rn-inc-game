import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { GameProfile, updateGameProfile } from '../utils/game_logic';
import gameSettings from '@/game_settings.json';

// Define the shape of the context's value
interface GameContextType {
  profile: GameProfile | null;
  loadProfile: (profile: GameProfile) => void;
  updateResources: (newResources: GameProfile['resources']) => void;
  addDevelopedGame: (gameName: string) => void;
}

// Create the context with a default value
const GameContext = createContext<GameContextType | undefined>(undefined);

// Create a provider component
export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<GameProfile | null>(null);

  useEffect(() => {
    if (!profile) return;

    const intervalId = setInterval(() => {
      setProfile((prevProfile) => {
        if (!prevProfile) return null;
        return updateGameProfile(prevProfile, 1);
      });
    }, gameSettings.gameTickInterval);

    return () => clearInterval(intervalId);
  }, [profile]);

  const loadProfile = (newProfile: GameProfile) => {
    setProfile(newProfile);
  };

  const updateResources = (newResources: GameProfile['resources']) => {
    if (profile) {
      setProfile({ ...profile, resources: newResources });
    }
  };

  const addDevelopedGame = (gameName: string) => {
    if (profile) {
      const newGames = [...profile.games];
      const existingGame = newGames.find((g) => g.name === gameName);
      if (existingGame) {
        existingGame.count += 1;
      } else {
        newGames.push({ name: gameName, count: 1 });
      }
      setProfile({ ...profile, games: newGames });
    }
  };

  return (
    <GameContext.Provider value={{ profile, loadProfile, updateResources, addDevelopedGame }}>
      {children}
    </GameContext.Provider>
  );
};

// Create a custom hook to use the game context
export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};
