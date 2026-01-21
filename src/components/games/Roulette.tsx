import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame, GameState } from '../../hooks/useGame';
import { ChevronLeft, RotateCw } from 'lucide-react';
import { generateGameImage } from '../../services/imageService';

const NUMBERS = [
  { n: 0, color: 'green' },
  { n: 32, color: 'red' }, { n: 15, color: 'black' }, { n: 19, color: 'red' }, { n: 4, color: 'black' },
  { n: 21, color: 'red' }, { n: 2, color: 'black' }, { n: 25, color: 'red' }, { n: 17, color: 'black' },
  { n: 34, color: 'red' }, { n: 6, color: 'black' }, { n: 27, color: 'red' }, { n: 13, color: 'black' },
  { n: 36, color: 'red' }, { n: 11, color: 'black' }, { n: 30, color: 'red' }, { n: 8, color: 'black' },
  { n: 23, color: 'red' }, { n: 10, color: 'black' }, { n: 5, color: 'red' }, { n: 24, color: 'black' },
  { n: 16, color: 'red' }, { n: 33, color: 'black' }, { n: 1, color: 'red' }, { n: 20, color: 'black' },
  { n: 14, color: 'red' }, { n: 31, color: 'black' }, { n: 9, color: 'red' }, { n: 22, color: 'black' },
  { n: 18, color: 'red' }, { n: 29, color: 'black' }, { n: 7, color: 'red' }, { n: 28, color: 'black' },
  { n: 12, color: 'red' }, { n: 35, color: 'black' }, { n: 3, color: 'red' }, { n: 26, color: 'black' },
];

