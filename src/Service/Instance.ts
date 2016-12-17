import { IServiceConfig } from "./Config";
import { IServiceHandle } from "./Handle";
import { IncomingMessage } from "http";
import { Duplex } from "stream";

interface IServiceInstanceInfo {
  config: IServiceConfig;
  args: Array<any>;
}

export { IServiceInstanceInfo };

interface IServiceInstanceFactory<ServiceHandle> {
  constructInstance(config: IServiceConfig): Promise<IServiceInstanceInfo>;
  ensureExists(info: IServiceInstanceInfo): Promise<boolean>;
  destructInstance(config: IServiceInstanceInfo): Promise<boolean>;
  constructHandle(config: IServiceInstanceInfo): Promise<ServiceHandle & IServiceHandle>;
}

interface ILambdaInstance<Input, Output> {
  run(arg: Input): Promise<Output>;
}

interface IContainerInstance {
  initialize(config: Object): Promise<void>;
  handleConnection(req: IncomingMessage, rawSocket: Duplex);
}

export { IServiceInstanceFactory, ILambdaInstance, IContainerInstance }
