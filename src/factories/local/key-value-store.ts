import { IKeyValueStore } from "../../abstract";
import { IServiceConfig } from "../../Service/Config";
import { IServiceHandle } from "../../Service/Handle";
import { IServiceInstanceFactory, IServiceInstanceInfo } from "../../Service/Instance";

const available = <Map<string, Map<any, any>>> new Map();

interface IKeyValueInstanceInfo extends IServiceInstanceInfo {
  name: string;
}

const KeyValueStoreFactory = <
  IServiceInstanceFactory<IKeyValueStore<any, any>>
> {
  constructInstance(config: IServiceConfig): Promise<IKeyValueInstanceInfo> {
    if (available.has(config.name)) {
      return Promise.reject(new Error("Cannot create two maps of the same name"));
    }
    available.set(config.name, new Map());
    return Promise.resolve({ config: config, name: config.name, args: [] });
  },
  ensureExists(info: IKeyValueInstanceInfo) {
    return Promise.resolve(available.has(info.name));
  },
  destructInstance(info: IKeyValueInstanceInfo) {
    const boo = available.has(info.name);
    if (boo) {
      available.delete(info.name);
    }
    return Promise.resolve(boo);
  },
  constructHandle(info: IKeyValueInstanceInfo) {
    if (!available.has(info.name)) {
      return Promise.reject(`${info.name} is not an available kvstore`);
    }
    const kvstore = new KeyValueStoreHandle(info);
    return Promise.resolve(kvstore);
  },
};

class KeyValueStoreHandle<Key, Value> implements IKeyValueStore<Key, Value> {
  public name;
  constructor(info: IKeyValueInstanceInfo) {
    this.name = info.name;
  }
  public get(key: Key): Promise<Value> {
    if (!available.has(this.name)) {
      return Promise.reject("This Key Value Store Does not Exist");
    }
    const kv = available.get(this.name);
    return Promise.resolve(kv.get(key));
  }
  public set(key: Key, value: Value): Promise<undefined | Value> {
    if (!available.has(this.name)) {
      return Promise.reject("This Key Value Store Does not Exist");
    }
    const kv = available.get(this.name);
    const previousValue = kv.get(key);
    kv.set(key, value);
    return Promise.resolve(previousValue);
  }
  public delete(key: Key): Promise<undefined | Value> {
    if (!available.has(this.name)) {
      return Promise.reject("This Key Value Store Does not Exist");
    }
    const kv = available.get(this.name);
    const previousValue = kv.get(key);
    kv.delete(key);
    return Promise.resolve(previousValue);
  }
}

export default KeyValueStoreFactory;
