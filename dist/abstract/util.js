"use strict";
function generateHandles(handleConfigs, instanceFactories) {
    return Promise.all(handleConfigs.map(function (handleConfig) {
        var serviceconfig = handleConfig.config;
        if (!instanceFactories.has(serviceconfig.type)) {
            return Promise.reject("Handle type could not be constructed");
        }
        var factory = instanceFactories.get(serviceconfig.type);
        return factory.constructHandle(handleConfig);
    }));
}
exports.generateHandles = generateHandles;
