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
}

export const showStatsMenue = () => {
    statsMenueView.style.display = "block";
}

export const hideStatsMenue = () => {
    statsMenueView.style.display = "none";
}