"use strict";
class ServiceRunner {
    constructor(availableServices, instanceFactories) {
        this.availableServices = availableServices;
        this.instanceFactories = instanceFactories;
        this.createdServices = new Map();
    }
    start(name) {
        if (!this.createdServices.has(name)) {
            if (!this.availableServices.has(name)) {
                return Promise.reject(new Error(`${name} is not an available service`));
            }
            return this.createContainer(this.availableServices.get(name));
        }
        const serviceModule = this.createdServices.get(name);
        if (serviceModule.hasError) {
            return Promise.reject(serviceModule.errorValue);
        }
    }
    createContainer(config) {
        if (!this.instanceFactories.has(config.type)) {
            return Promise.reject(new Error("Type not available for construction"));
        }
        return ("require" in config ?
            Promise.all(config.require.map((req) => {
                return this.start(req);
            }))
            :
                Promise.resolve([])).then(function (instanceConfigs) {
            const instanceFactory = this.instanceFactories.get(config.type);
            config.requireResults = instanceConfigs;
            return instanceFactory.constructInstance(config);
        }).then(function (containerInfo) {
            this.createdServices.set(config.name, {
                config: config,
                containerInfo: containerInfo,
                hasError: false,
            });
            return containerInfo;
        }, (e) => {
            this.createdServices.set(config.name, {
                config: config,
                errorValue: e.message || e,
                hasError: true,
            });
            throw e;
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ServiceRunner;
