import {
  BOX,
  calculateTotalMomentum,
  checkAndResolveCollision,
  checkCollisionBoxBox,
  checkCollisionDiscDisc,
  createPhysicsEntity,
  DISC,
  velocityVerlet,
} from "./features/RigidBody.js";
import { pathInterpolate, createArcLengthTable, samplePath } from "./features/PathInterpol.js";
import {
  randomAngularVelocity,
  randomPositionOnEdge,
  randomAsteroidSize,
  randomPosition,
  randomPowerupType,
  randomAsteroidType,
  randomAsteroidTypeExtreme,
} from "./util/random.js";
import * as renderer from "./renderer/2d.js";
import { angleOfVector, angleToUnitVector, lerp, normalize, scale, sub } from "./util/linalg.js";
import { gameState, getBest, resetGameState, trackScore } from "./util/gamestatistics.js";
import {
  playArmorHitSound,
  playAsteroidCollisionSound,
  playBulletHitSound,
  playBulletShootSound,
  playExplosionSound,
  playPickupCoinSound,
  playPowerupSound,
  playSpaceshipCollisionSound,
  setPropulsionVolume,
  setVolumeModifier,
} from "./util/sound.js";
import asteroid1Url from "/img/Asteroid1.png?url";
import asteroidSplitIUrl from "/img/asteroid_split.png";
import asteroidRedUrl from "/img/asteroid_red.png?url";
import asteroidArmoredUrl from "/img/asteroid_armored.png?url";
import asteroidGreenUrl from "/img/asteroid_green.png?url";
import asteroidGoldUrl from "/img/rogue/asteroid_gold.png?url";
import asteroidPlintinUrl from "/img/rogue/plintin_asteroid.png?url";
import asteroidXeroniumUrl from "/img/rogue/xeronium_asteroid.png?url";
import asteroidBlubboniumUrl from "/img/rogue/blubbonium_asteroid.png?url";
import spaceshipUrl from "/img/Spaceship.png?url";
import wingLeftUrl from "/img/WingLeft.png?url";
import wingRightUrl from "/img/WingRight.png?url";
import bossesColossusUrl from "/img/rogue/colossus.png?url";
import * as ui from "./util/ui.js";

import * as shop from "./util/rogue/shop.js";
import {modifiers, handleLevelUp} from "./util/rogue/rogue.js";
import * as bosses from "./util/rogue/bosses.js";

import { createFragementTexture, prepareVornoi } from "./features/VoronoiFracture.js";

// DOM elements
let canvas = document.getElementsByTagName("canvas")[0];

let controllerIndex = null;

let voronoiNoiseDisabled = false;

const BULLET_MASS = 1000;
const SPACESHIP_MASS = 1;
const SPACESHIP_FORCE = 0.0005;

const calculateAsteroidMass = (radius, type) => {
  const density = type === "armored" ? 10 : 3.5;
  return type === "armored"
    ? (radius * 2) ** 3 * density // box shape
    : (4 / 3) * Math.PI * radius ** 3 * density; // ball shape
};

// game state
let paused = true;
const resume = () => (paused = false);
const pause = () => (paused = true);
let frameHandle;

// fps / ups settings
let desired_delta_time = 1000 / 120;
const setDesiredDeltaTime = (value) => (desired_delta_time = value);
let desired_frame_time = 1000 / 60;
const setDesiredFrameTime = (value) => (desired_frame_time = value);

let lastFrameTime = 0;
let lastUpdateTime = 0;
let lastSummaryTime = 0;

let weaponsEnabled = true;
const setWeaponsEnabled = (enabled) => (weaponsEnabled = enabled);

let movementEnabled = true;
const setMovementEnabled = (enabled) => (movementEnabled = enabled);

// statistics
let updatesLastSecond = 0;
let framesLastSecond = 0;
let lastMenueToggle = 0;
let lastShopToggle = 0;

// entities
let asteroids = [];
let bullets = [];
let rockets = [];
let spaceship = null;
let powerups = [];

// shooting
const baseBulletDamage = 1;
let bulletDamage = baseBulletDamage;
let bulletIndex = 0;
let shootingBullets = false;
let lastBulletTime = 0;
const baseBulletCooldown = 40;
let bulletCooldown = baseBulletCooldown; // in ms
let enemyBulletCooldown = 80; // in ms

// rockets
const baseRocketPiercing = 3;
let rocketPiercing = baseRocketPiercing;
let shootingRockets = false;
const baseRocketCooldown = 3000;
let rocketCooldown = baseRocketCooldown; // in ms
let lastRocketTime = 0;
let rocketVelocity = 300;
const setRocketSpeed = (value) => (rocketVelocity = value);

// asteroids
const baseAsteroidCooldown = 1000;
let asteroidCooldown = baseAsteroidCooldown;
let lastAsteroidTime = 0;
const computeAsteroidCooldown = (elapsed) => Math.pow(0.99, elapsed / 1000) * 1000;
const asteroidTextures = {
  default: asteroid1Url,
  homing: asteroidRedUrl,
  armored: asteroidArmoredUrl,
  turret: asteroidGreenUrl,
  split: asteroidSplitIUrl,
  
  golden: asteroidGoldUrl,
  plintin: asteroidPlintinUrl,
  xeronium: asteroidXeroniumUrl,
  blubbonium: asteroidBlubboniumUrl,

  Colossus: bossesColossusUrl,
};

// bosses
const baseBossCooldown = 300 * 1000;
let bossCooldown = baseBossCooldown;
let lastBossTime = 0;

let extremeModeEnabled = false;
const setExtremeModeEnabled = (enabled) => (extremeModeEnabled = enabled);

let hitlessModeEnabled = false;
const setHitlessModeEnabled = (enabled) => {
  hitlessModeEnabled = enabled;
};

