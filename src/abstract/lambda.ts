import {IServiceHandle, IServiceInstance} from "../Service/Usable";

interface ILambdaHandle<Input, Output> extends IServiceHandle {
  run(input: Input): Promise<Output>;
}

interface ILambdaInstance<Input, Output> extends IServiceInstance {
  run(arg: Input): Promise<Output>;
}

export { ILambdaHandle, ILambdaInstance };
