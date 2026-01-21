import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export enum GameState {
  HOME = 'HOME',
  CASINO_FLOOR = 'CASINO_FLOOR',
  SLOTS = 'SLOTS',
  BLACKJACK = 'BLACKJACK',
  ROULETTE = 'ROULETTE',
  HORSE_RACING = 'HORSE_RACING',
  STORY_SCENE = 'STORY_SCENE',
  SCRAP_YARD = 'SCRAP_YARD'
}

interface GameContextType {
  money: number;
  setMoney: (amount: number | ((prev: number) => number)) => void;
  gameState: GameState;
  setGameState: (state: GameState) => void;
  day: number;
  setDay: (day: number) => void;
  storyProgress: number;
  setStoryProgress: (progress: number) => void;
  addMoney: (amount: number) => void;
  goal: number;
  assets: Record<string, string>;
  setAsset: (key: string, url: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [money, setMoney] = useState(500); // Starting seed money
  const [gameState, setGameState] = useState<GameState>(GameState.HOME);
  const [day, setDay] = useState(1);
  const [storyProgress, setStoryProgress] = useState(0);
  const [assets, setAssets] = useState<Record<string, string>>({});
  const goal = 10000;

  const addMoney = (amount: number) => {
    setMoney((prev) => Math.max(0, prev + amount));
  };

  const setAsset = (key: string, url: string) => {
    setAssets(prev => ({ ...prev, [key]: url }));
  };

  return (
    <GameContext.Provider
      value={{
        money,
        setMoney,
        gameState,
        setGameState,
        day,
        setDay,
        storyProgress,
        setStoryProgress,
        addMoney,
        goal,
        assets,
        setAsset,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
