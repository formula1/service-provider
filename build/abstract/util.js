"use strict";
function generateHandles(handleConfigs, instanceFactories) {
    return Promise.all(handleConfigs.map(function (handleConfig) {
        const serviceconfig = handleConfig.config;
        if (!instanceFactories.has(serviceconfig.type)) {
            return Promise.reject("Handle type could not be constructed");
        }
        const factory = instanceFactories.get(serviceconfig.type);
        return factory.constructHandle(handleConfig);
    }));
}
exports.generateHandles = generateHandles;
