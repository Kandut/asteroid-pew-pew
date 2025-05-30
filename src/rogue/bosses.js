import { randomIndexWithProbability } from "../util/random";

const canvas = document.getElementsByTagName("canvas")[0];
const bossHealthSectionView = document.getElementById("boss-health-overlay");
const bossHealthBarView = document.getElementById("boss-health-bar");
const bossNameView = document.getElementById("boss-name");

const bosses = {
    "Colossus": {
        position: {x: -1500, y: canvas.height / 2},
        rotation: Math.random() * 360,
        acceleration: {x: 0, y: 0},
        velocity: {x: 0.01, y: 0},
        angularVelocity: 0.00001,
        radius: 1300,
        type: "Colossus",
    }
}

const bossProbabilities = [1];

export const bossTypes = ["Colossus"];

export const addBoss = (addAsteroid, type) => {
    if (!type || !Object.keys(bosses).includes(type)) {
        let index = randomIndexWithProbability(bossProbabilities);
        console.log(index);
        type = bossTypes[index];
    }

    console.log(type);

    addBossAsAstroid(addAsteroid, bosses[type]);
}

function addBossAsAstroid(addAsteroid, bossAsteroid) {
    addAsteroid(
        bossAsteroid.position, 
        bossAsteroid.rotation,
        bossAsteroid.acceleration,
        bossAsteroid.velocity,
        bossAsteroid.angularVelocity,
        bossAsteroid.radius,
        bossAsteroid.type,
        bossAsteroid.texture,
        bossAsteroid.disableColitionCheck,
        bossAsteroid.width,
        bossAsteroid.height
    );
}

export const showBossHealthBar = (bossName) => {
    bossHealthSectionView.style.display = "block";
    bossNameView.innerText = bossName;
  }
  
export const hideBossHealthBar = () => {
    bossHealthSectionView.style.display = "none";
}

export const updateBossHealthBar = (bossHealth, bossTotalHealth) => {
    if (bossTotalHealth && !isNaN(bossTotalHealth)) {
        bossHealthBarView.max = bossTotalHealth;
    }
    bossHealthBarView.value = bossHealth;
}