import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame, GameState } from '../../hooks/useGame';
import { ChevronLeft, Play } from 'lucide-react';
import { generateGameImage } from '../../services/imageService';

type Card = {
  suit: string;
  value: string;
  rank: number;
};

const SUITS = ['♠️', '♥️', '♣️', '♦️'];
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const createDeck = () => {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (let i = 0; i < VALUES.length; i++) {
      let rank = i + 2;
      if (VALUES[i] === 'J' || VALUES[i] === 'Q' || VALUES[i] === 'K') rank = 10;
      if (VALUES[i] === 'A') rank = 11;
      deck.push({ suit, value: VALUES[i], rank });
    }
  }
  return deck.sort(() => Math.random() - 0.5);
};

const calculateScore = (hand: Card[]) => {
  let score = hand.reduce((acc, card) => acc + card.rank, 0);
  let aces = hand.filter(card => card.value === 'A').length;
  while (score > 21 && aces > 0) {
    score -= 10;
    aces -= 1;
  }
  return score;
};

export default function Blackjack() {
  const { money, addMoney, setGameState, assets, setAsset } = useGame();
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameStatus, setGameStatus] = useState<'betting' | 'playing' | 'dealerTurn' | 'gameOver'>('betting');
  const [bet, setBet] = useState(50);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(!assets['blackjack_bg']);

  useEffect(() => {
    if (!assets['blackjack_bg']) {
      generateGameImage("A green felt blackjack table in a dim casino, cards being dealt, 16-bit pixel art, Sierra style, King's Quest IV aesthetic, vibrant colors, dithering.")
        .then(url => {
          setAsset('blackjack_bg', url);
          setLoading(false);
        });
    }
  }, []);

  const bgImage = assets['blackjack_bg'] || "https://picsum.photos/seed/blackjack/1280/720?blur=4";

  const startNewGame = () => {
    if (money < bet) return;
    addMoney(-bet);
    const newDeck = createDeck();
    const pHand = [newDeck.pop()!, newDeck.pop()!];
    const dHand = [newDeck.pop()!, newDeck.pop()!];
    setDeck(newDeck);
    setPlayerHand(pHand);
    setDealerHand(dHand);
    setGameStatus('playing');
    setMessage('');

    if (calculateScore(pHand) === 21) {
      endGame('Blackjack!', true);
    }
  };

  const hit = () => {
    const newCard = deck.pop()!;
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);
    if (calculateScore(newHand) > 21) {
      endGame('Bust!', false);
    }
  };

  const stand = () => {
    setGameStatus('dealerTurn');
  };

  useEffect(() => {
    if (gameStatus === 'dealerTurn') {
      const dScore = calculateScore(dealerHand);
      if (dScore < 17) {
        setTimeout(() => {
          const newCard = deck.pop()!;
          setDealerHand([...dealerHand, newCard]);
        }, 600);
      } else {
        const pScore = calculateScore(playerHand);
        if (dScore > 21 || pScore > dScore) {
          endGame('You Win!', true);
        } else if (dScore > pScore) {
          endGame('Dealer Wins', false);
        } else {
          endGame('Push', null);
        }
      }
    }
  }, [dealerHand, gameStatus]);

  const endGame = (msg: string, win: boolean | null) => {
    setGameStatus('gameOver');
    setMessage(msg);
    if (win === true) {
      addMoney(bet * 2);
    } else if (win === null) {
      addMoney(bet);
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
            <span className="text-xs text-sierra-yellow">DEALING IN...</span>
          </div>
        </div>
      )}

      <div className="relative z-10 w-full max-w-4xl bg-emerald-900/80 border-8 border-amber-800 rounded-[4rem] p-8 shadow-2xl relative overflow-hidden">
        {/* Table Felt Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]" />

        <div className="relative z-10">
          <div className="flex justify-between items-center mb-12">
            <button 
              onClick={() => setGameState(GameState.CASINO_FLOOR)}
              className="p-2 hover:bg-emerald-800 rounded-full transition-colors"
            >
              <ChevronLeft className="w-8 h-8 text-amber-500" />
            </button>
            <h2 className="text-3xl font-black italic text-amber-500 tracking-tighter uppercase">Grandma's Table</h2>
            <div className="bg-black/30 px-4 py-1 rounded-full border border-white/10 text-xs font-bold text-emerald-400">
              DECK: {deck.length}
            </div>
          </div>

          {/* Dealer Area */}
          <div className="flex flex-col items-center mb-16">
            <div className="text-xs font-bold text-emerald-300 uppercase tracking-widest mb-4">Dealer's Hand</div>
            <div className="flex gap-4 min-h-[140px]">
              {dealerHand.map((card, i) => (
                <CardView 
                  key={i} 
                  card={card} 
                  hidden={i === 1 && gameStatus === 'playing'} 
                />
              ))}
            </div>
            {gameStatus !== 'playing' && gameStatus !== 'betting' && (
              <div className="mt-2 text-xl font-bold text-white">Score: {calculateScore(dealerHand)}</div>
            )}
          </div>

          {/* Player Area */}
          <div className="flex flex-col items-center mb-12">
            <div className="flex gap-4 min-h-[140px] mb-4">
              {playerHand.map((card, i) => (
                <CardView key={i} card={card} />
              ))}
            </div>
            {playerHand.length > 0 && (
              <div className="text-xl font-bold text-white">Your Score: {calculateScore(playerHand)}</div>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center gap-6">
            <AnimatePresence mode="wait">
              {gameStatus === 'betting' || gameStatus === 'gameOver' ? (
                <motion.div 
                  key="betting"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center gap-4"
                >
                  {message && <div className="text-3xl font-black text-amber-400 mb-2">{message}</div>}
                  <div className="flex items-center gap-6 bg-black/40 p-4 rounded-3xl border border-white/10">
                    <button onClick={() => setBet(Math.max(10, bet - 50))} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold">-</button>
                    <div className="text-center">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Bet</div>
                      <div className="text-2xl font-black">${bet}</div>
                    </div>
                    <button onClick={() => setBet(Math.min(money, bet + 50))} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold">+</button>
                  </div>
                  <button 
                    onClick={startNewGame}
                    className="px-12 py-4 bg-amber-500 hover:bg-amber-400 text-black font-black italic text-xl rounded-2xl shadow-xl transition-all"
                  >
                    DEAL CARDS
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="playing"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex gap-4"
                >
                  <button 
                    onClick={hit}
                    disabled={gameStatus !== 'playing'}
                    className="px-8 py-4 bg-sky-500 hover:bg-sky-400 text-white font-black italic text-xl rounded-2xl shadow-xl transition-all disabled:opacity-50"
                  >
                    HIT
                  </button>
                  <button 
                    onClick={stand}
                    disabled={gameStatus !== 'playing'}
                    className="px-8 py-4 bg-rose-500 hover:bg-rose-400 text-white font-black italic text-xl rounded-2xl shadow-xl transition-all disabled:opacity-50"
                  >
                    STAND
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CardView({ card, hidden }: { card: Card; hidden?: boolean; key?: string | number }) {
  return (
    <motion.div 
      initial={{ rotateY: 180, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      className={`w-24 h-36 rounded-xl flex flex-col items-center justify-center text-2xl shadow-lg border-2 ${
        hidden ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}
    >
      {!hidden ? (
        <>
          <div className={`font-bold ${card.suit === '♥️' || card.suit === '♦️' ? 'text-rose-600' : 'text-slate-900'}`}>
            {card.value}
          </div>
          <div className="text-3xl">{card.suit}</div>
        </>
      ) : (
        <div className="text-slate-600 font-black italic">?</div>
      )}
    </motion.div>
  );
}
