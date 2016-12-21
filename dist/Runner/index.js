"use strict";
var ServiceRunner = (function () {
    function ServiceRunner(availableServices, instanceFactories) {
        this.availableServices = availableServices;
        this.instanceFactories = instanceFactories;
        this.createdServices = new Map();
    }
    ServiceRunner.prototype.start = function (name) {
        var _this = this;
        return Promise.resolve().then(function () {
            if (_this.createdServices.has(name)) {
                return _this.createdServices.get(name);
            }
            if (!_this.availableServices.has(name)) {
                throw new Error(name + " is not an available service");
            }
            var config = _this.availableServices.get(name);
            _this.createContainer(config).then(_this.finishPending.bind(_this, name, false), _this.finishPending.bind(_this, name, true));
            _this.createdServices.set(name, {
                config: config,
                state: "pending",
                pending: [],
            });
            return _this.createdServices.get(name);
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
