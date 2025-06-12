import * as ui from "../util/ui.js";
import * as sound from "../util/sound.js";
import {addToStat} from "./rogue.js";
import { gameState } from "../util/gamestatistics.js";

import plintinUrl from "/img/rogue/plintin.png?url";
import xeroniumUrl from "/img/rogue/xeronium.png?url";
import blubboniumUrl from "/img/rogue/blubbonium.png?url";
import coinUrl from "/img/rogue/coin.png?url";

const shopMenuView = document.getElementById("shop");
const shopCoinsView = document.getElementById("shop-coins");

const bulletAttackSpeedButton = document.getElementById("shop-bullet-attack-speed");
const rocketAttackSpeedButton = document.getElementById("shop-rocket-attack-speed");
const rocketPiercingButton = document.getElementById("shop-rocket-piercing");
const experienceGainButton = document.getElementById("shop-experience-gain");
const fuelTankSizeButton = document.getElementById("shop-fuel-tank-size");
const fuelRefillRateButton = document.getElementById("shop-refill-rate");
const xeroniumShopIcon = document.getElementById("shop-xeronium-icon");

const coinIconViews = document.getElementsByName("coin-icon");

const xeroniumIconString = "<img class='resource-icon' src='" + xeroniumUrl + "'>";
const coinIconString = "<img class='resource-icon' src='" + coinUrl + "'>"

let shop = {}

let currentCoins = 0;
export let currentPlintin = 0;
let currentXeronium = 0;
let currentBlubbonium = 0;

export const resourceTypes = ["plintin", "xeronium", "blubbonium"];

export const handleGetCoins = (coins) => {
    currentCoins += coins;
    gameState.coinsCollected += coins;
  
    ui.updateCoins(currentCoins);
}

export const handleGetPlintin = (plintin) => {
    currentPlintin += plintin;
    gameState.plintinCollected += plintin;

    ui.updatePlintin(currentPlintin);
}

export const handleGetXeronium = (xeronium) => {
    currentXeronium += xeronium;
    gameState.xeroniumCollected += xeronium;

    ui.updateXeronium(currentXeronium);
}

export const handleGetBlubbonium = (blubbonium) => {
    currentBlubbonium += blubbonium;
    gameState.blubboniumCollected += blubbonium;

    ui.updateBlubbonium(currentBlubbonium);
}

export const initialiseResources = () => {

}

export const resetShop = () => {
    currentCoins = 0;
    currentPlintin = 0;
    currentXeronium = 0;
    currentBlubbonium = 0;

    shop = {
        "bullet_attack_speed": { // increases the fire rate of bullets
          "level": 0,
          "scaling": 1.2,
          "price": 100,
          "currency": "coins",
          "button": bulletAttackSpeedButton
        },
        "rocket_attack_speed": { // increases the fire rate of rocket
          "level": 0,
          "scaling": 1.2,
          "price": 100,
          "currency": "coins",
          "button": rocketAttackSpeedButton
        },
        "rocket_piercing": { // increases how many asteroids can be crushed with a single rocket
          "level": 0,
          "scaling": 1.2,
          "price": 100,
          "currency": "coins",
          "button": rocketPiercingButton
        },
        "experience_gain": { // increases how much experience the player gains
          "level": 0,
          "scaling": 1.2,
          "price": 100,
          "currency": "coins",
          "button": experienceGainButton
        },
        "fuel_tank_size": { // increases how much fuel can be kept in the tank
          "level": 0,
          "scaling": 1.2,
          "price": 10,
          "currency": "xeronium",
          "button": fuelTankSizeButton
        },
        "fuel_refill_rate": { // increases how much fuel can be kept in the tank
          "level": 0,
          "scaling": 1.2,
          "price": 10,
          "currency": "xeronium",
          "button": fuelRefillRateButton
        }
    }

    ui.updateCoins(0);
    ui.updatePlintin(0);
    ui.updateXeronium(0);
    ui.updateBlubbonium(0);
}

