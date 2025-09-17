import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILES_KEY = 'game_profiles';

// Define the structure of a game profile
export interface GameProfile {
  resources: {
    creativity: number;
    productivity: number;
    money: number;
  };
  assets: {
    name: string;
    count: number;
  }[];
  createdAt: string;
}

async function getStorage() {
  if (Platform.OS === 'web') {
    return {
      getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
      setItem: (key: string, value: string) => Promise.resolve(localStorage.setItem(key, value)),
    };
  }
  return AsyncStorage;
}

export function useGameStorage() {
  const [profiles, setProfiles] = useState<GameProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const storage = await getStorage();
      const profilesJson = await storage.getItem(PROFILES_KEY);
      if (profilesJson) {
        setProfiles(JSON.parse(profilesJson));
      } else {
        setProfiles([]);
      }
    } catch (error) {
      console.error('Failed to fetch game profiles', error);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const saveProfiles = useCallback(async (newProfiles: GameProfile[]) => {
    console.log('saveProfiles called with new profiles:', newProfiles);
    try {
      const storage = await getStorage();
      await storage.setItem(PROFILES_KEY, JSON.stringify(newProfiles));
      setProfiles(newProfiles);
      console.log('AsyncStorage updated successfully.');
    } catch (error) {
      console.error('Failed to save game profiles in saveProfiles', error);
      throw error; // Re-throw the error to be caught by the caller
    }
  }, []);

  const deleteProfile = useCallback(async (index: number) => {
    console.log('deleteProfile called with index:', index);
    try {
      const newProfiles = profiles.filter((_, i) => i !== index);
      console.log('New profiles after filter:', newProfiles);
      await saveProfiles(newProfiles);
      console.log('Profiles saved successfully after deletion.');
    } catch (error) {
      console.error('Failed to delete game profile', error);
      throw error; // Re-throw to allow the UI to handle it
    }
  }, [profiles, saveProfiles]);

  const addProfile = useCallback(async (profile: GameProfile) => {
    if (profiles.length < 5) {
      const newProfiles = [...profiles, profile];
      await saveProfiles(newProfiles);
    }
  }, [profiles, saveProfiles]);

  return { profiles, loading, fetchProfiles, saveProfiles, deleteProfile, addProfile };
}
