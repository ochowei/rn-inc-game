import { useState, useEffect, useCallback } from 'react';
import {
  GameProfile,
  updateGameProfile,
  developGame as developGameLogic,
  createNewGameProfile as createNewGameLogic,
} from '@/utils/game_logic';
import { useGameStorage } from './use-game-storage';
import gameSettings from '@/game_settings.json';

// The interface for the GameProfile used within the engine, which may not have an ID yet.
interface FullGameProfile extends GameProfile {
  id?: string;
}

export function useGameEngine() {
  const [profile, setProfile] = useState<FullGameProfile | null>(null);
  const { addProfile, updateProfile } = useGameStorage();

  // Game Tick Effect
  useEffect(() => {
    if (!profile) {
      return;
    }

    const intervalId = setInterval(() => {
      setProfile((prevProfile) => {
        if (!prevProfile) return null;
        return updateGameProfile(prevProfile, 1);
      });
    }, gameSettings.gameTickInterval);

    return () => clearInterval(intervalId);
  }, [profile?.id]); // Effect should only re-run when the game profile changes

  const loadGame = useCallback((profileToLoad: FullGameProfile) => {
    const now = new Date();
    const createdAt = new Date(profileToLoad.createdAt);
    const elapsedMilliseconds = now.getTime() - createdAt.getTime();
    const ticks = Math.floor(elapsedMilliseconds / gameSettings.gameTickInterval);

    const updatedProfile = updateGameProfile(profileToLoad, ticks);
    setProfile(updatedProfile);
  }, []);

  const createNewGame = useCallback(() => {
    const newProfile = createNewGameLogic();
    setProfile(newProfile);
  }, []);

  const unloadGame = useCallback(() => {
    setProfile(null);
  }, []);

  const developGame = useCallback((gameName: string) => {
    setProfile((prevProfile) => {
      if (!prevProfile) return null;
      return developGameLogic(prevProfile, gameName);
    });
  }, []);

  const saveGame = useCallback(async () => {
    if (!profile) return;

    // Destructure to separate the id from the rest of the profile data
    const { id, ...profileData } = profile;

    const gameProfileToSave = {
      ...profileData,
      createdAt: new Date().toISOString(),
    };

    try {
      if (id) {
        // Existing game, update it
        await updateProfile(id, gameProfileToSave);
      } else {
        // New game, add it and get the new profile with an ID
        const newProfileWithId = await addProfile(gameProfileToSave);
        if (newProfileWithId) {
          // Update the state to include the new ID for future saves
          setProfile(newProfileWithId);
        }
      }
    } catch (error) {
      console.error('Failed to save game profile', error);
    }
  }, [profile, addProfile, updateProfile]);

  return {
    profile,
    loadGame,
    createNewGame,
    unloadGame,
    developGame,
    saveGame,
  };
}