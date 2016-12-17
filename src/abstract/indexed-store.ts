import {IServiceHandle} from "../Service/Handle";

interface IIndexedStore<Value> extends IServiceHandle {
  create(value: Value, id?: string): Promise<string>;
  get(id: string): Promise<Value>;
  query(view: string, options?: any): Promise<Array<Value>>;
  update(id: string, newValues: Object): Promise<Value>;
  delete(id: string): Promise<Value>;
}

export default IIndexedStore;
