import { IServiceHandle, IServiceInstance } from "../Service/Usable";
import { IncomingMessage } from "http";
import { Duplex } from "stream";

interface IContainerHandle extends IServiceHandle {
  createConnection(): WebSocket;
  destroy(): Promise<any>;
}
interface IContainerInstance extends IServiceInstance {
  construct(config): Promise<any>;
  handleConnection(req: IncomingMessage, rawSocket: Duplex);
  destruct(): Promise<any>;
}

export { IContainerHandle, IContainerInstance };