// powerups
const basePowerupCooldown = 10000;
let powerupCooldown = 10000;
let lastPowerupTime = 0;

let collectedPowerups = {
  changes: false,
  bullet_damage: 0,
  rocket_piercing: 0,
}

// level
let currentLevel = 1;
let currentExperience = 0;
let experienceNeeded = 200;
let experienceScaling = 100; // needed = scaling * level

let movement = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  forwardController: false,
  backwardController: false,
  leftController: false,
  rightController: false,
};

let currentMenue = "none"; // types: "pause" "shop"
const toggleMenue = (menueType) => {
  if (currentMenue != menueType) {
    pause();
    setPropulsionVolume(0);
    switch (menueType) {
      case "pause":
        shop.hideShop();
        ui.showPauseMenu();
        break;

      case "shop":
        ui.hidePauseMenu();
        shop.showShop();
        break;
    }
    currentMenue = menueType;
  } else {
    ui.hidePauseMenu();
    shop.hideShop();
    resume();
    currentMenue = "none";
  }
}

let drawCollisions = false;
const setDrawCollisions = (enabled) => {
  drawCollisions = enabled;
};

let boxColliders = false;
const setDebugBoxColliders = (enabled) => {
  boxColliders = enabled;
  asteroids.forEach((asteroid) => {
    asteroid.collider = enabled ? BOX : DISC;
  });
  if (spaceship) {
    spaceship.collider = enabled ? BOX : DISC;
  }
};

const main = () => {
  document.getElementById("version").innerText = `${__APP_VERSION__}`;
  lastFrameTime = performance.now();
  lastSummaryTime = lastFrameTime;

  initInput();
  ui.init(
    startGame,
    setWeaponsEnabled,
    setMovementEnabled,
    setVolumeModifier,
    setDesiredFrameTime,
    setDesiredDeltaTime,
    setRocketSpeed,
    resume,
    resetGame,
    setExtremeModeEnabled,
    setHitlessModeEnabled,
    setDrawCollisions,
    setDebugBoxColliders
  );
  // playBackgroundMusic();
};

const controllerInput = (now) => {
  if (controllerIndex == null) {
    return;
  }
  const gamepad = navigator.getGamepads()[controllerIndex];

  /* gamepad.buttons
    0... A
    1... B
    2... X
    3... Y
    4... LB
    5... RB
    6... LT
    7... RT
    8... Menue
    9... Pause
    10... Left Stick Press
    11... Right Stick Press
    12... Cross Up
    13... Cross Down
    14... Cross Left
    15... Cross Right
  */

  if (gamepad.buttons[9].value >= 0.5 && now - 300 >= lastMenueToggle) {
    toggleMenue("pause");
    lastMenueToggle = now;
  }
  if (gamepad.buttons[7].pressed && gamepad.buttons[7].value >= 0.5) {
    shootingBullets = !paused && weaponsEnabled;
  } else {
    shootingBullets = false;
  }
  if (gamepad.buttons[8].pressed && gamepad.buttons[8].value >= 0.5 && now - 300 >= lastShopToggle) {
    toggleMenue("shop");
    lastShopToggle = now;
  }
  if (gamepad.buttons[6].pressed && gamepad.buttons[6].value >= 0.5) {
    shootingRockets = !paused && weaponsEnabled;
  } else {
    shootingRockets = false;
  }
  if (gamepad.buttons[12].pressed) {
    movement.forwardController = !paused && movementEnabled;
  } else {
    movement.forwardController = false;
  }
  if (gamepad.buttons[13].pressed) {
    movement.backwardController = !paused && movementEnabled;
  } else {
    movement.backwardController = false;
  }
  if (gamepad.buttons[14].pressed) {
    movement.leftController = !paused && movementEnabled;
  } else {
    movement.leftController = false;
  }
  if (gamepad.buttons[15].pressed) {
    movement.rightController = !paused && movementEnabled;
  } else {
    movement.rightController = false;
  }

  /* gamepad.axes
    0... Left Horizontal
    1... Left Vertical
    2... Right Horizontal
    3... Right Vertical
  */

  if (Math.abs(gamepad.axes[2]) >= 0.5 || Math.abs(gamepad.axes[3]) >= 0.5) {
    spaceship.rotation = Math.atan2(gamepad.axes[3], gamepad.axes[2]);
  }
};

const initInput = () => {
  for (const element of document.getElementsByClassName("controller")) {
    element.style.display = "none";
  }

  window.addEventListener("gamepadconnected", (event) => {
    controllerIndex = event.gamepad.index;
    for (const element of document.getElementsByClassName("controller")) {
      element.style.display = "inline";
    }
  });

  window.addEventListener("gamepaddisconnected", () => {
    controllerIndex = null;
    for (const element of document.getElementsByClassName("controller")) {
      element.style.display = "none";
    }
  });

  document.addEventListener("keydown", (event) => {
    switch (event.key) {
      case "Escape":
        toggleMenue("pause");
        break;
      case "e":
      case "E":
        toggleMenue("shop");
        break;
      case " ":
        shootingBullets = !paused && weaponsEnabled;
        break;
      case "Shift":
        shootingRockets = !paused && weaponsEnabled;
        break;
      case "ArrowUp":
      case "w":
      case "W":
        movement.forward = !paused && movementEnabled;
        break;
      case "ArrowDown":
      case "s":
      case "S":
        movement.backward = !paused && movementEnabled;
        break;
      case "ArrowLeft":
      case "a":
      case "A":
        movement.left = !paused && movementEnabled;
        break;
      case "ArrowRight":
      case "d":
      case "D":
        movement.right = !paused && movementEnabled;
        break;
    }
  });

  document.addEventListener("keyup", (event) => {
    switch (event.key) {
      case " ":
        shootingBullets = false;
        break;
      case "Shift":
        shootingRockets = false;
        break;
      case "ArrowUp":
      case "w":
      case "W":
        movement.forward = false;
        break;
      case "ArrowDown":
      case "s":
      case "S":
        movement.backward = false;
        break;
      case "ArrowLeft":
      case "a":
      case "A":
        movement.left = false;
        break;
      case "ArrowRight":
      case "d":
      case "D":
        movement.right = false;
        break;
    }
  });

  document.addEventListener("mousemove", (event) => {
    if (paused || spaceship == null) {
      return;
    }
    const x = event.clientX - canvas.getBoundingClientRect().left;
    const y = event.clientY - canvas.getBoundingClientRect().top;
    const dx = x - spaceship.position.x;
    const dy = y - spaceship.position.y;
    spaceship.rotation = Math.atan2(dy, dx);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      paused = true;
      ui.showPauseMenu();
    }
  });
};

