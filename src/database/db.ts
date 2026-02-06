import * as SQLite from 'expo-sqlite';
import { createTables } from './schema';
import type { Exercise, WorkoutSession, WorkoutSet, UserProfile } from '../types';
import { calculateXP, calculateLevelFromXP } from '../utils/leveling';

const db = SQLite.openDatabaseSync('workout.db');

const DEFAULT_EXERCISES = [
  { id: 'exercise-default-1', name: 'Tractions', order: 0 },
  { id: 'exercise-default-2', name: 'Squats', order: 1 },
  { id: 'exercise-default-3', name: 'Pompes', order: 2 },
  { id: 'exercise-default-4', name: 'Dips', order: 3 },
];

export const initDatabase = () => {
  db.execSync(createTables);

  // Seed default exercises if the table is empty
  const exerciseCount = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM exercises');
  if (!exerciseCount || exerciseCount.count === 0) {
    for (const exercise of DEFAULT_EXERCISES) {
      db.runSync(
        'INSERT INTO exercises (id, name, "order") VALUES (?, ?, ?)',
        [exercise.id, exercise.name, exercise.order]
      );
    }
  }

  // Initialize user profile if not exists
  const profile = db.getFirstSync<UserProfile>('SELECT * FROM user_profile LIMIT 1');
  if (!profile) {
    db.runSync(
      'INSERT INTO user_profile (id, current_level, total_volume, experience_points) VALUES (?, ?, ?, ?)',
      ['user-1', 1, 0, 0]
    );
  }
};

export const getExercises = (): Exercise[] => {
  return db.getAllSync<Exercise>('SELECT * FROM exercises ORDER BY "order"');
};

export const createWorkoutSession = (totalRounds: number, totalVolume: number): string => {
  const id = `session-${Date.now()}`;
  const date = new Date().toISOString();
  db.runSync(
    'INSERT INTO workout_sessions (id, date, total_rounds, total_volume) VALUES (?, ?, ?, ?)',
    [id, date, totalRounds, totalVolume]
  );
  return id;
};

export const addWorkoutSet = (exerciseId: string, reps: number, roundNumber: number, sessionId: string): string => {
  const id = `set-${Date.now()}-${Math.random()}`;
  db.runSync(
    'INSERT INTO workout_sets (id, exercise_id, reps, round_number, workout_session_id) VALUES (?, ?, ?, ?, ?)',
    [id, exerciseId, reps, roundNumber, sessionId]
  );
  return id;
};

export const getUserProfile = (): UserProfile | null => {
  const result = db.getFirstSync<any>('SELECT * FROM user_profile LIMIT 1');
  if (!result) return null;
  
  return {
    id: result.id,
    currentLevel: result.current_level,
    totalVolume: result.total_volume,
    experiencePoints: result.experience_points,
  };
};

export const updateUserProfile = (totalVolume: number, experiencePoints: number, currentLevel: number) => {
  console.log('Updating profile with:', { totalVolume, experiencePoints, currentLevel });
  db.runSync(
    'UPDATE user_profile SET total_volume = ?, experience_points = ?, current_level = ? WHERE id = ?',
    [totalVolume, experiencePoints, currentLevel, 'user-1']
  );
};

export const deleteWorkoutSession = (sessionId: string) => {
  db.runSync('DELETE FROM workout_sets WHERE workout_session_id = ?', [sessionId]);
  db.runSync('DELETE FROM workout_sessions WHERE id = ?', [sessionId]);

  // Recalculate user profile from remaining sessions
  const result = db.getFirstSync<{ total: number }>(
    'SELECT COALESCE(SUM(total_volume), 0) as total FROM workout_sessions'
  );
  const newTotalVolume = result?.total ?? 0;
  const newTotalXP = calculateXP(newTotalVolume);
  const newLevel = calculateLevelFromXP(newTotalXP);
  updateUserProfile(newTotalVolume, newTotalXP, newLevel);
};

export const getWorkoutHistory = (): WorkoutSession[] => {
  return db.getAllSync<WorkoutSession>('SELECT * FROM workout_sessions ORDER BY date DESC');
};

export const getWorkoutSets = (sessionId: string): (WorkoutSet & { exerciseName: string })[] => {
  return db.getAllSync(
    `SELECT ws.*, e.name as exerciseName 
     FROM workout_sets ws 
     JOIN exercises e ON ws.exercise_id = e.id 
     WHERE ws.workout_session_id = ? 
     ORDER BY ws.round_number, e."order"`,
    [sessionId]
  );
};

export default db;