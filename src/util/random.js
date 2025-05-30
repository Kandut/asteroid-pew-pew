const canvas = document.getElementsByTagName("canvas")[0];

let onlySplitable = false;

export const setOnlySplitable = (draw) => {
  onlySplitable = draw;
};

export const randomPosition = () => {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
  };
};

export const randomPositionOnEdge = () => {
  const edge = Math.floor(Math.random() * 4);
  const padding = 90;

  switch (edge) {
    case 0: // Top edge
      return { x: Math.random() * canvas.width, y: -padding };
    case 1: // Right edge
      return { x: canvas.width + padding, y: Math.random() * canvas.height };
    case 2: // Bottom edge
      return { x: Math.random() * canvas.width, y: canvas.height + padding };
    case 3: // Left edge
      return { x: -padding, y: Math.random() * canvas.height };
  }
};

export const randomVelocity = (scale) => {
  const angle = Math.random() * Math.PI * 2;
  return {
    x: Math.cos(angle) * scale,
    y: Math.sin(angle) * scale,
  };
};

export const randomAngularVelocity = (scale) => {
  return (Math.random() * 2 - 1) * scale;
};

export const randomAsteroidSize = (timePlayed) => {
  const sizes = [20, 30, 40];
  if (timePlayed > 30000) {
    sizes.shift();
    sizes.push(50);
  }
  if (timePlayed > 60000) {
    sizes.shift();
    sizes.push(60);
  }
  if (timePlayed > 90000) {
    sizes.shift();
    sizes.push(80);
  }
  if (timePlayed > 120000) {
    sizes.shift();
    sizes.push(100);
  }
  return sizes[Math.floor(Math.random() * sizes.length)];
};

export const randomPowerupType = () => {
  const types = ["health", "damage", "rocket-piercing", "coins", "experience", "ability", "plintin", "xeronium", "blubbonium"];
  const probabilities = [3, 1, 1, 0.5, 0.5, 0.1, 0.5, 0.5, 0.5];
  return randomRangeWithProbability(types, probabilities);
};

export const randomRangeWithProbability = (values, probabilities) => {
  const sum = probabilities.reduce((res, cur) => {
    return res + cur;
  }, 0);

  const randomValue = Math.random() * sum;
  let cumulativeProbability = 0;
  for (let i = 0; i < probabilities.length; i++) {
    cumulativeProbability += probabilities[i];
    if (randomValue < cumulativeProbability) {
      return values[i];
    }
  }
  return values[probabilities.length - 1];
};

export const randomIndexWithProbability = (probabilities) => {
  const sum = probabilities.reduce((res, cur) => {
    return res + cur;
  }, 0);

  const randomValue = Math.random() * sum;
  let cumulativeProbability = 0;
  for (let i = 0; i < probabilities.length; i++) {
    cumulativeProbability += probabilities[i];
    if (randomValue < cumulativeProbability) {
      return i;
    }
  }
  return probabilities.length - 1;
};

export const randomAsteroidType = () => {
  const types = ["default", "split", "homing", "armored", "turret", "golden", "plintin", "xeronium", "blubbonium"];
  const probabilities = [0.68, 0.05, 0.05, 0.05, 0.05, 0.03, 0.03, 0.03, 0.03];
  return onlySplitable ? "split" : randomRangeWithProbability(types, probabilities);
};

export const randomAsteroidTypeExtreme = () => {
  const types = ["split", "homing", "armored", "turret", "golden", "plintin", "xeronium", "blubbonium"];
  const probabilities = [0.19, 0.19, 0.19, 0.19, 0.12, 0.04, 0.04, 0.04];
  return randomRangeWithProbability(types, probabilities);
};