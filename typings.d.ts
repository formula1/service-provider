import { IServiceInstanceInfo, INetworkConfig, IServiceConfig } from "./src/Service/Config";
import { IServiceInstanceFactory, IServiceHandle } from "./src/Service/Usable";

export declare class ArchitectureConfiguration {
  public static compileFolder(folder: string): Promise<{
    availableServices: Map<string, IServiceConfig>,
    networkConfiguration: INetworkConfig,
  }>;
  constructor();
  public finalize(): {
    availableServices: Map<string, IServiceConfig>,
    networkConfiguration: INetworkConfig,
  };
  public register(config: IServiceConfig): void;
}

export declare class Runner {
  constructor(
    availableServices: Map<string, IServiceConfig>,
    instanceFactories: Map<string, IServiceInstanceFactory<IServiceHandle>>,
  );
  public start(name: string): Promise<IServiceInstanceInfo>;
}

export declare const LocalFactoryMap: Map<string, IServiceInstanceFactory<IServiceHandle>>;

export * from "./src/abstract";
