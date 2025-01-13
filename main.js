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
 * @prop {number} cookies the number of cookies the player has (floating-point number)
 * @prop {Object.<string, number>} cookiesPsByType the number of cookies per second produced by each building type
 * @prop {(name: string) => void} bakeryNameSet
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
 * @prop {((Game_Shimmer) => void)[]} customShimmer the callbacks to be called when a shimmer is created (note: there is not meant to be an 's' at the end)
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
 * @prop {(bypass: boolean = false) => (0 | 1)} buy
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
 * Cookie Clicker function that formats a number with commas.
 * @typedef {function} Beautify
 * @param {number} num
 * @return {string}
 */

/**
 * @typedef {object} CCSE_Art
 * TODO
 */

if (NeuroIntegration === undefined) var NeuroIntegration = {};
NeuroIntegration.id = "neuro api mod"; // the spaces are necessary
NeuroIntegration.name = "Neuro-sama API Integration";
NeuroIntegration.version = "1.00";
NeuroIntegration.GameVersion = "2.052";
/** @type {string | undefined} */
NeuroIntegration.errorMessage = undefined;

if (NeuroIntegration.util === undefined) NeuroIntegration.util = {};

/**
 * Convert an object to a JSON string, handling circular references.
 * @param obj the object to stringify
 * @returns {string} the JSON string
 */
NeuroIntegration.util.safeJsonStringify = function safeJsonStringify(obj) {
    return JSON.stringify(obj, (key, value) => {
        const seen = new WeakSet();
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                // Circular reference found, discard key
                return "[Circular Reference]";
            }
            // Store value in our collection
            seen.add(value);
        }
        return value;
    });
};

/**
 * Reload the game in the same way as when the mod list is modified.
 */
NeuroIntegration.util.reload = () => {
    console.info("[NeuroIntegration] Reloading the game...");

    if (l("neuro-integration-ws-address")?.value) {
        NeuroIntegration.config.wsAddress = l("neuro-integration-ws-address").value;
        CCSE.save();
    }

    Game.toSave = true;
    Game.toReload = true;
};

NeuroIntegration.loadDependency = function (path) {
    console.debug(`Loading dependency from path "${path}"`);
    return new Promise((resolve, reject) => {
        try {
            const scriptElement = document.createElement("script");
            scriptElement.src = path;
            scriptElement.onload = resolve;
            scriptElement.onerror = (event) => {
                const errorMessage = `Failed to load Zod script from ${event.target.src}`;
                NeuroIntegration.errorMessage = errorMessage;
                console.error("[NeuroIntegration] " + errorMessage, event);
                reject(new Error(errorMessage));
            };
            document.head.appendChild(scriptElement);
        } catch (e) {
            NeuroIntegration.errorMessage = e.message || e;
            console.error("[NeuroIntegration] Failed to load Zod", e);
            reject(new Error(e));
        }
    });
};

NeuroIntegration.loadDependencies = async function () {
    console.info("[NeuroIntegration] Loading dependencies...");
    const modDir = CCSE.GetModPath(NeuroIntegration.id);
    let zodPromise = Promise.resolve();
    if (!window.z) {
        zodPromise = NeuroIntegration.loadDependency(modDir + "/lib/zod.umd.js");
    }
    const neuroApiTypesPromise = zodPromise.then(() => NeuroIntegration.loadDependency(modDir + "/lib/neuroApiTypes.js"));
    const neuroApiClientPromise = neuroApiTypesPromise.then(() => NeuroIntegration.loadDependency(modDir + "/lib/neuroApiClient.js"));
    return Promise.all([zodPromise, neuroApiTypesPromise, neuroApiClientPromise]);
};

NeuroIntegration.defaultConfig = function () {
    return {
        wsAddress: "ws://localhost:8000"
    };
}

// NeuroIntegration.config = NeuroIntegration.defaultConfig();

/**
 * Update a configuration option.
 * @param {string} key
 * @param {any} value
 */
NeuroIntegration.updateConfig = function (key, value) {
    switch (key) {
        case "wsAddress":
            if (typeof value === "string") {
                NeuroIntegration.config.wsAddress = value;
                NeuroIntegration.api.setUpWebSocket();
            }
            break;
    }
}