const updateStats = () => {
  if (!modifiers.changes && !collectedPowerups.changes) {
    return;
  }
  collectedPowerups.changes = false;
  modifiers.changes = false;

  bulletDamage = ((baseBulletDamage + collectedPowerups.bullet_damage) * modifiers.bullet_damage_m + modifiers.bullet_damage_a) * (modifiers.bullet_compression);
  bulletCooldown = (baseBulletCooldown * (1 / modifiers.bullet_attack_speed_m) - modifiers.bullet_attack_speed_a) * (modifiers.bullet_compression * 0.95);

  rocketPiercing = Math.round((baseRocketPiercing + collectedPowerups.rocket_piercing) * modifiers.rocket_piercing_m + modifiers.rocket_piercing_a);
  rocketCooldown = baseRocketCooldown * (1 / modifiers.rocket_attack_speed_m) - modifiers.rocket_attack_speed_a; 

  powerupCooldown = basePowerupCooldown * (1 / modifiers.powerup_cooldown_m) - modifiers.powerup_cooldown_a;

  asteroidCooldown = baseAsteroidCooldown * (1 / modifiers.asteroid_spawn_rate_m) - modifiers.asteroid_spawn_rate_a;

  ui.updateBulletDamage(bulletDamage);
  ui.updateFireRate(bulletCooldown);
  ui.updateRocketPiercing(rocketPiercing);
}

let now = performance.now();

const doFrame = () => {
  now = performance.now();

  controllerInput(now);

  // updates
  // update at fixed rate to avoid physics issues
  // process next update if we are more than half a frame behind
  while (lastUpdateTime + desired_delta_time / 2 <= now) {
    if (!paused) {
      update(desired_delta_time);
      ++updatesLastSecond;
    }
    lastUpdateTime += desired_delta_time;
  }

  // render
  // render at desired rate
  // limited by the browser through requestAnimationFrame
  // process next render if we are more than half a frame behind
  if (lastFrameTime + desired_frame_time / 2 <= now) {
    if (!paused) {
      renderer.render();
      ++framesLastSecond;
    }
    lastFrameTime = now;
  }

  // every second, update the UI
  if (now - lastSummaryTime >= 1000) {
    const entityCount = asteroids.length + bullets.length + rockets.length + (spaceship ? 1 : 0);
    ui.updateDebugHeader(entityCount, framesLastSecond, updatesLastSecond);

    framesLastSecond = 0;
    updatesLastSecond = 0;

    lastSummaryTime = now;
  }

  // framerate is controlled by the browser
  frameHandle = requestAnimationFrame(doFrame);
};

