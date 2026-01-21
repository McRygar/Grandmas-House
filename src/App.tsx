import { motion, AnimatePresence } from 'motion/react';
import { useGame, GameState, GameProvider } from './hooks/useGame';
import HomeBase from './components/HomeBase';
import CasinoFloor from './components/CasinoFloor';
import Slots from './components/games/Slots';
import Blackjack from './components/games/Blackjack';
import Roulette from './components/games/Roulette';
import HorseRacing from './components/games/HorseRacing';
import ScrapYard from './components/games/ScrapYard';
import StoryOverlay from './components/StoryOverlay';
import { DollarSign, Home, Spade, Volume2, VolumeX } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

function GameContainer() {
  const { gameState, money, goal, setGameState } = useGame();
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.2;
    }
  }, []);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.play().catch(e => console.log("Audio play blocked", e));
      } else {
        audioRef.current.pause();
      }
      setIsMuted(!isMuted);
    }
  };

  const renderContent = () => {
    switch (gameState) {
      case GameState.HOME:
        return <HomeBase key="home" />;
      case GameState.CASINO_FLOOR:
        return <CasinoFloor key="casino" />;
      case GameState.SLOTS:
        return <Slots key="slots" />;
      case GameState.BLACKJACK:
        return <Blackjack key="blackjack" />;
      case GameState.ROULETTE:
        return <Roulette key="roulette" />;
      case GameState.HORSE_RACING:
        return <HorseRacing key="horses" />;
      case GameState.SCRAP_YARD:
        return <ScrapYard key="scrap" />;
      default:
        return <HomeBase key="home" />;
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-pixel text-sierra-white">
      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 z-40 p-2 flex justify-between items-center bg-sierra-dark-gray border-b-4 border-sierra-light-gray shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-black border-2 border-sierra-yellow px-4 py-1 flex items-center gap-2">
            <DollarSign className="text-sierra-light-green w-4 h-4" />
            <span className="text-xs">
              {money.toLocaleString()}
            </span>
          </div>
          <div className="hidden md:flex flex-col">
            <div className="text-[8px] uppercase text-sierra-light-gray">Goal: $10,000</div>
            <div className="w-48 h-3 bg-black border-2 border-sierra-dark-gray">
              <motion.div 
                className="h-full bg-sierra-light-green"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (money / goal) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={toggleMusic}
            className="sierra-button !p-1"
            title={isMuted ? "Play Music" : "Mute Music"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          {gameState !== GameState.HOME && (
            <button 
              onClick={() => setGameState(GameState.HOME)}
              className="sierra-button !p-1"
            >
              <Home className="w-4 h-4" />
            </button>
          )}
          {gameState !== GameState.CASINO_FLOOR && gameState !== GameState.HOME && (
            <button 
              onClick={() => setGameState(GameState.CASINO_FLOOR)}
              className="sierra-button !p-1"
            >
              <Spade className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>

      <StoryOverlay />
      
      <audio 
        ref={audioRef}
        src="https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Rolemusic/The_Black_Cat/Rolemusic_-_01_-_The_Black_Cat.mp3"
        loop
      />
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <GameContainer />
    </GameProvider>
  );
}
