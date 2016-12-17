import { w3cwebsocket } from "websocket";
import { IContainer } from "../../abstract";

import { IAbstractServiceConfig, IDependentServiceConfig } from "../../Service/Config";
import { IServiceHandle } from "../../Service/Handle";
import { IServiceInstanceFactory, IServiceInstanceInfo } from "../../Service/Instance";

import { IncomingMessage } from "http";
import { Duplex } from "stream";

const available = <Map<string, IContainerInstance>> new Map();

interface IContainerInstanceInfo extends IServiceInstanceInfo {
  name: string;
}

interface IContainerInstance {
  construct(config): Promise<any>;
  handleConnection(req: IncomingMessage, socket: Duplex);
  destruct(): Promise<any>;
}

const ContainerFactory = <
  IServiceInstanceFactory<IContainer>
> {
  constructInstance(config: IAbstractServiceConfig & IDependentServiceConfig): Promise<IContainerInstanceInfo> {
    if (available.has(config.name)) {
      return Promise.reject(new Error("Cannot create two maps of the same name"));
    }
    const container = <IContainerInstance> require(config.file);
    return container.construct(config).then(function(){
      available.set(config.name, container);
      return { args: [], config: config, name: config.name };
    });
  },
  ensureExists(info: IContainerInstanceInfo) {
    return Promise.resolve(available.has(info.name));
  },
  destructInstance(info: IContainerInstanceInfo) {
    return Promise.resolve().then(function(){
      const boo = available.has(info.name);
      if (!boo) {
        return boo;
      }
      const container = available.get(info.name);
      available.delete(info.name);
      return container.destruct().then(function(){
        return boo;
      });
    });
  },
  constructHandle(info: IContainerInstanceInfo) {
    if (!available.has(info.name)) {
      return Promise.reject(`${info.name} is not an available kvstore`);
    }
    const container = new ContainerHandle(info);
    return Promise.resolve(container);
  },
};

class ContainerHandle implements IContainer {
  public name;
  constructor(info: IContainerInstanceInfo, ) {
    this.name = info.name;
  }
  public createConnection(): WebSocket {
    return <WebSocket> new w3cwebsocket(`http://127.0.0.1/${this.name}`);
  };
  destroy() { return Promise.resolve(); }
}

export default ContainerFactory;
