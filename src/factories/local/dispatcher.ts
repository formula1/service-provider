import { IDispatcherHandle, IDispatcherInstance } from "../../abstract";
import { IServiceConfig, IServiceInstanceInfo, IAbstractServiceConfig, IDependentServiceConfig } from "../../Service/Config";
import { IServiceInstanceFactory, IServiceHandle } from "../../Service/Usable";

const available = <Map<string, DispatcherInstance>> new Map();

interface IDispatcherInstanceInfo extends IServiceInstanceInfo {
  name: string;
}

const DispatcherFactory = <
  IServiceInstanceFactory<IDispatcherHandle<any>>
> {
  constructInstance(config: IAbstractServiceConfig & IDependentServiceConfig): Promise<IDispatcherInstanceInfo> {
    if (available.has(config.name)) {
      return Promise.reject(new Error("Cannot create two dispatchers of the same name"));
    }
    return this.constructInternal(config).then(function(){
      return { config: config, name: config.name, args: [] };
    });
  },
  constructInternal(config: IServiceConfig) {
    if (available.has(config.name)) {
      return Promise.resolve(available.get(config.name));
    }
    const ret = new DispatcherInstance(config);
    available.set(config.name, ret);
    return Promise.resolve(ret);
  },
  ensureExists(info: IDispatcherInstanceInfo) {
    return Promise.resolve(available.has(info.name));
  },
  destructInstance(info: IDispatcherInstanceInfo) {
    const boo = available.has(info.name);
    if (boo) {
      available.delete(info.name);
    }
    return Promise.resolve(boo);
  },
  constructHandle(info: IDispatcherInstanceInfo) {
    if (!available.has(info.name)) {
      return Promise.reject(`${info.name} is not an available dispatcher`);
    }
    const kvstore = new DispatcherHandle(info);
    return Promise.resolve(kvstore);
  },
};

class DispatcherInstance implements IDispatcherInstance<any> {
  public info;
  private map: Map<string, Set<Function>>;
  constructor(config) {
    this.map = new Map();
  }
  public dispatch(key: string, input: any): Promise<number> {
    const map = this.map;
    const set = map.get(key);
    if (!set) {
      return Promise.resolve(0);
    }
    Array.from(set.values()).forEach(function(fn){
      fn(input);
    });
    return Promise.resolve(set.size);
  }
  public subscribe(key: string, fn: Function): Promise<Boolean> {
    const map = this.map;
    if (!map.has(key)) {
      map.set(key, new Set());
    }
    const set = map.get("key");
    if (set.has(fn)) {
      return Promise.resolve(true);
    }
    set.add(fn);
    return Promise.resolve(false);
  }
  public unsubscribe(key: string, fn: Function): Promise<Boolean> {
    const map = this.map;
    let set = map.get(key);
    if (!set) {
      return Promise.resolve(false);
    }
    if (!set.has(fn)) {
      return Promise.resolve(false);
    }
    set.delete(fn);
    if (set.size === 0) {
      map.delete(key);
    }
    return Promise.resolve(true);
  }
}


class DispatcherHandle<Input> implements IDispatcherHandle<Input> {
  public name;
  constructor(info: IDispatcherInstanceInfo) {
    this.name = info.name;
  }
  public dispatch(key: string, input: Input): Promise<number> {
    if (!available.has(this.name)) {
      return Promise.reject("This dispatcher does not exist");
    }
    const i = available.get(this.name);
    return i.dispatch(key, input);
  }
  public subscribe(key: string, fn: Function): Promise<Boolean> {
    if (!available.has(this.name)) {
      return Promise.reject("This dispatcher does not exist");
    }
    const i = available.get(this.name);
    return i.subscribe(key, fn);
  }
  public unsubscribe(key: string, fn: Function): Promise<Boolean> {
    if (!available.has(this.name)) {
      return Promise.reject("This dispatcher does not exist");
    }
    const i = available.get(this.name);
    return i.unsubscribe(key, fn);
  }
}

export default DispatcherFactory;
