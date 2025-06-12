const statsMenueView = document.getElementById("stats-menu");

const idPrefix = "stats-";
const idSuffixes = {
    base: "-base", 
    boxes: "-boxes", 
    m: "-m", 
    a: "-a", 
    total: "-total"
};

const keys = [
    "bullet-damage",
    "bullet-attack-speed",
    "critical-hit-chance",
    "critical-hit-damage",
    "rocket-piercing",
    "rocket-attack-speed",
    "experience-gain",
    "max-fuel",
    "fuel-regen"
];

export const updateStatsView = (
    modifier, 
    collectedPowerups, 
    baseValues
) => {
    for (let key of keys) {
        const baseV = baseValues[key];
        const boxesV = collectedPowerups[key.replaceAll("-", "_")];
        const mV = modifier[key.replaceAll("-", "_") + "_m"];
        const aV = modifier[key.replaceAll("-", "_") + "_a"];

        showStats(
            key, 
            baseV,
            boxesV,
            mV,
            aV,
            (baseV + (boxesV ? boxesV : 0)) * mV + aV
        );
    }
}

const showStats = (key, base=false, boxes=false, m=false, a=false, total=false) => {
    if (base || base === 0) {
        showStat(idPrefix + key + idSuffixes.base, base);
    }
    if (boxes || boxes === 0) {
        showStat(idPrefix + key + idSuffixes.boxes, boxes);
    }
    if (m || m === 0) {
        showStat(idPrefix + key + idSuffixes.m, m);
    }
    if (a || a === 0) {
        showStat(idPrefix + key + idSuffixes.a, a);
    }
    if (total || total === 0) {
        showStat(idPrefix + key + idSuffixes.total, total);
    }
}

const showStat = (id, value) => {
    document.getElementById(id).innerText = value;
}

export const showStatsMenue = () => {
    statsMenueView.style.display = "block";
}

export const hideStatsMenue = () => {
    statsMenueView.style.display = "none";
}