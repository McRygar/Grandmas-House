import { motion } from 'motion/react';
import { useGame, GameState } from '../hooks/useGame';
import { MapPin, MessageCircle, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { generateGameImage } from '../services/imageService';

export default function HomeBase() {
  const { money, goal, setGameState, storyProgress, assets, setAsset } = useGame();
  const [loading, setLoading] = useState(!assets['home_bg']);

  useEffect(() => {
    if (!assets['home_bg']) {
      generateGameImage("A cozy Victorian cottage with a small garden, 16-bit pixel art, Sierra style, King's Quest IV aesthetic, vibrant colors, dithering.")
        .then(url => {
          setAsset('home_bg', url);
          setLoading(false);
        });
    }
  }, []);

  const progress = (money / goal) * 100;
  const bgImage = assets['home_bg'] || "https://picsum.photos/seed/grandma-house/1920/1080?blur=4";

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-cover bg-center transition-all duration-1000"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-sierra-blue/30" />
      
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
          <div className="sierra-box p-4 animate-pulse">
            <span className="text-xs text-sierra-yellow">LOADING ADVENTURE...</span>
          </div>
        </div>
      )}

      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side: Grandma & Status */}
        <div className="flex flex-col gap-6">
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="sierra-box p-6"
          >
            <div className="flex items-center gap-4 mb-6 border-b-2 border-sierra-yellow pb-4">
              <div className="w-16 h-16 border-4 border-sierra-white overflow-hidden bg-black">
                <img 
                  src="https://picsum.photos/seed/grandma/200/200" 
                  alt="Grandma Elsie" 
                  className="w-full h-full object-cover grayscale"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h2 className="text-sm font-bold text-sierra-yellow">Grandma Elsie</h2>
                <p className="text-[8px] text-sierra-light-blue italic mt-1">"Don't let those suits take our memories, dear."</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[8px] mb-1">
                  <span className="text-sierra-light-gray uppercase">House Fund</span>
                  <span className="text-sierra-light-green">{Math.floor(progress)}%</span>
                </div>
                <div className="w-full h-4 bg-black border-2 border-sierra-dark-gray">
                  <motion.div 
                    className="h-full bg-sierra-light-green"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, progress)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black p-3 border-2 border-sierra-dark-gray">
                  <div className="text-[8px] text-sierra-light-gray uppercase mb-1">Current</div>
                  <div className="text-xs font-bold text-sierra-white">${money.toLocaleString()}</div>
                </div>
                <div className="bg-black p-3 border-2 border-sierra-dark-gray">
                  <div className="text-[8px] text-sierra-light-gray uppercase mb-1">Needed</div>
                  <div className="text-xs font-bold text-sierra-light-red">${Math.max(0, goal - money).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Doom Meter */}
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-sierra-red border-4 border-sierra-light-red p-4 flex items-center gap-4"
          >
            <div className="p-2 bg-black border-2 border-sierra-white">
              <TrendingUp className="text-sierra-light-red w-6 h-6" />
            </div>
            <div>
              <h3 className="text-[10px] font-bold text-sierra-white uppercase">OmniCorp Pressure</h3>
              <p className="text-[8px] text-sierra-yellow mt-1">
                {storyProgress < 2 ? "Surveyors spotted at property." : 
                 storyProgress < 4 ? "Construction noise is loud." :
                 "Bulldozers are idling!"}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex flex-col gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setGameState(GameState.CASINO_FLOOR)}
            className="group relative h-48 border-4 border-sierra-yellow overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/casino-neon/800/400')] bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-500" />
            <div className="absolute inset-0 bg-sierra-blue/40 group-hover:bg-transparent transition-all" />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-sierra-blue/80 border-t-4 border-sierra-yellow text-left">
              <div className="flex items-center gap-2 text-sierra-yellow mb-1">
                <MapPin className="w-3 h-3" />
                <span className="text-[8px] font-bold uppercase">Travel</span>
              </div>
              <h3 className="text-xs font-bold text-sierra-white group-hover:text-sierra-yellow transition-colors">GRANDMA'S CASIO</h3>
            </div>
          </motion.button>

          <div className="grid grid-cols-2 gap-4 h-full">
            <button className="sierra-button flex flex-col items-center justify-center gap-2">
              <MessageCircle className="w-6 h-6" />
              <span className="text-[8px]">Talk to Elsie</span>
            </button>
            <button 
              onClick={() => setGameState(GameState.SCRAP_YARD)}
              className="sierra-button flex flex-col items-center justify-center gap-2"
            >
              <TrendingUp className="w-6 h-6" />
              <span className="text-[8px]">Scrap Yard</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
