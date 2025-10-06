import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Audio } from 'expo-av';
import { useAudio } from './useAudio';

// Helper function to create a mock sound
const createMockSound = () => ({
  unloadAsync: jest.fn().mockResolvedValue(undefined),
  replayAsync: jest.fn().mockResolvedValue(undefined),
  playAsync: jest.fn().mockResolvedValue(undefined),
  stopAsync: jest.fn().mockResolvedValue(undefined),
  getStatusAsync: jest.fn().mockResolvedValue({ isLoaded: true, isPlaying: false }),
  setOnPlaybackStatusUpdate: jest.fn(),
});

// Mock Sound objects
const mockClickSound = createMockSound();
const mockBgmSounds = [createMockSound(), createMockSound(), createMockSound()];

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
    jest.clearAllMocks();
    // Setup mock implementations for createAsync
createAsyncMock
      .mockResolvedValueOnce({ sound: mockClickSound })
      .mockResolvedValueOnce({ sound: mockBgmSounds[0] })
      .mockResolvedValueOnce({ sound: mockBgmSounds[1] })
      .mockResolvedValueOnce({ sound: mockBgmSounds[2] });
  });

  it('should load all sounds on mount and play the first BGM track', async () => {
    renderHook(() => useAudio());

    await waitFor(() => {
      expect(createAsyncMock).toHaveBeenCalledTimes(4);
      expect(mockBgmSounds[0].playAsync).toHaveBeenCalled();
    });
  });

  it('should play the next track when the current one finishes', async () => {
    renderHook(() => useAudio());

    await waitFor(() => expect(mockBgmSounds[0].playAsync).toHaveBeenCalled());

    const statusUpdateCallback = mockBgmSounds[0].setOnPlaybackStatusUpdate.mock.calls[0][0];
    act(() => {
      statusUpdateCallback({ isLoaded: true, didJustFinish: true });
    });

    await waitFor(() => expect(mockBgmSounds[1].playAsync).toHaveBeenCalled());
  });

  it('should loop back to the first track after the last one finishes', async () => {
    renderHook(() => useAudio());
    await waitFor(() => expect(mockBgmSounds[0].playAsync).toHaveBeenCalled());

    const firstTrackCallback = mockBgmSounds[0].setOnPlaybackStatusUpdate.mock.calls[0][0];
    act(() => firstTrackCallback({ isLoaded: true, didJustFinish: true }));
    await waitFor(() => expect(mockBgmSounds[1].playAsync).toHaveBeenCalled());

    const secondTrackCallback = mockBgmSounds[1].setOnPlaybackStatusUpdate.mock.calls[0][0];
    act(() => secondTrackCallback({ isLoaded: true, didJustFinish: true }));
    await waitFor(() => expect(mockBgmSounds[2].playAsync).toHaveBeenCalled());

    const thirdTrackCallback = mockBgmSounds[2].setOnPlaybackStatusUpdate.mock.calls[0][0];
    act(() => thirdTrackCallback({ isLoaded: true, didJustFinish: true }));

    await waitFor(() => expect(mockBgmSounds[0].playAsync).toHaveBeenCalledTimes(2));
  });

  it('should stop BGM when setPlayBGM is false', async () => {
    // Mock the first getStatusAsync call to return isPlaying: false, so playAsync is called.
    mockBgmSounds[0].getStatusAsync.mockResolvedValueOnce({ isLoaded: true, isPlaying: false });
    const { result } = renderHook(() => useAudio());

    // Wait for the BGM to start playing.
    await waitFor(() => expect(mockBgmSounds[0].playAsync).toHaveBeenCalled());

    // Now, mock getStatusAsync to return isPlaying: true for the stop function.
    mockBgmSounds[0].getStatusAsync.mockResolvedValue({ isLoaded: true, isPlaying: true });

    act(() => {
      result.current.setPlayBGM(false);
    });

    await waitFor(() => expect(mockBgmSounds[0].stopAsync).toHaveBeenCalled());
  });

  it('should unload all sounds on unmount', async () => {
    const { unmount } = renderHook(() => useAudio());
    await waitFor(() => expect(createAsyncMock).toHaveBeenCalledTimes(4));

    unmount();

    await waitFor(() => {
      expect(mockClickSound.unloadAsync).toHaveBeenCalled();
      mockBgmSounds.forEach(sound => {
        expect(sound.unloadAsync).toHaveBeenCalled();
      });
    });
  });
});