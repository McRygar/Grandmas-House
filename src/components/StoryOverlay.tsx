import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame, GameState } from '../hooks/useGame';
import { ChevronLeft } from 'lucide-react';

const STORY_SCENES = [
  {
    id: 0,
    trigger: 0,
    speaker: "Grandma Elsie",
    text: "Oh, you're here! Thank goodness. Those OmniCorp people... they sent another notice. They want to tear down our home for a factory! We need $10,000 to fight them in court. It's impossible, isn't it?",
    action: "Seed money given",
    next: 1
  },
  {
    id: 1,
    trigger: 0,
    speaker: "You",
    text: "Don't worry, Grandma. I've got a plan. It's risky, but it's the only way. I'm going to Grandma's Casio.",
    action: "Game Start",
    next: null
  },
  {
    id: 2,
    trigger: 500,
    speaker: "Huxley (OmniCorp)",
    text: "Still here, old woman? You're just delaying the inevitable. My surveyors are already mapping out the new assembly line. Why not take our $500 offer and leave with some dignity?",
    action: "Pressure increased",
    next: 3
  },
  {
    id: 3,
    trigger: 500,
    speaker: "Grandma Elsie",
    text: "Get off my porch, you weasel! My grandchild is bringing home more than that in a single night! We're not going anywhere!",
    action: "Elsie defiant",
    next: null
  },
  {
    id: 4,
    trigger: 2500,
    speaker: "Grandma Elsie",
    text: "Look at all this cash! You're doing it! But be careful... I saw some shady characters following you from the casino. They don't like it when people win this much.",
    action: "Warning",
    next: null
  },
  {
    id: 5,
    trigger: 7500,
    speaker: "Huxley (OmniCorp)",
    text: "This is your final warning. The bulldozers arrive tomorrow. I don't care how much money you've 'found'. The permits are signed.",
    action: "Final Escalation",
    next: 6
  },
  {
    id: 6,
    trigger: 7500,
    speaker: "Grandma Elsie",
    text: "They put up a fence right through my petunias! We're so close, dear... just a little more and we can stop them forever!",
    action: "High Stakes",
    next: null
  },
  {
    id: 7,
    trigger: 10000,
    speaker: "Grandma Elsie",
    text: "WE DID IT! $10,000! Look at Huxley's face... he's turning purple! Our home is safe!",
    action: "VICTORY",
    next: null
  }
];

export default function StoryOverlay() {
  const { money, storyProgress, setStoryProgress } = useGame();
  const [currentScene, setCurrentScene] = useState<typeof STORY_SCENES[0] | null>(null);

  useEffect(() => {
    // Check for new story triggers
    const nextScene = STORY_SCENES.find(s => s.id === storyProgress && money >= s.trigger);
    if (nextScene) {
      setCurrentScene(nextScene);
    }
  }, [money, storyProgress]);

  const handleNext = () => {
    if (currentScene?.next !== null && currentScene?.next !== undefined) {
      const next = STORY_SCENES.find(s => s.id === currentScene.next);
      setCurrentScene(next || null);
      setStoryProgress(currentScene.next);
    } else {
      setStoryProgress(storyProgress + 1);
      setCurrentScene(null);
    }
  };

  if (!currentScene) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl sierra-box p-6 flex flex-col gap-6"
      >
        <div className="flex gap-6 items-start">
          <div className="w-24 h-24 bg-black border-4 border-sierra-white flex-shrink-0 overflow-hidden">
            <img 
              src={`https://picsum.photos/seed/${currentScene.speaker}/200/200`} 
              alt={currentScene.speaker}
              className="w-full h-full object-cover grayscale"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <div className="flex-grow">
            <div className="text-sierra-yellow text-[10px] font-bold uppercase mb-2">{currentScene.speaker}</div>
            <p className="text-xs text-sierra-white leading-relaxed">"{currentScene.text}"</p>
          </div>
        </div>

        <div className="flex justify-between items-center border-t-2 border-sierra-yellow pt-4">
          <div className="text-[8px] text-sierra-cyan font-bold uppercase">
            {currentScene.action}
          </div>
          <button 
            onClick={handleNext}
            className="sierra-button"
          >
            CONTINUE
          </button>
        </div>
      </motion.div>
    </div>
  );
}
