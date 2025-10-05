import { renderHook, act, waitFor } from '@testing-library/react';
import { Audio } from 'expo-av';
import { useAudio } from './useAudio';

// Mock Sound objects
const mockClickSound = {
  unloadAsync: jest.fn().mockResolvedValue(undefined),
  replayAsync: jest.fn().mockResolvedValue(undefined),
  setIsMutedAsync: jest.fn().mockResolvedValue(undefined),
  getStatusAsync: jest.fn().mockResolvedValue({ isLoaded: true, isPlaying: false }),
};

const mockBgmSound = {
  unloadAsync: jest.fn().mockResolvedValue(undefined),
  playAsync: jest.fn().mockResolvedValue(undefined),
  stopAsync: jest.fn().mockResolvedValue(undefined),
  setIsLoopingAsync: jest.fn().mockResolvedValue(undefined),
  setIsMutedAsync: jest.fn().mockResolvedValue(undefined),
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
  });

  it('should load sounds on mount', async () => {
    renderHook(() => useAudio());
    await waitFor(() => expect(createAsyncMock).toHaveBeenCalledTimes(2));

    expect(createAsyncMock).toHaveBeenCalledWith(require('../assets/audio/click.mp3'));
    expect(createAsyncMock).toHaveBeenCalledWith(require('../assets/audio/bgm.mp3'));
    expect(mockBgmSound.setIsLoopingAsync).toHaveBeenCalledWith(true);
  });

  it('should play click sound when not muted', async () => {
    const { result } = renderHook(() => useAudio());
    await waitFor(() => expect(createAsyncMock).toHaveBeenCalledTimes(2));

    await act(async () => {
      await result.current.playClickSound();
    });

    expect(mockClickSound.replayAsync).toHaveBeenCalled();
  });

  it('should play BGM when not muted', async () => {
    const { result } = renderHook(() => useAudio());
    await waitFor(() => expect(createAsyncMock).toHaveBeenCalledTimes(2));

    await act(async () => {
      await result.current.playBGM();
    });

    expect(mockBgmSound.playAsync).toHaveBeenCalled();
  });

  it('should stop BGM', async () => {
    (mockBgmSound.getStatusAsync as jest.Mock).mockResolvedValue({ isLoaded: true, isPlaying: true });
    const { result } = renderHook(() => useAudio());
    await waitFor(() => expect(createAsyncMock).toHaveBeenCalledTimes(2));

    await act(async () => {
      await result.current.stopBGM();
    });

    expect(mockBgmSound.stopAsync).toHaveBeenCalled();
  });

  it('should toggle mute state and mute/unmute sounds', async () => {
    const { result } = renderHook(() => useAudio());
    await waitFor(() => expect(createAsyncMock).toHaveBeenCalledTimes(2));

    // Mute
    await act(async () => {
      await result.current.toggleMute();
    });

    expect(result.current.isMuted).toBe(true);
    expect(mockBgmSound.setIsMutedAsync).toHaveBeenCalledWith(true);
    expect(mockClickSound.setIsMutedAsync).toHaveBeenCalledWith(true);

    // Unmute
    await act(async () => {
      await result.current.toggleMute();
    });

    expect(result.current.isMuted).toBe(false);
    expect(mockBgmSound.setIsMutedAsync).toHaveBeenCalledWith(false);
    expect(mockClickSound.setIsMutedAsync).toHaveBeenCalledWith(false);
  });
});