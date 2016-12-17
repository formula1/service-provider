import {ServiceType} from "./Shared";

interface IServiceConfig {
  name: string;
  type: ServiceType;
  public: "ANY" | "EXTERNAL" | "INTERNAL" | "SELF";
  folder?: string;
}

interface IDependentServiceConfig extends IServiceConfig {
  type: "container" | "lambda";
  require: Array<string>;
}
interface IAbstractServiceConfig extends IServiceConfig {
  type: "container" | "lambda";
  file: string;
  defaultArgument?: Object;
}

interface INetworkConfig {
  connectionsNecessary: [string, string];
  external: boolean;
  networksNecessary: Array<string>;
}

export { IServiceConfig, IDependentServiceConfig, IAbstractServiceConfig, INetworkConfig };