const processEvents = () => {
  // bullets
  if (shootingBullets && now - lastBulletTime >= bulletCooldown && spaceship) {
    let rotation = modifiers.shoot_random_direction ? Math.random() * 360 : spaceship.rotation + (Math.random() - 0.5) * 0.1;
    const offsetMultiplier = bulletIndex % 2 === 0 ? -1 : 1;
    const bulletPosition = angleToUnitVector(spaceship.rotation + (Math.PI / 2) * offsetMultiplier);
    bulletPosition.x *= 10;
    bulletPosition.y *= 10;
    bulletPosition.x += spaceship.position.x;
    bulletPosition.y += spaceship.position.y;
    addBullet(bulletPosition, rotation, angleToUnitVector(rotation), 0, true);
    // const force = angleToUnitVector(rotation + Math.PI);
    // force.x *= 0.01;
    // force.y *= 0.01;
    // applyForce(spaceship, force, 0.0);
    playBulletShootSound();
    bulletIndex++;
    lastBulletTime = now;
  }

  // rockets
  if (shootingRockets && now - lastRocketTime >= rocketCooldown && spaceship) {
    const targets = [
      {
        position: {
          x: spaceship.position.x - Math.cos(spaceship.rotation) * 100,
          y: spaceship.position.y - Math.sin(spaceship.rotation) * 100,
        },
      },
      {
        position: {
          x: spaceship.position.x,
          y: spaceship.position.y,
        },
      },
    ];
    for (let i = 0; i < Math.min(rocketPiercing, asteroids.length); i++) {
      let asteroid;
      do {
        asteroid = asteroids[Math.floor(Math.random() * asteroids.length)];
      } while (targets.includes(asteroid) || bosses.bossTypes.includes(asteroid.type));
      asteroid.frozen = true;
      asteroid.velocity.x = 0;
      asteroid.velocity.y = 0;
      asteroid.angularVelocity = 0;
      asteroid.force.x = 0;
      asteroid.force.y = 0;
      asteroid.torque = 0;
      targets.push(asteroid);
    }

    const lastDiff = normalize(sub(targets.at(-1).position, targets.at(-2).position));
    targets.push({
      position: {
        x: targets.at(-1).position.x + lastDiff.x * 100,
        y: targets.at(-1).position.y + lastDiff.y * 100,
      },
    });

    addRocket({ ...spaceship.position }, spaceship.rotation, { x: 0, y: 0 }, 0, targets);

    lastRocketTime = now;
  }

  // bosses
  if (now - lastBossTime >= bossCooldown) {
    bosses.addBoss(addAsteroid);
    lastBossTime = now;
  }

  // spawn new asteroids
  if (now - lastAsteroidTime >= asteroidCooldown) {
    const position = randomPositionOnEdge();
    // const position = { x: 200, y: 200 };
    const target = randomPosition();
    const rotation = Math.random() * Math.PI * 2;
    const velocity = {
      x: target.x - position.x,
      y: target.y - position.y,
    };
    const length = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
    if (length > 0) {
      velocity.x /= length;
      velocity.y /= length;
    }
    velocity.x *= Math.random() * 0.1 + 0.1;
    velocity.y *= Math.random() * 0.1 + 0.1;
    if (extremeModeEnabled) {
      velocity.x *= 2;
      velocity.y *= 2;
    }
    const angularVelocity = randomAngularVelocity(0.0005);
    // const angularVelocity = 0;
    const radius = randomAsteroidSize(gameState.timePlayed);
    // const radius = 25;
    const asteroidType = extremeModeEnabled ? randomAsteroidTypeExtreme() : randomAsteroidType();
    // const asteroidType = "armored";
    addAsteroid(position, rotation, { x: 0, y: 0 }, velocity, angularVelocity, radius, asteroidType);
    lastAsteroidTime = now;
    asteroidCooldown = computeAsteroidCooldown(gameState.timePlayed);
  }

  // powerups
  if (now - lastPowerupTime >= powerupCooldown) {
    const position = randomPositionOnEdge();
    const target = {
      x: canvas.width / 2 + (Math.random() - 0.5) * 400,
      y: canvas.height / 2 + (Math.random() - 0.5) * 400,
    };
    const velocity = {
      x: target.x - position.x,
      y: target.y - position.y,
    };
    const length = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
    if (length > 0) {
      velocity.x /= length;
      velocity.y /= length;
    }
    velocity.x *= 0.1;
    velocity.y *= 0.1;
    const angularVelocity = randomAngularVelocity(0.005);
    const powerupType = randomPowerupType();
    addPowerup(powerupType, position, 0, velocity, angularVelocity);
    lastPowerupTime = now;
  }

  // movement
  if (spaceship) {
    if (controllerIndex != null) {
      const gamepad = navigator.getGamepads()[controllerIndex];

      let yMulti = gamepad.axes[1];
      if (Math.abs(gamepad.axes[1]) <= 0.01) {
        yMulti = 0;
      } else if (gamepad.axes[1] >= 0.7) {
        yMulti = 1;
      } else if (gamepad.axes[1] <= -0.7) {
        yMulti = -1;
      }

      let xMulti = gamepad.axes[0];
      if (Math.abs(gamepad.axes[0]) <= 0.01) {
        xMulti = 0;
      } else if (gamepad.axes[0] >= 0.7) {
        xMulti = 1;
      } else if (gamepad.axes[0] <= -0.7) {
        xMulti = -1;
      }

      spaceship.force.y += SPACESHIP_FORCE * yMulti;
      spaceship.force.x += SPACESHIP_FORCE * xMulti;
    }

    if (spaceship.force.x == 0 && spaceship.force.y == 0) {
      if (movement.forward || movement.forwardController) {
        spaceship.force.y -= SPACESHIP_FORCE;
      }
      if (movement.backward || movement.backwardController) {
        spaceship.force.y += SPACESHIP_FORCE;
      }
      if (movement.left || movement.leftController) {
        spaceship.force.x -= SPACESHIP_FORCE;
      }
      if (movement.right || movement.rightController) {
        spaceship.force.x += SPACESHIP_FORCE;
      }
    }
  }
};

const outOfBounds = (position, padding) => {
  if (!padding || isNaN(padding)) {
    padding = 100;
  }
  return (
    position.x < 0 - padding ||
    position.x > canvas.width + padding ||
    position.y < 0 - padding ||
    position.y > canvas.height + padding
  );
};

const handleDamageTaken = () => {
  if (spaceship.invincible > 0) {
    return;
  }
  spaceship.hp -= 1;
  spaceship.invincible = 30;
  playSpaceshipCollisionSound();
  if (spaceship.hp >= 0) {
    ui.updateHp(spaceship.hp);
  }
  if (spaceship.hp <= 0) {
    playExplosionSound();
    removeSpaceshipFromRenderer();
    setPropulsionVolume(0);
    renderer.addEntity(renderer.EXPLOSION, { position: { ...spaceship.position }, frame: 0 });
    setTimeout(() => {
      endGame();
    }, 1000);
  }
};

const handleExperienceGain = (experience) => {
  currentExperience += experience * modifiers.experience_gain_m + modifiers.experience_gain_a;
  
  if (currentExperience >= experienceNeeded) {
    currentLevel += 1;
    currentExperience -= experienceNeeded;

    experienceNeeded += experienceScaling;

    pause();
    handleLevelUp(() => {
      updateStats();
      resume();
    });
  }

  ui.updateLevel(currentExperience, experienceNeeded, currentLevel);
}

