import { modifiers } from "./rogue";
import fuelTankUrl from "/img/rogue/fuel_tank.png?url";

const fuelTankImageView = document.getElementById("fuel-tank-image");
const fuelTankFillingView = document.getElementById("fuel-tank-filling");
const fuelTankTextView = document.getElementById("fuel-text");

const maxFuelHeight = 380; //pixels
const maxFuelWidth = 90; //pixels
const maxMarginLeft = 5;
export const baseMaxFuel = 1000;
export const baseFuelRegen = 0.25;
export const baseFuelPowerupYield = 1000;
export const baseFuelConsumption = 1;
export let maxFuel = baseMaxFuel;
export let currentFuel = baseMaxFuel;
export let fuelRegen = baseFuelRegen;
export let fuelConsumption = baseFuelConsumption;

export const updateStats = () => {
    maxFuel = baseMaxFuel * modifiers.max_fuel_m + modifiers.max_fuel_a;
    fuelRegen = baseFuelRegen * modifiers.fuel_regen_m + modifiers.fuel_regen_a;
    fuelConsumption = baseFuelConsumption * modifiers.fuel_consumption_m + modifiers.fuel_consumption_a;
}

export const updateFuel = (fuel) => {
    currentFuel = fuel;

    if (currentFuel > maxFuel) {
        currentFuel = maxFuel;
    } else if (currentFuel < 0) {
        currentFuel = 0;
    }

    updateFilling(currentFuel / maxFuel);
}

const updateFilling = (percent) => {
    const height = maxFuelHeight * percent;
    fuelTankFillingView.style.height = height + "px";

    if (height <= 30) {
        fuelTankFillingView.style.width = (90 - (30 - height)) + "px";
        fuelTankFillingView.style.marginLeft = (5 + (30 - height) / 2) + "px";
    } else {
        fuelTankFillingView.style.width = maxFuelWidth + "px";
        fuelTankFillingView.style.marginLeft = maxMarginLeft + "px";
    }
}

export const init = () => {
    fuelTankImageView.src = fuelTankUrl;
}

export const reset = () => {
    maxFuel = baseMaxFuel;
    currentFuel = baseMaxFuel;
    fuelRegen = baseFuelRegen;

    updateFuel(currentFuel);
}

export const showFuelTank = () => {
    fuelTankImageView.style.display = "block";
    fuelTankFillingView.style.display = "block";
    fuelTankTextView.style.display = "block";
}

export const hideFuelTank = () => {
    fuelTankImageView.style.display = "none";
    fuelTankFillingView.style.display = "none";
    fuelTankTextView.style.display = "none";
}

init();