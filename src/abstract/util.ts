import {  IServiceInstanceInfo } from "../Service/Config";
import { IServiceInstanceFactory, IServiceHandle } from "../Service/Usable";

function generateHandles(
  handleConfigs: Array<IServiceInstanceInfo>,
  instanceFactories: Map<string, IServiceInstanceFactory<IServiceHandle>>
): Promise<Map<string, IServiceHandle>> {
  return Promise.all(handleConfigs.map(function(handleConfig){
    const serviceconfig = handleConfig.config;
    if (!instanceFactories.has(serviceconfig.type)) {
      return Promise.reject("Handle type could not be constructed");
    }
    const factory = instanceFactories.get(serviceconfig.type);
    return factory.constructHandle(handleConfig);
  })).then(function(handles: Array<IServiceHandle>){
    return handles.reduce(function(map, handle) {
      map.set(handle.info.config.name, handle);
      return map;
    }, new Map<string, IServiceHandle>());
  });
}

export { generateHandles };