export default function Roulette() {
  const { money, addMoney, setGameState, assets, setAsset } = useGame();
  const [betAmount, setBetAmount] = useState(10);
  const [bets, setBets] = useState<Record<string, number>>({});
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<typeof NUMBERS[0] | null>(null);
  const [winMessage, setWinMessage] = useState('');
  const [loading, setLoading] = useState(!assets['roulette_bg']);

  useEffect(() => {
    if (!assets['roulette_bg']) {
      generateGameImage("A close up of a spinning roulette wheel with a white ball, 16-bit pixel art, Sierra style, King's Quest IV aesthetic, vibrant colors, dithering.")
        .then(url => {
          setAsset('roulette_bg', url);
          setLoading(false);
        });
    }
  }, []);

  const bgImage = assets['roulette_bg'] || "https://picsum.photos/seed/roulette/1280/720?blur=4";

  const placeBet = (type: string) => {
    if (money < betAmount || spinning) return;
    addMoney(-betAmount);
    setBets(prev => ({
      ...prev,
      [type]: (prev[type] || 0) + betAmount
    }));
  };

  const spin = () => {
    if (Object.keys(bets).length === 0 || spinning) return;
    
    setSpinning(true);
    setResult(null);
    setWinMessage('');

    const extraSpins = 5 + Math.random() * 5;
    const finalRotation = rotation + extraSpins * 360;
    setRotation(finalRotation);

    setTimeout(() => {
      const normalizedRotation = finalRotation % 360;
      const index = Math.floor((normalizedRotation / 360) * NUMBERS.length);
      // The wheel rotation is clockwise, so the index is inverse
      const resultIndex = (NUMBERS.length - index) % NUMBERS.length;
      const winningNumber = NUMBERS[resultIndex];
      
      finishSpin(winningNumber);
    }, 4000);
  };

  const finishSpin = (winningNumber: typeof NUMBERS[0]) => {
    setResult(winningNumber);
    setSpinning(false);

    let totalWin = 0;
    Object.entries(bets).forEach(([type, amount]) => {
      const betVal = amount as number;
      if (type === 'red' && winningNumber.color === 'red') totalWin += betVal * 2;
      if (type === 'black' && winningNumber.color === 'black') totalWin += betVal * 2;
      if (type === 'even' && winningNumber.n !== 0 && winningNumber.n % 2 === 0) totalWin += betVal * 2;
      if (type === 'odd' && winningNumber.n % 2 !== 0) totalWin += betVal * 2;
      if (type === winningNumber.n.toString()) totalWin += betVal * 36;
    });

    if (totalWin > 0) {
      addMoney(totalWin);
      setWinMessage(`JACKPOT! You won $${totalWin}!`);
    } else {
      setWinMessage(`The ball landed on ${winningNumber.n} (${winningNumber.color}).`);
    }
    setBets({});
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-full flex flex-col items-center justify-center p-6 bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/60" />
      
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
          <div className="sierra-box p-4 animate-pulse">
            <span className="text-xs text-sierra-yellow">SPINNING UP...</span>
          </div>
        </div>
      )}

      <div className="relative z-10 w-full max-w-6xl bg-slate-900/80 border-4 border-amber-600 rounded-[3rem] p-8 shadow-2xl flex flex-col lg:flex-row gap-12">
        
        {/* Left Side: The Wheel */}
        <div className="flex flex-col items-center gap-8">
          <div className="flex justify-between w-full items-center">
            <button 
              onClick={() => setGameState(GameState.CASINO_FLOOR)}
              className="p-2 hover:bg-slate-800 rounded-full transition-colors"
            >
              <ChevronLeft className="w-8 h-8 text-amber-500" />
            </button>
            <h2 className="text-2xl font-black italic text-amber-500 tracking-tighter">NEON ROULETTE</h2>
            <div className="w-8" />
          </div>

          <div className="relative w-80 h-80 md:w-96 md:h-96">
            <motion.div 
              className="w-full h-full rounded-full border-8 border-amber-900 shadow-2xl relative overflow-hidden"
              animate={{ rotate: rotation }}
              transition={{ duration: 4, ease: "circOut" }}
            >
              {NUMBERS.map((num, i) => (
                <div 
                  key={i}
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1/2 origin-bottom flex flex-col items-center pt-2"
                  style={{ transform: `translateX(-50%) rotate(${(i * 360) / NUMBERS.length}deg)` }}
                >
                  <div className={`w-full h-8 rounded-t-lg flex items-center justify-center text-[10px] font-bold text-white ${
                    num.color === 'red' ? 'bg-rose-600' : num.color === 'black' ? 'bg-slate-900' : 'bg-emerald-600'
                  }`}>
                    {num.n}
                  </div>
                </div>
              ))}
            </motion.div>
            {/* The Pointer */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-12 bg-amber-500 clip-path-triangle z-10 shadow-lg" 
                 style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} />
          </div>

          <div className="text-center h-12">
            <AnimatePresence>
              {winMessage && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`text-xl font-bold ${winMessage.includes('JACKPOT') ? 'text-emerald-400' : 'text-slate-400'}`}
                >
                  {winMessage}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Betting Board */}
        <div className="flex-grow flex flex-col gap-6">
          <div className="grid grid-cols-3 gap-4">
            <BetButton label="RED" color="bg-rose-600" onClick={() => placeBet('red')} amount={bets['red']} />
            <BetButton label="BLACK" color="bg-slate-900" onClick={() => placeBet('black')} amount={bets['black']} />
            <BetButton label="ZERO" color="bg-emerald-600" onClick={() => placeBet('0')} amount={bets['0']} />
            <BetButton label="EVEN" color="bg-slate-800" onClick={() => placeBet('even')} amount={bets['even']} />
            <BetButton label="ODD" color="bg-slate-800" onClick={() => placeBet('odd')} amount={bets['odd']} />
            <div className="flex flex-col items-center justify-center bg-black/40 rounded-2xl border border-slate-800 p-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Wager</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setBetAmount(Math.max(10, betAmount - 10))} className="text-amber-500 font-bold">-</button>
                <span className="font-black text-white">${betAmount}</span>
                <button onClick={() => setBetAmount(Math.min(money, betAmount + 10))} className="text-amber-500 font-bold">+</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-6 gap-2 bg-black/20 p-4 rounded-3xl border border-slate-800">
            {Array.from({ length: 36 }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => placeBet(n.toString())}
                className={`h-10 rounded-lg text-xs font-bold transition-all relative ${
                  NUMBERS.find(num => num.n === n)?.color === 'red' ? 'bg-rose-900/40 border-rose-500/30' : 'bg-slate-800/40 border-slate-600/30'
                } border hover:border-amber-500`}
              >
                {n}
                {bets[n.toString()] > 0 && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-amber-500 rounded-full text-[8px] flex items-center justify-center text-black font-black">
                    ${bets[n.toString()]}
                  </div>
                )}
              </button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={spin}
            disabled={spinning || Object.keys(bets).length === 0}
            className={`w-full py-6 rounded-2xl flex items-center justify-center gap-3 text-2xl font-black italic transition-all shadow-xl ${
              spinning || Object.keys(bets).length === 0
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 text-black'
            }`}
          >
            <RotateCw className={`w-8 h-8 ${spinning ? 'animate-spin' : ''}`} />
            {spinning ? 'WHEEL SPINNING...' : 'SPIN THE WHEEL'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function BetButton({ label, color, onClick, amount }: { label: string; color: string; onClick: () => void; amount?: number }) {
  return (
    <button
      onClick={onClick}
      className={`relative h-20 rounded-2xl flex flex-col items-center justify-center gap-1 border border-white/10 transition-all hover:scale-105 active:scale-95 ${color}`}
    >
      <span className="text-xs font-black italic tracking-widest">{label}</span>
      <span className="text-[10px] opacity-60">PAYS 2:1</span>
      {amount && amount > 0 && (
        <div className="absolute -top-2 -right-2 px-2 py-1 bg-amber-500 rounded-full text-[10px] flex items-center justify-center text-black font-black shadow-lg">
          ${amount}
        </div>
      )}
    </button>
  );
}
