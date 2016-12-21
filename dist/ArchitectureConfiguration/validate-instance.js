"use strict";
var fsUtil = require("fs");
var pathUtil = require("path");
function validateInstance(config) {
    if (!configRequiresFile(config)) {
        return;
    }
    var absoluteLocation = require.resolve(config.file ? pathUtil.join(config.folder, config.file) : config.folder);
    if (!fsUtil.existsSync(absoluteLocation)) {
        throw new Error("location " + absoluteLocation + " does not exist");
    }
    config.file = pathUtil.basename(absoluteLocation);
}
function configRequiresFile(config) {
    switch (config.type) {
        case "container": {
            return true;
        }
        case "lambda": {
            return true;
        }
        default: {
            return false;
        }
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = validateInstance;
