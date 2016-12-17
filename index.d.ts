import { INetworkConfig, IServiceConfig } from "./src/Service/Config";
import { IServiceHandle } from "./src/Service/Handle";
import { IServiceInstanceFactory, IServiceInstanceInfo } from "./src/Service/Instance";

declare class ArchitectureConfiguration {
  constructor();
  public finalize(): {
    availableServices: Map<string, IServiceConfig>,
    netwotrkConfiguration: INetworkConfig,
  }
  public register(config: IServiceConfig): any;
}

declare class Runner {
  constructor(
    availableServices: Map<string, IServiceConfig>,
    instanceFactories: Map<string, IServiceInstanceFactory<IServiceInstanceInfo, IServiceHandle>>
  );
  public start(name): Promise<IServiceInstanceInfo>;
}

export { LocalFactoryMap } from "./src/factories/local";

export * from "./src/abstract";
