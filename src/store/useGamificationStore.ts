import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ═══ TYPES ═══
export interface Mission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  coinReward: number;
  type: 'daily' | 'weekly' | 'story' | 'challenge' | 'hacker';
  category: 'attendance' | 'quiz' | 'coding' | 'study' | 'social' | 'project';
  progress: number;
  target: number;
  completed: boolean;
  icon: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
}

export interface PowerUp {
  id: string;
  name: string;
  description: string;
  icon: string;
  duration: number; // minutes
  multiplier: number;
  active: boolean;
  activatedAt?: string;
}

export interface SkillNode {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  xpInvested: number;
  category: 'coding' | 'logic' | 'design' | 'security' | 'devops' | 'softskills';
  unlocked: boolean;
  icon: string;
}

export interface AvatarConfig {
  skinColor: string;
  hairStyle: string;
  outfit: string;
  accessory: string;
  pet: string;
  hoverboard: string;
  trail: string;
}

export type Season = 'S1_Genesis' | 'S2_Cyberwave' | 'S3_Neon' | 'S4_Quantum';

// ═══ RANK SYSTEM ═══
const RANKS = [
  { name: 'Freshman', minLevel: 1, icon: '🌱', color: '#609494' },
  { name: 'Explorer', minLevel: 3, icon: '🧭', color: '#ffc0cb' },
  { name: 'Pathfinder', minLevel: 5, icon: '🗺️', color: '#fce883' },
  { name: 'Scholar', minLevel: 8, icon: '📚', color: '#00d4ff' },
  { name: 'Sentinel', minLevel: 12, icon: '🛡️', color: '#ff8243' },
  { name: 'Architect', minLevel: 18, icon: '🏗️', color: '#a855f7' },
  { name: 'Grandmaster', minLevel: 25, icon: '👑', color: '#fce883' },
  { name: 'Legendary', minLevel: 35, icon: '⭐', color: '#ff6b35' },
  { name: 'Mythic', minLevel: 50, icon: '🌟', color: '#ff8243' },
];

const DEFAULT_MISSIONS: Mission[] = [
  {
    id: 'daily_attendance',
    title: 'Streak Checkpoint',
    description: 'Mark your attendance to maintain your daily streak',
    xpReward: 30,
    coinReward: 10,
    type: 'daily',
    category: 'attendance',
    progress: 0,
    target: 1,
    completed: false,
    icon: '📍',
  },
  {
    id: 'daily_quiz',
    title: 'Challenge Run',
    description: 'Complete a quiz challenge',
    xpReward: 50,
    coinReward: 25,
    type: 'daily',
    category: 'quiz',
    progress: 0,
    target: 1,
    completed: false,
    icon: '⚡',
  },
  {
    id: 'daily_study',
    title: 'Knowledge Lane',
    description: 'Spend 30 minutes in a study zone',
    xpReward: 40,
    coinReward: 15,
    type: 'daily',
    category: 'study',
    progress: 0,
    target: 30,
    completed: false,
    icon: '📖',
  },
  {
    id: 'daily_social',
    title: 'Guild Connect',
    description: 'Send a message in global chat',
    xpReward: 15,
    coinReward: 5,
    type: 'daily',
    category: 'social',
    progress: 0,
    target: 1,
    completed: false,
    icon: '💬',
  },
  {
    id: 'weekly_project',
    title: 'Builder Protocol',
    description: 'Submit a project milestone',
    xpReward: 200,
    coinReward: 100,
    type: 'weekly',
    category: 'project',
    progress: 0,
    target: 1,
    completed: false,
    icon: '🏗️',
  },
  {
    id: 'hacker_mission',
    title: 'Hacker Mission',
    description: 'Solve 3 coding challenges',
    xpReward: 150,
    coinReward: 75,
    type: 'hacker',
    category: 'coding',
    progress: 0,
    target: 3,
    completed: false,
    icon: '🖥️',
  },
];

