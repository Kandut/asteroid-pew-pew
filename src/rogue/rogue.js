import { gameState } from "../util/gamestatistics";
import { randomIndexWithProbability } from "../util/random";
import { playClickSound, playFailedSound, playSpaceshipCollisionSound } from "../util/sound";
import { updatePlintin } from "../util/ui";
import { currentPlintin, handleGetPlintin } from "./shop";

import plintinUrl from "/img/rogue/plintin.png?url";

const levelupMenuView = document.getElementById("levelup-menu");
const level1View = document.getElementById("levelup-1");
const levelupTitle1 = document.getElementById("levelup-1-title");
const levelupRarity1 = document.getElementById("levelup-1-rarity");
const levelupDescription1 = document.getElementById("levelup-1-description");
const level2View = document.getElementById("levelup-2");
const levelupTitle2 = document.getElementById("levelup-2-title");
const levelupRarity2 = document.getElementById("levelup-2-rarity");
const levelupDescription2 = document.getElementById("levelup-2-description");
const level3View = document.getElementById("levelup-3");
const levelupTitle3 = document.getElementById("levelup-3-title");
const levelupRarity3 = document.getElementById("levelup-3-rarity");
const levelupDescription3 = document.getElementById("levelup-3-description");
const rerollAbilitiesButton = document.getElementById("reroll-abilities");
const rerollAbilitiesPriceView = document.getElementById("reroll-abilities-price");
const rerollAbilitiesImage = document.getElementById("reroll-abilities-price-img");

const baseRerollPrice = 15;
let rerollPrice = baseRerollPrice;
const rerollPriceAddition = 3;

export let modifiers = {} // defaults are set in reset()

const rarities = ["common", "uncommon", "rare", "epic", "legendary", "mythic", "historical", "unreal"];             
const rarityChances = [0.40, 0.30, 0.15, 0.10, 0.05, 0.01, 0.005, 0.001];

export const allBoni = [
    {
        "title": "More Bullet Damage!",
        "description": "Increases your bullet damage by <span class='<class>'><level>%</span>",
        "levels": [10,15,20,30,50,100,200,400],
        "callback": (level) => {
            const levels = [0.10, 0.15, 0.20, 0.30, 0.50, 1, 2, 4];
            addToStat("bullet_damage_m", levels[level]);
        }
    },
    {
        "title": "More Rocket Piercing!",
        "description": "Increases your rocket piercing by <span class='<class>'><level></span>",
        "levels": [1, 1, 2, 2, 3, 5, 7, 10],
        "callback": (level) => {
            const levels = [1,1,1,2,2];
            addToStat("rocket_piercing_a", levels[level]);
        }
    },
    {
        "title": "More Experience!",
        "description": "Increases the experience per asteroid by <span class='<class>'><level></span>",
        "levels": [1, 1, 1, 2, 3, 5, 7, 10],
        "callback": (level) => {
            const levels = [1,1,1,2,3];
            addToStat("experience_gain_a", levels[level]);
        }
    },
    {
        "title": "More Experience!",
        "description": "Increases your experience by <span class='<class>'><level>%</span>",
        "levels": [10, 15, 20, 30, 50, 100, 200, 400],
        "callback": (level) => {
            const levels = [0.10, 0.15, 0.20, 0.30, 0.50, 1, 2, 4];
            addToStat("experience_gain_m", levels[level]);
        }
    }
];

export const singleTimeUpgrades = [
    {
        "title": "Bigger Bullets!",
        "description": "Increases bullet mass by <span class='<class>'}>200%</span> but reduces your damage by <span class='<class>'>50%</span>",
        "active": false,
        "callback": () => {
            multiplyStat("bullet_mass_m", 2);
            multiplyStat("bullet_damage_m", 0.5);
        }
    },
    {
        "title": "No more control, BUT DAMAGE!",
        "description": "Shoot in random directions but deal <span class='<class>'>+1000%</span> damage",
        "active": false,
        "callback": () => {
            enableModifier("shoot_random_direction");
            multiplyStat("bullet_damage_m", 10);
        }
    }
]

export const addToStat = (key, addition) => {
    modifiers.changes = true;
    modifiers[key] += addition;
}

export const multiplyStat = (key, multi) => {
    modifiers.changes = true;
    modifiers[key] *= multi;
}

