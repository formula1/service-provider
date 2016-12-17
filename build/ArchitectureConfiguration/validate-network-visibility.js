"use strict";
function validateNetworkVisibility(config, oconfigs) {
    oconfigs.forEach(function (oconfig) {
        if (oconfig.public === "EXTERNAL") {
            throw "Only Available externally";
        }
        if (oconfig.public === "SELF") {
            if (oconfig.folder !== config.folder) {
                throw "Only Available by its direct peer services";
            }
        }
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = validateNetworkVisibility;
