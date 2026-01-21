import { motion } from 'motion/react';
import { useGame, GameState } from '../hooks/useGame';
import { Spade, Zap, Target, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { generateGameImage } from '../services/imageService';

const GAMES = [
  {
    id: GameState.SLOTS,
    name: 'Lucky Grandma Slots',
    description: 'Spin to win big! High volatility, high reward.',
    icon: Zap,
    color: 'from-purple-600 to-indigo-600',
    image: 'https://picsum.photos/seed/slots/400/300'
  },
  {
    id: GameState.BLACKJACK,
    name: 'High Stakes Blackjack',
    description: 'Beat the dealer. Skill and strategy required.',
    icon: Spade,
    color: 'from-emerald-600 to-teal-600',
    image: 'https://picsum.photos/seed/blackjack/400/300'
  },
  {
    id: GameState.ROULETTE,
    name: 'Neon Roulette',
    description: 'Place your bets on the spinning wheel of fate.',
    icon: Target,
    color: 'from-rose-600 to-pink-600',
    image: 'https://picsum.photos/seed/roulette/400/300'
  },
  {
    id: GameState.HORSE_RACING,
    name: 'Derby Dreams',
    description: 'Bet on the fastest fillies in the city.',
    icon: Trophy,
    color: 'from-amber-600 to-orange-600',
    image: 'https://picsum.photos/seed/horses/400/300'
  }
];

export default function CasinoFloor() {
  const { setGameState, money, assets, setAsset } = useGame();
  const [loading, setLoading] = useState(!assets['casino_bg']);
  const vipThreshold = 5000;

  useEffect(() => {
    if (!assets['casino_bg']) {
      generateGameImage("A cozy but glitzy 16-bit pixel art casino called 'Grandma's Casio', neon signs with a grandmother's face, slot machines, Sierra style, King's Quest IV aesthetic, vibrant colors, dithering.")
        .then(url => {
          setAsset('casino_bg', url);
          setLoading(false);
        });
    }
  }, []);

  const bgImage = assets['casino_bg'] || "https://picsum.photos/seed/casino/1920/1080?blur=4";

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-full overflow-y-auto bg-cover bg-center pt-24 pb-12 px-6"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/60" />
      
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
          <div className="sierra-box p-4 animate-pulse">
            <span className="text-xs text-sierra-yellow">ENTERING CASINO...</span>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-6xl mx-auto">
        <header className="mb-12 text-center">
          <motion.h1 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-2xl md:text-4xl font-bold text-sierra-yellow drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]"
          >
            GRANDMA'S CASIO
          </motion.h1>
          <p className="text-sierra-light-gray mt-4 uppercase tracking-widest text-[8px]">Premium Entertainment District</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {GAMES.map((game, index) => (
            <motion.button
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setGameState(game.id)}
              className="group sierra-box flex flex-col overflow-hidden transition-all hover:border-sierra-white"
            >
              <div className="h-32 relative overflow-hidden border-b-4 border-sierra-yellow">
                <img 
                  src={game.image} 
                  alt={game.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 right-2 p-1 bg-black border-2 border-sierra-white">
                  <game.icon className="w-4 h-4 text-sierra-white" />
                </div>
              </div>
              
              <div className="p-4 text-left flex flex-col flex-grow bg-sierra-blue">
                <h3 className="text-[10px] font-bold text-sierra-yellow mb-2 group-hover:text-sierra-white transition-colors">{game.name}</h3>
                <p className="text-sierra-light-gray text-[8px] mb-4 flex-grow leading-relaxed">{game.description}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-[8px] uppercase font-bold text-sierra-cyan">Min: $10</span>
                  <div className="sierra-button !px-2 !py-1 !text-[8px]">
                    PLAY
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="mt-12 p-6 sierra-box flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-black border-4 border-sierra-dark-gray flex items-center justify-center">
              <Zap className="w-6 h-6 text-sierra-dark-gray" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-sierra-yellow">VIP High Roller Lounge</h4>
              <p className="text-[8px] text-sierra-light-gray mt-1">Unlock at ${vipThreshold.toLocaleString()} bankroll.</p>
            </div>
          </div>
          <button 
            disabled={money < vipThreshold}
            className={`sierra-button ${money < vipThreshold ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
          >
            {money < vipThreshold ? 'LOCKED' : 'ENTER'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