const update = (deltaTime) => {
  updateStats();
  processEvents();

  gameState.timePlayed += deltaTime;

  for (let i = 0; i < asteroids.length; i++) {
    const asteroid = asteroids[i];
    if (asteroid.type === "homing" && spaceship !== null && !asteroid.frozen) {
      const current = normalize(asteroid.velocity);
      const target = normalize(sub(spaceship.position, asteroid.position));
      const direction = normalize(lerp(current, target, 0.002 * deltaTime));
      const velocityMagnitude = Math.sqrt(asteroid.velocity.x ** 2 + asteroid.velocity.y ** 2);
      let dx = direction.x;
      let dy = direction.y;
      const length = Math.sqrt(dx ** 2 + dy ** 2);
      if (length > 0) {
        dx /= length;
        dy /= length;
      }
      dx *= velocityMagnitude;
      dy *= velocityMagnitude;
      asteroid.velocity.x = dx;
      asteroid.velocity.y = dy;

      if (isNaN(asteroid.velocity.x) || isNaN(asteroid.velocity.y)) {
        console.warn("Homing asteroid velocity is NaN");
        debugger;
      }
    }

    velocityVerlet(asteroid, deltaTime);
    if (bosses.bossTypes.includes(asteroid.type) ? outOfBounds(asteroid.position, 10000) : outOfBounds(asteroid.position)) {
      asteroid.remove = true;
      shop.handleGetCoins(1);
    }

    for (let j = i + 1; j < asteroids.length; j++) {
      const asteroid2 = asteroids[j];
      const momentumBefore = calculateTotalMomentum(asteroids);
      if (checkAndResolveCollision(asteroid, asteroid2, showFlash)) {
        playAsteroidCollisionSound();
        const momentumAfter = calculateTotalMomentum(asteroids);
        const momentumChange = Math.abs(momentumAfter - momentumBefore);
        if (momentumChange > 0.00001) {
          console.warn("Momentum change after collision:", momentumChange);
        }
      }
    }

    if (asteroid.type === "turret" && !asteroid.frozen) {
      const nextCooldown = asteroid.bulletIndex % 5 === 0 ? enemyBulletCooldown * (extremeModeEnabled ? 10 : 50) * (1 / modifiers.asteroid_bullet_attack_speed_m) - modifiers.asteroid_bullet_attack_speed_a : enemyBulletCooldown;
      if (now - asteroid.lastBulletTime >= nextCooldown) {
        const direction = {
          x: spaceship.position.x - asteroid.position.x,
          y: spaceship.position.y - asteroid.position.y,
        };
        const length = Math.sqrt(direction.x ** 2 + direction.y ** 2);
        if (length > 0) {
          direction.x /= length * 2;
          direction.y /= length * 2;
        }
        const bulletPosition = {
          x: asteroid.position.x,
          y: asteroid.position.y,
        };
        addBullet(bulletPosition, angleOfVector(direction), direction, 0, false);
        playBulletShootSound();
        asteroid.lastBulletTime = now;
        asteroid.bulletIndex++;
      }
    }
  }

  for (const bullet of bullets) {
    void 0;
    velocityVerlet(bullet, deltaTime);
    if (outOfBounds(bullet.position)) {
      bullet.remove = true;
    }
    if (bullet.disabled) {
      continue;
    }
    if (bullet.friendly) {
      for (const asteroid of asteroids) {
        if (asteroid.type === "armored") {
          if (checkAndResolveCollision(bullet, asteroid, showFlash)) {
            gameState.bulletsHit++;
            bullet.velocity.x *= 0.1;
            bullet.velocity.y *= 0.1;
            bullet.disabled = true;
            playArmorHitSound();
            setTimeout(() => {
              bullet.remove = true;
            }, 300);
          }
        } else if (asteroid.type === "split") {
          if (checkAndResolveCollision(bullet, asteroid, showFlash)) {
            gameState.bulletsHit++;
            gameState.damageDealt += Math.min(asteroid.hp, bulletDamage);
            asteroid.hp -= bulletDamage;

            bullet.remove = true;
            playBulletHitSound();

            prepareVornoi(asteroid, bullet, voronoiNoiseDisabled);

            if (asteroid.hp <= 0) {
              const fragments = createFragementTexture(asteroid);

              ++gameState.asteroidsDestroyed;
              asteroid.remove = true;
              asteroid.giveExp = true;
              asteroid.dropCoins = true;
              asteroid.hp = 100;
              playExplosionSound();
              createFragments(fragments, asteroid);
            }
          }
        } else if (asteroid.type === "golden") {
          if (checkAndResolveCollision(bullet, asteroid, showFlash)) {
            gameState.bulletsHit++;
            gameState.damageDealt += Math.min(asteroid.hp, bulletDamage);
            
            shop.handleGetCoins(1);
            asteroid.hp--;
            
            if (asteroid.hp <= 0) {
              ++gameState.asteroidsDestroyed;
              asteroid.remove = true;
              asteroid.giveExp = true;
              asteroid.dropCoins = true;
              shop.handleGetCoins(200);
              playExplosionSound();
            }
            bullet.remove = true;
            if (Math.random() > 0.7) {
              playPickupCoinSound();
            }
          }
        } else {
          if (checkAndResolveCollision(bullet, asteroid, showFlash)) {
            gameState.bulletsHit++;
            gameState.damageDealt += Math.min(asteroid.hp, bulletDamage);
            
            if (asteroid.type == "Colossus") {
              asteroid.hp--;
            } else {
              asteroid.hp -= bulletDamage;
            }
            
            if (asteroid.hp <= 0) {
              if (asteroid.dropResource === false) {
                asteroid.dropResource = true;
              }

              ++gameState.asteroidsDestroyed;
              asteroid.remove = true;
              asteroid.giveExp = true;
              asteroid.dropCoins = true;
              playExplosionSound();
            }
            bullet.remove = true;
            playBulletHitSound();
          }
        }
      }
    } else {
      if (checkAndResolveCollision(bullet, spaceship, showFlash)) {
        handleDamageTaken();
        bullet.remove = true;
        if (spaceship.hp <= 0) {
          break;
        }
      }
    }
  }

  for (const rocket of rockets) {
    rocket.progress += (deltaTime / 1000) * rocketVelocity;
    pathInterpolate(rocket, rocket.progress, (target) => {
      target.remove = true;
      if (target.dropResource === false) {
        target.dropResource = true;
      }
      target.dropCoins = true;
      target.giveExp = true;
      ++gameState.asteroidsDestroyed;
      gameState.damageDealt += target.hp;
      playExplosionSound();
      if (rocket.currentTarget >= rocket.targets.length - 4) {
        rocket.remove = true;
        return;
      }
    });
  }

  for (const powerup of powerups) {
    velocityVerlet(powerup, deltaTime);
    if (outOfBounds(powerup.position)) {
      powerup.remove = true;
    }
    if (checkCollisionBoxBox(powerup, spaceship)) {
      powerup.remove = true;
      playPowerupSound();
      switch (powerup.type) {
        case "health":
          spaceship.hp += 1;
          spaceship.hp = Math.min(spaceship.hp, spaceship.maxHp);
          ui.updateHp(spaceship.hp);
          break;
        case "damage":
          collectedPowerups.bullet_damage++;
          collectedPowerups.changes = true;
          ui.updateBulletDamage(bulletDamage);
          break;
        case "rocket-piercing":
          collectedPowerups.rocket_piercing++;
          collectedPowerups.changes = true;
          ui.updateRocketPiercing(rocketPiercing);
          break;
      }
    }
  }

  // spaceship
  if (spaceship !== null && spaceship.hp > 0) {
    const previousPosition = { ...spaceship.position };
    velocityVerlet(spaceship, deltaTime);
    const difference = {
      x: spaceship.position.x - previousPosition.x,
      y: spaceship.position.y - previousPosition.y,
    };
    const distance = Math.sqrt(difference.x ** 2 + difference.y ** 2);
    gameState.distanceTraveled += distance;
    setPropulsionVolume(Math.min(distance / 100, 0.05));

    // collision checks
    for (const asteroid of asteroids) {
      if (checkAndResolveCollision(spaceship, asteroid, showFlash)) {
        handleDamageTaken();
        if (spaceship.hp <= 0) {
          break;
        }
      }
    }

    // reduce invincibility frames
    if (spaceship.invincible > 0) {
      spaceship.invincible--;
    }

    if (spaceship.acceleration.x === 0 && spaceship.acceleration.y === 0) {
      spaceship.velocity.x *= Math.pow(0.25, deltaTime / 1000);
      spaceship.velocity.y *= Math.pow(0.25, deltaTime / 1000);
    }

    if (spaceship.angularAcceleration === 0) {
      spaceship.angularVelocity *= Math.pow(0.25, deltaTime / 1000);
    }
  }

  // bounce off walls
  if (spaceship.position.x < 0 || spaceship.position.x > canvas.width) {
    spaceship.position.x = Math.max(0, Math.min(spaceship.position.x, canvas.width));
    spaceship.velocity.x *= -1;
  }
  if (spaceship.position.y < 0 || spaceship.position.y > canvas.height) {
    spaceship.position.y = Math.max(0, Math.min(spaceship.position.y, canvas.height));
    spaceship.velocity.y *= -1;
  }

  cleanUpEntities(asteroids);
};

