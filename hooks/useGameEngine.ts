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
  }, [profile]); // Effect should only re-run when the game profile changes

  const loadGame = useCallback((profileToLoad: FullGameProfile) => {
    const now = new Date();
    const createdAt = new Date(profileToLoad.createdAt);
    const elapsedMilliseconds = now.getTime() - createdAt.getTime();
    const ticks = Math.floor(elapsedMilliseconds / gameSettings.gameTickInterval);

    const updatedProfile = updateGameProfile(profileToLoad, ticks);
    setProfile(updatedProfile);
  }, []);

  const createNewGame = useCallback(async () => {
    const newProfileData = createNewGameLogic();
    const newProfileWithId = await addProfile(newProfileData);

    if (newProfileWithId) {
      // Update the state with the profile that includes the new ID from storage.
      setProfile(newProfileWithId);
    }

    // Return the newly created profile, or undefined if the operation failed (e.g., storage limit reached).
    return newProfileWithId;
  }, [addProfile]);

  const unloadGame = useCallback(() => {
    setProfile(null);
  }, []);

  const saveProfileNow = useCallback(async (profileToSave: FullGameProfile) => {
    // The profile might be null if called in a context where it's not guaranteed to exist.
    if (!profileToSave) return;

    // Destructure to separate the id from the rest of the profile data.
    const { id, ...profileData } = profileToSave;

    // Always update the `createdAt` timestamp to the current moment of saving.
    const gameProfileToSave = {
      ...profileData,
      createdAt: new Date().toISOString(),
    };

    try {
      if (id) {
        // If an ID exists, it's an existing game, so we update it.
        await updateProfile(id, gameProfileToSave);
      } else {
        // If there's no ID, it's a new game. We add it to the storage.
        const newProfileWithId = await addProfile(gameProfileToSave);
        if (newProfileWithId) {
          // After adding, we update the component's state to include the new ID.
          // This is crucial for subsequent saves to be treated as updates.
          setProfile(newProfileWithId);
        }
      }
    } catch (error) {
      // Log any errors that occur during the save process.
      console.error('Failed to save game profile', error);
    }
  }, [addProfile, updateProfile]);

  const developGame = useCallback((gameName: string) => {
    setProfile((prevProfile) => {
      if (!prevProfile) return null;
      const newProfile = developGameLogic(prevProfile, gameName);
      if (newProfile !== prevProfile) {
        saveProfileNow(newProfile);
      }
      return newProfile;
    });
  }, [saveProfileNow]);

  const saveGame = useCallback(async () => {
    if (!profile) return;
    await saveProfileNow(profile);
  }, [profile, saveProfileNow]);

  return {
    profile,
    loadGame,
    createNewGame,
    unloadGame,
    developGame,
    saveGame,
  };
}