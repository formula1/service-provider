"use strict";
var ServiceRunner = (function () {
    function ServiceRunner(availableServices, instanceFactories) {
        this.availableServices = availableServices;
        this.instanceFactories = instanceFactories;
        this.createdServices = new Map();
    }
    ServiceRunner.prototype.start = function (name) {
        if (!this.availableServices.has(name)) {
            Promise.reject(new Error(name + " is not an available service"));
        }
        if (!this.createdServices.has(name)) {
            var config = this.availableServices.get(name);
            this.createContainer(config).then(this.finishPending.bind(this, name, false), this.finishPending.bind(this, name, true));
            this.createdServices.set(name, {
                config: config,
                state: "pending",
                pending: [],
            });
        }
        var serviceModule = this.createdServices.get(name);
        return new Promise(function (res, rej) {
            switch (serviceModule.state) {
                case "error": return rej(serviceModule.error);
                case "ready": return res(serviceModule.value);
                case "pending": return serviceModule.pending.push([res, rej]);
                default: rej("non-existant type");
            }
        });
    };
    ServiceRunner.prototype.createContainer = function (config) {
        var _this = this;
        var _a = this, createdServices = _a.createdServices, instanceFactories = _a.instanceFactories;
        if (!instanceFactories.has(config.type)) {
            return Promise.reject(new Error("Type[" + config.type + "] not available for construction from [" + Array.from(this.instanceFactories.keys()).join(", ") + "]"));
        }
        return ("require" in config ?
            Promise.all(config.require.map(function (req) {
                return _this.start(req);
            }))
            :
                Promise.resolve([])).then(function (instanceConfigs) {
            var instanceFactory = instanceFactories.get(config.type);
            config.requireResults = instanceConfigs;
            return instanceFactory.constructInstance(config);
        });
    };
    ServiceRunner.prototype.finishPending = function (name, error, value) {
        var init = this.createdServices.get(name);
        var pending = init.pending;
        init.pending = [];
        this.createdServices.set(name, init);
        if (error) {
            init.state = "error";
            init.error = value;
            pending.forEach(function (resrejFns) {
                return resrejFns[1](init.error);
            });
        }
        else {
            init.state = "ready";
            init.value = value;
            pending.forEach(function (resrejFns) {
                return resrejFns[0](init.value);
            });
        }
    };
    return ServiceRunner;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ServiceRunner;
