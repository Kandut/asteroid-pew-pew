const DEFAULT = {
  timePlayed: 0,
  asteroidsDestroyed: 0,
  damageDealt: 0,
  bulletsFired: 0,
  bulletsHit: 0,
  rocketsFired: 0,
  distanceTraveled: 0,

  bossesDefeated: 0,

  coinsCollected: 0,
  experienceCollected: 0,
  abilitiesObtained: 0,

  plintinCollected: 0,
  xeroniumCollected: 0,
  blubboniumCollected: 0,

  level: 1,
};

const BEST_STRING = JSON.stringify(DEFAULT);

const getScoreName = (isPacifist, isStationary, isExtreme, isHitless) =>
  "rogue-best" +
  (isPacifist ? "-pacifist" : "-default") +
  (isStationary ? "-stationary" : "-default") +
  (isExtreme ? "-extreme" : "-default") +
  (isHitless ? "-hitless" : "-default");

export const getBest = (isPacifist, isStationary, isExtreme, isHitless) => {
  const bestName = getScoreName(isPacifist, isStationary, isExtreme, isHitless);
  return JSON.parse(localStorage.getItem(bestName) || BEST_STRING);
};

export const gameState = { ...DEFAULT };

export const trackScore = (isPacifist, isStationary, isExtreme, isHitless) => {
  const best = getBest(isPacifist, isStationary, isExtreme, isHitless);
  best.timePlayed = Math.max(best.timePlayed, gameState.timePlayed);
  best.asteroidsDestroyed = Math.max(best.asteroidsDestroyed, gameState.asteroidsDestroyed);
  best.damageDealt = Math.max(best.damageDealt, gameState.damageDealt);
  best.bulletsFired = Math.max(best.bulletsFired, gameState.bulletsFired);
  best.bulletsHit = Math.max(best.bulletsHit, gameState.bulletsHit);
  best.rocketsFired = Math.max(best.rocketsFired, gameState.rocketsFired);
  best.distanceTraveled = Math.max(best.distanceTraveled, gameState.distanceTraveled);
  best.bossesDefeated = Math.max(best.bossesDefeated, gameState.bossesDefeated);
  best.coinsCollected = Math.max(best.coinsCollected, gameState.coinsCollected);
  best.experienceCollected = Math.max(best.experienceCollected, gameState.experienceCollected);
  best.plintinCollected = Math.max(best.plintinCollected, gameState.plintinCollected);
  best.xeroniumCollected = Math.max(best.xeroniumCollected, gameState.xeroniumCollected);
  best.blubboniumCollected = Math.max(best.blubboniumCollected, gameState.blubboniumCollected);
  best.abilitiesObtained = Math.max(best.abilitiesObtained, gameState.abilitiesObtained);
  best.level = Math.max(best.level, gameState.level);
  localStorage.setItem(getScoreName(isPacifist, isStationary, isExtreme), JSON.stringify(best));
};

export const resetGameState = () => {
  gameState.timePlayed = DEFAULT.timePlayed;
  gameState.asteroidsDestroyed = DEFAULT.asteroidsDestroyed;
  gameState.damageDealt = DEFAULT.damageDealt;
  gameState.bulletsFired = DEFAULT.bulletsFired;
  gameState.bulletsHit = DEFAULT.bulletsHit;
  gameState.rocketsFired = DEFAULT.rocketsFired;
  gameState.distanceTraveled = DEFAULT.distanceTraveled;
  gameState.bossesDefeated = DEFAULT.bossesDefeated;
  gameState.coinsCollected = DEFAULT.coinsCollected;
  gameState.experienceCollected = DEFAULT.experienceCollected;
  gameState.plintinCollected = DEFAULT.plintinCollected;
  gameState.xeroniumCollected = DEFAULT.xeroniumCollected;
  gameState.blubboniumCollected = DEFAULT.blubboniumCollected;
  gameState.abilitiesObtained = DEFAULT.abilitiesObtained;
  gameState.level = DEFAULT.level;
};
