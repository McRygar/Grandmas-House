import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame, GameState } from '../../hooks/useGame';
import { Coins, RefreshCw, ChevronLeft } from 'lucide-react';
import { generateGameImage } from '../../services/imageService';

const SYMBOLS = ['🍒', '🍋', '🔔', '💎', '7️⃣', '👵'];
const PAYOUTS: Record<string, number> = {
  '🍒': 2,
  '🍋': 5,
  '🔔': 10,
  '💎': 25,
  '7️⃣': 50,
  '👵': 100,
};

export default function Slots() {
  const { money, addMoney, setGameState, assets, setAsset } = useGame();
  const [reels, setReels] = useState(['🍒', '🍒', '🍒']);
  const [spinning, setSpinning] = useState(false);
  const [bet, setBet] = useState(10);
  const [lastWin, setLastWin] = useState(0);
  const [loading, setLoading] = useState(!assets['slots_bg']);

  useEffect(() => {
    if (!assets['slots_bg']) {
      generateGameImage("A close up of a retro mechanical slot machine with bright lights, 16-bit pixel art, Sierra style, King's Quest IV aesthetic, vibrant colors, dithering.")
        .then(url => {
          setAsset('slots_bg', url);
          setLoading(false);
        });
    }
  }, []);

  const bgImage = assets['slots_bg'] || "https://picsum.photos/seed/slots/1280/720?blur=4";

  const spin = () => {
    if (money < bet || spinning) return;
    
    addMoney(-bet);
    setSpinning(true);
    setLastWin(0);

    const spinDuration = 1500;
    const interval = 100;
    let elapsed = 0;

    const timer = setInterval(() => {
      setReels([
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      ]);
      elapsed += interval;
      if (elapsed >= spinDuration) {
        clearInterval(timer);
        finishSpin();
      }
    }, interval);
  };

  const finishSpin = () => {
    const finalReels = [
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    ];
    
    // Rigging it slightly for Grandma's sake? No, let's keep it fair-ish but fun.
    // 10% chance to force a win if they are losing? Maybe later.
    
    setReels(finalReels);
    setSpinning(false);

    if (finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2]) {
      const winAmount = bet * PAYOUTS[finalReels[0]];
      addMoney(winAmount);
      setLastWin(winAmount);
    } else if (finalReels[0] === finalReels[1] || finalReels[1] === finalReels[2] || finalReels[0] === finalReels[2]) {
      const winAmount = Math.floor(bet * 1.5);
      addMoney(winAmount);
      setLastWin(winAmount);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-full h-full flex flex-col items-center justify-center p-6 bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/60" />
      
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
          <div className="sierra-box p-4 animate-pulse">
            <span className="text-xs text-sierra-yellow">LOADING SLOTS...</span>
          </div>
        </div>
      )}

      <div className="relative z-10 w-full max-w-2xl sierra-box p-8">
        <div className="flex justify-between items-center mb-8 border-b-4 border-sierra-yellow pb-4">
          <button 
            onClick={() => setGameState(GameState.CASINO_FLOOR)}
            className="sierra-button !p-1"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-xs font-bold text-sierra-yellow uppercase">LUCKY GRANDMA</h2>
          <div className="w-8" />
        </div>

        <div className="flex gap-4 justify-center mb-12">
          {reels.map((symbol, i) => (
            <motion.div
              key={i}
              animate={spinning ? { y: [0, -10, 10, 0] } : {}}
              transition={{ repeat: spinning ? Infinity : 0, duration: 0.1 }}
              className="w-24 h-32 bg-black border-4 border-sierra-dark-gray flex items-center justify-center text-4xl shadow-inner"
            >
              {symbol}
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-sierra-blue p-3 border-2 border-sierra-yellow">
              <span className="text-sierra-white font-bold uppercase text-[8px]">Bet</span>
              <div className="flex items-center gap-4">
                <button onClick={() => setBet(Math.max(10, bet - 10))} className="text-sierra-yellow font-bold">-</button>
                <span className="text-xs font-bold text-white">${bet}</span>
                <button onClick={() => setBet(Math.min(money, bet + 10))} className="text-sierra-yellow font-bold">+</button>
              </div>
            </div>
            <div className="h-12 flex items-center justify-center">
              <AnimatePresence>
                {lastWin > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs font-bold text-sierra-light-green"
                  >
                    WIN: ${lastWin}!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={spin}
            disabled={spinning || money < bet}
            className={`w-full h-20 sierra-button text-xs font-bold ${
              spinning || money < bet 
                ? 'opacity-50 grayscale cursor-not-allowed' 
                : ''
            }`}
          >
            {spinning ? 'SPINNING...' : 'SPIN!'}
          </motion.button>
        </div>

        <div className="mt-8 pt-6 border-t-2 border-sierra-dark-gray flex justify-around">
          {Object.entries(PAYOUTS).slice(0, 4).map(([sym, mult]) => (
            <div key={sym} className="text-center">
              <div className="text-xl mb-1">{sym}</div>
              <div className="text-[6px] font-bold text-sierra-light-gray uppercase">x{mult}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