const cleanUpEntities = () => {
  // TODO: clean up entity removal. very clumsy atm.

  // remove entities that are out of bounds
  asteroids.forEach((asteroid) => {
    if (asteroid.remove) {
      if (asteroid.giveExp) {
        handleExperienceGain(asteroid.type == "default" ? 5 : 10);
      }

      if (asteroid.dropCoins) {
        shop.handleGetCoins(Math.round(Math.random() * 5));
      }

      if (asteroid.dropResource) {
        if (asteroid.type === "plintin") {
          shop.handleGetPlintin(Math.round(Math.random() * 4) + 1);
        } else if (asteroid.type === "xeronium") {
          shop.handleGetXeronium(Math.round(Math.random() * 4) + 1);
        } else if (asteroid.type === "blubbonium") {
          shop.handleGetBlubbonium(Math.round(Math.random() * 4) + 1);
        }
      }

      renderer.removeEntity(renderer.ASTEROID, asteroid.id);
      asteroid.frame = 0;
      renderer.addEntity(renderer.EXPLOSION, asteroid);
    }
  });

  bullets.forEach((bullet) => {
    if (bullet.remove) {
      renderer.removeEntity(renderer.BULLET, bullet.id);
    }
  });

  rockets.forEach((rocket) => {
    if (rocket.remove) {
      renderer.removeEntity(renderer.ROCKET, rocket.id);
      rocket.children.forEach((child) => {
        renderer.removeEntity(renderer.FLAMES, child.id);
        for (const particle of child.children) {
          renderer.removeEntity(renderer.FLAME_PARTICLES, particle.id);
        }
      });
    }
  });

  powerups.forEach((powerup) => {
    if (powerup.remove) {
      renderer.removeEntity(renderer.POWERUP, powerup.id);
    }
  });

  asteroids = asteroids.filter((asteroid) => !asteroid.remove);
  bullets = bullets.filter((bullet) => !bullet.remove);
  rockets = rockets.filter((rocket) => !rocket.remove);
  powerups = powerups.filter((powerup) => !powerup.remove);
};

