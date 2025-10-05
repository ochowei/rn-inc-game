import { renderHook, act, waitFor } from '@testing-library/react';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAudio } from './useAudio';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock Sound objects
const mockClickSound = {
  unloadAsync: jest.fn().mockResolvedValue(undefined),
  replayAsync: jest.fn().mockResolvedValue(undefined),
  getStatusAsync: jest.fn().mockResolvedValue({ isLoaded: true, isPlaying: false }),
};

const mockBgmSound = {
  unloadAsync: jest.fn().mockResolvedValue(undefined),
  playAsync: jest.fn().mockResolvedValue(undefined),
  stopAsync: jest.fn().mockResolvedValue(undefined),
  setPositionAsync: jest.fn().mockResolvedValue(undefined),
  setIsLoopingAsync: jest.fn().mockResolvedValue(undefined),
  getStatusAsync: jest.fn().mockResolvedValue({ isLoaded: true, isPlaying: false }),
};

// Mock expo-av
jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(),
    },
  },
}));

const createAsyncMock = Audio.Sound.createAsync as jest.Mock;
const getItemMock = AsyncStorage.getItem as jest.Mock;
const setItemMock = AsyncStorage.setItem as jest.Mock;

describe('useAudio', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    createAsyncMock
      .mockResolvedValueOnce({ sound: mockClickSound })
      .mockResolvedValueOnce({ sound: mockBgmSound });
    getItemMock.mockResolvedValue(null); // Default to no saved settings
    (mockBgmSound.getStatusAsync as jest.Mock).mockResolvedValue({ isLoaded: true, isPlaying: false });
  });

  it('should initialize, load sounds, and play BGM by default', async () => {
    const { result } = renderHook(() => useAudio());

    await waitFor(() => {
      expect(result.current.isBgmOn).toBe(true);
      expect(mockBgmSound.playAsync).toHaveBeenCalled();
    });
  });

  it('should load saved settings from AsyncStorage and not play BGM if saved setting is off', async () => {
    getItemMock.mockImplementation(async (key: string) => {
      if (key === 'isBgmOn') return 'false';
      if (key === 'isSfxOn') return 'false';
      return null;
    });

    const { result } = renderHook(() => useAudio());

    await waitFor(() => {
      expect(result.current.isBgmOn).toBe(false);
      expect(result.current.isSfxOn).toBe(false);
    });

    expect(mockBgmSound.playAsync).not.toHaveBeenCalled();
  });

  it('should toggle BGM, save to storage, and stop/play music', async () => {
    const { result } = renderHook(() => useAudio());

    // Wait for initial state to be set and BGM to play
    await waitFor(() => expect(mockBgmSound.playAsync).toHaveBeenCalledTimes(1));
    expect(result.current.isBgmOn).toBe(true);

    // Mock that BGM is now playing to test the stop functionality
    (mockBgmSound.getStatusAsync as jest.Mock).mockResolvedValue({ isLoaded: true, isPlaying: true });

    // Toggle BGM off
    await act(async () => {
      await result.current.toggleBGM();
    });

    expect(setItemMock).toHaveBeenCalledWith('isBgmOn', 'false');
    expect(result.current.isBgmOn).toBe(false);
    await waitFor(() => expect(mockBgmSound.stopAsync).toHaveBeenCalledTimes(1));

    // Mock that BGM is now stopped to test the play functionality
    (mockBgmSound.getStatusAsync as jest.Mock).mockResolvedValue({ isLoaded: true, isPlaying: false });

    // Toggle BGM on
    await act(async () => {
      await result.current.toggleBGM();
    });

    expect(setItemMock).toHaveBeenCalledWith('isBgmOn', 'true');
    expect(result.current.isBgmOn).toBe(true);
    await waitFor(() => expect(mockBgmSound.playAsync).toHaveBeenCalledTimes(2));
  });

  it('should save SFX setting to AsyncStorage when toggled', async () => {
    const { result } = renderHook(() => useAudio());
    await waitFor(() => expect(result.current.isSfxOn).toBe(true));

    await act(async () => {
      await result.current.toggleSfx();
    });

    expect(setItemMock).toHaveBeenCalledWith('isSfxOn', 'false');
    expect(result.current.isSfxOn).toBe(false);
  });
});