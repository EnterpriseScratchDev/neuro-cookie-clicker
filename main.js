var Game;
var CCSE;

/**
 * @typedef {object} Game
 * @prop {Function} Unlock
 * @prop {Function} UnlockTiered
 * @prop {Date | number} lastClick the time of the last click
 * @prop {Function} ClickCookie
 * @prop {(hook: string, func: function) => void} registerHook
 * @prop {?number} mouseX
 * @prop {?number} mouseY
 * @prop {0 | 1} canClick
 * @prop {number} cookies the number of cookies the player has (flouting-point number)
 *
 * --- Notifications ---
 * @prop {(name: string, desc: string, pic: ?, quick?: number, noLog?: number) => void} Notify
 * @prop {number} noteId the ID of the last notification
 * @prop {(noteId: number) => void} CloseNote close a notification by ID
 *
 * --- Shimmers (golden cookies, reindeer, etc.) ---
 * @prop {(type: Game_ShimmerType, obj: ?, noCount: ?) => Game_Shimmer} shimmer This is called with `new` to create a new shimmer.
 * @prop {Game_Shimmer[]} shimmers the list of shimmers currently on the screen
 * @prop {HTMLDivElement} shimmersL the parent element of all shimmers
 * @prop {number} shimmersN the number of shimmers currently on the screen
 * @prop {((Game_Shimmer) => void)[]} customShimmers the callbacks to be called when a shimmer is created
 *
 * --- Upgrades ---
 * @prop {Object.<string, Upgrade>} Upgrades upgrades by name
 * @prop {Object.<number, Upgrade>} UpgradesById upgrades by ID number
 * @prop {number} UpgradesN the number of upgrades
 * @prop {Upgrade[]} UpgradesInStore upgrades in the store
 *
 * @prop {1 | -1} buyMode whether to buy (`1`) or sell (`-1`) objects
 */

/**
 * @typedef {object} Game_Shimmer
 * @prop {Game_ShimmerType} type the type of shimmer
 * @prop {HTMLElement} l the shimmer's HTML element, which may not still be on the page if this is an old reference
 * @prop {number} x the x-coordinate of the shimmer
 * @prop {number} y the y-coordinate of the shimmer
 * @prop {number} id the unique identifier for the shimmer
 * @prop {string} force the type of force applied to the shimmer
 * @prop {object} forceObj the object representing the force applied to the shimmer
 * @prop {boolean} noCount whether the shimmer should be counted
 */

/**
 * The possible types of shimmers.
 * @typedef {"golden" | "reindeer"} Game_ShimmerType
 */

/**
 * TODO: This is incomplete
 * @typedef {object} Upgrade
 * @prop {number} id the ID number of the upgrade
 * @prop {string} name the name of the upgrade
 * @prop {string} desc the description of the upgrade
 * @prop {() => "Upgrade"} getType
 * @prop {() => number} getPrice
 * @prop {() => boolean} canBuy
 * @prop {(bypass: boolean) => (0 | 1)} buy
 */

/**
 * @typedef {object} Game_Object
 * @prop {number} id
 * @prop {string} name
 * @prop {number} basePrice
 * @prop {number} price
 * @prop {0 | 1} locked
 *
 * @prop {number} amount the number of this object owned
 * @prop {() => number} getPrice get the price of buying one of this object
 * @prop {(amount: number) => ?} buy buy a certain number of this object
 */

/**
 * @typedef {object} CCSE
 * @prop {CCSE_NewBuilding} NewBuilding
 */

/**
 * @typedef CCSE_NewBuilding
 * @param {string} name
 * @param {string} commonName
 * @param {string} desc
 * @param {number} icon
 * @param {number} iconColumn
 * @param {CCSE_Art} art
 * @param {?} price
 * @param {(me: object) => number} cps
 * @param {?} buyFunction
 * @param {?} foolObject
 * @param {?} buildingSpecial
 * @return {object}
 */

/**
 * Alias for `document.getElementById` used by Cookie Clicker.
 * @typedef {function} l
 * @param {string} id
 * @return {HTMLElement | null}
 */

/**
 * @typedef {object} CCSE_Art
 * TODO
 */

if (NeuroIntegration === undefined) var NeuroIntegration = {};
NeuroIntegration.name = "Neuro-sama Integration";
NeuroIntegration.version = "1.00";
NeuroIntegration.GameVersion = "2.052";

