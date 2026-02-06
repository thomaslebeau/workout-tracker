export interface Exercise {
  id: string;
  name: string;
  order: number;
}

export interface WorkoutSet {
  id: string;
  exerciseId: string;
  reps: number;
  roundNumber: number;
  workoutSessionId: string;
}

export interface WorkoutSession {
  id: string;
  date: string;
  totalRounds: number;
  totalVolume: number;
}

export interface UserProfile {
  id: string;
  currentLevel: number;
  totalVolume: number;
  experiencePoints: number;
}