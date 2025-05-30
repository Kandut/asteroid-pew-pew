const bulletDamageBaseView = document.getElementById("bullet-damage-base");
const bulletDamageBoxesView = document.getElementById("bullet-damage-boxes");
const bulletDamageMView = document.getElementById("bullet-damage-m");
const bulletDamageAView = document.getElementById("bullet-damage-a");
const bulletDamageTotalView = document.getElementById("bullet-damage-total");

const bulletCooldownBaseView = document.getElementById("bullet-cooldown-base");
const bulletCooldownAView = document.getElementById("bullet-cooldown-a");
const bulletCooldownMView = document.getElementById("bullet-cooldown-m");
const bulletCooldownTotalView = document.getElementById("bullet-cooldown-total");

const rocketPiercingBaseView = document.getElementById("rocket-piercing-base");
const rocketPiercingBoxesView = document.getElementById("rocket-piercing-boxes");
const rocketPiercingMView = document.getElementById("rocket-piercing-m");
const rocketPiercingAView = document.getElementById("rocket-piercing-a");
const rocketPiercingTotalView = document.getElementById("rocket-piercing-total");

const rocketCooldownBaseView = document.getElementById("rocket-cooldown-base");
const rocketCooldownMView = document.getElementById("rocket-cooldown-m");
const rocketCooldownAView = document.getElementById("rocket-cooldown-a");
const rocketCooldownTotalView = document.getElementById("rocket-cooldown-total");

const experienceGainBaseView = document.getElementById("experience-gain-base");
const experienceGainMView = document.getElementById("experience-gain-m");
const experienceGainAView = document.getElementById("experience-gain-a");
const experienceGainTotalView = document.getElementById("experience-gain-total");

const statsMenueView = document.getElementById("stats-menu");

export const updateStatView = (modifier, collectedPowerups, baseBulletDamage, baseBulletCooldown, baseRocketPiercing, baseRocketCooldown, baseExperienceGain) => {
    bulletDamageBaseView.innerText = baseBulletDamage;
    bulletDamageBoxesView.innerText = collectedPowerups.bullet_damage;
    bulletDamageMView.innerText = modifier.bullet_damage_m;
    bulletDamageAView.innerText = modifier.bullet_damage_a;
    bulletDamageTotalView.innerText = (baseBulletDamage + collectedPowerups.bullet_damage) * modifier.bullet_damage_m + modifier.bullet_damage_a;

    bulletCooldownBaseView.innerText = baseBulletCooldown;
    bulletCooldownAView.innerText = modifier.bullet_attack_speed_a;
    bulletCooldownMView.innerText = modifier.bullet_attack_speed_m;
    bulletCooldownTotalView.innerText = baseBulletCooldown * modifier.bullet_attack_speed_m + modifier.bullet_attack_speed_a;

    rocketPiercingBaseView.innerText = baseRocketPiercing;
    rocketPiercingBoxesView.innerText = collectedPowerups.rocket_piercing;
    rocketPiercingMView.innerText = modifier.rocket_piercing_m;
    rocketPiercingAView.innerText = modifier.rocket_piercing_a;
    rocketPiercingTotalView.innerText = (baseRocketPiercing + collectedPowerups.rocket_piercing) * modifier.rocket_piercing_m + modifier.rocket_piercing_a;

    rocketCooldownBaseView.innerText = baseRocketCooldown;
    rocketCooldownMView.innerText = modifier.rocket_attack_speed_m;
    rocketCooldownAView.innerText = modifier.rocket_attack_speed_a;
    rocketCooldownTotalView.innerText = baseRocketCooldown * modifier.rocket_attack_speed_m + modifier.rocket_attack_speed_a;

    experienceGainBaseView.innerText = "[ 0 - " + baseExperienceGain + " ]";
    experienceGainMView.innerText = modifier.experience_gain_m;
    experienceGainAView.innerText = modifier.experience_gain_a;
    experienceGainTotalView.innerText = "[ " + modifier.experience_gain_a + " - " + baseExperienceGain * modifier.experience_gain_m + modifier.experience_gain_a + " ]";
}

export const showStatsMenue = () => {
    statsMenueView.style.display = "block";
}

export const hideStatsMenue = () => {
    statsMenueView.style.display = "none";
}