/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Audio } from 'expo-av';
import { useAudio } from './useAudio';
import { Platform } from 'react-native';

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

// Mock expo-av and Platform
jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(),
    },
  },
}));

jest.mock('react-native', () => {
  const RNCore = jest.requireActual('react-native');
  // We need to be able to change Platform.OS in our tests
  RNCore.Platform = {
    ...RNCore.Platform,
    OS: 'ios',
  };
  return RNCore;
});

const createAsyncMock = Audio.Sound.createAsync as jest.Mock;

describe('useAudio', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createAsyncMock
      .mockResolvedValueOnce({ sound: mockClickSound })
      .mockResolvedValueOnce({ sound: mockBgmSounds[0] })
      .mockResolvedValueOnce({ sound: mockBgmSounds[1] })
      .mockResolvedValueOnce({ sound: mockBgmSounds[2] });
  });

  describe('on native platforms', () => {
    beforeEach(() => {
      (Platform.OS as any) = 'ios';
    });

    it('should load all sounds on mount and play the first BGM track', async () => {
      const { result } = renderHook(() => useAudio());
      await waitFor(() => expect(result.current.isLoaded).toBe(true));
      expect(mockBgmSounds[0].playAsync).toHaveBeenCalled();
    });

    it('should play the next track when the current one finishes', async () => {
        const { result } = renderHook(() => useAudio());
        await waitFor(() => expect(result.current.isLoaded).toBe(true));
        const statusUpdateCallback = mockBgmSounds[0].setOnPlaybackStatusUpdate.mock.calls[0][0];
        act(() => statusUpdateCallback({ isLoaded: true, didJustFinish: true }));
        await waitFor(() => expect(mockBgmSounds[1].playAsync).toHaveBeenCalled());
    });

    it('should loop back to the first track after the last one finishes', async () => {
        const { result } = renderHook(() => useAudio());
        await waitFor(() => expect(result.current.isLoaded).toBe(true));

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
        const { result } = renderHook(() => useAudio());
        await waitFor(() => expect(result.current.isLoaded).toBe(true));
        mockBgmSounds[0].getStatusAsync.mockResolvedValue({ isLoaded: true, isPlaying: true });
        act(() => result.current.setPlayBGM(false));
        await waitFor(() => expect(mockBgmSounds[0].stopAsync).toHaveBeenCalled());
      });

      it('should unload all sounds on unmount', async () => {
        const { result, unmount } = renderHook(() => useAudio());
        await waitFor(() => expect(result.current.isLoaded).toBe(true));
        unmount();
        await waitFor(() => {
          expect(mockClickSound.unloadAsync).toHaveBeenCalled();
          mockBgmSounds.forEach(sound => expect(sound.unloadAsync).toHaveBeenCalled());
        });
      });
  });

  describe('on web platform', () => {
    beforeEach(() => {
      (Platform.OS as any) = 'web';
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it.skip('should not play BGM on mount until user interacts', async () => {
      const eventMap: { [key: string]: Function } = {};
      jest.spyOn(window, 'addEventListener').mockImplementation((event, cb) => {
        eventMap[event] = cb as Function;
      });

      const { result } = renderHook(() => useAudio());

      await waitFor(() => expect(result.current.isLoaded).toBe(true));
      expect(mockBgmSounds[0].playAsync).not.toHaveBeenCalled();

      act(() => {
        eventMap.click();
      });

      await waitFor(() => expect(mockBgmSounds[0].playAsync).toHaveBeenCalled());
    });

    it.skip('should remove event listeners after first interaction', async () => {
      const eventMap: { [key: string]: Function } = {};
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener').mockImplementation((event, cb) => {
        eventMap[event] = cb as Function;
      });
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const { result } = renderHook(() => useAudio());

      await waitFor(() => expect(result.current.isLoaded).toBe(true));

      expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      act(() => {
        eventMap.click();
      });

      await waitFor(() => {
        expect(removeEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
        expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      });
    });
  });
});