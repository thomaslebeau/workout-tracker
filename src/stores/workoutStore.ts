import { create } from 'zustand';
import type { Exercise, Workout, UserProfile } from '../types';
import {
  getExercises,
  getUserProfile,
  updateUserProfile,
  createWorkoutSession,
  addWorkoutSet,
  createExercise as dbCreateExercise,
  updateExercise as dbUpdateExercise,
  deleteExercise as dbDeleteExercise,
  getWorkouts as dbGetWorkouts,
  createWorkout as dbCreateWorkout,
  updateWorkout as dbUpdateWorkout,
  deleteWorkout as dbDeleteWorkout,
  getNextWorkoutName as dbGetNextWorkoutName,
} from '../database/db';
import { calculateXP, calculateLevelFromXP } from '../utils/leveling';

interface WorkoutState {
  exercises: Exercise[];
  allExercises: Exercise[];
  workouts: Workout[];
  selectedWorkoutId: number | null;
  currentSession: {
    rounds: Array<{ [exerciseId: string]: number }>;
    currentRound: number;
  };
  userProfile: UserProfile | null;

  loadExercises: () => void;
  loadUserProfile: () => void;
  loadWorkouts: () => void;
  selectWorkout: (id: number) => void;
  createNewWorkout: (name: string, exerciseIds: string[], rounds: number) => void;
  updateExistingWorkout: (id: number, name: string, exerciseIds: string[], rounds: number) => void;
  deleteExistingWorkout: (id: number) => boolean;
  getNextWorkoutName: () => string;

  addExercise: (name: string) => void;
  renameExercise: (id: string, name: string) => void;
  removeExercise: (id: string) => void;

  startNewRound: () => void;
  saveRoundData: (roundIndex: number, exerciseId: string, reps: number) => void;
  resetUserProfile: () => void;
  finishWorkout: () => number;
  resetSession: () => void;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  exercises: [],
  allExercises: [],
  workouts: [],
  selectedWorkoutId: null,
  currentSession: {
    rounds: [{}],
    currentRound: 0,
  },
  userProfile: null,

  loadExercises: () => {
    const allExercises = getExercises();
    set({ allExercises });
  },

  loadUserProfile: () => {
    const profile = getUserProfile();
    set({ userProfile: profile });
  },

  loadWorkouts: () => {
    const allExercises = getExercises();
    const workouts = dbGetWorkouts();
    const { selectedWorkoutId } = get();

    // Select first workout if none selected or selected no longer exists
    let activeId = selectedWorkoutId;
    if (!activeId || !workouts.find(w => w.id === activeId)) {
      activeId = workouts.length > 0 ? workouts[0].id : null;
    }

    const selected = workouts.find(w => w.id === activeId);
    const exerciseMap = new Map(allExercises.map(e => [e.id, e]));
    const filteredExercises = selected
      ? selected.exerciseIds.map(id => exerciseMap.get(id)).filter(Boolean) as Exercise[]
      : allExercises;

    // Build rounds array matching workout round count
    const roundCount = selected?.rounds ?? 1;
    const emptyRounds: Array<{ [exerciseId: string]: number }> = [];
    for (let i = 0; i < roundCount; i++) {
      emptyRounds.push({});
    }

    set({
      allExercises,
      workouts,
      selectedWorkoutId: activeId,
      exercises: filteredExercises,
      currentSession: {
        rounds: emptyRounds,
        currentRound: 0,
      },
    });
  },

  selectWorkout: (id: number) => {
    const { allExercises, workouts } = get();
    const selected = workouts.find(w => w.id === id);
    if (!selected) return;

    const exerciseMap = new Map(allExercises.map(e => [e.id, e]));
    const filteredExercises = selected.exerciseIds.map(id => exerciseMap.get(id)).filter(Boolean) as Exercise[];
    const roundCount = selected.rounds;
    const emptyRounds: Array<{ [exerciseId: string]: number }> = [];
    for (let i = 0; i < roundCount; i++) {
      emptyRounds.push({});
    }

    set({
      selectedWorkoutId: id,
      exercises: filteredExercises,
      currentSession: {
        rounds: emptyRounds,
        currentRound: 0,
      },
    });
  },

  createNewWorkout: (name: string, exerciseIds: string[], rounds: number) => {
    dbCreateWorkout(name, exerciseIds, rounds);
    get().loadWorkouts();
  },

  updateExistingWorkout: (id: number, name: string, exerciseIds: string[], rounds: number) => {
    dbUpdateWorkout(id, name, exerciseIds, rounds);
    // Reload and re-select if the updated workout is active
    const { selectedWorkoutId } = get();
    get().loadWorkouts();
    if (selectedWorkoutId === id) {
      get().selectWorkout(id);
    }
  },

  deleteExistingWorkout: (id: number) => {
    const { workouts, selectedWorkoutId } = get();
    if (workouts.length <= 1) return false;

    dbDeleteWorkout(id);
    const remaining = dbGetWorkouts();

    if (selectedWorkoutId === id) {
      // Fall back to first remaining workout
      const fallback = remaining[0];
      set({ workouts: remaining.map(r => ({ ...r, exerciseIds: r.exerciseIds })), selectedWorkoutId: fallback?.id ?? null });
      if (fallback) get().selectWorkout(fallback.id);
    } else {
      get().loadWorkouts();
    }
    return true;
  },

  getNextWorkoutName: () => {
    return dbGetNextWorkoutName();
  },

  addExercise: (name: string) => {
    dbCreateExercise(name);
    const allExercises = getExercises();
    set({ allExercises });
  },

  renameExercise: (id: string, name: string) => {
    dbUpdateExercise(id, name);
    const allExercises = getExercises();
    set({ allExercises });
    // Refresh filtered exercises for current workout
    const { workouts, selectedWorkoutId } = get();
    const selected = workouts.find(w => w.id === selectedWorkoutId);
    if (selected) {
      const exerciseMap = new Map(allExercises.map(e => [e.id, e]));
      set({ exercises: selected.exerciseIds.map(id => exerciseMap.get(id)).filter(Boolean) as Exercise[] });
    }
  },

  removeExercise: (id: string) => {
    dbDeleteExercise(id);
    // Reload everything since workouts may have changed
    get().loadWorkouts();
  },

  startNewRound: () => {
    const { currentSession } = get();
    const nextRound = currentSession.currentRound + 1;

    if (nextRound < currentSession.rounds.length) {
      // Advance to next pre-populated round
      set({
        currentSession: {
          ...currentSession,
          currentRound: nextRound,
        },
      });
    } else {
      // All pre-populated rounds used, add a new one
      set({
        currentSession: {
          ...currentSession,
          rounds: [...currentSession.rounds, {}],
          currentRound: nextRound,
        },
      });
    }
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
    const { currentSession, selectedWorkoutId } = get();
    const userProfile = getUserProfile();

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

    const sessionId = createWorkoutSession(totalRounds, sessionVolume, selectedWorkoutId);

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
    const { workouts, selectedWorkoutId } = get();
    const selected = workouts.find(w => w.id === selectedWorkoutId);
    const roundCount = selected?.rounds ?? 1;
    const emptyRounds: Array<{ [exerciseId: string]: number }> = [];
    for (let i = 0; i < roundCount; i++) {
      emptyRounds.push({});
    }
    set({
      currentSession: {
        rounds: emptyRounds,
        currentRound: 0,
      },
    });
  },
}));
