import {IServiceHandle, IServiceInstance} from "../Service/Usable";

interface IDispatcherHandle<Input> extends IServiceHandle {
  dispatch(key: string, arg: Input): Promise<number>;
  subscribe(key: string, fn: Function): Promise<Boolean>;
  unsubscribe(key: string, fn: Function): Promise<Boolean>;
}
interface IDispatcherInstance<Input> extends IServiceInstance {
  dispatch(key: string, arg: Input): Promise<number>;
  subscribe(key: string, fn: Function): Promise<Boolean>;
  unsubscribe(key: string, fn: Function): Promise<Boolean>;
}

/*

A dispatcher is...
1. Can do one of two things
  - Container which
  - Can also do polled Lambda which
    - KeyQueue<ServiceIdentity, Array<Events>> Store
    - External lambda which grabs the Events that are waiting for that individual
2. A dispatch Lambda
3. KeySetStore<eventname, Set<ServiceIdentity>>

*/

export { IDispatcherHandle, IDispatcherInstance };
