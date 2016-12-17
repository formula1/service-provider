"use strict";
const fsUtil = require("fs");
const pathUtil = require("path");
function validateInstance(config) {
    const absoluteLocation = pathUtil.resolve(config.folder, config.file);
    if (!fsUtil.existsSync(absoluteLocation)) {
        throw new Error(`location ${absoluteLocation} does not exist`);
    }
    if (config.file.indexOf(config.folder) !== 0) {
        throw new Error(`location must be relative to the folder`);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = validateInstance;
