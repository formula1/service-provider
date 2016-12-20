"use strict";
var create_network_config_1 = require("./create-network-config");
var validate_instance_1 = require("./validate-instance");
var validate_network_visibility_1 = require("./validate-network-visibility");
var validate_not_circular_1 = require("./validate-not-circular");
var compile_1 = require("./compile");
var ArchitectureConfiguration = (function () {
    function ArchitectureConfiguration() {
        this.context = {
            availableServices: new Map(),
            pendingWatchers: new Map(),
            serviceDependencies: new Map(),
            serviceDependents: new Map(),
            serviceIsReady: new Map(),
        };
    }
    ArchitectureConfiguration.compileFolder = function (folder) {
        return compile_1.default(new ArchitectureConfiguration(), folder);
    };
    ArchitectureConfiguration.prototype.finalize = function () {
        var context = this.context;
        if (context.pendingWatchers.size > 0) {
            throw new Error("still waiting on services: [" + Array.from(context.pendingWatchers.keys()).join(", ") + "]");
        }
        var networkConfig = create_network_config_1.default(context.availableServices, context.serviceDependents, context.serviceDependencies);
        return {
            availableServices: context.availableServices,
            networkConfiguration: networkConfig,
        };
    };
    ArchitectureConfiguration.prototype.register = function (config) {
        var context = this.context;
        var name = config.name;
        if (context.availableServices.has(name)) {
            throw new Error(name + " has already been registered as a service");
        }
        if ("file" in config) {
            validate_instance_1.default(config);
        }
        if (!("require" in config)) {
            context.serviceDependencies.set(name, []);
            return;
        }
        var tconfig = config;
        var isReady = this.ensureDependencyIsReady(tconfig);
        context.serviceIsReady.set(name, isReady);
        context.availableServices.set(name, config);
        validate_network_visibility_1.default(config, tconfig.require.filter(function (rName) {
            return context.availableServices.has(rName);
        }).map(function (rName) {
            return context.availableServices.get(rName);
        }));
        validate_not_circular_1.default(tconfig.name, context.serviceDependencies);
        context.serviceDependencies.set(name, tconfig.require);
        if (!context.pendingWatchers.has(name)) {
            return;
        }
        this.resolvePending(name);
    };
    ArchitectureConfiguration.prototype.ensureDependencyIsReady = function (config) {
        var context = this.context;
        var availableServices = context.availableServices;
        return config.require.reduce(function (isWaiting, value) {
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
    };
    ArchitectureConfiguration.prototype.resolvePending = function (name) {
        var context = this.context;
        context.pendingWatchers.get(name).forEach(function (oname) {
            var reqs = context.serviceDependencies.get(oname);
            if (reqs.some(function (req) {
                return !context.availableServices.has(req);
            })) {
                return;
            }
            context.serviceIsReady.set(oname, true);
        });
        context.pendingWatchers.delete(name);
    };
    return ArchitectureConfiguration;
}());
;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ArchitectureConfiguration;