NeuroIntegration.createOptionsMenu = function () {
    function getMenuString() {
        let m = CCSE.MenuHelper;
        let str = "";

        let reloadButtonStr = ""
            + "<div class='listing'>"
            + m.ActionButton("NeuroIntegration.config.wsAddress=NeuroIntegration.temp.wsAddress; CCSE.save(); NeuroIntegration.util.reload();", "Reload the Game")
            + "<label>Use this to quickly reload the game and apply the below settings</label>"
            + "</div>";
        str += reloadButtonStr;

        if (NeuroIntegration.temp === undefined) NeuroIntegration.temp = {};
        if (NeuroIntegration.temp.wsAddress === undefined) NeuroIntegration.temp.wsAddress = NeuroIntegration.config.wsAddress;

        const currentWsAddress = NeuroIntegration.config.wsAddress;
        let wsConfigStr = ""
            + m.Header("WebSocket Configuration")
            + "<div class='listing'>"
            + `<text>Current WebSocket Address: ${currentWsAddress}</text>`
            + "</div>"
            + "<div class='listing'>"
            + m.InputBox("neuro-integration-ws-address", 200, NeuroIntegration.temp.wsAddress, "NeuroIntegration.temp.wsAddress=this.value;console.log(this.value); Game.UpdateMenu();")
            + "<label>Use the Reload button above to apply this change. This text box loses focus sometimes, there's not much I can do about it :(</label>"
            + "</div>";
        str += wsConfigStr;

        return str;
    }

    Game.customOptionsMenu.push(() => CCSE.AppendCollapsibleOptionsMenu(NeuroIntegration.name, getMenuString()));
};

if (NeuroIntegration.api === undefined) NeuroIntegration.api = {};
NeuroIntegration.api.setUpWebSocket = function () {
    const Mod = NeuroIntegration;
    // Clear the auto-clicker interval if it's running
    if (Mod.autoClicker.intervalId !== null) {
        clearInterval(Mod.autoClicker.intervalId);
        Mod.autoClicker.intervalId = null;
    }
    const address = Mod.config?.wsAddress || Mod.defaultConfig().wsAddress;
    if (Mod.api.client) {
        Mod.api.client.close();
        Mod.api.client = undefined;
    }
    Mod.api.client = new Mod.api.NeuroApiClient(address, {
        shouldReconnect: true,
        reconnectTimeMs: 5000
    });
    /** @type {typeof import("neuroApiTypes")} */
    const client = Mod.api.client;
    client.onStatus((status) => {
        console.info(`WebSocket status: ${status}`);
        if (status === "open") {
            client.send({
                command: "startup",
                game: "Cookie Clicker"
            });
            Mod.api.registerActions("buy_upgrade", "buy_building");

            // Automatically click the cookie every 100ms
            if (Mod.autoClicker.intervalId === null) {
                Mod.autoClicker.intervalId = setInterval(() => Mod.util.clickCookie(), Mod.autoClicker.msPerClick);
            }
        } else {
            if (Mod.autoClicker.intervalId !== null) {
                clearInterval(Mod.autoClicker.intervalId);
                Mod.autoClicker.intervalId = null;
            }
        }
    });
    client.onCommand("action", (message) => {
        console.debug("[NeuroIntegration] Received action message:", message);
        const handler = Mod.api.actionHandlers[message.data.name];
        if (handler) {
            handler(message);
        } else {
            console.error(`[NeuroIntegration] No handler for action "${message.data.name}"`);
        }
    });
};

/**
 *
 * @param {ActionResultMessage} result
 */
NeuroIntegration.api.sendActionResult = function (result) {
    console.debug("[NeuroIntegration] Sending action result:", result);
    NeuroIntegration.api.client?.send(result);
};

/**
 * @type {Object.<string, function(ActionMessage): void>}
 */
NeuroIntegration.api.actionHandlers = {}

NeuroIntegration.api.actionHandlers.click_cookie = (actionMessage) => {
    NeuroIntegration.click(25);
    if (NeuroIntegration.autoClicker.remainingClicks > 90) {
        NeuroIntegration.api.unregisterActions("click_cookie");
    }
    NeuroIntegration.api.sendActionResult({
        command: "action/result",
        game: "Cookie Clicker",
        data: {
            id: actionMessage.data.id,
            success: true,
            message: "You start rapidly clicking the cookie!"
        }
    });
};

