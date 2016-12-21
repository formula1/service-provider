"use strict";
var ServiceRunner = (function () {
    function ServiceRunner(availableServices, instanceFactories) {
        this.availableServices = availableServices;
        this.instanceFactories = instanceFactories;
        this.createdServices = new Map();
    }
    ServiceRunner.prototype.start = function (name) {
        if (!this.createdServices.has(name)) {
            if (!this.availableServices.has(name)) {
                return Promise.reject(new Error(name + " is not an available service"));
            }
            return this.createContainer(this.availableServices.get(name));
        }
        var serviceModule = this.createdServices.get(name);
        if (serviceModule.hasError) {
            return Promise.reject(serviceModule.errorValue);
        }
    };
    ServiceRunner.prototype.createContainer = function (config) {
        var _this = this;
        var _a = this, createdServices = _a.createdServices, instanceFactories = _a.instanceFactories;
        if (!instanceFactories.has(config.type)) {
            return Promise.reject(new Error("Type[" + config.type + "] not available for construction from [" + Array.from(this.instanceFactories.keys()).join(", ") + "]"));
        }
        return ("require" in config ?
            config.require.reduce(function (p, req) {
                return p.then(function (configArray) {
                    return _this.start(req).then(function (info) {
                        return configArray.concat([info]);
                    });
                });
            }, Promise.resolve([]))
            :
                Promise.resolve([])).then(function (instanceConfigs) {
            var instanceFactory = instanceFactories.get(config.type);
            config.requireResults = instanceConfigs;
            return instanceFactory.constructInstance(config);
        }).then(function (containerInfo) {
            createdServices.set(config.name, {
                config: config,
                containerInfo: containerInfo,
                hasError: false,
            });
            return containerInfo;
        }, function (e) {
            createdServices.set(config.name, {
                config: config,
                errorValue: e.message || e,
                hasError: true,
            });
            throw e;
        });
    };
    return ServiceRunner;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ServiceRunner;
