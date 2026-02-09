export const createTables = `
  CREATE TABLE IF NOT EXISTS exercises (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    "order" INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS workout_sessions (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    total_rounds INTEGER NOT NULL,
    total_volume INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS workout_sets (
    id TEXT PRIMARY KEY,
    exercise_id TEXT NOT NULL,
    reps INTEGER NOT NULL,
    round_number INTEGER NOT NULL,
    workout_session_id TEXT NOT NULL,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id),
    FOREIGN KEY (workout_session_id) REFERENCES workout_sessions(id)
  );

  CREATE TABLE IF NOT EXISTS user_profile (
    id TEXT PRIMARY KEY,
    current_level INTEGER NOT NULL DEFAULT 1,
    total_volume INTEGER NOT NULL DEFAULT 0,
    experience_points INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    exercise_ids TEXT NOT NULL,
    rounds INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS training_schedule (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_of_week INTEGER NOT NULL,
    reminder_hour INTEGER NOT NULL DEFAULT 9,
    reminder_minute INTEGER NOT NULL DEFAULT 0,
    enabled INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`;