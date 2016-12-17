import {IServiceHandle} from "../Service/Handle";

interface IContainer extends IServiceHandle {
  createConnection(): WebSocket;
  destroy(): Promise<any>;
}

export default IContainer;