NeuroIntegration.api.actionHandlers.click_golden_cookie = (actionMessage) => {
    if (Game.shimmersN === 0) {
        NeuroIntegration.api.unregisterActions("click_golden_cookie");
        NeuroIntegration.api.sendActionResult({
            command: "action/result",
            game: "Cookie Clicker",
            data: {
                id: actionMessage.data.id,
                success: false,
                message: "There are no golden cookies to click :("
            }
        });
    } else {
        try {
            Game.shimmers[0].l.click(); // click the first golden cookie
        } catch (e) {
            // This is unlikely to happen, so we won't handle it any further
            console.error("[NeuroIntegration] Failed to click a golden cookie", e);
        }
        let message;
        if (Game.shimmersN > 0) {
            message = `You click the golden cookie! There are ${Game.shimmersN} more golden cookies to click!`;
        } else {
            message = `You click the golden cookie! There no more golden cookies to click!`;
            NeuroIntegration.api.unregisterActions("click_golden_cookie");
        }
        NeuroIntegration.api.sendActionResult({
            command: "action/result",
            game: "Cookie Clicker",
            data: {
                id: actionMessage.data.id,
                success: true,
                message: message
            }
        });
    }
};

NeuroIntegration.api.actionHandlers.buy_upgrade = (actionMessage) => {
    console.info(`[NeuroIntegration] Executing buy_upgrade action:`, actionMessage);
    let upgradeName;
    try {
        const dataObj = JSON.parse(actionMessage.data.data);
        upgradeName = dataObj.upgrade_name;
    } catch (e) {
        console.error(`[NeuroIntegration] Failed to parse data for action "buy_upgrade"`, e);
    }
    if (!upgradeName) {
        NeuroIntegration.api.sendActionResult({
            command: "action/result",
            game: "Cookie Clicker",
            data: {
                id: actionMessage.data.id,
                success: false,
                message: "No upgrade name provided"
            }
        });
        return;
    }
    const buyError = NeuroIntegration.util.buyUpgrade(upgradeName);
    if (buyError) {
        NeuroIntegration.api.sendActionResult({
            command: "action/result",
            game: "Cookie Clicker",
            data: {
                id: actionMessage.data.id,
                success: false,
                message: buyError
            }
        });
    } else {
        NeuroIntegration.api.sendActionResult({
            command: "action/result",
            game: "Cookie Clicker",
            data: {
                id: actionMessage.data.id,
                success: true,
                message: `You bought the upgrade!`
            }
        });
    }
}

NeuroIntegration.api.actionHandlers.buy_building = (actionMessage) => {
    console.info(`[NeuroIntegration] Executing buy_building action:`, actionMessage);
    let buildingName;
    let amount = 1;
    try {
        const dataObj = JSON.parse(actionMessage.data.data);
        buildingName = dataObj.building_name;
        if (dataObj.amount && typeof dataObj.amount === "number") {
            amount = dataObj.amount;
        }
    } catch (e) {
        console.error(`[NeuroIntegration] Failed to parse data for action "buy_building"`, e);
    }
    if (!buildingName) {
        NeuroIntegration.api.sendActionResult({
            command: "action/result",
            game: "Cookie Clicker",
            data: {
                id: actionMessage.data.id,
                success: false,
                message: "No building name provided"
            }
        });
        return;
    }
    const object = NeuroIntegration.util.getObjectByName(buildingName);
    if (typeof object === "undefined") {
        NeuroIntegration.api.sendActionResult({
            command: "action/result",
            game: "Cookie Clicker",
            data: {
                id: actionMessage.data.id,
                success: false,
                message: `No building found with name "${buildingName}"`
            }
        });
        return;
    }
    const buyResult = NeuroIntegration.util.buyObject(object, amount);
    if (typeof buyResult === "string") {
        NeuroIntegration.api.sendActionResult({
            command: "action/result",
            game: "Cookie Clicker",
            data: {
                id: actionMessage.data.id,
                success: false,
                message: "Failed to buy the building: " + buyResult
            }
        });
    } else {
        NeuroIntegration.api.sendActionResult({
            command: "action/result",
            game: "Cookie Clicker",
            data: {
                id: actionMessage.data.id,
                success: true,
                message: `You bought ${buyResult} of [${object.name}]`
            }
        });
    }
}

/**
 * @type {Object.<string, Action>}
 */
