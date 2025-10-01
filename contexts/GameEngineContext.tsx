import { createContext, useContext, ReactNode } from 'react';
import { useGameEngine, GameEngineHook } from '@/hooks/useGameEngine';

// Define the shape of the context value, using the explicit interface
const GameEngineContext = createContext<GameEngineHook | undefined>(undefined);

// Create a provider component that no longer requires initialProfile
export function GameEngineProvider({ children }: { children: ReactNode }) {
  const gameEngine = useGameEngine(); // The hook is now self-contained
  return (
    <GameEngineContext.Provider value={gameEngine}>
      {children}
    </GameEngineContext.Provider>
  );
}

// Create a custom hook to use the context
export function useGameEngineContext() {
  const context = useContext(GameEngineContext);
  if (context === undefined) {
    throw new Error('useGameEngineContext must be used within a GameEngineProvider');
  }
  return context;
}