const DEFAULT_BADGES: Badge[] = [
  { id: 'first_login', name: 'System Online', description: 'Log into the metaverse for the first time', icon: '🚀', rarity: 'common' },
  { id: 'streak_7', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🔥', rarity: 'rare' },
  { id: 'streak_30', name: 'Monthly Maven', description: 'Maintain a 30-day streak', icon: '💎', rarity: 'epic' },
  { id: 'level_5', name: 'Pathfinder', description: 'Reach Level 5', icon: '🗺️', rarity: 'common' },
  { id: 'level_10', name: 'Double Digits', description: 'Reach Level 10', icon: '🌟', rarity: 'rare' },
  { id: 'quiz_master', name: 'Quiz Master', description: 'Complete 10 quizzes', icon: '🧠', rarity: 'rare' },
  { id: 'code_warrior', name: 'Code Warrior', description: 'Solve 25 coding challenges', icon: '⚔️', rarity: 'epic' },
  { id: 'social_butterfly', name: 'Social Butterfly', description: 'Send 100 chat messages', icon: '🦋', rarity: 'common' },
  { id: 'night_owl', name: 'Night Owl', description: 'Study past midnight', icon: '🦉', rarity: 'rare' },
  { id: 'speed_demon', name: 'Speed Demon', description: 'Complete a quiz in under 60 seconds', icon: '⚡', rarity: 'legendary' },
];

const DEFAULT_SKILLS: SkillNode[] = [
  { id: 'coding_basics', name: 'Coding Fundamentals', level: 0, maxLevel: 10, xpInvested: 0, category: 'coding', unlocked: true, icon: '💻' },
  { id: 'logic_mastery', name: 'Logic Mastery', level: 0, maxLevel: 10, xpInvested: 0, category: 'logic', unlocked: true, icon: '🧩' },
  { id: 'ui_design', name: 'UI/UX Design', level: 0, maxLevel: 10, xpInvested: 0, category: 'design', unlocked: true, icon: '🎨' },
  { id: 'cyber_sec', name: 'Cybersecurity', level: 0, maxLevel: 10, xpInvested: 0, category: 'security', unlocked: false, icon: '🔐' },
  { id: 'devops', name: 'DevOps Engineering', level: 0, maxLevel: 10, xpInvested: 0, category: 'devops', unlocked: false, icon: '⚙️' },
  { id: 'communication', name: 'Communication', level: 0, maxLevel: 10, xpInvested: 0, category: 'softskills', unlocked: true, icon: '🗣️' },
];

// ═══ STATE INTERFACE ═══
interface GamificationState {
  // Core progression
  xp: number;
  level: number;
  coins: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string;
  totalStudyMinutes: number;
  currentSeason: Season;

  // Collections
  badges: Badge[];
  missions: Mission[];
  skills: SkillNode[];
  powerUps: PowerUp[];
  unlockedThemes: string[];
  unlockedHoverboards: string[];

  // Avatar
  avatar: AvatarConfig;

  // Stats
  totalMissionsCompleted: number;
  totalQuizzesTaken: number;
  totalCodeChallenges: number;
  totalAttendanceDays: number;

  // Level up state
  recentLevelUp: boolean;
  recentBadge: Badge | null;
  xpMultiplier: number;

  // Actions
  addXP: (amount: number, reason?: string) => void;
  addCoins: (amount: number, reason?: string) => void;
  checkStreak: () => void;
  completeMission: (missionId: string) => void;
  updateMissionProgress: (missionId: string, amount: number) => void;
  unlockBadge: (badgeId: string) => void;
  investSkillXP: (skillId: string, amount: number) => void;
  activatePowerUp: (powerUpId: string) => void;
  setAvatar: (config: Partial<AvatarConfig>) => void;
  clearLevelUp: () => void;
  clearRecentBadge: () => void;
  resetDailyMissions: () => void;
  getRank: () => typeof RANKS[0];
  getXPForNextLevel: () => number;
  getCurrentLevelXP: () => number;
}

const calculateLevel = (xp: number) => {
  // Progressive leveling: each level requires more XP
  // Level 1: 0 XP, Level 2: 500 XP, Level 3: 1200 XP, etc.
  return Math.floor(Math.sqrt(xp / 250)) + 1;
};

const xpRequiredForLevel = (level: number) => {
  return Math.pow(level - 1, 2) * 250;
};

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      // Core
      xp: 150,
      level: 1,
      coins: 50,
      streak: 1,
      longestStreak: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      totalStudyMinutes: 0,
      currentSeason: 'S1_Genesis',

      // Collections
      badges: DEFAULT_BADGES,
      missions: DEFAULT_MISSIONS,
      skills: DEFAULT_SKILLS,
      powerUps: [],
      unlockedThemes: ['default'],
      unlockedHoverboards: ['basic'],

      // Avatar
      avatar: {
        skinColor: '#ff8243',
        hairStyle: 'spiky',
        outfit: 'starter',
        accessory: 'none',
        pet: 'none',
        hoverboard: 'basic',
        trail: 'orange',
      },

      // Stats
      totalMissionsCompleted: 0,
      totalQuizzesTaken: 0,
      totalCodeChallenges: 0,
      totalAttendanceDays: 0,

      // Level up state
      recentLevelUp: false,
      recentBadge: null,
      xpMultiplier: 1,

      // ═══ ACTIONS ═══
      addXP: (amount: number, _reason?: string) => {
        set((state) => {
          const multipliedAmount = Math.floor(amount * state.xpMultiplier);
          const newXP = state.xp + multipliedAmount;
          const newLevel = calculateLevel(newXP);
          const hasLeveledUp = newLevel > state.level;

          // Check for level badges
          let updatedBadges = [...state.badges];
          if (newLevel >= 5) {
            updatedBadges = updatedBadges.map(b =>
              b.id === 'level_5' && !b.unlockedAt ? { ...b, unlockedAt: new Date().toISOString() } : b
            );
          }
          if (newLevel >= 10) {
            updatedBadges = updatedBadges.map(b =>
              b.id === 'level_10' && !b.unlockedAt ? { ...b, unlockedAt: new Date().toISOString() } : b
            );
          }

          return {
            xp: newXP,
            level: newLevel,
            badges: updatedBadges,
            recentLevelUp: hasLeveledUp ? true : state.recentLevelUp,
          };
        });
      },

      addCoins: (amount: number, _reason?: string) => {
        set((state) => ({
          coins: state.coins + amount,
        }));
      },

      checkStreak: () => {
        set((state) => {
          const today = new Date().toISOString().split('T')[0];
          if (state.lastActiveDate === today) return state;

          const lastDate = new Date(state.lastActiveDate);
          const currentDate = new Date(today);
          const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          let newStreak = diffDays === 1 ? state.streak + 1 : 1;
          const newLongest = Math.max(newStreak, state.longestStreak);

          // Check streak badges
          let updatedBadges = [...state.badges];
          if (newStreak >= 7) {
            updatedBadges = updatedBadges.map(b =>
              b.id === 'streak_7' && !b.unlockedAt ? { ...b, unlockedAt: new Date().toISOString() } : b
            );
          }
          if (newStreak >= 30) {
            updatedBadges = updatedBadges.map(b =>
              b.id === 'streak_30' && !b.unlockedAt ? { ...b, unlockedAt: new Date().toISOString() } : b
            );
          }

          return {
            streak: newStreak,
            longestStreak: newLongest,
            lastActiveDate: today,
            badges: updatedBadges,
          };
        });
      },

      completeMission: (missionId: string) => {
        set((state) => {
          const mission = state.missions.find(m => m.id === missionId);
          if (!mission || mission.completed) return state;

          const newXP = state.xp + Math.floor(mission.xpReward * state.xpMultiplier);
          const newCoins = state.coins + mission.coinReward;
          const newLevel = calculateLevel(newXP);

          return {
            missions: state.missions.map(m =>
              m.id === missionId ? { ...m, completed: true, progress: m.target } : m
            ),
            xp: newXP,
            coins: newCoins,
            level: newLevel,
            totalMissionsCompleted: state.totalMissionsCompleted + 1,
            recentLevelUp: newLevel > state.level ? true : state.recentLevelUp,
          };
        });
      },

      updateMissionProgress: (missionId: string, amount: number) => {
        set((state) => {
          return {
            missions: state.missions.map(m => {
              if (m.id !== missionId || m.completed) return m;
              const newProgress = Math.min(m.progress + amount, m.target);
              return { ...m, progress: newProgress };
            }),
          };
        });
      },

      unlockBadge: (badgeId: string) => {
        set((state) => {
          const badge = state.badges.find(b => b.id === badgeId);
          if (!badge || badge.unlockedAt) return state;

          const updatedBadge = { ...badge, unlockedAt: new Date().toISOString() };
          return {
            badges: state.badges.map(b => b.id === badgeId ? updatedBadge : b),
            recentBadge: updatedBadge,
          };
        });
      },

      investSkillXP: (skillId: string, amount: number) => {
        set((state) => ({
          skills: state.skills.map(s => {
            if (s.id !== skillId || !s.unlocked) return s;
            const newInvested = s.xpInvested + amount;
            const newLevel = Math.min(Math.floor(newInvested / 100), s.maxLevel);
            return { ...s, xpInvested: newInvested, level: newLevel };
          }),
        }));
      },

      activatePowerUp: (powerUpId: string) => {
        set((state) => ({
          powerUps: state.powerUps.map(p =>
            p.id === powerUpId ? { ...p, active: true, activatedAt: new Date().toISOString() } : p
          ),
          xpMultiplier: state.xpMultiplier * (state.powerUps.find(p => p.id === powerUpId)?.multiplier || 1),
        }));
      },

      setAvatar: (config: Partial<AvatarConfig>) => {
        set((state) => ({
          avatar: { ...state.avatar, ...config },
        }));
      },

      clearLevelUp: () => set({ recentLevelUp: false }),
      clearRecentBadge: () => set({ recentBadge: null }),

      resetDailyMissions: () => {
        set((state) => ({
          missions: state.missions.map(m =>
            m.type === 'daily' ? { ...m, progress: 0, completed: false } : m
          ),
        }));
      },

      getRank: () => {
        const level = get().level;
        const rank = [...RANKS].reverse().find(r => level >= r.minLevel);
        return rank || RANKS[0];
      },

      getXPForNextLevel: () => {
        const level = get().level;
        return xpRequiredForLevel(level + 1);
      },

      getCurrentLevelXP: () => {
        const { xp, level } = get();
        return xp - xpRequiredForLevel(level);
      },
    }),
    {
      name: 'sentinel-gamification',
    }
  )
);
