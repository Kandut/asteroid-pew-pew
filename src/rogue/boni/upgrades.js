export const createUpgrades = (addToStat, multiplyStat) => {
    return [
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
        },
        {
            "title": "Double rockets",
            "description": "Fire two rockets instead of one, gain +3 piercing and disable bullets",
            "active": false,
            "callback": () => {
                multiplyStat("rocket_multiplier", 2);
                enableModifier("no_more_bullets");
                addToStat("rocket_piercing_a", 3);
            }
        },
        {
            "title": "Targeting Rockets",
            "description": "Rockets will now prioritize armored and gold asteroids",
            "active": false,
            "callback": () => {
                enableModifier("rocket_aim_armored");
            }
        },
    ]
}

/*
{
    "title": "",
    "description": "",
    "active": false,
    "callback": () => {
    }
},
*/