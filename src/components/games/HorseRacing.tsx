import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame, GameState } from '../../hooks/useGame';
import { ChevronLeft, Trophy } from 'lucide-react';
import { generateGameImage } from '../../services/imageService';

const HORSES = [
  { id: 1, name: 'Bingo Queen', color: '#fbbf24', odds: 2, speed: 0.8 },
  { id: 2, name: 'OmniCorp Buster', color: '#f87171', odds: 5, speed: 0.7 },
  { id: 3, name: 'Petunia Power', color: '#c084fc', odds: 10, speed: 0.6 },
  { id: 4, name: 'Feisty Elsie', color: '#60a5fa', odds: 3, speed: 0.75 },
  { id: 5, name: 'Tax Evasion', color: '#4ade80', odds: 20, speed: 0.5 },
];

export default function HorseRacing() {
  const { money, addMoney, setGameState, assets, setAsset } = useGame();
  const [bet, setBet] = useState(100);
  const [selectedHorse, setSelectedHorse] = useState<number | null>(null);
  const [racing, setRacing] = useState(false);
  const [positions, setPositions] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [winner, setWinner] = useState<number | null>(null);
  const [resultMessage, setResultMessage] = useState('');
  const [loading, setLoading] = useState(!assets['horses_bg']);

  useEffect(() => {
    if (!assets['horses_bg']) {
      generateGameImage("A pixel art horse racing track with a crowd in the background, 16-bit pixel art, Sierra style, King's Quest IV aesthetic, vibrant colors, dithering.")
        .then(url => {
          setAsset('horses_bg', url);
          setLoading(false);
        });
    }
  }, []);

  const bgImage = assets['horses_bg'] || "https://picsum.photos/seed/horses/1280/720?blur=4";

  const startRace = () => {
    if (money < bet || selectedHorse === null || racing) return;
    
    addMoney(-bet);
    setRacing(true);
    setWinner(null);
    setResultMessage('');
    setPositions({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

    const raceInterval = setInterval(() => {
      setPositions(prev => {
        const next = { ...prev };
        let raceFinished = false;
        let currentWinner = null;

        HORSES.forEach(horse => {
          if (next[horse.id] < 100) {
            // Random speed boost + base speed
            next[horse.id] += (Math.random() * 2 + horse.speed * 2);
            if (next[horse.id] >= 100) {
              next[horse.id] = 100;
              raceFinished = true;
              currentWinner = horse.id;
            }
          }
        });

        if (raceFinished) {
          clearInterval(raceInterval);
          finishRace(currentWinner!);
        }
        return next;
      });
    }, 50);
  };

  const finishRace = (winnerId: number) => {
    setWinner(winnerId);
    setRacing(false);
    const horse = HORSES.find(h => h.id === winnerId)!;
    if (winnerId === selectedHorse) {
      const winAmount = bet * horse.odds;
      addMoney(winAmount);
      setResultMessage(`WINNER! ${horse.name} took the gold! You won $${winAmount}!`);
    } else {
      setResultMessage(`${horse.name} won. Better luck next time!`);
    }
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
            <span className="text-xs text-sierra-yellow">HEADING TO TRACK...</span>
          </div>
        </div>
      )}

      <div className="relative z-10 w-full max-w-5xl bg-slate-900/80 border-4 border-amber-600 rounded-[3rem] p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => setGameState(GameState.CASINO_FLOOR)}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors"
          >
            <ChevronLeft className="w-8 h-8 text-amber-500" />
          </button>
          <h2 className="text-3xl font-black italic text-amber-500 tracking-tighter">DERBY DREAMS</h2>
          <div className="w-12" />
        </div>

        {/* Race Track */}
        <div className="bg-emerald-900/30 border-2 border-emerald-500/30 rounded-2xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute right-12 top-0 bottom-0 w-1 bg-white/20 border-r-2 border-dashed border-white/40" />
          <div className="space-y-4">
            {HORSES.map(horse => (
              <div key={horse.id} className="relative h-12 flex items-center">
                <div className="absolute left-0 text-[10px] font-bold text-slate-500 uppercase w-24 truncate">{horse.name}</div>
                <div className="ml-24 flex-grow h-1 bg-slate-800 rounded-full relative">
                  <motion.div 
                    className="absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2"
                    style={{ backgroundColor: horse.color, borderColor: 'white', left: `${positions[horse.id]}%` }}
                    animate={{ x: -20 }}
                  >
                    <Trophy className="w-5 h-5 text-white" />
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Betting Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select Your Champion</div>
            <div className="grid grid-cols-1 gap-2">
              {HORSES.map(horse => (
                <button
                  key={horse.id}
                  onClick={() => !racing && setSelectedHorse(horse.id)}
                  className={`flex justify-between items-center p-3 rounded-xl border transition-all ${
                    selectedHorse === horse.id 
                      ? 'bg-amber-500/20 border-amber-500' 
                      : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'
                  } ${racing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: horse.color }} />
                    <span className="font-bold">{horse.name}</span>
                  </div>
                  <span className="text-amber-500 font-black">{horse.odds}x</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-slate-800">
                <span className="text-slate-400 font-bold uppercase text-xs">Wager</span>
                <div className="flex items-center gap-4">
                  <button onClick={() => setBet(Math.max(10, bet - 50))} className="text-2xl text-amber-500 font-bold">-</button>
                  <span className="text-2xl font-black text-white">${bet}</span>
                  <button onClick={() => setBet(Math.min(money, bet + 50))} className="text-2xl text-amber-500 font-bold">+</button>
                </div>
              </div>
              
              <div className="h-20 flex items-center justify-center text-center">
                <AnimatePresence>
                  {resultMessage && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`text-xl font-bold ${resultMessage.includes('WINNER') ? 'text-emerald-400' : 'text-rose-400'}`}
                    >
                      {resultMessage}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={startRace}
              disabled={racing || selectedHorse === null || money < bet}
              className={`w-full py-6 rounded-2xl flex items-center justify-center gap-3 text-2xl font-black italic transition-all shadow-xl ${
                racing || selectedHorse === null || money < bet
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 text-black'
              }`}
            >
              {racing ? 'THEY\'RE OFF!' : 'PLACE BET & RACE'}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
