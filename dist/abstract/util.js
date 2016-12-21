"use strict";
function generateHandles(handleConfigs, instanceFactories) {
    return Promise.all(handleConfigs.map(function (handleConfig) {
        var serviceconfig = handleConfig.config;
        if (!instanceFactories.has(serviceconfig.type)) {
            return Promise.reject("Handle type could not be constructed");
        }
        var factory = instanceFactories.get(serviceconfig.type);
        return factory.constructHandle(handleConfig);
    })).then(function (handles) {
        return handles.reduce(function (map, handle) {
            map.set(handle.info.config.name, handle);
            return map;
        }, new Map());
    });
}
exports.generateHandles = generateHandles;
