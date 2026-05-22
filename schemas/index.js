"use strict";
/**
 * SuperInstance Fleet Schema Registry
 * Re-exports all schema types for the fleet
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Capability = exports.ShellType = exports.SCHEMA_VERSION = void 0;
exports.SCHEMA_VERSION = '1.0.0';
// Turbo Shell
var turbo_shell_1 = require("./turbo-shell");
Object.defineProperty(exports, "ShellType", { enumerable: true, get: function () { return turbo_shell_1.ShellType; } });
Object.defineProperty(exports, "Capability", { enumerable: true, get: function () { return turbo_shell_1.Capability; } });
