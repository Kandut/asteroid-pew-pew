import * as ui from "../ui.js";
import * as sound from "../sound.js";
import {addToStat} from "./rogue.js";

const shopMenuView = document.getElementById("shop");

const shopCoinsView = document.getElementById("shop-coins");

const bulletAttackSpeedButton = document.getElementById("shop-bullet-attack-speed");
const bulletCompressionButton = document.getElementById("shop-bullet-attack-compression");
const rocketAttackSpeedButton = document.getElementById("shop-rocket-attack-speed");
const rocketPiercingButton = document.getElementById("shop-rocket-piercing");
const experienceGainButton = document.getElementById("shop-experience-gain");

let shop = {}

let currentCoins = 0;
let totalCoins = 0;

export const handleGetCoins = (coins) => {
    currentCoins += coins;
    totalCoins += coins;
  
    ui.updateCoins(currentCoins);
}

export const resetShop = () => {
    currentCoins = 0;
    totalCoins = 0;

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

hideShop();
resetShop();
initialiseShop();