NeuroIntegration.api.actions = {
    // click_cookie: {
    //     name: "click_cookie",
    //     description: "Rapidly click the cookie for a few seconds",
    //     schema: undefined
    // },
    click_golden_cookie: {
        name: "click_golden_cookie",
        description: "Click the golden cookie",
        schema: undefined
    },
    buy_upgrade: {
        name: "buy_upgrade",
        description: "Buy an upgrade. The upgrade name must exactly match the name of an upgrade in the store.",
        schema: {
            type: "object",
            properties: {
                upgrade_name: {
                    type: "string"
                }
            },
            required: ["upgrade_name"]
        }
    },
    buy_building: {
        name: "buy_building",
        description: "Buy a building. The building name must exactly match the name of a building in the store. If you have insufficient cookies to buy the requested amount, the game will buy as many as you can afford.",
        schema: {
            type: "object",
            properties: {
                building_name: {
                    type: "string"
                },
                amount: {
                    type: "number"
                }
            },
            required: ["building_name"]
        }
    }
};

/**
 * Register actions with the Neuro-sama API.
 * @param {string[]} actionNames the names of the actions to register
 * @see NeuroIntegration.api.actions
 */
NeuroIntegration.api.registerActions = (...actionNames) => {
    /** @type {Action[]} */
    const actions = [];
    for (const actionName of actionNames) {
        const action = NeuroIntegration.api.actions[actionName];
        if (!action) {
            console.error(`[NeuroIntegration] Action "${actionName}" is not defined`);
            continue;
        }
        actions.push(action);
    }
    /** @type {RegisterActionsMessage} */
    const message = {
        command: "actions/register",
        game: "Cookie Clicker",
        data: {
            actions: actions
        }
    };
    NeuroIntegration.api.client?.send(message);
};

/**
 * Unregister actions with the Neuro-sama API.
 * @param {...string} actionNames the names of the actions to register
 * @see NeuroIntegration.api.actions
 */
NeuroIntegration.api.unregisterActions = (...actionNames) => {
    /** @type {UnregisterActionsMessage} */
    const message = {
        command: "actions/unregister",
        game: "Cookie Clicker",
        data: {
            action_names: actionNames
        }
    };
    NeuroIntegration.api.client?.send(message);
};

/**
 * Send context over the Neuro-sama API.
 * @param {any} message a message explaining the context
 * @param {boolean = false} silent whether to prompt Neuro to respond to the context
 */
NeuroIntegration.api.sendContext = (message, silent = false) => {
    if (typeof message !== "string") {
        message = JSON.stringify(message);
    }
    /** @type {ContextMessage} */
    const contextMessage = {
        command: "context",
        game: "Cookie Clicker",
        data: {
            message: message,
            silent: silent
        }
    };
    NeuroIntegration.api.client?.send(contextMessage);
};

