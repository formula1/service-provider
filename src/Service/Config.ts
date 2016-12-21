import {ServiceType} from "./Shared";

interface IServiceConfig {
  name: string;
  type: ServiceType;
  public: "ANY" | "EXTERNAL" | "INTERNAL" | "SELF";
  requireResults?: Array<IServiceInstanceInfo>;
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

type ServiceHandleState = "pending" | "error" | "ready";

interface IServiceHandleInit {
  config: IServiceConfig;
  state: ServiceHandleState;
  pending: Array<[Function, Function]>;
  error?: any;
  value?: IServiceInstanceInfo;
}

interface IServiceInstanceInfo {
  config: IServiceConfig;
  args: Array<any>;
}

export {
  IServiceConfig, IServiceHandleInit, IServiceInstanceInfo,
  IDependentServiceConfig, IAbstractServiceConfig,
  INetworkConfig
};
