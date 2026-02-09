import * as SQLite from 'expo-sqlite';
import { createTables } from './schema';
import type { Exercise, Workout, WorkoutSession, WorkoutSet, UserProfile } from '../types';
import { calculateXP, calculateLevelFromXP } from '../utils/leveling';

const db = SQLite.openDatabaseSync('workout.db');

const DEFAULT_EXERCISES = [
  { id: 'exercise-default-1', name: 'Tractions', order: 0 },
  { id: 'exercise-default-2', name: 'Squats', order: 1 },
  { id: 'exercise-default-3', name: 'Pompes', order: 2 },
  { id: 'exercise-default-4', name: 'Dips', order: 3 },
  { id: 'exercise-default-5', name: 'Montées de genoux', order: 4 },
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

  // Migration: add missing exercises
  for (const exercise of DEFAULT_EXERCISES) {
    const exists = db.getFirstSync<{ count: number }>(
      'SELECT COUNT(*) as count FROM exercises WHERE id = ?', [exercise.id]
    );
    if (!exists || exists.count === 0) {
      db.runSync(
        'INSERT INTO exercises (id, name, "order") VALUES (?, ?, ?)',
        [exercise.id, exercise.name, exercise.order]
      );
    }
  }

  // Migration: add workout_id column to workout_sessions
  try {
    db.runSync('ALTER TABLE workout_sessions ADD COLUMN workout_id INTEGER');
  } catch (_) {
    // Column already exists
  }

  // Seed default workout if workouts table is empty
  const workoutCount = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM workouts');
  if (!workoutCount || workoutCount.count === 0) {
    const allExerciseIds = DEFAULT_EXERCISES.map(e => e.id);
    db.runSync(
      'INSERT INTO workouts (name, exercise_ids, rounds) VALUES (?, ?, ?)',
      ['Training #1', JSON.stringify(allExerciseIds), 1]
    );
  }
};

export const getExercises = (): Exercise[] => {
  return db.getAllSync<Exercise>('SELECT * FROM exercises ORDER BY "order"');
};

export const createWorkoutSession = (totalRounds: number, totalVolume: number, workoutId?: number | null): string => {
  const id = `session-${Date.now()}`;
  const date = new Date().toISOString();
  db.runSync(
    'INSERT INTO workout_sessions (id, date, total_rounds, total_volume, workout_id) VALUES (?, ?, ?, ?, ?)',
    [id, date, totalRounds, totalVolume, workoutId ?? null]
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
  return db.getAllSync<WorkoutSession>(
    'SELECT id, date, total_rounds AS totalRounds, total_volume AS totalVolume FROM workout_sessions ORDER BY date DESC'
  );
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

export type VolumeFilter = 'day' | 'week' | 'year';

export interface VolumeDataPoint {
  label: string;
  value: number;
}

export interface VolumeStats {
  dataPoints: VolumeDataPoint[];
  totalSessions: number;
  avgVolume: number;
  bestSession: number;
}

export const getVolumeStats = (filter: VolumeFilter): VolumeStats => {
  let query: string;

  // Dates are stored as ISO 8601 (e.g. '2026-02-06T14:30:00.000Z').
  // SQLite date functions require 'YYYY-MM-DD HH:MM:SS', so we normalize first.
  const d = "replace(replace(date, 'T', ' '), 'Z', '')";

  switch (filter) {
    case 'day':
      query = `
        SELECT strftime('%d/%m', ${d}) as label, SUM(total_volume) as value
        FROM workout_sessions
        WHERE ${d} >= datetime('now', '-14 days')
        GROUP BY date(${d})
        ORDER BY date(${d}) ASC
      `;
      break;
    case 'week':
      query = `
        SELECT 'S' || strftime('%W', ${d}) as label, SUM(total_volume) as value
        FROM workout_sessions
        WHERE ${d} >= datetime('now', '-84 days')
        GROUP BY strftime('%Y-%W', ${d})
        ORDER BY strftime('%Y-%W', ${d}) ASC
      `;
      break;
    case 'year':
      query = `
        SELECT CASE strftime('%m', ${d})
          WHEN '01' THEN 'Jan' WHEN '02' THEN 'Feb' WHEN '03' THEN 'Mar'
          WHEN '04' THEN 'Apr' WHEN '05' THEN 'May' WHEN '06' THEN 'Jun'
          WHEN '07' THEN 'Jul' WHEN '08' THEN 'Aug' WHEN '09' THEN 'Sep'
          WHEN '10' THEN 'Oct' WHEN '11' THEN 'Nov' WHEN '12' THEN 'Dec'
        END as label, SUM(total_volume) as value
        FROM workout_sessions
        WHERE ${d} >= datetime('now', '-12 months')
        GROUP BY strftime('%Y-%m', ${d})
        ORDER BY strftime('%Y-%m', ${d}) ASC
      `;
      break;
  }

  const dataPoints = db.getAllSync<VolumeDataPoint>(query);

  const summaryQuery = `
    SELECT
      COUNT(*) as totalSessions,
      COALESCE(AVG(total_volume), 0) as avgVolume,
      COALESCE(MAX(total_volume), 0) as bestSession
    FROM workout_sessions
  `;
  const summary = db.getFirstSync<{ totalSessions: number; avgVolume: number; bestSession: number }>(summaryQuery);

  return {
    dataPoints,
    totalSessions: summary?.totalSessions ?? 0,
    avgVolume: Math.round(summary?.avgVolume ?? 0),
    bestSession: summary?.bestSession ?? 0,
  };
};

// --- Exercise CRUD ---

export const createExercise = (name: string): string => {
  const id = `exercise-${Date.now()}`;
  const maxOrder = db.getFirstSync<{ max: number | null }>(
    'SELECT MAX("order") as max FROM exercises'
  );
  const order = (maxOrder?.max ?? -1) + 1;
  db.runSync(
    'INSERT INTO exercises (id, name, "order") VALUES (?, ?, ?)',
    [id, name, order]
  );
  return id;
};

export const updateExercise = (id: string, name: string) => {
  db.runSync('UPDATE exercises SET name = ? WHERE id = ?', [name, id]);
};

export const deleteExercise = (id: string) => {
  db.runSync('DELETE FROM exercises WHERE id = ?', [id]);

  // Remove from all workout exercise_ids arrays
  const workouts = db.getAllSync<{ id: number; exercise_ids: string }>(
    'SELECT id, exercise_ids FROM workouts'
  );
  for (const w of workouts) {
    const ids: string[] = JSON.parse(w.exercise_ids);
    const filtered = ids.filter(eid => eid !== id);
    if (filtered.length !== ids.length) {
      db.runSync(
        'UPDATE workouts SET exercise_ids = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [JSON.stringify(filtered), w.id]
      );
    }
  }
};

// --- Workout CRUD ---

export const getWorkouts = (): Workout[] => {
  const rows = db.getAllSync<{ id: number; name: string; exercise_ids: string; rounds: number }>(
    'SELECT id, name, exercise_ids, rounds FROM workouts ORDER BY id'
  );
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    exerciseIds: JSON.parse(row.exercise_ids),
    rounds: row.rounds,
  }));
};