export const enableModifier = (key) => {
    modifiers.changes = true;
    modifiers[key] = true;
}

export const handleObtainAbility = (onselect, reset) => {
    if (reset === true) {
        rerollPrice = baseRerollPrice;
    }

    rerollAbilitiesPriceView.innerText = rerollPrice;

    const availableBoni = singleTimeUpgrades.filter((it) => !it.active);

    const pool = [...allBoni, ...availableBoni];
    const probs = [];

    allBoni.forEach(() => {
        probs.push(0.7 / allBoni.length);
    });

    availableBoni.forEach(() => {
        probs.push(0.3 / availableBoni.length);
    });

    let upgrades = [];

    while (upgrades.length < 3) {
        const upgradeIndex = randomIndexWithProbability(probs);

        if (!upgrades.includes(upgradeIndex)) {
            upgrades.push(upgradeIndex);
        }
    }

    upgrades = upgrades.map((it) => {return pool[it]});

    levelupMenuView.style.display = "grid";

    rerollAbilitiesButton.onclick = () => {handleReroll(onselect)};

    showUpgrade(levelupTitle1, levelupRarity1, levelupDescription1, level1View, upgrades[0], onselect);
    showUpgrade(levelupTitle2, levelupRarity2, levelupDescription2, level2View, upgrades[1], onselect);
    showUpgrade(levelupTitle3, levelupRarity3, levelupDescription3, level3View, upgrades[2], onselect);
}

function handleReroll(onselect) {
    if (currentPlintin >= rerollPrice) {
        playClickSound();
        handleGetPlintin(-rerollPrice);
        rerollPrice += rerollPriceAddition;
        handleObtainAbility(onselect, false);
    } else {
        playFailedSound();
    }
}

function showUpgrade(title, rarity, description, view, upgrade, onselect) {
    if (upgrade.levels == undefined) {
        title.innerText = upgrade.title;
        rarity.innerText = "Upgrade";
        rarity.classList = ["rarity-upgrade"];
        view.classList = ["rarity-background-upgrade"];
        description.innerHTML = upgrade.description.replaceAll("<class>", "rarity-upgrade");
        view.onclick = () => {
            upgrade.callback();
            upgrade.active = true;
            levelupMenuView.style.display = "none";
            onselect();
        }
    } else {
        const level = randomIndexWithProbability(rarityChances);

        title.innerText = upgrade.title;
        rarity.innerText = rarities[level];
        rarity.classList = ["rarity-" + rarities[level]];
        view.classList = ["rarity-background-" + rarities[level]];
        description.innerHTML = upgrade.description.replaceAll("<level>", upgrade.levels[level]).replace("<class>", "rarity-" + rarities[level]);
        view.onclick = () => {
            upgrade.callback(level);
            levelupMenuView.style.display = "none";
            gameState.abilitiesObtained++;
            onselect();
        };
    }
}

export const reset = () => {
    modifiers = {
        changes: true,
        bullet_compression: 1, // damage * 2 = attack speed / 1.95
    
        bullet_damage_m: 1,
        bullet_damage_a: 0,
    
        bullet_attack_speed_m: 1,
        bullet_attack_speed_a: 0,
    
        rocket_attack_speed_m: 1,
        rocket_attack_speed_a: 0,
    
        rocket_piercing_m: 1,
        rocket_piercing_a: 0,
    
        experience_gain_m: 1,
        experience_gain_a: 0,
    
        bullet_mass_m: 1,
        bullet_mass_a: 0,
    
        powerup_cooldown_m: 1,
        powerup_cooldown_a: 0,

        powerup_fuel_m: 1,
        powerup_fuel_a: 0,
    
        asteroid_radius_m: 1,
        asteroid_radius_a: 0,
    
        asteroid_mass_m: 1,
        asteroid_mass_a: 0,
    
        asteroid_speed_m: 1,
    
        asteroid_bullet_attack_speed_m: 1,
        asteroid_bullet_attack_speed_a: 0,
    
        asteroid_health_m: 1,
        asteroid_health_a: 0,
    
        asteroid_spawn_rate_m: 1,
        asteroid_spawn_rate_a: 0,
    
        shoot_random_direction: false,
    }

    singleTimeUpgrades.map((upgrade) => {
        upgrade.active = false;
        return upgrade;
    });

    rerollAbilitiesImage.src = plintinUrl;
}

reset();