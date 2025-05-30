import { randomIndexWithProbability } from "../random";

const canvas = document.getElementsByTagName("canvas")[0];

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
    console.log("Adding Boss");

    if (!type || !Object.keys(bosses).includes(type)) {
        console.log("here");
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



