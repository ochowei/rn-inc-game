import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameProfile as AppGameProfile } from '@/utils/game_logic';

const PROFILES_KEY = 'game_profiles';

// Define the structure of a game profile for storage, which must include an ID.
export interface GameProfile extends AppGameProfile {
  id: string;
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

  const saveProfiles = async (newProfiles: GameProfile[]) => {
    try {
      const storage = await getStorage();
      await storage.setItem(PROFILES_KEY, JSON.stringify(newProfiles));
      setProfiles(newProfiles);
    } catch (error) {
      console.error('Failed to save game profiles', error);
    }
  };

  const deleteProfile = async (id: string) => {
    const newProfiles = profiles.filter((p) => p.id !== id);
    await saveProfiles(newProfiles);
  };

  const addProfile = async (profile: Omit<GameProfile, 'id'>) => {
    if (profiles.length < 5) {
      const newProfile = {
        ...profile,
        id: new Date().toISOString() + '-' + Math.random().toString(36).substr(2, 9),
      };
      const newProfiles = [...profiles, newProfile];
      await saveProfiles(newProfiles);
      return newProfile;
    }
    return undefined; // Return undefined if limit is reached
  };

  const updateProfile = async (id: string, profile: AppGameProfile) => {
    const profileWithId = { ...profile, id };
    const newProfiles = profiles.map((p) => (p.id === id ? profileWithId : p));
    await saveProfiles(newProfiles);
  };

  return { profiles, loading, fetchProfiles, saveProfiles, deleteProfile, addProfile, updateProfile };
}