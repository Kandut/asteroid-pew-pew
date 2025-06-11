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

export const baseCriticalHitChance = 0.15;
export const baseCriticalHitDamage = 1.25;
const baseRerollPrice = 15;
let rerollPrice = baseRerollPrice;
const rerollPriceAddition = 3;

export let modifiers = {} // defaults are set in reset()

const rarities =        ["common",      "uncommon",     "rare",         "epic",         "legendary",    "mythic",       "historical",   "unreal"];
export const colors =   ["0,128,0",     "35,228,224",   "35,70,228",    "163,35,228",   "210,23,26",    "255,250,28",   "255,208,252",  "105,9,18"];             
const rarityChances =   [0.40,          0.30,           0.15,           0.10,           0.05,           0.01,           0.005,          0.001];

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
            const levels =  [1, 1, 2, 2, 3, 5, 7, 10];
            addToStat("rocket_piercing_a", levels[level]);
        }
    },
    {
        "title": "More Experience!",
        "description": "Increases the experience per asteroid by <span class='<class>'><level></span>",
        "levels": [1, 1, 1, 2, 3, 5, 7, 10],
        "callback": (level) => {
            const levels = [1, 1, 1, 2, 3, 5, 7, 10];
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
    },
    {
        "title": "Permanent Fuel Regeneration",
        "description": "Fuel now regenerates while flying, but the ship flies at half speed",
        "active": false,
        "callback": () => {
            enableModifier("permanent_fuel_regeneration");
            multiplyStat("spaceship_acceleration_m", 0.5);
        }
    }
]

export const addToStat = (key, addition) => {
    modifiers.changes = true;
    modifiers[key] += addition;

    if (key.includes("critical")) {
        updateCriticalStats();
    }
}

const updateCriticalStats = () => {
    modifiers.critical_hit_chance = baseCriticalHitChance * modifiers.critical_hit_chance_m + modifiers.critical_hit_chance_a;
    modifiers.critical_hit_damage = baseCriticalHitDamage * modifiers.critical_hit_damage_m + modifiers.critical_hit_damage_a;
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

export const calcCrit = (baseDamage, isCrit) => {
    const chance = modifiers.critical_hit_chance % 1;
    const multiplier = modifiers.critical_hit_chance - chance;

    let damage = baseDamage * modifiers.critical_hit_damage ** multiplier;

    if (isCrit == 2 || isCrit == 1 && Math.random() < chance) {
        damage = damage * modifiers.critical_hit_damage;
    }

    return damage;
}

/* Returns a number
0 = no crit
1 = crit chance > 1
2 = crit by chance
*/
export const hitIsCrit = () => {
    if (Math.random() + Math.floor(modifiers.critical_hit_chance) < modifiers.critical_hit_chance) {
        return 2;
    }
    if (modifiers.critical_hit_chance > 1) {
        return 1;
    }
    return 0;
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

        max_fuel_m: 1,
        max_fuel_a: 0,

        fuel_regen_m: 1,
        fuel_regen_a: 0,
    
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

        spaceship_acceleration_m: 1,

        critical_hit_chance: baseCriticalHitChance,
        critical_hit_chance_m: 1,
        critical_hit_chance_a: 0,

        critical_hit_damage: baseCriticalHitDamage,
        critical_hit_damage_m: 1,
        critical_hit_damage_a: 0,
    
        shoot_random_direction: false,
        permanent_fuel_regeneration: false,
    }

    singleTimeUpgrades.map((upgrade) => {
        upgrade.active = false;
        return upgrade;
    });

    rerollAbilitiesImage.src = plintinUrl;
}

reset();