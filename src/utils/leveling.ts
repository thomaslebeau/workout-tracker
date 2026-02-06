const XP_PER_REP = 10;
const XP_BASE = 100;
const XP_MULTIPLIER = 1.5;

export const calculateXP = (reps: number): number => {
  return reps * XP_PER_REP;
};

export const calculateLevelFromXP = (totalXP: number): number => {
  let level = 1;
  let xpRequired = XP_BASE;
  let accumulatedXP = 0;

  while (totalXP >= accumulatedXP + xpRequired) {
    accumulatedXP += xpRequired;
    level++;
    xpRequired = Math.floor(XP_BASE * Math.pow(XP_MULTIPLIER, level - 1));
  }

  return level;
};

export const getXPForNextLevel = (currentLevel: number): number => {
  return Math.floor(XP_BASE * Math.pow(XP_MULTIPLIER, currentLevel));
};

export const getXPProgress = (totalXP: number, currentLevel: number): { current: number; required: number; percentage: number } => {
  let accumulatedXP = 0;
  for (let i = 1; i < currentLevel; i++) {
    accumulatedXP += Math.floor(XP_BASE * Math.pow(XP_MULTIPLIER, i - 1));
  }

  const currentLevelXP = totalXP - accumulatedXP;
  const requiredXP = getXPForNextLevel(currentLevel);
  const percentage = (currentLevelXP / requiredXP) * 100;

  return {
    current: currentLevelXP,
    required: requiredXP,
    percentage: Math.min(percentage, 100)
  };
};