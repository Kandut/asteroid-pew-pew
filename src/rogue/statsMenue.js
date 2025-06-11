const bulletDamageBaseView = document.getElementById("stats-bullet-damage-base");
const bulletDamageBoxesView = document.getElementById("stats-bullet-damage-boxes");
const bulletDamageMView = document.getElementById("stats-bullet-damage-m");
const bulletDamageAView = document.getElementById("stats-bullet-damage-a");
const bulletDamageTotalView = document.getElementById("stats-bullet-damage-total");

const bulletCooldownBaseView = document.getElementById("stats-bullet-cooldown-base");
const bulletCooldownAView = document.getElementById("stats-bullet-cooldown-a");
const bulletCooldownMView = document.getElementById("stats-bullet-cooldown-m");
const bulletCooldownTotalView = document.getElementById("stats-bullet-cooldown-total");

const rocketPiercingBaseView = document.getElementById("stats-rocket-piercing-base");
const rocketPiercingBoxesView = document.getElementById("stats-rocket-piercing-boxes");
const rocketPiercingMView = document.getElementById("stats-rocket-piercing-m");
const rocketPiercingAView = document.getElementById("stats-rocket-piercing-a");
const rocketPiercingTotalView = document.getElementById("stats-rocket-piercing-total");

const rocketCooldownBaseView = document.getElementById("stats-rocket-cooldown-base");
const rocketCooldownMView = document.getElementById("stats-rocket-cooldown-m");
const rocketCooldownAView = document.getElementById("stats-rocket-cooldown-a");
const rocketCooldownTotalView = document.getElementById("stats-rocket-cooldown-total");

const experienceGainBaseView = document.getElementById("stats-experience-gain-base");
const experienceGainMView = document.getElementById("stats-experience-gain-m");
const experienceGainAView = document.getElementById("stats-experience-gain-a");
const experienceGainTotalView = document.getElementById("stats-experience-gain-total");

const fuelTankBase = document.getElementById("stats-fuel-tank-size-base");
const fuelTankM = document.getElementById("stats-fuel-tank-size-m");
const fuelTankA = document.getElementById("stats-fuel-tank-size-a");
const fuelTankTotal = document.getElementById("stats-fuel-tank-size-total");

const fuelRegenBase = document.getElementById("stats-fuel-regen-base");
const fuelRegenM = document.getElementById("stats-fuel-regen-m");
const fuelRegenA = document.getElementById("stats-fuel-regen-a");
const fuelRegenTotal = document.getElementById("stats-fuel-regen-total");

const statsMenueView = document.getElementById("stats-menu");

export const updateStatView = (modifier, collectedPowerups, baseBulletDamage, baseBulletCooldown, baseRocketPiercing, baseRocketCooldown, baseExperienceGain, baseMaxFuel, baseFuelRegen) => {
    bulletDamageBaseView.innerText = baseBulletDamage.toFixed(1);
    bulletDamageBoxesView.innerText = collectedPowerups.bullet_damage.toFixed(0);
    bulletDamageMView.innerText = modifier.bullet_damage_m.toFixed(2);
    bulletDamageAView.innerText = modifier.bullet_damage_a.toFixed(1);
    bulletDamageTotalView.innerText = ((baseBulletDamage + collectedPowerups.bullet_damage) * modifier.bullet_damage_m + modifier.bullet_damage_a).toFixed(2);

    bulletCooldownBaseView.innerText = baseBulletCooldown.toFixed(0);
    bulletCooldownAView.innerText = modifier.bullet_attack_speed_a.toFixed(1);
    bulletCooldownMView.innerText = modifier.bullet_attack_speed_m.toFixed(2);
    bulletCooldownTotalView.innerText = (baseBulletCooldown * ( 1 / modifier.bullet_attack_speed_m ) + modifier.bullet_attack_speed_a).toFixed(0);

    rocketPiercingBaseView.innerText = baseRocketPiercing.toFixed(0);
    rocketPiercingBoxesView.innerText = collectedPowerups.rocket_piercing.toFixed(0);
    rocketPiercingMView.innerText = modifier.rocket_piercing_m.toFixed(2);
    rocketPiercingAView.innerText = modifier.rocket_piercing_a.toFixed(0);
    rocketPiercingTotalView.innerText = ((baseRocketPiercing + collectedPowerups.rocket_piercing) * modifier.rocket_piercing_m + modifier.rocket_piercing_a).toFixed(0);

    rocketCooldownBaseView.innerText = baseRocketCooldown.toFixed(0);
    rocketCooldownMView.innerText = modifier.rocket_attack_speed_m.toFixed(2);
    rocketCooldownAView.innerText = modifier.rocket_attack_speed_a.toFixed(1);
    rocketCooldownTotalView.innerText = (baseRocketCooldown * ( 1 / modifier.rocket_attack_speed_m ) + modifier.rocket_attack_speed_a).toFixed(0);

    experienceGainBaseView.innerText = "[ 0 - " + baseExperienceGain.toFixed(0) + " ]";
    experienceGainMView.innerText = modifier.experience_gain_m.toFixed(2);
    experienceGainAView.innerText = modifier.experience_gain_a.toFixed(0);
    experienceGainTotalView.innerText = "[ " + modifier.experience_gain_a.toFixed(0) + " - " + (baseExperienceGain * modifier.experience_gain_m + modifier.experience_gain_a).toFixed(1) + " ]";

    fuelTankBase.innerText = baseMaxFuel.toFixed(0);
    fuelTankM.innerText = modifier.max_fuel_m.toFixed(2);
    fuelTankA.innerText = modifier.max_fuel_a.toFixed(0);
    fuelTankTotal.innerText = (baseMaxFuel * modifier.max_fuel_m + modifier.max_fuel_a).toFixed(0);

    fuelRegenBase.innerText = baseFuelRegen.toFixed(2);
    fuelRegenM.innerText = modifier.fuel_regen_m.toFixed(2);
    fuelRegenA.innerText = modifier.fuel_regen_a.toFixed(2);
    fuelRegenTotal.innerText = (baseFuelRegen * modifier.fuel_regen_m + modifier.fuel_regen_a).toFixed(2);
}

export const showStatsMenue = () => {
    statsMenueView.style.display = "block";
}

export const hideStatsMenue = () => {
    statsMenueView.style.display = "none";
}