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
        if (!this.instanceFactories.has(config.type)) {
            return Promise.reject(new Error("Type not available for construction"));
        }
        return ("require" in config ?
            Promise.all(config.require.map(function (req) {
                return _this.start(req);
            }))
            :
                Promise.resolve([])).then(function (instanceConfigs) {
            var instanceFactory = this.instanceFactories.get(config.type);
            config.requireResults = instanceConfigs;
            return instanceFactory.constructInstance(config);
        }).then(function (containerInfo) {
            this.createdServices.set(config.name, {
                config: config,
                containerInfo: containerInfo,
                hasError: false,
            });
            return containerInfo;
        }, function (e) {
            _this.createdServices.set(config.name, {
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