NeuroIntegration.launch = function () {

    const Mod = NeuroIntegration;

    /** @type {boolean} */
    Mod.isLoaded = true;

    automaticallyCloseNotes();

    Game.Notify("Neuro-sama Integration mod loaded!", "Bwaaa!", [16, 5], 6, 1);
    console.info("[NeuroIntegration] Loaded!");

    /**
     * @prop {number} msPerClick the number of milliseconds between each click
     * @prop {number} remainingClicks the number of pending clicks
     * @prop {number | null} setIntervalId the ID of the last call to `setInterval`, or `null` if no interval is running
     */
    Mod.autoClicker = {
        msPerClick: 100,
        maximumPendingClicks: 100,
        remainingClicks: 0,
        intervalId: null
    };

    /**
     * Click the cookie.
     * @param {number} times the number of times to click; default is 1
     * @return {void}
     */
    Mod.click = function (times = 1) {
        console.info(`[NeuroIntegration] Clicking ${times} times`);
        Mod.autoClicker.remainingClicks = Math.min(Mod.autoClicker.remainingClicks + times, Mod.autoClicker.maximumPendingClicks);
        if (Mod.autoClicker.intervalId === null) {
            console.info(`[NeuroIntegration] Setting up clicker interval`);
            Mod.autoClicker.intervalId = setInterval(() => {
                // console.debug(`[NeuroIntegration] Remaining clicks: ${Mod.autoClicker.remainingClicks}`);
                if (Mod.autoClicker.remainingClicks > 0 || Game.canClick) {


                    Mod.autoClicker.remainingClicks--;
                } else {
                    clearInterval(Mod.autoClicker.intervalId);
                    Mod.autoClicker.intervalId = null;
                    Mod.autoClicker.remainingClicks = 0; // will already be 0 in most cases
                }
            }, Mod.autoClicker.msPerClick);
        }
    };

    Game.registerHook("click", () => {
        console.debug(`[NeuroIntegration] Clicked! (from hook)`);
    });

    Mod.util = {};
    /**
     * Reload the game in the same way as when the mod list is modified.
     */
    Mod.util.reload = () => {
        console.info("[NeuroIntegration] Reloading the game...");
        Game.toSave = true;
        Game.toReload = true;
    };
    /**
     * Get a random integer in the range `[min, max]`.
     * @param {number} min the minimum value
     * @param {number} max the maximum value
     * @returns {number} a random integer in the range `[min, max]`
     */
    Mod.util.randomRange = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1) + min);
    };
    /**
     * Get a random choice from an array.
     * @typeParam T the type of the array elements
     * @param {ArrayLike} choices
     * @returns {any | undefined} a random element from the array, or `undefined` if the array is empty
     */
    Mod.util.randomChoice = (choices) => {
        if (!choices?.length) return undefined;
        return choices[Math.floor(Math.random() * choices.length)];
    };
    /**
     * Spawn a golden cookie.
     * @return {Game_Shimmer}
     */
    Mod.util.spawnGoldenCookie = () => {
        return new Game.shimmer("golden", 0, 0);
    }

    /**
     * Automatically close notifications after a certain amount of time.
     * This works by replacing the `Game.Notify` function with a new function that closes the notification after a delay.
     * @param {number} [timeoutSeconds=5] the number of seconds to wait before closing notifications
     */
    function automaticallyCloseNotes(timeoutSeconds = 5) {
        let oldNotify = Game.Notify;
        Game.Notify = function (title, desc, pic, quick, noLog) {
            oldNotify(title, desc, pic, quick, noLog);
            setTimeout(() => Game.CloseNote(Game.noteId), timeoutSeconds * 1000);
        };
    }

    /**
     * Click the cookie.
     */
    Mod.util.clickCookie = () => {
        // Set Game.mouseX and Game.mouseY to a random point near the center of the cookie
        // This doesn't affect whether the click is registered, but it varies the location of the particle effect
        let {left, top} = l("cookieAnchor").getBoundingClientRect();
        Game.mouseX = left + Mod.util.randomRange(-25, 25);
        Game.mouseY = top + Mod.util.randomRange(-25, 25);

        // Click the cookie
        Game.lastClick = 0; // prevents the game from ignoring the click if it's too soon after the last one
        Game.ClickCookie();
    }

    function getShopContents(maxUpgrades = 5) {
        let upgrades = [];
        for (let i = 0; i < Math.min(Game.UpgradesInStore.length, maxUpgrades); i++) {
            const upgrade = Game.UpgradesInStore[i];
            upgrades.push({
                name: upgrade.name,
                desc: simplifyHtmlString(upgrade.desc),
                price: Beautify(upgrade.getPrice()),
                canBuy: upgrade.canBuy()
            });
        }
        return {
            upgrades: upgrades
        };
    }
    Mod.util.getShopContents = getShopContents;

    function simplifyHtmlString(htmlString) {
        return htmlString
            // Add whitespace before quote tags
            .replaceAll(/<q>/g, "  <q>")
            // Replace quote tags with double quotes
            .replaceAll(/<\/?q>/g, "\"")
            // Replace bold tags with double asterisks
            .replaceAll(/<\/?b>/g, "**")
            // Replace italic tags with single asterisks
            .replaceAll(/<\/?i>/g, "*");
    }
    Mod.util.simplifyHtmlString = simplifyHtmlString;

    /**
     * Buy an object
     * @param {Game_Object} object the object to buy
     * @param {number} amount the number of objects to buy
     * @return {number | string} the number of objects bought, or an error message
     */
    function buyObject(object, amount = 1) {
        if (amount < 1) {
            console.warn(`[NeuroIntegration] Invalid amount: ${amount}`);
            return "Invalid amount";
        }
        if (object.locked) {
            console.warn(`[NeuroIntegration] Object "${object.name}" is locked`);
            return "This object is locked";
        }
        if (object.getPrice() > Game.cookies) {
            console.warn(`[NeuroIntegration] Insufficient cookies to buy ${amount} of [${object.name}]`);
            return `Insufficient cookies to buy any [${object.name}]. You need ${Beautify(object.getPrice() - Game.cookies)} more cookies to afford one.`;
        }
        const oldAmount = object.amount;
        const buyResult = object.buy(amount);
        const newAmount = object.amount;
        const amountBought = newAmount - oldAmount;
        console.debug(`[NeuroIntegration] Attempted to buy ${amount} of [${object.name}]; bought ${amountBought}; buy method returned ${buyResult}`);
        if (amountBought > 0) {
            console.info(`[NeuroIntegration] Bought ${amountBought} of [${object.name}]`);
            return amountBought;
        } else {
            console.error(`[NeuroIntegration] Failed to buy [${object.name}] for an unknown reason`);
            return "Failed to buy for an unknown reason";
        }
    }
    Mod.util.buyObject = buyObject;
};

