import * as ui from "../util/ui.js";
import * as sound from "../util/sound.js";
import {addToStat} from "./rogue.js";
import { gameState } from "../util/gamestatistics.js";

import plintinUrl from "/img/rogue/plintin.png?url";
import xeroniumUrl from "/img/rogue/xeronium.png?url";
import blubboniumUrl from "/img/rogue/blubbonium.png?url";

const shopMenuView = document.getElementById("shop");

const shopCoinsView = document.getElementById("shop-coins");

const bulletAttackSpeedButton = document.getElementById("shop-bullet-attack-speed");
const bulletCompressionButton = document.getElementById("shop-bullet-attack-compression");
const rocketAttackSpeedButton = document.getElementById("shop-rocket-attack-speed");
const rocketPiercingButton = document.getElementById("shop-rocket-piercing");
const experienceGainButton = document.getElementById("shop-experience-gain");

let shop = {}

let currentCoins = 0;
let currentPlintin = 0;
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
    totalCoins = 0;

    currentPlintin = 0;
    totalPlintin = 0;

    currentXeronium = 0;
    totalXeronium = 0;

    currentBlubbonium = 0;
    totalBlubbonium = 0;

    shop = {
        "bullet_attack_speed": { // increases the fire rate of bullets
          "level": 0,
          "scaling": 1.2,
          "price": 100,
          "button": bulletAttackSpeedButton
        },
        "bullet_compression": { //reduced attack speed, but increases bullet damage accordingly (helps to not lag the game)
          "level": 0,
          "scaling": 1.2,
          "price": 100,
          "button": bulletCompressionButton
        },
        "rocket_attack_speed": { // increases the fire rate of rocket
          "level": 0,
          "scaling": 1.2,
          "price": 100,
          "button": rocketAttackSpeedButton
        },
        "rocket_piercing": { // increases how many asteroids can be crushed with a single rocket
          "level": 0,
          "scaling": 1.2,
          "price": 100,
          "button": rocketPiercingButton
        },
        "experience_gain": { // increases how much experience the player gains
          "level": 0,
          "scaling": 1.2,
          "price": 100,
          "button": experienceGainButton
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

    if (currentCoins >= shop[key].price) {
        sound.playPowerupSound();

        currentCoins -= shop[key].price;
        shop[key].level++;
        shop[key].price = Math.round(shop[key].price * shop[key].scaling);

        shop[key].button.innerText = formatNumberName(shop[key].price) + "💲";

        switch (key) {
            case "bullet_attack_speed": 
                addToStat(key + "_m", 0.05);
                break;

            case "bullet_compression": 
                addToStat(key, 1);
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
        }

        ui.updateCoins(currentCoins);
    } else {
        sound.playClickSound();
    }
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
    bulletAttackSpeedButton.innerText = shop.bullet_attack_speed.price + "💲";
    bulletAttackSpeedButton.onclick = () => {buy("bullet_attack_speed")};
    bulletCompressionButton.innerText = shop.bullet_compression.price + "💲";
    bulletCompressionButton.onclick = () => {buy("bullet_compression")};
    rocketAttackSpeedButton.innerText = shop.rocket_attack_speed.price + "💲";
    rocketAttackSpeedButton.onclick = () => {buy("rocket_attack_speed")};
    rocketPiercingButton.innerText = shop.rocket_piercing.price + "💲";
    rocketPiercingButton.onclick = () => {buy("rocket_piercing")};
    experienceGainButton.innerText = shop.experience_gain.price + "💲";
    experienceGainButton.onclick = () => {buy("experience_gain")};

    shopCoinsView.innerText = 0;
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