import {IServiceConfig, IServiceInstanceInfo} from "./Config";

interface IServiceInstanceFactory<ServiceHandle> {
  constructInstance(config: IServiceConfig): Promise<IServiceInstanceInfo>;
  constructInternal(config: IServiceConfig): Promise<IServiceInstance>;
  ensureExists(info: IServiceInstanceInfo): Promise<boolean>;
  destructInstance(config: IServiceInstanceInfo): Promise<boolean>;
  constructHandle(config: IServiceInstanceInfo): Promise<ServiceHandle & IServiceHandle>;
}


interface IServiceHandle {
  name: string;
}

interface IServiceInstance {
  info: IServiceInstanceInfo;
}

export {
  IServiceInstanceFactory,
  IServiceHandle,
  IServiceInstance,
};
