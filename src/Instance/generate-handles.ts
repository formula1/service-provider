import { IServiceHandle } from "../Service/Handle";
import { IServiceInstanceFactory, IServiceInstanceInfo } from "../Service/Instance";

function generateHandles(
  handleConfigs: Array<IServiceInstanceInfo>,
  instanceFactories: Map<string, IServiceInstanceFactory<IServiceInstanceInfo, IServiceHandle>>
) {
  return Promise.all(handleConfigs.map(function(handleConfig){
    const serviceconfig = handleConfig.config;
    if (!instanceFactories.has(serviceconfig.type)) {
      return Promise.reject("Handle type could not be constructed");
    }
    const factory = instanceFactories.get(serviceconfig.type);
    return factory.constructHandle(handleConfig);
  }));
}

export default generateHandles;