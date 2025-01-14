"use strict";

var exports;
exports = {};
if (!window.libs) window.libs = {};
window.libs.neuroApiClient = exports;

exports.NeuroApiClient = /** @class */ (function () {
    const types = window.libs.neuroApiTypes;
    if (typeof types === "undefined") {
        console.error("neuroApiTypes is not defined. Please import neuroApiTypes before importing this module.");
    }

    function NeuroApiClient(url, options) {
        this.reconnectTimeMs = options?.reconnectTimeMs ?? 5000;
        if (this.reconnectTimeMs < 0) {
            throw new RangeError("reconnectTimeMs must be greater than or equal to 0");
        }
        this.shouldReconnect = options?.shouldReconnect ?? true;
        this.url = url;
        this.socket = null;
        this.commandListeners = {};
        /** @type {"open" | "closed"} */
        this.status = "closed";
        this.reconnectAttempts = 0;
        this.reconnectBackoffFactor = 1.5;
        this.reconnectTimeCapMs = 30000;
        this.connect();
    }

    /**
     * Set the handler for a command.
     * The structure of the message will be validated before the handler is called.
     * @param {string} command the command to listen for
     * @param {(message: Message) => void} handler
     */
    NeuroApiClient.prototype.onCommand = function (command, handler) {
        this.commandListeners[command] = handler;
    };
    /**
     * Remove the handler for a command.
     * @param command the command to remove the handler for
     */
    NeuroApiClient.prototype.offCommand = function (command) {
        delete this.commandListeners[command];
    };
    /**
     * Set the handler for the WebSocket status.
     * There can only be one handler at a time.
     * @param {function("open" | "closed"): void} callback
     */
    NeuroApiClient.prototype.onStatus = function (callback) {
        this.statusListener = callback;
        callback(this.status);
    };
    /**
     * Send a message over this WebSocket.
     * @param {Message} message the message  to send
     * @return {boolean} true if the message was sent, false if the WebSocket is closed
     * @throws Error if the message is invalid
     */
    NeuroApiClient.prototype.send = function (message) {
        if (!this.socket || this.status === "closed") {
            return false;
        }
        types.MessageSchema.parse(message);
        this.socket.send(JSON.stringify(message));
    };
    NeuroApiClient.prototype.connect = function () {
        var _this = this;
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        var socket = new WebSocket(this.url);
        this.socket = socket;
        socket.onopen = function (event) {
            console.debug("WebSocket opened:", event);
            _this.status = "open";
            if (_this.statusListener) {
                _this.statusListener("open");
            }
            _this.reconnectAttempts = 0;
        };
        socket.onclose = function (event) {
            console.debug("WebSocket closed:", event);
            _this.status = "closed";
            if (_this.statusListener) {
                _this.statusListener("closed");
            }
            if (_this.shouldReconnect) {
                console.assert(typeof _this.reconnectTimerId === "undefined");
                let backoffReconnectTimeMs = _this.reconnectTimeMs; // initial reconnect time
                backoffReconnectTimeMs *= Math.pow(_this.reconnectBackoffFactor, _this.reconnectAttempts);
                backoffReconnectTimeMs = Math.min(backoffReconnectTimeMs, _this.reconnectTimeCapMs);
                console.debug(`WebSocket will attempt to reconnect after ${backoffReconnectTimeMs / 1000} seconds...`);
                _this.reconnectTimerId = setTimeout(function () {
                    _this.reconnectTimerId = undefined;
                    _this.connect();
                }, backoffReconnectTimeMs);
                _this.reconnectAttempts++;
            }
        };
        socket.onmessage = function (event) {
            if (typeof event.data !== "string") {
                console.error("WebSocket received non-string data");
                return;
            }
            var obj;
            try {
                obj = JSON.parse(event.data);
            }
            catch (e) {
                console.error("WebSocket received invalid JSON:", e);
                return;
            }
            var command;
            var message;
            try {
                message = types.MessageSchema.parse(obj);
                command = message.command;
            }
            catch (e) {
                console.error("WebSocket received an invalid message:", e);
                return;
            }
            _this.emit(command, message);
        };
    };
    NeuroApiClient.prototype.emit = function (command, message) {
        var commandHandler = this.commandListeners[command];
        if (commandHandler) {
            try {
                commandHandler(message);
            }
            catch (e) {
                console.error("Error thrown from command handler:", e);
            }
        }
        else {
            console.warn("WebSocket received a message with the \"".concat(command, "\" command which doesn't have a handler registered"));
        }
    };
    NeuroApiClient.prototype.close = function () {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        if (this.reconnectTimerId) {
            clearTimeout(this.reconnectTimerId);
            this.reconnectTimerId = undefined;
        }
    }
    return NeuroApiClient;
}());
