import { useState, useEffect, useCallback } from 'react';
import {
  SaveProfile,
  updateSaveProfile,
  developGame as developGameLogic,
  createNewSaveProfile as createNewSaveLogic,
} from '@/utils/game_logic';
import { useGameStorage } from './use-game-storage';
import gameSettings from '@/settings.json';

// The interface for the SaveProfile used within the engine, which may not have an ID yet.
export interface FullSaveProfile extends SaveProfile {
  id?: string;
}

export interface GameEngineHook {
  profile: FullSaveProfile | null;
  loadSave: (profileToLoad: FullSaveProfile) => void;
  createNewSave: () => Promise<FullSaveProfile | undefined>;
  unloadSave: () => void;
  developGame: (gameName: string) => void;
  saveCurrentProgress: () => Promise<void>;
}

export function useGameEngine(): GameEngineHook {
  const [profile, setProfile] = useState<FullSaveProfile | null>(null);
  const { addProfile, updateProfile } = useGameStorage();

  // Game Tick Effect
  useEffect(() => {
    if (!profile) {
      return;
    }

    const intervalId = setInterval(() => {
      setProfile((prevProfile) => {
        if (!prevProfile) return null;
        return updateSaveProfile(prevProfile, 1);
      });
    }, gameSettings.gameTickInterval);

    return () => clearInterval(intervalId);
  }, [profile]); // Effect should only re-run when the game profile changes

  const loadSave = useCallback((profileToLoad: FullSaveProfile) => {
    const now = new Date();
    const createdAt = new Date(profileToLoad.createdAt);
    const elapsedMilliseconds = now.getTime() - createdAt.getTime();
    const ticks = Math.floor(elapsedMilliseconds / gameSettings.gameTickInterval);

    const updatedProfile = updateSaveProfile(profileToLoad, ticks);
    setProfile(updatedProfile);
  }, []);

  const createNewSave = useCallback(async () => {
    const newProfileData = createNewSaveLogic();
    const newProfileWithId = await addProfile(newProfileData);

    if (newProfileWithId) {
      // Update the state with the profile that includes the new ID from storage.
      setProfile(newProfileWithId);
    }

    // Return the newly created profile, or undefined if the operation failed (e.g., storage limit reached).
    return newProfileWithId;
  }, [addProfile]);

  const unloadSave = useCallback(() => {
    setProfile(null);
  }, []);

  const saveProfileNow = useCallback(async (saveProfileToSave: FullSaveProfile) => {
    // The profile might be null if called in a context where it's not guaranteed to exist.
    if (!saveProfileToSave) return;

    // Destructure to separate the id from the rest of the profile data.
    const { id, ...profileData } = saveProfileToSave;

    // Always update the `createdAt` timestamp to the current moment of saving.
    const updatedSaveProfile = {
      ...profileData,
      createdAt: new Date().toISOString(),
    };

    try {
      if (id) {
        // If an ID exists, it's an existing game, so we update it.
        await updateProfile(id, updatedSaveProfile);
      } else {
        // If there's no ID, it's a new game. We add it to the storage.
        const newProfileWithId = await addProfile(updatedSaveProfile);
        if (newProfileWithId) {
          // After adding, we update the component's state to include the new ID.
          // This is crucial for subsequent saves to be treated as updates.
          setProfile(newProfileWithId);
        }
      }
    } catch (error) {
      // Log any errors that occur during the save process.
      console.error('Failed to save profile', error);
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

  const saveCurrentProgress = useCallback(async () => {
    if (!profile) return;
    await saveProfileNow(profile);
  }, [profile, saveProfileNow]);

  return {
    profile,
    loadSave,
    createNewSave,
    unloadSave,
    developGame,
    saveCurrentProgress,
  };
}