export const createWorkout = (name: string, exerciseIds: string[], rounds: number): number => {
  const result = db.runSync(
    'INSERT INTO workouts (name, exercise_ids, rounds) VALUES (?, ?, ?)',
    [name, JSON.stringify(exerciseIds), rounds]
  );
  return result.lastInsertRowId;
};

export const updateWorkout = (id: number, name: string, exerciseIds: string[], rounds: number) => {
  db.runSync(
    'UPDATE workouts SET name = ?, exercise_ids = ?, rounds = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [name, JSON.stringify(exerciseIds), rounds, id]
  );
};

export const deleteWorkout = (id: number) => {
  db.runSync('DELETE FROM workouts WHERE id = ?', [id]);
};

export const getNextWorkoutName = (): string => {
  const count = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM workouts');
  return `Training #${(count?.count ?? 0) + 1}`;
};

// --- Training Schedule ---

export interface ScheduleEntry {
  id: number;
  dayOfWeek: number;
  reminderHour: number;
  reminderMinute: number;
  enabled: number;
}

export const getSchedule = (): ScheduleEntry[] => {
  const rows = db.getAllSync<{
    id: number;
    day_of_week: number;
    reminder_hour: number;
    reminder_minute: number;
    enabled: number;
  }>('SELECT * FROM training_schedule ORDER BY day_of_week');
  return rows.map(r => ({
    id: r.id,
    dayOfWeek: r.day_of_week,
    reminderHour: r.reminder_hour,
    reminderMinute: r.reminder_minute,
    enabled: r.enabled,
  }));
};

export const setSchedule = (activeDays: number[], hour: number, minute: number) => {
  db.runSync('DELETE FROM training_schedule');
  for (const day of activeDays) {
    db.runSync(
      'INSERT INTO training_schedule (day_of_week, reminder_hour, reminder_minute, enabled) VALUES (?, ?, ?, 1)',
      [day, hour, minute]
    );
  }
};

// --- App Settings ---

export const getSetting = (key: string): string | null => {
  const row = db.getFirstSync<{ value: string }>(
    'SELECT value FROM app_settings WHERE key = ?',
    [key]
  );
  return row?.value ?? null;
};

export const setSetting = (key: string, value: string) => {
  db.runSync(
    'INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)',
    [key, value]
  );
};

export default db;