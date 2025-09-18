import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILES_KEY = 'game_profiles';

// Define the structure of a game profile
export interface GameProfile {
  id: string;
  resources: {
    creativity: number;
    productivity: number;
    money: number;
  };
  employees: {
    name: string;
    count: number;
  }[];
  games: {
    name: string;
    count: number;
  }[];
  createdAt: string;
}

function getStorage() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return {
      getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
      setItem: (key: string, value: string) => {
        localStorage.setItem(key, value);
        return Promise.resolve();
      },
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
      const storage = getStorage();
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
      const storage = getStorage();
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
  };

  const updateProfile = async (id: string, profile: GameProfile) => {
    const newProfiles = profiles.map((p) => (p.id === id ? profile : p));
    await saveProfiles(newProfiles);
  };

  return { profiles, loading, fetchProfiles, saveProfiles, deleteProfile, addProfile, updateProfile };
}
