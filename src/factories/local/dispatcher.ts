import { IDispatcher } from "../../abstract";
import { IAbstractServiceConfig, IDependentServiceConfig } from "../../Service/Config";
import { IServiceHandle } from "../../Service/Handle";
import { IServiceInstanceFactory, IServiceInstanceInfo } from "../../Service/Instance";

const available = <Map<string, Map<string, Set<Function> > >> new Map();

interface IDispatcherInstanceInfo extends IServiceInstanceInfo {
  name: string;
}

const DispatcherFactory = <
  IServiceInstanceFactory<IDispatcher<any>>
> {
  constructInstance(config: IAbstractServiceConfig & IDependentServiceConfig): Promise<IDispatcherInstanceInfo> {
    if (available.has(config.name)) {
      return Promise.reject(new Error("Cannot create two dispatchers of the same name"));
    }
    available.set(config.name, new Map());
    return Promise.resolve({ config: config, name: config.name, args: [] });
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

class DispatcherHandle<Input> implements IDispatcher<Input> {
  public name;
  constructor(info: IDispatcherInstanceInfo) {
    this.name = info.name;
  }
  public dispatch(key: string, input: Input): Promise<number> {
    if (!available.has(this.name)) {
      return Promise.reject("This dispatcher does not exist");
    }
    const map = available.get(this.name);
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
    if (!available.has(this.name)) {
      return Promise.reject("This dispatcher does not exist");
    }
    const map = available.get(this.name);
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
    if (!available.has(this.name)) {
      return Promise.reject("This dispatcher does not exist");
    }
    const map = available.get(this.name);
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

export default DispatcherFactory;
