import { IServiceConfig, INetworkConfig } from "../Service/Config";

function createNetworkConfig(
  configMap: Map<string, IServiceConfig>,
  serviceDependents: Map<string, Set<string>>,
  serviceDependencies: Map<string, Array<string>>
): INetworkConfig {
  return Array.from(configMap.values()).reduce((networkConfig, config) => {
    if (config.public === "EXTERNAL") {
      networkConfig.external = true;
      return networkConfig;
    }
    if (config.public === "ANY") {
      networkConfig.external = true;
    }
    if (!serviceDependents.has(config.name)) {
      if (config.type === "container") {
        return;
      }
      throw new Error(`${config.name} is public type ${config.public} but not used internally`);
    }
    if (config.public === "SELF") {
      networkConfig.networksNecessary.push(config.folder);
    }
  }, <INetworkConfig> {
    connectionsNecessary: [],
    external: false,
    networksNecessary: [],
  });
}

export default createNetworkConfig;