NeuroIntegration.launch = function () {

    automaticallyCloseNotes();
    Game.Notify("Neuro-sama Integration loaded!", "Bwaaa!", [16, 5], 6, 1);

    const Mod = NeuroIntegration;

    CCSE.customSave.push(() => {
        console.info("[NeuroIntegration] Saving config...");
        Mod.config.createdVersion = Mod.version;
        CCSE.config.OtherMods.NeuroIntegration = JSON.stringify(Mod.config);
    });

    CCSE.customLoad.push(() => {
        console.info("[NeuroIntegration] Loading config...");
        let loadedConfig;
        try {
            loadedConfig = JSON.parse(CCSE.config.OtherMods.NeuroIntegration);
            console.info("[NeuroIntegration] Loaded config:", loadedConfig);
        } catch (e) {
            console.error("[NeuroIntegration] Failed to parse loaded config, resetting to default", e);
            Mod.config = Mod.defaultConfig();
            return;
        }
        if (!loadedConfig || typeof loadedConfig !== "object") {
            console.error("[NeuroIntegration] Loaded config is invalid, resetting to default");
            Mod.config = Mod.defaultConfig();
            return;
        }
        if (loadedConfig.createdVersion !== Mod.version) {
            console.warn("[NeuroIntegration] Config is from an older version, issues may occur. It's probably fine, though.");
        }
        const oldConfig = Mod.config ?? {};
        const newConfig = { ...NeuroIntegration.defaultConfig(), ...loadedConfig };
        if (Mod.api.client && newConfig.wsAddress !== Mod.config.wsAddress) {
            Mod.setUpWebSocket();
        }
        Mod.config = newConfig;
    });
    CCSE.load();

    /** @type {boolean} */
    Mod.isLoaded = true;

    /** @type {typeof import("./lib/zod.umd.js").z} */
    var z = window.libs.zod.z;

    if (Mod.api === undefined) Mod.api = {};
    Mod.api.NeuroApiClient = window.libs.neuroApiClient.NeuroApiClient;
    Mod.api.types = window.libs.neuroApiTypes;

    // Game.Notify("Neuro-sama Integration mod loaded!", "Bwaaa!", [16, 5], 6, 1);

    /**
     * @prop {number} msPerClick the number of milliseconds between each click
     * @prop {number} remainingClicks the number of pending clicks
     * @prop {number | null} setIntervalId the ID of the last call to `setInterval`, or `null` if no interval is running
     */
    Mod.autoClicker = {
        msPerClick: 200,
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
        console.info(`[NeuroIntegration] Trying to click ${times} times`);
        Mod.autoClicker.remainingClicks = Math.min(Mod.autoClicker.remainingClicks + times, Mod.autoClicker.maximumPendingClicks);
        if (Mod.autoClicker.intervalId === null) {
            console.info(`[NeuroIntegration] Setting up clicker interval`);
            Mod.autoClicker.intervalId = setInterval(() => {
                // console.debug(`[NeuroIntegration] Remaining clicks: ${Mod.autoClicker.remainingClicks}`);
                if (Mod.autoClicker.remainingClicks > 0 || Game.canClick) {
                    Mod.util.clickCookie();
                    Mod.autoClicker.remainingClicks--;
                } else {
                    clearInterval(Mod.autoClicker.intervalId);
                    Mod.autoClicker.intervalId = null;
                    Mod.autoClicker.remainingClicks = 0; // will already be 0 in most cases
                }
            }, Mod.autoClicker.msPerClick);
        }
    };

    // Uncomment to log when the cookie is clicked
    // Game.registerHook("click", () => {
    //     console.debug(`[NeuroIntegration] Clicked! (from hook)`);
    // });

    if (!Mod.util) Mod.util = {};
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
    };

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
    };

    Mod.util.getCookiesPerSecondByBuilding = () => {
        const cookiesPerSecondByBuilding = Game.cookiesPsByType;
        const filteredCookiesPerSecondByBuilding = {};
        for (const key in cookiesPerSecondByBuilding) {
            if (cookiesPerSecondByBuilding.hasOwnProperty(key) && cookiesPerSecondByBuilding[key] !== 0) {
                cookiesPerSecondByBuilding[key] = cookiesPerSecondByBuilding[key];
            }
        }
        return filteredCookiesPerSecondByBuilding;
    }

    Mod.util.getContext = () => {
        const context = {
            cookies: Beautify(Game.cookies),
            totalCookiesPerSecond: Beautify(Game.cookiesPs),
            cookiesPerSecondByBuilding: Mod.util.getCookiesPerSecondByBuilding(),
            store: getStoreContents(5)
        };
        const commentsText = l("commentsText1")?.innerText;
        if (commentsText && commentsText.length > 0) {
            context.bulletin = commentsText;
        }
        return context;
    }
    // // TODO: make this configurable
    setInterval(() => {
        // TODO: make this configurable
        // if (Mod.autoClicker.remainingClicks < 75) {
        //     Mod.api.registerActions("click_cookie");
        // }
        Mod.api.sendContext(Mod.util.getContext(), true);
    }, 5000);

    function getStoreContents(maxUpgrades = 5) {
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

        let objects = [];
        for (let i = 0; i < Game.ObjectsById.length; i++) {
            const object = Game.ObjectsById[i];
            if (object.locked) continue;
            // Skip objects that are too expensive
            if (object.amount === 0 && object.getPrice() > 10 * Game.cookies) continue;
            objects.push({
                name: object.name,
                desc: simplifyHtmlString(object.desc),
                priceFor1: Beautify(object.getPrice()),
                priceFor5: Beautify(object.getSumPrice(5)),
                priceFor10: Beautify(object.getSumPrice(10)),
                // priceFor25: Beautify(object.getSumPrice(25)),
            });
        }

        return {
            upgrades: upgrades,
            objects: objects
        };
    }

    Mod.util.getStoreContents = getStoreContents;

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
     * Get an object (e.g., a building) by its name.
     * @param name the name of the object
     * @return {Game_Object | undefined} the object with the given name, or `undefined` if no object was found
     */
    Mod.util.getObjectByName = (name) => {
        name = name.toLowerCase().replaceAll(/\W/g, "")
        return Game.ObjectsById.find(obj => obj.name.toLowerCase().replaceAll(/\W/g, "") === name);
    }

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
            console.warn(`[NeuroIntegration] Insufficient cookies to buy any [${object.name}]`);
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

    /**
     * Attempt to buy an upgrade by name.
     * @param upgradeName the name of the upgrade to buy
     * @returns {undefined | string} `undefined` if the upgrade was bought successfully, or an error message if the upgrade could not be bought
     */
    function buyUpgrade (upgradeName) {
        const availableUpgrades = Game.UpgradesInStore;
        upgradeName = upgradeName.toLowerCase().replaceAll(/\W/g, "")
        const upgrade = availableUpgrades.find(u => u.name.toLowerCase().replaceAll(/\W/g, "") === upgradeName);
        if (!upgrade) {
            console.warn(`[NeuroIntegration] No upgrade found with name "${upgradeName}"`);
            return `No upgrade found with name "${upgradeName}". Be sure to match the name exactly.`;
        }
        const cookies = Game.cookies;
        const price = upgrade.getPrice();
        if (cookies < price) {
            console.warn(`[NeuroIntegration] Insufficient cookies to buy upgrade "${upgradeName}"`);
            return `Insufficient cookies to buy upgrade "${upgrade.name}". You need ${Beautify(price - cookies)} more cookies to afford it.`;
        }
        const success = upgrade.buy();
        if (success) {
            console.info(`[NeuroIntegration] Bought upgrade "${upgrade.name}"`);
            return undefined;
        } else {
            console.error(`[NeuroIntegration] Failed to buy upgrade "${upgrade.name}" for an unknown reason`);
            return "Failed to buy for an unknown reason";
        }
    }

    Mod.util.buyUpgrade = buyUpgrade;

    // Notify Neuro when a golden cookie appears
    Game.customShimmer.push((shimmer) => {
        console.debug(`[NeuroIntegration] Shimmer spawned:`, shimmer);
        Mod.api.registerActions("click_golden_cookie");
        Mod.api.sendContext("A golden cookie has appeared!", false);
    });

    Mod.createOptionsMenu();

    Mod.api.setUpWebSocket();

    console.info("[NeuroIntegration] Finished launching Neuro-sama Integration");
};

