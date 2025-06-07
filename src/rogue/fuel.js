import fuelTankUrl from "/img/rogue/fuel_tank.png?url";

const fuelTankImageView = document.getElementById("fuel-tank-image");
const fuelTankFillingView = document.getElementById("fuel-tank-filling");

const maxFuelHeight = 380; //pixels
const maxFuelWidth = 90; //pixels
const maxMarginLeft = 5;
const baseMaxFuel = 1000;
export let maxFuel = baseMaxFuel;
export let currentFuel = baseMaxFuel;

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

    updateFuel(currentFuel);
}

init();