import { useState, useEffect, useCallback } from 'react';
import {
  updateSaveProfile,
  addAsset as addAssetLogic,
  createNewSaveProfile as createNewSaveLogic,
} from '@/engine/game_engine';
import { SaveProfile as EngineSaveProfile, GameSettings } from '@/engine/types';
import { useGameStorage, SaveProfile as StoredSaveProfile } from './use-game-storage';
import gameSettings from '@/settings.json';

// The interface for the SaveProfile used within the engine, which may not have an ID yet.
export type FullSaveProfile = StoredSaveProfile;

export interface GameEngineHook {
  profile: FullSaveProfile | null;
  loadSave: (profileToLoad: FullSaveProfile) => void;
  createNewSave: () => Promise<FullSaveProfile | undefined>;
  unloadSave: () => void;
  addAsset: (assetType: 'asset_group_1' | 'asset_group_2', assetId: string) => void;
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

    const gameTickInterval = gameSettings.gameTickInterval;
    let intervalId: NodeJS.Timeout | null = null;

    const gameTick = () => {
      setProfile((prevProfile) => {
        if (!prevProfile) return null;
        const updatedCoreProfile = updateSaveProfile(prevProfile, 1, gameSettings as GameSettings);
        return { ...updatedCoreProfile, id: prevProfile.id };
      });
    };

    const startTicking = () => {
      // First tick, right now.
      gameTick();
      // Subsequent ticks
      intervalId = setInterval(gameTick, gameTickInterval);
    };

    const delay = gameTickInterval - (Date.now() % gameTickInterval);
    const timeoutId = setTimeout(startTicking, delay);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [profile]); // Effect should only re-run when the game profile changes

  const loadSave = useCallback((profileToLoad: FullSaveProfile) => {
    const now = new Date();
    const createdAt = new Date(profileToLoad.createdAt);
    const elapsedMilliseconds = now.getTime() - createdAt.getTime();
    const ticks = Math.floor(elapsedMilliseconds / gameSettings.gameTickInterval);

    // Ensure inProgressAssets exists for backward compatibility
    const profileWithInProgress = {
      ...profileToLoad,
      inProgressAssets: profileToLoad.inProgressAssets || [],
    };

    const updatedCoreProfile = updateSaveProfile(profileWithInProgress, ticks, gameSettings as GameSettings);
    setProfile({ ...updatedCoreProfile, id: profileToLoad.id });
  }, []);

  const createNewSave = useCallback(async () => {
    const newProfileData = createNewSaveLogic(gameSettings as GameSettings);
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
    const updatedSaveProfile: EngineSaveProfile = {
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

  const saveCurrentProgress = useCallback(async () => {
    if (!profile) return;
    await saveProfileNow(profile);
  }, [profile, saveProfileNow]);

  const addAsset = useCallback(
    (assetType: 'asset_group_1' | 'asset_group_2', assetId: string) => {
      setProfile((prevProfile) => {
        if (!prevProfile) return null;
        const newCoreProfile = addAssetLogic(
          prevProfile,
          assetType,
          assetId,
          gameSettings as GameSettings
        );

        const newProfile = { ...newCoreProfile, id: prevProfile.id };

        if (newCoreProfile !== prevProfile) {
          saveProfileNow(newProfile);
        }
        return newProfile;
      });
    },
    [saveProfileNow]
  );

  return {
    profile,
    loadSave,
    createNewSave,
    unloadSave,
    addAsset,
    saveCurrentProgress,
  };
}