import { IAbstractServiceConfig, IDependentServiceConfig, IServiceConfig } from "../Service/Config";

import createNetworkConfig from "./create-network-config";

import validateInstance from "./validate-instance";
import validateNetworkVisibility from "./validate-network-visibility";
import validateNotCircular from "./validate-not-circular";

import compileFolder from "./compile";

class ArchitectureConfiguration {
  public static compileFolder(folder: string) {
    return compileFolder(new ArchitectureConfiguration(), folder);
  }
  private context: {
    availableServices: Map<string, IServiceConfig>;
    pendingWatchers: Map<string, Array<string>>;
    serviceDependencies: Map<string, Array<string>>;
    serviceDependents: Map<string, Set<string>>;
    serviceIsReady: Map<string, boolean>;
  };
  constructor() {
    this.context = {
      availableServices: new Map<string, IServiceConfig>(),
      pendingWatchers: new Map<string, Array<string>>(),
      serviceDependencies: new Map<string, Array<string>>(),
      serviceDependents: new Map<string, Set<string>>(),
      serviceIsReady: new Map<string, boolean>(),
    };
  }
  public finalize() {
    const context = this.context;
    if (context.pendingWatchers.size > 0) {
      throw new Error(`still waiting on services: [${
        Array.from(context.pendingWatchers.keys()).join(", ")
      }]`);
    }

    const networkConfig = createNetworkConfig(
      context.availableServices,
      context.serviceDependents,
      context.serviceDependencies
    );

    return {
      availableServices: context.availableServices,
      networkConfiguration: networkConfig,
    };
  }
  public register(config: IServiceConfig) {
    const context = this.context;
    const name = config.name;
    if (context.availableServices.has(name)) {
      throw new Error(`${name} has already been registered as a service`);
    }
    if ("file" in config) {
      validateInstance(<IAbstractServiceConfig> config);
    }
    if (!("require" in config)) {
      context.serviceDependencies.set(name, []);
      return;
    }
    let tconfig = <IDependentServiceConfig> config;
    const isReady = this.ensureDependencyIsReady(tconfig);
    context.serviceIsReady.set(name, isReady);
    context.availableServices.set(name, config);

    validateNetworkVisibility(config, Array.from(tconfig.require.values()).filter(function(rName){
      return context.availableServices.has(rName);
    }).map(function(rName){
      return context.availableServices.get(rName);
    }));

    validateNotCircular(tconfig.name, context.serviceDependencies);
    context.serviceDependencies.set(name, Array.from(tconfig.require.values()));
    if (!context.pendingWatchers.has(name)) {
      return;
    }
    this.resolvePending(name);
  }

  private ensureDependencyIsReady(config: IDependentServiceConfig) {
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

  private resolvePending(name) {
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
};

export default ArchitectureConfiguration;
