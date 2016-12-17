import {IServiceConfig} from "./Config";
import { IServiceInstanceInfo } from "./Instance";
interface IServiceHandle {
  name: string;
}

interface IServiceHandleInit {
  config: IServiceConfig;
  hasError: boolean;
  errorValue?: any;
  containerInfo?: IServiceInstanceInfo;
}

interface IKeySetStore<Key, Value> extends IServiceHandle {
  addItem(key: Key, value: Value): Promise<boolean>;
  getKey(key: Key): Promise<Array<Value>>;
  deleteItem(key: Key, value: Value): Promise<boolean>;
  deleteKey(key: Key): Promise<Array<Value>>;
}

export {
  IServiceHandle, IServiceHandleInit
};
