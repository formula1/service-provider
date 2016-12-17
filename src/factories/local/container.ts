import { LocalFactoryMap } from "./index";
import { w3cwebsocket } from "websocket";
import { IContainerHandle, IContainerInstance } from "../../abstract";

import { IServiceConfig, IServiceInstanceInfo, IAbstractServiceConfig, IDependentServiceConfig } from "../../Service/Config";
import { IServiceInstanceFactory, IServiceHandle } from "../../Service/Usable";

import { IncomingMessage } from "http";
import { Duplex } from "stream";


const available = <Map<string, IContainerInstance>> new Map();

interface IContainerInstanceInfo extends IServiceInstanceInfo {
  name: string;
}

const ContainerFactory = <
  IServiceInstanceFactory<IContainerHandle>
> {
  constructInstance(config): Promise<IContainerInstanceInfo> {
    if (available.has(config.name)) {
      return Promise.reject(new Error("Cannot create two maps of the same name"));
    }
    this.constructInternal(config).then(function(){
      return { args: [], config: config, name: config.name };
    });
  },
  constructInternal(config: IAbstractServiceConfig & IDependentServiceConfig) {
    if (available.has(config.name)) {
      return Promise.resolve(available.get(config.name));
    }
    return easyGenerate(config, LocalFactoryMap).then(function(container){
      available.set(config.name, container);
      return container;
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


class ContainerInstance implements IContainerInstance {
  public services: Array<IServiceHandle>;
  public methods: IContainerInstance;
  public info: IServiceInstanceInfo;
  constructor(info, serviceHandles: Array<IServiceHandle>, methods: IContainerInstance) {
    this.info = info;
    this.services = serviceHandles;
    this.methods = methods;
  }
  public construct(config) {
    return this.methods.construct.call(this, config);
  }
  public handleConnection(req, socket) {
    return this.methods.handleConnection.call(this, req, socket);
  }
  public destruct() {
    return this.methods.destruct.call(this);
  }
}

import { generateHandles } from "../../abstract/util";

function easyGenerate(
  config: IServiceConfig & IAbstractServiceConfig,
  factoryMap: Map<string, IServiceInstanceFactory<IServiceHandle>>
) {
  return generateHandles(config.requireResults, factoryMap).then(function(handles){
    const containerMethods = <IContainerInstance> require(config.file);
    const container = new ContainerInstance(undefined, handles, containerMethods);
    return container.construct(config).then(function(){
      return container;
    });
  });
}

class ContainerHandle implements IContainerHandle {
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
