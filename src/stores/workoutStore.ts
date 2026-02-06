import { create } from 'zustand';
import type { Exercise, UserProfile } from '../types';
import {
  getExercises,
  getUserProfile,
  updateUserProfile,
  createWorkoutSession,
  addWorkoutSet
} from '../database/db';
import { calculateXP, calculateLevelFromXP } from '../utils/leveling';

interface WorkoutState {
  exercises: Exercise[];
  currentSession: {
    rounds: Array<{ [exerciseId: string]: number }>;
    currentRound: number;
  };
  userProfile: UserProfile | null;

  loadExercises: () => void;
  loadUserProfile: () => void;

  startNewRound: () => void;
  saveRoundData: (roundIndex: number, exerciseId: string, reps: number) => void;
  resetUserProfile: () => void;
  finishWorkout: () => number;
  resetSession: () => void;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  exercises: [],
  currentSession: {
    rounds: [{}],
    currentRound: 0,
  },
  userProfile: null,

  loadExercises: () => {
    const exercises = getExercises();
    set({ exercises });
  },

  loadUserProfile: () => {
    const profile = getUserProfile();
    set({ userProfile: profile });
  },

  startNewRound: () => {
    const { currentSession } = get();
    set({
      currentSession: {
        ...currentSession,
        rounds: [...currentSession.rounds, {}],
        currentRound: currentSession.currentRound + 1,
      },
    });
  },

  saveRoundData: (roundIndex: number, exerciseId: string, reps: number) => {
    const { currentSession } = get();
    const updatedRounds = [...currentSession.rounds];
    updatedRounds[roundIndex] = {
      ...updatedRounds[roundIndex],
      [exerciseId]: Number(reps),
    };

    set({
      currentSession: {
        ...currentSession,
        rounds: updatedRounds,
      },
    });
  },

  resetUserProfile: () => {
    updateUserProfile(0, 0, 1);
    get().loadUserProfile();
  },

  finishWorkout: () => {
    const { currentSession, userProfile } = get();

    if (!userProfile) {
        console.error('No user profile found');
        return 0;
    }

    const totalRounds = currentSession.currentRound + 1;
    let sessionVolume = 0;

    currentSession.rounds.forEach((round) => {
        Object.values(round).forEach((reps) => {
        const validReps = Number(reps) || 0;
        sessionVolume += validReps;
        });
    });

    if (sessionVolume === 0) {
        console.warn('No volume recorded, skipping session save');
        get().resetSession();
        return 0;
    }

    const sessionId = createWorkoutSession(totalRounds, sessionVolume);

    console.log('Session created:', { sessionId, totalRounds, sessionVolume });

    currentSession.rounds.forEach((round, roundIndex) => {
        Object.entries(round).forEach(([exerciseId, reps]) => {
        const validReps = Number(reps) || 0;
        if (validReps > 0) {
            addWorkoutSet(exerciseId, validReps, roundIndex + 1, sessionId);
        }
        });
    });

    const gainedXP = calculateXP(sessionVolume);
    const newTotalXP = userProfile.experiencePoints + gainedXP;
    const newTotalVolume = userProfile.totalVolume + sessionVolume;
    const newLevel = calculateLevelFromXP(newTotalXP);

    updateUserProfile(newTotalVolume, newTotalXP, newLevel);
    get().loadUserProfile();
    get().resetSession();

    return gainedXP;
    },

  resetSession: () => {
    set({
      currentSession: {
        rounds: [{}],
        currentRound: 0,
      },
    });
  },
}));