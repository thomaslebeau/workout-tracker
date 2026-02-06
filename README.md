# Workout Tracker

A React Native mobile app built with Expo that gamifies workout tracking through an XP-based leveling system.

## How It Works

1. **Create exercises** - Define custom exercises (e.g. push-ups, squats, pull-ups)
2. **Track workouts** - Perform rounds of exercises, logging reps for each
3. **Earn XP** - Every rep grants 10 XP, which contributes to leveling up
4. **Level up** - XP thresholds scale exponentially (base 100, 1.5x per level)
5. **Review history** - Browse and manage past workout sessions

## Features

- Custom exercise management with ordering
- Multi-round workout sessions
- XP and leveling progression system
- Workout history with per-session details
- User profile with level, XP progress bar, and total volume stats
- Local SQLite storage (all data stays on device)

## Tech Stack

- **Framework**: React Native 0.81 + Expo 54 (New Architecture enabled)
- **Language**: TypeScript
- **Navigation**: React Navigation (bottom tabs)
- **State Management**: Zustand
- **Database**: expo-sqlite
- **Data Fetching**: TanStack React Query
- **Charts**: Victory Native
- **Date Formatting**: date-fns

## Project Structure

```
src/
  database/
    db.ts          # SQLite operations (CRUD for exercises, sessions, sets, profile)
    schema.ts      # Table definitions (exercises, workout_sessions, workout_sets, user_profile)
  navigation/
    AppNavigator.tsx  # Bottom tab navigator (Workout, History, Profile, Exercises)
  screens/
    WorkoutScreen.tsx          # Main workout input (reps per exercise per round)
    HistoryScreen.tsx          # Past sessions list with delete support
    ProfileScreen.tsx          # Level, XP progress, total stats, reset option
    ManageExercisesScreen.tsx  # Add/view custom exercises
  stores/
    workoutStore.ts  # Zustand store (exercises, session state, profile, XP calculations)
  types/
    index.ts         # TypeScript interfaces (Exercise, WorkoutSet, WorkoutSession, UserProfile)
  utils/
    leveling.ts      # XP/level math (calculateXP, calculateLevelFromXP, getXPProgress)
```

## Getting Started

```bash
npm install
npx expo start
```

Then open the app on a device or emulator via the Expo development client.
