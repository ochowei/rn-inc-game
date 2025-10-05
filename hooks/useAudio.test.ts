import { renderHook, act, waitFor } from '@testing-library/react';
import { Audio } from 'expo-av';
import { useAudio } from './useAudio';

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

describe('useAudio', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Re-prime the mocks for each test run
    createAsyncMock
      .mockResolvedValueOnce({ sound: mockClickSound })
      .mockResolvedValueOnce({ sound: mockBgmSound });
    // Reset BGM status mock
    (mockBgmSound.getStatusAsync as jest.Mock).mockResolvedValue({ isLoaded: true, isPlaying: false });
  });

  it('should load sounds on mount and play BGM by default', async () => {
    renderHook(() => useAudio());
    await waitFor(() => expect(createAsyncMock).toHaveBeenCalledTimes(2));

    expect(createAsyncMock).toHaveBeenCalledWith(require('../assets/audio/click.mp3'));
    expect(createAsyncMock).toHaveBeenCalledWith(require('../assets/audio/bgm-1.mp3'));
    expect(mockBgmSound.setIsLoopingAsync).toHaveBeenCalledWith(true);

    // BGM should play by default because isBgmOn is true initially
    await waitFor(() => expect(mockBgmSound.playAsync).toHaveBeenCalled());
  });

  it('should play click sound when SFX is on', async () => {
    const { result } = renderHook(() => useAudio());
    await waitFor(() => expect(createAsyncMock).toHaveBeenCalledTimes(2));

    await act(async () => {
      await result.current.playClickSound();
    });

    expect(mockClickSound.replayAsync).toHaveBeenCalled();
  });

  it('should NOT play click sound when SFX is off', async () => {
    const { result } = renderHook(() => useAudio());
    await waitFor(() => expect(createAsyncMock).toHaveBeenCalledTimes(2));

    // Toggle SFX off
    act(() => {
      result.current.toggleSfx();
    });

    await act(async () => {
      await result.current.playClickSound();
    });

    expect(mockClickSound.replayAsync).not.toHaveBeenCalled();
  });

  it('should stop BGM when toggled off and play when toggled on', async () => {
    const { result } = renderHook(() => useAudio());
    // Wait for initial play call from useEffect
    await waitFor(() => expect(mockBgmSound.playAsync).toHaveBeenCalledTimes(1));
    expect(result.current.isBgmOn).toBe(true);

    // Set status to playing to test stop functionality
    (mockBgmSound.getStatusAsync as jest.Mock).mockResolvedValue({ isLoaded: true, isPlaying: true });

    // Toggle BGM off
    act(() => {
      result.current.toggleBGM();
    });

    await waitFor(() => expect(result.current.isBgmOn).toBe(false));
    expect(mockBgmSound.stopAsync).toHaveBeenCalledTimes(1);

    // Toggle BGM on again
    (mockBgmSound.getStatusAsync as jest.Mock).mockResolvedValue({ isLoaded: true, isPlaying: false });
    act(() => {
      result.current.toggleBGM();
    });

    await waitFor(() => expect(result.current.isBgmOn).toBe(true));
    // It's called once on load, and once when toggled back on.
    expect(mockBgmSound.playAsync).toHaveBeenCalledTimes(2);
  });

  it('should toggle SFX state', async () => {
    const { result } = renderHook(() => useAudio());
    await waitFor(() => expect(createAsyncMock).toHaveBeenCalledTimes(2));

    expect(result.current.isSfxOn).toBe(true);

    act(() => {
      result.current.toggleSfx();
    });

    expect(result.current.isSfxOn).toBe(false);

    act(() => {
      result.current.toggleSfx();
    });

    expect(result.current.isSfxOn).toBe(true);
  });
});