if (!NeuroIntegration.isLoaded) {
    const launch = () => {
        NeuroIntegration.loadDependencies()
            .then(NeuroIntegration.launch, (e) => {
                console.error("[NeuroIntegration] Failed to load dependencies", e);
                Game.Notify("Neuro-sama Integration failed to load", `Please copy the error from above and send it to the developer. Be sure to remove any sensitive information.`, [16, 5]);
                const errorDiv = document.createElement("div");
                errorDiv.style.cssText = "width: 100%; height: fit-content; padding: 1em;";
                const errorHeaderElement = document.createElement("h1");
                errorHeaderElement.innerText = "Neuro-sama Integration failed to load";
                errorHeaderElement.style.fontSize = "2em";
                errorDiv.appendChild(errorHeaderElement);
                const errorTextElement = document.createElement("text");
                if (e instanceof Error) {
                    errorTextElement.innerText = `${e.message}`;
                } else {
                    errorTextElement.innerHTML = `<text>${e}</text>`;
                }
                errorTextElement.style.cssText = "fontSize: 2em; user-select: text; width: 100%; height: fit-content; padding-top: 1em; font-family: monospace;";
                errorDiv.appendChild(errorTextElement);
                const copyButton = document.createElement("button");
                copyButton.innerText = "Copy Error to Clipboard";
                copyButton.style.cssText = "margin-top: 1em; padding: 0.5em; font-size: 1em;";
                copyButton.onclick = () => {
                    navigator.clipboard.writeText(e instanceof Error ? e.message : e).then(
                        () => console.error("[NeuroIntegration] Copied error message to clipboard"),
                        r => console.error("[NeuroIntegration] Failed to copy error message to clipboard", r));
                    alert("Error message copied to clipboard");
                };
                errorDiv.appendChild(copyButton);
                l("centerArea").appendChild(errorDiv);
            });
    };
    if (CCSE && CCSE.isLoaded) {
        launch();
    } else {
        if (!CCSE) CCSE = {};
        if (!CCSE.postLoadHooks) CCSE.postLoadHooks = [];
        CCSE.postLoadHooks.push(launch);
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