if (!NeuroIntegration.isLoaded) {
    if (CCSE && CCSE.isLoaded) {
        NeuroIntegration.launch();
    } else {
        if (!CCSE) CCSE = {};
        if (!CCSE.postLoadHooks) CCSE.postLoadHooks = [];
        CCSE.postLoadHooks.push(NeuroIntegration.launch);
    }
}

// Game.registerMod("neuro-api-mod", {//this string needs to match the ID provided in your info.txt
// 	init: function () {
// 		//this function is called as soon as the mod is registered
// 		//declare hooks here
//
// 		//writing mods for Cookie Clicker may require a decent understanding of javascript.
// 		//dig around in the game files and look for "main.js", almost the entire source code is in there including further mod hook instructions and more examples! search for "MODDING API".
//
// 		Game.Notify(`Cooler mod loaded!`, `Now with extra clickable stuff!`, [16, 5]);
//
// 		//this mod adds the very silly functionality of letting you click a little button next to the Store header to increase a number displayed on it.
// 		//how anyone could find this kind of idle clicking fun is beyond us, but this is just an example.
//
// 		this.buttonClicks = 0;//"this" refers to this mod; we're declaring a variable local to this mod. Other mods could access it with Game.mods["cooler sample mod"].buttonClicks
//
// 		//create the button inside the Store div
// 		l('storeTitle').insertAdjacentHTML('beforeend', '<a style="font-size:12px;position:absolute;bottom:2px;right:2px;display:block;" class="smallFancyButton" id="storeClicker"></a>');
// 		this.updateScore();
//
// 		//we declare "MOD" as a proxy for "this", since inside other functions and events "this" no longer refers to this mod but to the functions or events themselves!
// 		let MOD = this;
//
// 		//this attaches a click detector to our button
// 		AddEvent(l('storeClicker'), 'click', function () {
// 			PlaySound('snd/pop' + Math.floor(Math.random() * 3 + 1) + '.mp3', 0.5);//play the sound pop1, pop2 or pop3 at random with half-volume
// 			MOD.buttonClicks += 1;
// 			MOD.updateScore();
// 			//this displays a random message for 2 seconds for every 20 clicks on our button
// 			if (MOD.buttonClicks % 20 == 0 && MOD.buttonClicks > 0) Game.Notify(choose([`Splendid!`, `Keep going!`, `Amazing!`, `Incredible!`, `Outstanding!`]), '', 0, 2);
// 		});
//
// 		//this registers a hook that triggers on game reset
// 		//we use this to reset the mod's buttonClicks variable (but only in a hard reset)
// 		Game.registerHook('reset', function (hard) {
// 			if (hard) {
// 				MOD.buttonClicks = 0;
// 				MOD.updateScore();
// 			}
// 		});
//
// 		//to finish off, we're replacing the big cookie picture with a cool cookie, why not (the image is in this mod's directory)
// 		Game.Loader.Replace('perfectCookie.png', this.dir + '/coolCookie.png');
//
// 	},
// 	save: function () {
// 		//use this to store persistent data associated with your mod
// 		//note: as your mod gets more complex, you should consider storing a stringified JSON instead
// 		return String(this.buttonClicks);
// 	},
// 	load: function (str) {
// 		//do stuff with the string data you saved previously
// 		this.buttonClicks = parseInt(str || 0);
// 		this.updateScore();
// 	},
// 	updateScore: function () {
// 		//this is not a standard mod hook - it's a custom function we're defining for ease of use; it simply sets the text on our button to reflect the current number of clicks
// 		l('storeClicker').innerHTML = 'Click me!<br>' + Beautify(this.buttonClicks);
// 	},
// });