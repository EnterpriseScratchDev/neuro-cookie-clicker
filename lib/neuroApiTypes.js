"use strict";
var z;
z = z ?? window.libs?.zod;
if (typeof z === "undefined") {
    console.error("Zod is not defined. Please import Zod before importing this module.");
}

(() => {
    let exports = {}

    var zod_1 = z;
    var JsonSchema = zod_1.z.custom(function (val) {
        // modified to remove dependency on ajv
        return typeof val === "object";
    }, function () { return ({ message: "invalid JSON schema" }); });
    exports.JsonSchema = JsonSchema;
    var ActionSchema = zod_1.z
        .object({
            name: zod_1.z.string().nonempty(),
            description: zod_1.z.string(),
            schema: JsonSchema.optional()
        }).strict();
    var StartupMessageSchema = zod_1.z
        .object({
            command: zod_1.z.literal("startup"),
            game: zod_1.z.string()
        }).strict();
    exports.StartupMessageSchema = StartupMessageSchema;
    var ContextMessageSchema = zod_1.z
        .object({
            command: zod_1.z.literal("context"),
            game: zod_1.z.string(),
            data: zod_1.z.object({
                message: zod_1.z.string(),
                silent: zod_1.z.boolean()
            }).strict()
        }).strict();
    exports.ContextMessageSchema = ContextMessageSchema;
    var RegisterActionsMessageSchema = zod_1.z
        .object({
            command: zod_1.z.literal("actions/register"),
            game: zod_1.z.string(),
            data: zod_1.z.object({
                actions: zod_1.z.array(ActionSchema)
            }).strict()
        }).strict();
    exports.RegisterActionsMessageSchema = RegisterActionsMessageSchema;
    var UnregisterActionsMessageSchema = zod_1.z
        .object({
            command: zod_1.z.literal("actions/unregister"),
            game: zod_1.z.string(),
            data: zod_1.z.object({
                action_names: zod_1.z.array(zod_1.z.string())
            }).strict()
        }).strict();
    exports.UnregisterActionsMessageSchema = UnregisterActionsMessageSchema;
    var ForceActionMessageSchema = zod_1.z
        .object({
            command: zod_1.z.literal("actions/force"),
            game: zod_1.z.string(),
            data: zod_1.z.object({
                state: zod_1.z.string().optional(),
                query: zod_1.z.string(),
                ephemeral_context: zod_1.z.boolean().optional(),
                action_names: zod_1.z.array(zod_1.z.string())
            }).strict()
        }).strict();
    exports.ForceActionMessageSchema = ForceActionMessageSchema;
    var ActionMessageSchema = zod_1.z
        .object({
            command: zod_1.z.literal("action"),
            data: zod_1.z.object({
                id: zod_1.z.string(),
                name: zod_1.z.string(),
                data: zod_1.z.string().optional()
            }).strict()
        }).strict();
    exports.ActionMessageSchema = ActionMessageSchema;
    var ActionResultMessageSchema = zod_1.z
        .object({
            command: zod_1.z.literal("action/result"),
            game: zod_1.z.string(),
            data: zod_1.z.object({
                id: zod_1.z.string(),
                success: zod_1.z.boolean(),
                message: zod_1.z.string().optional()
            }).strict()
        }).strict();
    exports.ActionResultMessageSchema = ActionResultMessageSchema;
    /**
     * Schema for {@link Message}.
     */
    exports.MessageSchema = zod_1.z.discriminatedUnion("command", [
        StartupMessageSchema,
        ContextMessageSchema,
        RegisterActionsMessageSchema,
        UnregisterActionsMessageSchema,
        ForceActionMessageSchema,
        ActionResultMessageSchema,
        ActionMessageSchema
    ]);

    /**
     * @typedef {Object} MessageParseSuccess
     * @property {true} success - Indicates the parsing was successful.
     * @property {Message} message - The parsed message.
     */

    /**
     * @typedef {Object} MessageParseFailure
     * @property {false} success - Indicates the parsing failed.
     * @property {Error} error - The error that occurred during parsing.
     */

    /**
     * @typedef {MessageParseSuccess | MessageParseFailure} MessageParseResult
     */

    /**
     * The `data` argument may be any type, but a successful result is only possible for `string` and `object`.
     * If `data` is a `string`, it will be parsed as JSON before being parsed as a `Message`.
     * @param data
     * @
     */
    function parseMessage(data) {
        // Parse string inputs as JSON
        if (typeof data === "string") {
            try {
                data = JSON.parse(data);
            }
            catch (e) {
                if (e instanceof Error) {
                    return {
                        success: false,
                        error: e
                    };
                }
                else {
                    return {
                        success: false,
                        error: new Error("Unknown error occurred during JSON parsing")
                    };
                }
            }
        }
        // Parse using the Zod schemas
        var parseResult = exports.MessageSchema.safeParse(data);
        if (parseResult.success) {
            return {
                success: true,
                message: parseResult.data
            };
        }
        else {
            return {
                success: false,
                error: parseResult.error
            };
        }
    }
    exports.parseMessage = parseMessage;

    if (!window.libs) window.libs = {};
    window.libs.neuroApiTypes = exports;
})();

/**
 * @typedef Action
 * @prop {string} name
 * @prop {string} description
 * @prop {any | {} | undefined} schema
 */

/**
 * @typedef BaseMessage
 * @prop {string} command
 */

/**
 * @typedef StartupMessage
 * @prop {"startup"} command
 * @prop {string} game
 */

/**
 * @typedef ActionMessage
 * @extends BaseMessage
 * @prop {"action"} command
 * @prop {{id: string, name: string, data: ?string}} data
 */

/**
 * @typedef ActionResultMessage
 * @extends BaseMessage
 * @prop {"action/result"} command
 * @prop {string} game
 * @prop {{id: string, success: boolean, message: string}} data
 */

/**
 * @typedef ContextMessage
 * @extends BaseMessage
 * @prop {string} game
 * @prop {{message: string, silent: boolean}} data
 */

/**
 * @typedef RegisterActionsMessage
 * @extends BaseMessage
 * @prop {"actions/register"} command
 * @prop {string} game
 * @prop {actions: Action[]} data
 */

/**
 * @typedef UnregisterActionsMessage
 * @extends BaseMessage
 * @prop {"actions/unregister"} command
 * @prop {string} game
 * @prop {action_names: string[]} data
 */

/**
 * @typedef {StartupMessage | ActionMessage | ActionResultMessage | ContextMessage | RegisterActionsMessage | UnregisterActionsMessage} Message
 */