const addAsteroid = (
  position,
  rotation,
  acceleration,
  velocity,
  angularVelocity,
  radius,
  type,
  texture = null,
  disableColitionCheck = false,
  width = 0,
  height = 0
) => {
  const asteroid = createPhysicsEntity();
  asteroid.position = position;
  asteroid.rotation = rotation;
  asteroid.acceleration = acceleration;
  asteroid.velocity = {x: velocity.x * modifiers.asteroid_speed_m, y: velocity.y * modifiers.asteroid_speed_m};
  asteroid.angularVelocity = angularVelocity;
  asteroid.mass = calculateAsteroidMass(radius, type) * modifiers.asteroid_mass_m + modifiers.asteroid_mass_a;
  asteroid.radius = type === "armored" ? radius * 2 : radius;
  asteroid.inertia =
    type === "armored"
      ? (1 / 12) * asteroid.mass * ((asteroid.radius * 2) ** 2 + 4 * (asteroid.radius * 2) ** 2) // box shape
      : (2 / 5) * asteroid.mass * radius ** 2; // ball shape
  asteroid.hp = radius / 2 * modifiers.asteroid_health_m + modifiers.asteroid_health_a;
  asteroid.collider = boxColliders || (width > 0 && height > 0) || type === "armored" ? BOX : DISC;
  asteroid.width = width || asteroid.radius * 2;
  asteroid.height = height || asteroid.radius * 2;
  asteroid.dropCoins = false;
  asteroid.giveExp = false;

  if (texture) {
    asteroid.texture = texture;
    asteroid.textureReady = true;
  } else {
    loadImageIntoTexture(asteroid, asteroidTextures[type], asteroid.radius * 2, asteroid.radius * 2);
  }
  asteroid.type = type;

  if (type === "turret") {
    asteroid.lastBulletTime = now;
    asteroid.bulletIndex = 0;
  } else if (type === "golden") {
    asteroid.hp *= 10;
  } else if (type === "Colossus") {
    asteroid.hp = 3000 * modifiers.asteroid_health_m + modifiers.asteroid_health_a;
  } else if (shop.resourceTypes.includes(type)) {
    asteroid.dropResource = false;
    asteroid.hp *= 2;
  }

  // do not spawn asteroids inside each other
  // do not spawn asteroids on top of other entities
  if (!disableColitionCheck && checkCollisionDiscDisc(asteroid, spaceship)) {
    return;
  }
  for (const other of asteroids) {
    if (!disableColitionCheck && checkCollisionDiscDisc(asteroid, other)) {
      return;
    }
  }

  renderer.addEntity(renderer.ASTEROID, asteroid);
  asteroids.push(asteroid);
};

const addBullet = (position, rotation, velocity, angularVelocity, friendly) => {
  const bullet = createPhysicsEntity();
  bullet.position = position;
  bullet.rotation = rotation;
  bullet.velocity = velocity;
  bullet.angularVelocity = angularVelocity;
  bullet.mass = BULLET_MASS * modifiers.bullet_mass_m + modifiers.bullet_mass_a;
  bullet.collider = BOX;
  bullet.width = 10;
  bullet.height = 1;
  bullet.inertia = (bullet.mass * bullet.width) / 2 / 2;
  bullet.friendly = friendly;
  renderer.addEntity(renderer.BULLET, bullet);
  bullets.push(bullet);
  ++gameState.bulletsFired;
};

const addRocket = (position, rotation, velocity, angularVelocity, targets) => {
  const rocket = createPhysicsEntity();
  rocket.position = position;
  rocket.rotation = rotation;
  rocket.velocity = velocity;
  rocket.angularVelocity = angularVelocity;
  rocket.mass = BULLET_MASS * modifiers.bullet_mass_m + modifiers.bullet_mass_a;
  rocket.radius = 5;
  rocket.targets = targets;
  rocket.progress = 0;
  rocket.currentTarget = 0;
  createArcLengthTable(rocket);
  samplePath(rocket);
  renderer.addEntity(renderer.ROCKET, rocket);
  rockets.push(rocket);
  addFlames({ x: -5, y: 0 }, Math.PI / 2, rocket);
  ++gameState.rocketsFired;
};

const addSpaceship = (position, rotation, velocity, angularVelocity) => {
  spaceship = createPhysicsEntity();
  spaceship.position = position;
  spaceship.rotation = rotation;
  spaceship.velocity = velocity;
  spaceship.angularVelocity = angularVelocity;
  spaceship.mass = SPACESHIP_MASS;
  spaceship.drag = 1;
  spaceship.maxVelocity = 0.5;
  spaceship.collider = boxColliders ? BOX : DISC;
  spaceship.height = 40;
  spaceship.width = 40;
  spaceship.radius = spaceship.width / 2;
  spaceship.maxHp = 5;
  if (hitlessModeEnabled) {
    spaceship.maxHp = 1;
  }
  spaceship.hp = spaceship.maxHp;
  spaceship.invincible = 0;

  loadImageIntoTexture(spaceship, spaceshipUrl, spaceship.height, spaceship.width);

  renderer.addEntity(renderer.SPACESHIP, spaceship);

  addSpaceshipPart({ x: -5, y: 18 }, 0, renderer.SPACESHIPPART, wingRightUrl, spaceship);
  addSpaceshipPart({ x: -5, y: -18 }, 0, renderer.SPACESHIPPART, wingLeftUrl, spaceship);
};

const addSpaceshipPart = (position, rotation, type, image, parent) => {
  const part = createPhysicsEntity();
  part.position = position;
  part.rotation = rotation;
  part.parent = parent;
  part.height = 20;
  part.width = 20;

  renderer.addEntity(type, part);

  loadImageIntoTexture(part, image, part.height, part.width);

  parent.children ??= parent.children || [];
  parent.children.push(part);

  addFlames({ x: -5, y: 0 }, Math.PI / 2, part);
};

