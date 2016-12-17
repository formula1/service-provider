import {IServiceHandle, IServiceInstance} from "../Service/Usable";

interface IIndexedStoreHandle<Value> extends IServiceHandle {
  create(value: Value, id?: string): Promise<string>;
  get(id: string): Promise<Value>;
  query(view: string, options?: any): Promise<Array<Value>>;
  update(id: string, newValues: Object): Promise<Value>;
  delete(id: string): Promise<Value>;
}
interface IIndexedStoreInstance<Value> extends IServiceInstance {
  create(value: Value, id?: string): Promise<string>;
  get(id: string): Promise<Value>;
  query(view: string, options?: any): Promise<Array<Value>>;
  update(id: string, newValues: Object): Promise<Value>;
  delete(id: string): Promise<Value>;
}

export { IIndexedStoreHandle, IIndexedStoreInstance };
