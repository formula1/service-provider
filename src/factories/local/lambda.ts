import * as pathUtil from "path";
import { ILambdaHandle, ILambdaInstance } from "../../abstract";

import { IServiceConfig, IServiceInstanceInfo, IAbstractServiceConfig, IDependentServiceConfig } from "../../Service/Config";
import { IServiceInstanceFactory, IServiceHandle } from "../../Service/Usable";

const available = <Map<string, ILambdaInstance<any, any>>> new Map();

import { LocalFactoryMap } from "./index";

interface ILambdaInstanceInfo extends IServiceInstanceInfo {
  name: string;
}

const LambdaFactory: IServiceInstanceFactory<ILambdaHandle<any, any>> = {
  constructInstance(config: IAbstractServiceConfig & IDependentServiceConfig) {
    if (available.has(config.name)) {
      return Promise.reject(new Error("Cannot create two maps of the same name"));
    }
    return this.constructInternal(config).then(function(){
      return Promise.resolve({ config: config, args: [], name: config.name });
    });
  },
  constructInternal(config) {
    if (available.has(config.name)) {
      return Promise.resolve(available.get(config.name));
    }
    return easyGenerate(<IAbstractServiceConfig> config, LocalFactoryMap).then(function(lambda){
      available.set(config.name, lambda);
      return lambda;
    });
  },
  ensureExists(info: ILambdaInstanceInfo) {
    return Promise.resolve(available.has(info.name));
  },
  destructInstance(info: ILambdaInstanceInfo) {
    const boo = available.has(info.name);
    if (boo) {
      available.delete(info.name);
    }
    return Promise.resolve(boo);
  },
  constructHandle(info: ILambdaInstanceInfo) {
    if (!available.has(info.name)) {
      return Promise.reject(`${info.name} is not an available kvstore`);
    }
    const kvstore = new LambdaHandle(info);
    return Promise.resolve(kvstore);
  },
};

class LambdaInstance<Input, Output> implements ILambdaInstance<Input, Output> {
  public services: Map<string, IServiceHandle>;
  public method: (input: Input) => Promise<Output>;
  public info: IServiceInstanceInfo;
  constructor(info, serviceHandles, method: (input: Input) => Promise<Output>) {
    this.info = info;
    this.services = serviceHandles;
    this.method = method;
  }
  public run(input: Input): Promise<Output> {
    return this.method.call(this, input);
  }
}

import { generateHandles } from "../../abstract/util";

function easyGenerate<Input, Output>(
  config: IServiceConfig & IAbstractServiceConfig,
  factoryMap: Map<string, IServiceInstanceFactory<IServiceHandle>>
) {
  return generateHandles(config.requireResults, factoryMap).then(function(handles){
    const containerMethod = require(pathUtil.join(config.folder, config.file));
    const container = new LambdaInstance<Input, Output>(undefined, handles, containerMethod);
    return container;
  });
}


class LambdaHandle<Input, Output> implements ILambdaHandle<Input, Output> {
  public name;
  public info;
  constructor(info: ILambdaInstanceInfo) {
    this.name = info.name;
    this.info = info;
  }
  public run(input: Input): Promise<Output> {
    if (!available.has(this.name)) {
      return Promise.reject("This Lambda Does not Exist");
    }
    let lambda = available.get(this.name);
    return lambda.run(input);
  }
}

export default LambdaFactory;
