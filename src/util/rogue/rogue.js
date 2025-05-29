import { randomIndexWithProbability } from "../random";

const levelupMenuView = document.getElementById("levelup-menu");

const level1View = document.getElementById("levelup-1");
const levelupTitle1 = document.getElementById("levelup-1-title");
const levelupDescription1 = document.getElementById("levelup-1-description");
const level2View = document.getElementById("levelup-2");
const levelupTitle2 = document.getElementById("levelup-2-title");
const levelupDescription2 = document.getElementById("levelup-2-description");
const level3View = document.getElementById("levelup-3");
const levelupTitle3 = document.getElementById("levelup-3-title");
const levelupDescription3 = document.getElementById("levelup-3-description");

export const allBoni = [
    {
        "title": "More Bullet Damage!",
        "description": "Increases your bullet damage by <level>%",
        "levels": [10,15,20,30,50],
        "callback": (level) => {
            const levels = [0.10, 0.15, 0.20, 0.30, 0.50];
            addToStat("bullet_damage_m", levels[level]);
        }
    },
    {
        "title": "More Rocket Piercing!",
        "description": "Increases your rocket piercing by <level>",
        "levels": [1,1,1,2,2],
        "callback": (level) => {
            const levels = [1,1,1,2,2];
            addToStat("rocket_piercing_a", levels[level]);
        }
    },
    {
        "title": "More Experience!",
        "description": "Increases the experience per asteroid by <level>",
        "levels": [1,1,1,2,3],
        "callback": (level) => {
            const levels = [1,1,1,2,3];
            addToStat("experience_gain_a", levels[level]);
        }
    },
    {
        "title": "More Experience!",
        "description": "Increases your experience by <level>%",
        "levels": [10, 15, 20, 30, 50],
        "callback": (level) => {
            const levels = [0.10, 0.15, 0.20, 0.30, 0.50];
            addToStat("experience_gain_m", levels[level]);
        }
    }
];

export const singleTimeUpgrades = [
    {
        "title": "Bigger Bullets!",
        "description": "Increases bullet mass by 200% but reduces your damage by 50%",
        "active": false,
        "callback": () => {
            multiplyStat("bullet_mass_m", 2);
            multiplyStat("bullet_damage_m", 0.5);
        }
    }
]

export const modifiers = {
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
}

const chances = [0.40, 0.30, 0.15, 0.10, 0.05];

export const addToStat = (key, addition) => {
    modifiers.changes = true;
    modifiers[key] += addition;
}

export const multiplyStat = (key, multi) => {
    modifiers.changes = true;
    modifiers[key] *= multi;
}

export const handleLevelUp = (onselect) => {
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

    levelupMenuView.style.display = "block";

    showUpgrade(levelupTitle1, levelupDescription1, level1View, upgrades[0], onselect);
    showUpgrade(levelupTitle2, levelupDescription2, level2View, upgrades[1], onselect);
    showUpgrade(levelupTitle3, levelupDescription3, level3View, upgrades[2], onselect);
}

function showUpgrade(title, description, view, upgrade, onselect) {
    console.log(upgrade)

    if (upgrade.levels == undefined) {
        title.innerText = upgrade.title;
        description.innerText = upgrade.description;
        view.onclick = () => {
            upgrade.callback;
            levelupMenuView.style.display = "none";
            onselect();
        }
    } else {
        const level = randomIndexWithProbability(chances);

        title.innerText = upgrade.title;
        description.innerText = upgrade.description.replace("<level>", upgrade.levels[level]);
        view.onclick = () => {
            upgrade.callback(level);
            levelupMenuView.style.display = "none";
            onselect();
        };
    }
}