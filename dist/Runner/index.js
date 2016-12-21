"use strict";
var ServiceRunner = (function () {
    function ServiceRunner(availableServices, instanceFactories) {
        this.availableServices = availableServices;
        this.instanceFactories = instanceFactories;
        this.createdServices = new Map();
    }
    ServiceRunner.prototype.start = function (name) {
        return Promise.resolve().then(function () {
            if (this.createdServices.has(name)) {
                return this.createdServices.get(name);
            }
            if (!this.availableServices.has(name)) {
                return Promise.reject(new Error(name + " is not an available service"));
            }
            var config = this.availableServices.get(name);
            this.createContainer(config).then(this.finishPending.bind(this, name, false), this.finishPending.bind(this, name, true));
            this.createdServices.set(name, {
                config: config,
                state: "pending",
                value: [],
            });
            return this.createdServices.get(name);
        }).then(function (serviceModule) {
            return new Promise(function (res, rej) {
                switch (serviceModule.state) {
                    case "error": return rej(serviceModule.error);
                    case "ready": return res(serviceModule.value);
                    case "pending": serviceModule.pending.push([res, rej]);
                    default: rej("non-existant type");
                }
            });
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
        var resrej;
        if (error) {
            init.state = "error";
            init.error = value;
            resrej = 1;
        }
        else {
            init.state = "ready";
            init.value = value;
            resrej = 0;
        }
        var pending = init.pending;
        init.pending = [];
        this.createdServices.set(name, init);
        pending.forEach(function (resrejFns) {
            return resrejFns[resrej](value);
        });
    };
    return ServiceRunner;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ServiceRunner;
