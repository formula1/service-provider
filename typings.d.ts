import { INetworkConfig, IServiceConfig } from "./src/Service/Config";
import { IServiceHandle } from "./src/Service/Handle";
import { IServiceInstanceFactory, IServiceInstanceInfo } from "./src/Service/Instance";

export declare class ArchitectureConfiguration {
  public static compileFolder(folder: string): {
    availableServices: Map<string, IServiceConfig>,
    networkConfiguration: INetworkConfig,
  };
  constructor();
  public finalize(): {
    availableServices: Map<string, IServiceConfig>,
    networkConfiguration: INetworkConfig,
  };
  public register(config: IServiceConfig): void;
}

export declare class Runner {
  constructor(
    availableServices: Map<string, IServiceConfig>,
    instanceFactories: Map<string, IServiceInstanceFactory<IServiceHandle>>,
  );
  public start(name: string): Promise<IServiceInstanceInfo>;
}

export declare const LocalFactoryMap: Map<string, IServiceInstanceFactory<IServiceHandle>>;

import { IContainer, IDispatcher, IIndexedStore, IKeyValueStore, ILambda } from "./src/abstract";

export declare interface IContainer extends IServiceHandle {
  createConnection(): WebSocket;
  destroy(): Promise<any>;
}
export declare interface IDispatcher<Input> extends IServiceHandle {
  dispatch(key: string, arg: Input): Promise<number>;
  subscribe(key: string, fn: Function): Promise<Boolean>;
  unsubscribe(key: string, fn: Function): Promise<Boolean>;
}
export declare interface IIndexedStore<Value> extends IServiceHandle {
  create(value: Value, id?: string): Promise<string>;
  get(id: string): Promise<Value>;
  query(view: string, options?: any): Promise<Array<Value>>;
  update(id: string, newValues: Object): Promise<Value>;
  delete(id: string): Promise<Value>;
}
export declare interface IKeyValueStore<Key, Value> extends IServiceHandle {
  set(key: Key, value: Value): Promise<undefined | Value>; // true if already existed
  get(key: Key): Promise<Value>;
  delete(key: Key): Promise<undefined | Value>; // Value if it used to exist
}
export declare interface ILambda<Input, Output> extends IServiceHandle {
  run(input: Input): Promise<Output>;
}
