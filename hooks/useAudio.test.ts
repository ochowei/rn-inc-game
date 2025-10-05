import { renderHook, act, waitFor } from '@testing-library/react';
import { Audio } from 'expo-av';
import { useAudio } from './useAudio';

// Mock Sound objects
const mockClickSound = {
  unloadAsync: jest.fn().mockResolvedValue(undefined),
  replayAsync: jest.fn().mockResolvedValue(undefined),
};

const mockBgmSound = {
  unloadAsync: jest.fn().mockResolvedValue(undefined),
  playAsync: jest.fn().mockResolvedValue(undefined),
  stopAsync: jest.fn().mockResolvedValue(undefined),
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
    const { result } = renderHook(() => useAudio());
    await waitFor(() => expect(result.current.playBGM).toBe(true));

    expect(createAsyncMock).toHaveBeenCalledWith(require('../assets/audio/click.mp3'));
    expect(createAsyncMock).toHaveBeenCalledWith(require('../assets/audio/bgm-1.mp3'));
    expect(mockBgmSound.setIsLoopingAsync).toHaveBeenCalledWith(true);

    // BGM should play by default because playBGM is initially true
    await waitFor(() => expect(mockBgmSound.playAsync).toHaveBeenCalled());
  });

  it('should play click sound', async () => {
    const { result } = renderHook(() => useAudio());
    await waitFor(() => expect(createAsyncMock).toHaveBeenCalledTimes(2));

    await act(async () => {
      await result.current.playClickSound();
    });

    expect(mockClickSound.replayAsync).toHaveBeenCalled();
  });

  it('should stop BGM when playBGM is set to false', async () => {
    // Simulate BGM is already playing
    (mockBgmSound.getStatusAsync as jest.Mock).mockResolvedValue({ isLoaded: true, isPlaying: true });
    const { result } = renderHook(() => useAudio());
    await waitFor(() => expect(result.current.playBGM).toBe(true));

    await act(() => {
      result.current.setPlayBGM(false);
    });

    expect(result.current.playBGM).toBe(false);
    await waitFor(() => expect(mockBgmSound.stopAsync).toHaveBeenCalled());
  });

  it('should play BGM when playBGM is set to true after being disabled', async () => {
    // Start with BGM playing, so playAsync is not called on mount
    (mockBgmSound.getStatusAsync as jest.Mock).mockResolvedValueOnce({ isLoaded: true, isPlaying: true });
    const { result } = renderHook(() => useAudio());
    await waitFor(() => expect(result.current.playBGM).toBe(true));

    // Disable BGM
    await act(async () => {
      result.current.setPlayBGM(false);
    });

    await waitFor(() => expect(result.current.playBGM).toBe(false));
    await waitFor(() => expect(mockBgmSound.stopAsync).toHaveBeenCalled());

    // Enable BGM again
    (mockBgmSound.getStatusAsync as jest.Mock).mockResolvedValue({ isLoaded: true, isPlaying: false });
    await act(async () => {
      result.current.setPlayBGM(true);
    });

    await waitFor(() => expect(result.current.playBGM).toBe(true));
    // Should be called once when re-enabled
    await waitFor(() => expect(mockBgmSound.playAsync).toHaveBeenCalledTimes(1));
  });

  it('should unload sounds on unmount', async () => {
    const { unmount } = renderHook(() => useAudio());
    await waitFor(() => expect(createAsyncMock).toHaveBeenCalledTimes(2));

    unmount();

    expect(mockClickSound.unloadAsync).toHaveBeenCalled();
    expect(mockBgmSound.unloadAsync).toHaveBeenCalled();
  });
});