const addFlames = (position, rotation, parent) => {
  const flame = createPhysicsEntity();
  flame.position = position;
  flame.rotation = rotation;
  flame.parent = parent;
  flame.height = 10;
  flame.width = 5;

  parent.children ??= parent.children || [];
  parent.children.push(flame);

  renderer.addEntity(renderer.FLAMES, flame);

  addFlameParticle({ x: 0, y: 0 }, 0, flame);
};

const addFlameParticle = (position, rotation, parent) => {
  const flameParticle = createPhysicsEntity();
  flameParticle.position = position;
  flameParticle.rotation = rotation;
  flameParticle.parent = parent;
  flameParticle.height = 5;
  flameParticle.width = 5;

  parent.children ??= parent.children || [];
  parent.children.push(flameParticle);

  renderer.addEntity(renderer.FLAME_PARTICLES, flameParticle);
};

const addPowerup = (type, position, rotation, velocity, angularVelocity) => {
  if (hitlessModeEnabled && ["health"].includes(type)) {
    return;
  }

  const powerup = createPhysicsEntity();
  powerup.type = type;
  powerup.position = position;
  powerup.rotation = rotation;
  powerup.velocity = velocity;
  powerup.angularVelocity = angularVelocity;
  powerup.width = 50;
  powerup.height = 50;
  powerup.collider = BOX;

  renderer.addEntity(renderer.POWERUP, powerup);
  powerups.push(powerup);
};

const removeSpaceshipFromRenderer = () => {
  if (spaceship) {
    renderer.removeEntity(renderer.SPACESHIP, spaceship.id);
    for (let wing of spaceship.children) {
      renderer.removeEntity(renderer.SPACESHIPPART, wing.id);
      for (let flame of wing.children) {
        renderer.removeEntity(renderer.FLAMES, flame.id);
        for (let particle of flame.children) {
          renderer.removeEntity(renderer.FLAME_PARTICLES, particle.id);
        }
      }
    }
  }
};

const initGame = () => {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  addSpaceship({ x: canvas.width / 2, y: canvas.height / 2 }, 0, { x: 0, y: 0 }, 0);
  ui.setMaxHp(hitlessModeEnabled ? 1 : 5);
  lastBossTime = 100;
};

const startGame = () => {
  initGame();
  resume();
  frameHandle = requestAnimationFrame(doFrame);
};

const endGame = () => {
  if (paused) {
    return;
  }
  paused = true;
  cancelAnimationFrame(frameHandle);
  setPropulsionVolume(0);
  spaceship = null;

  const best = getBest(!weaponsEnabled, !movementEnabled, extremeModeEnabled, hitlessModeEnabled);

  ui.updateGameOverMenu(weaponsEnabled, movementEnabled, extremeModeEnabled, hitlessModeEnabled, gameState, best);
  ui.showGameOverMenu();

  trackScore(!weaponsEnabled, !movementEnabled, extremeModeEnabled, hitlessModeEnabled);
};

const resetGame = () => {
  lastUpdateTime = performance.now();
  lastFrameTime = lastUpdateTime;
  lastSummaryTime = lastFrameTime;
  lastAsteroidTime = lastFrameTime;
  lastBulletTime = lastFrameTime;
  lastRocketTime = lastFrameTime;
  lastPowerupTime = lastFrameTime;

  resetGameState();
  renderer.removeAllEntities();
  asteroids = [];
  bullets = [];
  rockets = [];
  asteroidCooldown = 1000;

  shop.resetShop();

  currentLevel = 1;
  currentExperience = 0;
  experienceNeeded = 200;
  experienceScaling = 100;

  rocketPiercing = 3;
  bulletDamage = 1;
  ui.updateHp(5);
  ui.hidePauseMenu();
  ui.hideGameOverMenu();
};

const loadImageIntoTexture = (entity, imageUrl, height, width) => {
  const image = new Image();
  image.src = imageUrl;

  image.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0, width, height);

    entity.texture = canvas;
    entity.textureReady = true;
  };
};

const createFragments = (fragments, asteroid) => {
  for (let frag_count = 0; frag_count < fragments.length; frag_count++) {
    const texture = fragments[frag_count];
    const originalPosition = asteroid.position;
    const position = {
      x: originalPosition.x + Math.random(),
      y: originalPosition.y + Math.random(),
    };
    const target = randomPosition();
    const rotation = asteroid.rotation;
    const velocity = {
      x: target.x - position.x,
      y: target.y - position.y,
    };
    const length = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
    if (length > 0) {
      velocity.x /= length;
      velocity.y /= length;
    }
    velocity.x *= Math.random() * 0.1 + 0.1;
    velocity.y *= Math.random() * 0.1 + 0.1;
    if (extremeModeEnabled) {
      velocity.x *= 2;
      velocity.y *= 2;
    }
    const angularVelocity = randomAngularVelocity(0.0005);

    const radius = Math.max(texture.width, texture.height) / 2;
    const asteroidType = "default";

    addAsteroid(
      position,
      rotation,
      { x: 0, y: 0 },
      velocity,
      angularVelocity,
      radius,
      asteroidType,
      texture,
      true,
      texture.width,
      texture.height
    );
  }
};

export const setDisableVoronoiNoise = (draw) => {
  voronoiNoiseDisabled = draw;
};

const showFlash = (a, b, collisionPoint, normal, overlap) => {
  if (drawCollisions) {
    renderer.addEntity(renderer.COLLISION, {
      a,
      b,
      collisionPoint,
      normal,
      lifetime: 100,
    });
  } else {
    const flash = {
      position: collisionPoint,
      rotation: Math.random() * Math.PI * 2,
    };
    renderer.addEntity(renderer.FLASH, flash);
    setTimeout(() => renderer.removeEntity(renderer.FLASH, flash.id), 100);
  }
};

main();
