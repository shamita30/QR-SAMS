import { create } from 'zustand';

interface RunnerState {
  isPlaying: boolean;
  isGameOver: boolean;
  score: number; // Distance
  coinsCollected: number;
  multiplier: number;
  speed: number;
  baseSpeed: number;
  playerLane: number; // -1 (left), 0 (center), 1 (right)
  isJumping: boolean;
  isSliding: boolean;
  chaserDistance: number; // Higher is further away (safer)
  
  startGame: () => void;
  endGame: () => void;
  resetGame: () => void;
  addScore: (points: number) => void;
  addCoin: () => void;
  setPlayerLane: (lane: number) => void;
  setJumping: (val: boolean) => void;
  setSliding: (val: boolean) => void;
  increaseSpeed: (amount: number) => void;
  updateChaser: (delta: number) => void; // delta < 0 means chaser gets closer
}

export const useRunnerStore = create<RunnerState>((set) => ({
  isPlaying: false,
  isGameOver: false,
  score: 0,
  coinsCollected: 0,
  multiplier: 1,
  baseSpeed: 20,
  speed: 20,
  playerLane: 0,
  isJumping: false,
  isSliding: false,
  chaserDistance: 10, // Safe distance

  startGame: () => set({ 
    isPlaying: true, 
    isGameOver: false, 
    score: 0, 
    coinsCollected: 0, 
    speed: 20,
    playerLane: 0,
    chaserDistance: 10 
  }),
  endGame: () => set({ isGameOver: true, isPlaying: false }),
  resetGame: () => set({ 
    isPlaying: false, 
    isGameOver: false, 
    score: 0, 
    coinsCollected: 0, 
    speed: 20,
    playerLane: 0,
    chaserDistance: 10 
  }),
  
  addScore: (points) => set((state) => ({ score: state.score + (points * state.multiplier) })),
  addCoin: () => set((state) => ({ coinsCollected: state.coinsCollected + 1 })),
  
  setPlayerLane: (lane) => set({ playerLane: Math.max(-1, Math.min(1, lane)) }),
  setJumping: (val) => set({ isJumping: val }),
  setSliding: (val) => set({ isSliding: val }),
  
  increaseSpeed: (amount) => set((state) => ({ speed: state.speed + amount })),
  
  updateChaser: (delta) => set((state) => {
    const newDist = Math.max(0, Math.min(20, state.chaserDistance + delta));
    if (newDist <= 0) {
      return { chaserDistance: 0, isGameOver: true, isPlaying: false };
    }
    return { chaserDistance: newDist };
  }),
}));
