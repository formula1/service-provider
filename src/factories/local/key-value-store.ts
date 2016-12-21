import { IKeyValueStoreHandle, IKeyValueStoreInstance } from "../../abstract";
import { IServiceInstanceInfo, IServiceConfig } from "../../Service/Config";
import { IServiceInstanceFactory, IServiceHandle } from "../../Service/Usable";

const available = <Map<string, IKeyValueStoreInstance<any, any>>> new Map();

interface IKeyValueInstanceInfo extends IServiceInstanceInfo {
  name: string;
}

const KeyValueStoreFactory = <
  IServiceInstanceFactory<IKeyValueStoreHandle<any, any>>
> {
  constructInstance(config: IServiceConfig): Promise<IKeyValueInstanceInfo> {
    if (available.has(config.name)) {
      return Promise.reject(new Error("Cannot create two maps of the same name"));
    }
    return this.constructInternal(config).then(function(){
      return { config: config, name: config.name, args: [] };
    });
  },
  constructInternal(config: IServiceConfig) {
    if (available.has(config.name)) {
      return Promise.resolve(available.get(config.name));
    }
    const instance = new KeyValueStoreInstance(config);
    available.set(config.name, instance);
    return Promise.resolve(instance);
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

class KeyValueStoreHandle<Key, Value> implements KeyValueStoreHandle<Key, Value> {
  public name;
  public info;
  constructor(info: IKeyValueInstanceInfo) {
    this.name = info.name;
    this.info = info;
  }
  public get(key: Key): Promise<Value> {
    if (!available.has(this.name)) {
      return Promise.reject("This Key Value Store Does not Exist");
    }
    return available.get(this.name).get(key);
  }
  public set(key: Key, value: Value): Promise<undefined | Value> {
    if (!available.has(this.name)) {
      return Promise.reject("This Key Value Store Does not Exist");
    }
    return available.get(this.name).set(key, value);
  }
  public delete(key: Key): Promise<undefined | Value> {
    if (!available.has(this.name)) {
      return Promise.reject("This Key Value Store Does not Exist");
    }
    return available.get(this.name).delete(key);
  }
}

class KeyValueStoreInstance<Key, Value> implements KeyValueStoreInstance<Key, Value> {
  public name;
  private map: Map<any, any>;
  public info;
  constructor(info: IServiceConfig) {
    this.name = info.name;
    this.map = new Map();
  }
  public get(key: Key): Promise<Value> {
    const kv = this.map;
    return Promise.resolve(kv.get(key));
  }
  public set(key: Key, value: Value): Promise<undefined | Value> {
    const kv = this.map;
    const previousValue = kv.get(key);
    kv.set(key, value);
    return Promise.resolve(previousValue);
  }
  public delete(key: Key): Promise<undefined | Value> {
    const kv = this.map;
    const previousValue = kv.get(key);
    kv.delete(key);
    return Promise.resolve(previousValue);
  }
}

export default KeyValueStoreFactory;
