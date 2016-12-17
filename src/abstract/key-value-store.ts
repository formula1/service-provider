import {IServiceHandle} from "../Service/Handle";

interface IKeyValueStore<Key, Value> extends IServiceHandle {
  set(key: Key, value: Value): Promise<undefined | Value>; // true if already existed
  get(key: Key): Promise<Value>;
  delete(key: Key): Promise<undefined | Value>; // Value if it used to exist
}

export default IKeyValueStore;
