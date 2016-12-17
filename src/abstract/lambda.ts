import {IServiceHandle} from "../Service/Handle";

interface ILambda<Input, Output> extends IServiceHandle {
  run(input: Input): Promise<Output>;
}

export default ILambda;