function buy(key) {
    if (!Object.keys(shop).includes(key)) {
        console.warn("Unknown shop key given: " + key);
        return;
    }

    let money = currentCoins;
    if (shop[key].currency !== "coins") {
        switch (shop[key].currency) {
            case "plintin":
                money = currentPlintin;
                break;
            case "xeronium":
                money = currentXeronium;
                break;
            case "blubbonium":
                money = currentBlubbonium;
                break;
        }
    }

    if (money >= shop[key].price) {
        sound.playPowerupSound();

        switch (shop[key].currency) {
            case "coins":
                currentCoins -= shop[key].price;
                break;
            case "plintin":
                currentPlintin-= shop[key].price;
                break;
            case "xeronium":
                currentXeronium-= shop[key].price;
                break;
            case "blubbonium":
                currentBlubbonium -= shop[key].price;
                break;
        }

        shop[key].level++;

        const scaling = shop[key].scaling ? shop[key].scaling : 1;
        const adaptive = shop[key].adaptive ? shop[key].adaptive : 0;
        shop[key].price = Math.round(shop[key].price * scaling + adaptive);

        switch (key) {
            case "bullet_attack_speed": 
                addToStat(key + "_m", 0.05);
                break;

            case "rocket_attack_speed": 
                addToStat(key + "_m", 0.05);
                break;

            case "rocket_piercing": 
                addToStat(key + "_a", 1);
                break;

            case "experience_gain": 
                addToStat(key + "_m", 0.05);
                break;

            case "fuel_tank_size":
                addToStat("max_fuel_a", 100);
                break;

            case "fuel_refill_rate":
                addToStat("fuel_regen_a", 0.05);
                break;
        }

        ui.updateCoins(currentCoins);
        ui.updatePlintin(currentPlintin);
        ui.updateXeronium(currentXeronium);
        ui.updateBlubbonium(currentBlubbonium);
    } else {
        sound.playFailedSound();
    }

    return shop[key].price;
}

const formatNumberName = (number) => {
    const letters = ["", "K", "M", "B", "T", "q", "Q", "s", "S", "O", "N", "D"];
    let i = 1;
  
    while (number > 1000 ** i) {
      i++;
    }
  
    return Math.ceil(number / 1000 ** (i-1)) + letters[i-1];
}

export const initialiseShop = () => {
    bulletAttackSpeedButton.innerHTML = shop.bullet_attack_speed.price + coinIconString;
    bulletAttackSpeedButton.onclick = () => {
        let price = buy("bullet_attack_speed");
        bulletAttackSpeedButton.innerHTML = formatNumberName(price) + coinIconString;
    };
    rocketAttackSpeedButton.innerHTML = shop.rocket_attack_speed.price + coinIconString;
    rocketAttackSpeedButton.onclick = () => {
        let price = buy("rocket_attack_speed");
        rocketAttackSpeedButton.innerHTML = formatNumberName(price) + coinIconString;
    };
    rocketPiercingButton.innerHTML = shop.rocket_piercing.price + coinIconString;
    rocketPiercingButton.onclick = () => {
        let price = buy("rocket_piercing");
        rocketPiercingButton.innerHTML = formatNumberName(price) + coinIconString;
    };
    experienceGainButton.innerHTML = shop.experience_gain.price + coinIconString;
    experienceGainButton.onclick = () => {
        let price = buy("experience_gain");
        experienceGainButton.innerHTML = formatNumberName(price) + coinIconString;
    };

    fuelTankSizeButton.innerHTML = shop.fuel_tank_size.price + xeroniumIconString;
    fuelTankSizeButton.onclick = () => {
        let price = buy("fuel_tank_size");
        fuelTankSizeButton.innerHTML = formatNumberName(price) + xeroniumIconString;
    };
    fuelRefillRateButton.innerHTML = shop.fuel_refill_rate.price + xeroniumIconString;
    fuelRefillRateButton.onclick = () => {
        let price = buy("fuel_refill_rate");
        fuelRefillRateButton.innerHTML = formatNumberName(price) + xeroniumIconString;
    };

    shopCoinsView.innerText = 0;

    xeroniumShopIcon.src = xeroniumUrl;

    for (let view of coinIconViews) {
        view.src = coinUrl;
    }
}

export const toggleShop = () => {
    if (shopMenuView.style.display == "none") {
        showShop();
    } else {
        hideShop();
    }
}

export const hideShop = () => {
    shopMenuView.style.display = "none";
}

export const showShop = () => {
    shopMenuView.style.display = "flex";
}
const resources = [
    {
        "name": "plintin",
        "url": plintinUrl
    },
    {
        "name": "xeronium",
        "url": xeroniumUrl
    },
    {
        "name": "blubbonium",
        "url": blubboniumUrl
    }
]
ui.initialiseResourceList(resources);
resetShop();
initialiseShop();