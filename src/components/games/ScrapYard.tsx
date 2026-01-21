import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame, GameState } from '../../hooks/useGame';
import { ChevronLeft, Hammer } from 'lucide-react';
import { generateGameImage } from '../../services/imageService';

const CAR_PARTS = [
  { id: 'door_l', name: 'Left Door', health: 5, x: '20%', y: '40%' },
  { id: 'door_r', name: 'Right Door', health: 5, x: '60%', y: '40%' },
  { id: 'hood', name: 'Hood', health: 8, x: '40%', y: '20%' },
  { id: 'trunk', name: 'Trunk', health: 6, x: '40%', y: '70%' },
  { id: 'wheel_fl', name: 'Front Left Wheel', health: 3, x: '15%', y: '20%' },
  { id: 'wheel_fr', name: 'Front Right Wheel', health: 3, x: '65%', y: '20%' },
  { id: 'wheel_rl', name: 'Rear Left Wheel', health: 3, x: '15%', y: '70%' },
  { id: 'wheel_rr', name: 'Rear Right Wheel', health: 3, x: '65%', y: '70%' },
  { id: 'engine', name: 'Engine Block', health: 15, x: '40%', y: '45%' },
];

export default function ScrapYard() {
  const { addMoney, setGameState, assets, setAsset } = useGame();
  const [parts, setParts] = useState(CAR_PARTS.map(p => ({ ...p })));
  const [isDone, setIsDone] = useState(false);
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(!assets['scrapyard_bg']);

  useEffect(() => {
    if (!assets['scrapyard_bg']) {
      generateGameImage("A muddy junkyard with piles of scrap metal and a rusty old car in the center, 16-bit pixel art, Sierra style, King's Quest IV aesthetic, vibrant colors, dithering.")
        .then(url => {
          setAsset('scrapyard_bg', url);
          setLoading(false);
        });
    }
  }, []);

  const bgImage = assets['scrapyard_bg'] || "https://picsum.photos/seed/scrapyard/1280/720?blur=4";

  const hitPart = (id: string) => {
    if (isDone) return;
    
    setShake(true);
    setTimeout(() => setShake(false), 100);

    setParts(prev => {
      const next = prev.map(p => {
        if (p.id === id && p.health > 0) {
          return { ...p, health: p.health - 1 };
        }
        return p;
      });

      // Check if all parts are destroyed
      if (next.every(p => p.health <= 0)) {
        finishJob();
      }
      return next;
    });
  };

  const finishJob = () => {
    setIsDone(true);
    setTimeout(() => {
      addMoney(500);
      setGameState(GameState.HOME);
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-full flex flex-col items-center justify-center p-6 bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/40" />
      
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
          <div className="sierra-box p-4 animate-pulse">
            <span className="text-xs text-sierra-yellow">HEADING TO YARD...</span>
          </div>
        </div>
      )}

      <div className={`relative z-10 w-full max-w-4xl sierra-box p-8 transition-transform ${shake ? 'translate-y-1' : ''}`}>
        <div className="flex justify-between items-center mb-8 border-b-4 border-sierra-yellow pb-4">
          <button 
            onClick={() => setGameState(GameState.HOME)}
            className="sierra-button !p-1"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-xs font-bold text-sierra-yellow uppercase">JOE'S SCRAP YARD</h2>
          <div className="w-8" />
        </div>

        <div className="text-center mb-8">
          <p className="text-[10px] text-sierra-white uppercase mb-2">Tear this junker apart for $500!</p>
          <p className="text-[8px] text-sierra-light-gray">CLICK THE PARTS TO SMASH THEM</p>
        </div>

        <div className="relative w-full aspect-video bg-sierra-dark-gray border-4 border-black overflow-hidden mb-8">
          {/* Car Silhouette */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
             <div className="w-3/4 h-1/2 bg-black rounded-full" />
          </div>

          {parts.map(part => (
            <motion.button
              key={part.id}
              onClick={() => hitPart(part.id)}
              disabled={part.health <= 0}
              className={`absolute w-20 h-20 flex flex-col items-center justify-center transition-all ${
                part.health <= 0 ? 'opacity-0 scale-0' : 'hover:scale-110'
              }`}
              style={{ left: part.x, top: part.y }}
            >
              <div className="sierra-box !bg-sierra-light-gray !border-2 p-2 flex flex-col items-center">
                <Hammer className="w-6 h-6 text-sierra-red mb-1" />
                <div className="w-full h-1 bg-black border border-sierra-dark-gray">
                  <div 
                    className="h-full bg-sierra-light-green" 
                    style={{ width: `${(part.health / CAR_PARTS.find(cp => cp.id === part.id)!.health) * 100}%` }} 
                  />
                </div>
              </div>
              <span className="text-[6px] text-sierra-white mt-1 uppercase font-bold">{part.name}</span>
            </motion.button>
          ))}

          <AnimatePresence>
            {isDone && (
              <motion.div 
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1.5, rotate: 0 }}
                className="absolute inset-0 flex items-center justify-center z-20"
              >
                <div className="sierra-box !bg-sierra-light-green p-4 border-4 border-sierra-white">
                  <span className="text-black font-bold text-xl">JOB DONE! +$500</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-center">
           <div className="text-[8px] text-sierra-light-blue animate-pulse">
             {parts.filter(p => p.health > 0).length} PARTS REMAINING
           </div>
        </div>
      </div>
    </motion.div>
  );
}
