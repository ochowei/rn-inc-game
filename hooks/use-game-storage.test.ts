import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { SaveProfile as EngineSaveProfile } from '@/engine/types';
import { SaveProfile, useGameStorage } from './use-game-storage';

// Mock react-native with a simple, mutable object to avoid transform errors
var mockReactNative = {
  Platform: {
    OS: 'web',
  },
};
jest.mock('react-native', () => ({
  __esModule: true,
  get Platform() {
    return mockReactNative.Platform;
  },
}));


// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock localStorage for web
const mockLocalStorage = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

const mockProfile: EngineSaveProfile = {
  resources: {
    resource_1: 100,
    resource_2: 100,
    money: 1000,
    resource_1_max: 200,
    resource_2_max: 200,
    resource_1_per_tick: 1,
    resource_2_per_tick: 1,
    money_per_tick: 0,
  },
  employees: [],
  games: [],
  createdAt: new Date().toISOString(),
};

describe('useGameStorage', () => {
  let getItemSpy: jest.SpyInstance;
  let setItemSpy: jest.SpyInstance;

  beforeEach(() => {
    // Clear mocks before each test
    (AsyncStorage.getItem as jest.Mock).mockClear();
    (AsyncStorage.setItem as jest.Mock).mockClear();

    // Reset spies
    getItemSpy?.mockRestore();
    setItemSpy?.mockRestore();

    mockLocalStorage.clear();

    // Reset Platform.OS to 'web' before each test
    mockReactNative.Platform.OS = 'web';
  });

  describe('fetchProfiles', () => {
    it('should fetch and return an empty array when no profiles are stored', async () => {
      getItemSpy = jest.spyOn(window.localStorage, 'getItem').mockReturnValue(null);
      const { result } = renderHook(() => useGameStorage());

      // The hook's useEffect runs on mount, so we wait for the result
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.profiles).toEqual([]);
      expect(getItemSpy).toHaveBeenCalledWith('game_profiles');
    });

    it('should fetch and return stored profiles', async () => {
      const storedProfiles: SaveProfile[] = [
        { ...mockProfile, id: '1', createdAt: new Date().toISOString() },
      ];
      getItemSpy = jest.spyOn(window.localStorage, 'getItem').mockReturnValue(JSON.stringify(storedProfiles));
      const { result } = renderHook(() => useGameStorage());

      await waitFor(() => {
        expect(result.current.profiles).toEqual(storedProfiles);
      });
      expect(result.current.loading).toBe(false);
    });

    it('should handle native platform correctly', async () => {
        mockReactNative.Platform.OS = 'ios';
        const storedProfiles: SaveProfile[] = [
          { ...mockProfile, id: '1', createdAt: new Date().toISOString() },
        ];
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(storedProfiles));

        const { result } = renderHook(() => useGameStorage());

        await waitFor(() => {
            expect(result.current.profiles).toEqual(storedProfiles);
        });

        expect(AsyncStorage.getItem).toHaveBeenCalledWith('game_profiles');
      });
  });

  describe('addProfile', () => {
    it('should add a new profile', async () => {
      setItemSpy = jest.spyOn(window.localStorage, 'setItem');
      const { result } = renderHook(() => useGameStorage());

      // Wait for initial fetch to complete
      await waitFor(() => expect(result.current.loading).toBe(false));

      let newProfile;
      await act(async () => {
        newProfile = await result.current.addProfile(mockProfile);
      });

      await waitFor(() => {
        expect(result.current.profiles.length).toBe(1);
        expect(result.current.profiles[0].id).toBe(newProfile!.id);
      });
      expect(setItemSpy).toHaveBeenCalled();
    });

    it('should not add a new profile if the limit is reached', async () => {
        const initialProfiles: SaveProfile[] = Array(5)
        .fill(0)
        .map((_, i) => ({
          ...mockProfile,
          id: i.toString(),
          createdAt: new Date().toISOString(),
        }));

      getItemSpy = jest.spyOn(window.localStorage, 'getItem').mockReturnValue(JSON.stringify(initialProfiles));
      setItemSpy = jest.spyOn(window.localStorage, 'setItem');

      const { result } = renderHook(() => useGameStorage());

      // Let the hook initialize with the 5 profiles
      await waitFor(() => expect(result.current.profiles.length).toBe(5));

      await act(async () => {
        await result.current.addProfile(mockProfile);
      });

      expect(result.current.profiles.length).toBe(5);
      // setItem should not be called again after the initial load
      expect(setItemSpy).not.toHaveBeenCalled();
    });
  });

  describe('updateProfile', () => {
    it('should update an existing profile', async () => {
      const initialProfiles: SaveProfile[] = [
        { ...mockProfile, id: '1', createdAt: new Date().toISOString() },
      ];
      getItemSpy = jest.spyOn(window.localStorage, 'getItem').mockReturnValue(JSON.stringify(initialProfiles));
      setItemSpy = jest.spyOn(window.localStorage, 'setItem');

      const { result } = renderHook(() => useGameStorage());

      await waitFor(() => expect(result.current.profiles.length).toBe(1));

      const updatedProfile: SaveProfile = {
        ...initialProfiles[0],
        resources: {
            ...initialProfiles[0].resources,
            resource_1: 200,
            resource_2: 200,
            money: 2000
        },
      };

      await act(async () => {
        const { id, ...profileData } = updatedProfile;
        await result.current.updateProfile('1', profileData);
      });

      await waitFor(() => {
        expect(result.current.profiles[0].resources.money).toBe(2000);
      });
      expect(setItemSpy).toHaveBeenCalled();
    });
  });

  describe('deleteProfile', () => {
    it('should delete a profile', async () => {
      const initialProfiles: SaveProfile[] = [
        { ...mockProfile, id: '1', createdAt: new Date().toISOString() },
        { ...mockProfile, id: '2', createdAt: new Date().toISOString() },
      ];
      getItemSpy = jest.spyOn(window.localStorage, 'getItem').mockReturnValue(JSON.stringify(initialProfiles));
      setItemSpy = jest.spyOn(window.localStorage, 'setItem');

      const { result } = renderHook(() => useGameStorage());

      await waitFor(() => expect(result.current.profiles.length).toBe(2));

      await act(async () => {
        await result.current.deleteProfile('1');
      });

      await waitFor(() => {
          expect(result.current.profiles.length).toBe(1);
      });
      expect(result.current.profiles[0].id).toBe('2');
      expect(setItemSpy).toHaveBeenCalled();
    });
  });
});
