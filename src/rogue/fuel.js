import fuelTankUrl from "/img/rogue/fuel_tank.png?url";

const fuelTankImageView = document.getElementById("fuel-tank-image");
const fuelTankFillingView = document.getElementById("fuel-tank-filling");

const maxFuelHeight = 385; //pixels
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

    fuelTankFillingView.style.height = (maxFuelHeight * (currentFuel / maxFuel)) + "px";
}

export const init = () => {
    fuelTankImageView.src = fuelTankUrl;
}

init();