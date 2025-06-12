export const createBoni = (addToStat, multiplyStat) => {
    return [
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
            "title": "More Experience",
            "description": "Increases your experience by <span class='<class>'><level>%</span>",
            "levels": [10, 15, 20, 30, 50, 100, 200, 400],
            "callback": (level) => {
                const levels = [0.10, 0.15, 0.20, 0.30, 0.50, 1, 2, 4];
                addToStat("experience_gain_m", levels[level]);
            }
        },
        {
            "title": "Reload Bullets Faster",
            "description": "Increases your bullet fire rate by <span class='<class>'><level>%</span>",
            "levels": [10, 15, 20, 30, 50, 100, 200, 400], // 8 levels (printed numbers)
            "callback": (level) => {
                const levels = [0.10, 0.15, 0.20, 0.30, 0.50, 1, 2, 4]; // 8 levels (added amounts)
                addToStat("bullet_attack_speed_m", levels[level]);
            }
        },
        {
            "title": "Reload Rockets Faster",
            "description": "Increases your rocket fire rate by <span class='<class>'><level>%</span>",
            "levels": [10, 15, 20, 30, 50, 100, 200, 400], // 8 levels (printed numbers)
            "callback": (level) => {
                const levels = [0.10, 0.15, 0.20, 0.30, 0.50, 1, 2, 4]; // 8 levels (added amounts)
                addToStat("bullet_attack_speed_m", levels[level]);
            }
        },
        {
            "title": "More Powerups",
            "description": "Decreases the powerup spawn cooldown by <span class='<class>'><level>%</span>",
            "levels": [1, 3, 5, 8, 10, 15, 20, 25], // 8 levels (printed numbers)
            "callback": (level) => {
                const levels = [0.01, 0.03, 0.05, 0.08, 0.10, 0.15, 0.20, 0.25]; // 8 levels (added amounts)
                addToStat("powerup_cooldown_m", levels[level]);
            }
        },
        {
            "title": "Bigger Tank",
            "description": "Increases the size of the fuel tank by <span class='<class>'><level>%</span>",
            "levels": [5, 10, 15, 20, 30, 50, 100, 200], // 8 levels (printed numbers)
            "callback": (level) => {
                const levels = [0.05, 0.10, 0.15, 0.2, 0.3, 0.5, 1, 2]; // 8 levels (added amounts)
                addToStat("max_fuel_m", levels[level]);
            }
        },
        {
            "title": "Bigger Tank",
            "description": "Increases the size of the fuel tank by <span class='<class>'><level> L</span>",
            "levels": [50, 100, 150, 200, 300, 400, 500, 1000], // 8 levels (printed numbers)
            "callback": (level) => {
                const levels = [50, 100, 150, 200, 300, 400, 500, 1000]; // 8 levels (added amounts)
                addToStat("max_fuel_a", levels[level]);
            }
        },
        {
            "title": "Bigger Pumps",
            "description": "Increases your fuel regeneration by <span class='<class>'><level> L / Frame</span>",
            "levels": [0.01, 0.03, 0.05, 0.08, 0.1, 0.15, 0.20, 0.25], // 8 levels (printed numbers)
            "callback": (level) => {
                const levels = [0.01, 0.03, 0.05, 0.08, 0.1, 0.15, 0.20, 0.25]; // 8 levels (added amounts)
                addToStat("fuel_regen_a", levels[level]);
            }
        }
        ,
        {
            "title": "Bigger Jets",
            "description": "Increases your fuel consumption and acceleration by <span class='<class>'><level>%</span>",
            "levels": [5, 10, 15, 20, 25, 30, 35, 40], // 8 levels (printed numbers)
            "callback": (level) => {
                const levels = [0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40]; // 8 levels (added amounts)
                addToStat("spaceship_acceleration_m", levels[level]);
                addToStat("fuel_consumption_m", levels[level]);
            }
        }
    ];
}