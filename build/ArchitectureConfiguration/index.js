"use strict";
const create_network_config_1 = require("./create-network-config");
const validate_instance_1 = require("./validate-instance");
const validate_network_visibility_1 = require("./validate-network-visibility");
const validate_not_circular_1 = require("./validate-not-circular");
const compile_1 = require("./compile");
class ArchitectureConfiguration {
    static compileFolder(folder) {
        return compile_1.default(new ArchitectureConfiguration(), folder);
    }
    constructor() {
        this.context = {
            availableServices: new Map(),
            pendingWatchers: new Map(),
            serviceDependencies: new Map(),
            serviceDependents: new Map(),
            serviceIsReady: new Map(),
        };
    }
    finalize() {
        const context = this.context;
        if (context.pendingWatchers.size > 0) {
            throw new Error(`still waiting on services: [${Array.from(context.pendingWatchers.keys()).join(", ")}]`);
        }
        const networkConfig = create_network_config_1.default(context.availableServices, context.serviceDependents, context.serviceDependencies);
        return {
            availableServices: context.availableServices,
            networkConfiguration: networkConfig,
        };
    }
    register(config) {
        const context = this.context;
        const name = config.name;
        if (context.availableServices.has(name)) {
            throw new Error(`${name} has already been registered as a service`);
        }
        if ("file" in config) {
            validate_instance_1.default(config);
        }
        if (!("require" in config)) {
            context.serviceDependencies.set(name, []);
            return;
        }
        let tconfig = config;
        const isReady = this.ensureDependencyIsReady(tconfig);
        context.serviceIsReady.set(name, isReady);
        context.availableServices.set(name, config);
        validate_network_visibility_1.default(config, Array.from(tconfig.require.values()).filter(function (rName) {
            return context.availableServices.has(rName);
        }).map(function (rName) {
            return context.availableServices.get(rName);
        }));
        validate_not_circular_1.default(tconfig.name, context.serviceDependencies);
        context.serviceDependencies.set(name, Array.from(tconfig.require.values()));
        if (!context.pendingWatchers.has(name)) {
            return;
        }
        this.resolvePending(name);
    }
    ensureDependencyIsReady(config) {
        const context = this.context;
        const availableServices = context.availableServices;
        return Array.from(config.require.values()).reduce((isWaiting, value) => {
            if (!context.serviceDependents.has(value)) {
                context.serviceDependents.set(value, new Set());
            }
            if (!availableServices.has(value)) {
                if (!context.pendingWatchers.has(value)) {
                    context.pendingWatchers.set(value, []);
                }
                context.pendingWatchers.get(value).push(name);
                return true;
            }
            context.serviceDependents.get(value).add(config.name);
            return isWaiting;
        }, false);
    }
    resolvePending(name) {
        const context = this.context;
        context.pendingWatchers.get(name).forEach((oname) => {
            const reqs = context.serviceDependencies.get(oname);
            if (Array.from(reqs.values()).some((req) => {
                return !context.availableServices.has(req);
            })) {
                return;
            }
            context.serviceIsReady.set(oname, true);
        });
        context.pendingWatchers.delete(name);
    }
}
;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ArchitectureConfiguration;
