import { IDependentServiceConfig, IServiceInstanceInfo, IServiceHandleInit, IServiceConfig } from "../Service/Config";
import { IServiceInstanceFactory, IServiceHandle } from "../Service/Usable";

class ServiceRunner {
  private instanceFactories: Map<string, IServiceInstanceFactory<IServiceHandle>>;
  private createdServices: Map<string, IServiceHandleInit>;
  private availableServices: Map<string, IServiceConfig>;
  constructor(
    availableServices: Map<string, IServiceConfig>,
    instanceFactories: Map<string, IServiceInstanceFactory<IServiceHandle>>,
  ) {
    this.availableServices = availableServices;
    this.instanceFactories = instanceFactories;
    this.createdServices = new Map();
  }
  public start(name): Promise<IServiceInstanceInfo> {
    if (!this.createdServices.has(name)) {
      if (!this.availableServices.has(name)) {
        return Promise.reject(new Error(`${name} is not an available service`));
      }
      return this.createContainer(this.availableServices.get(name));
    }
    const serviceModule = this.createdServices.get(name);
    if (serviceModule.hasError) {
      return Promise.reject(serviceModule.errorValue);
    }
    return Promise.resolve(serviceModule.containerInfo);
  }
  private createContainer(config: IServiceConfig): Promise<IServiceInstanceInfo> {
    const { createdServices, instanceFactories } = this;
    if (!instanceFactories.has(config.type)) {
      return Promise.reject(new Error(`Type[${config.type}] not available for construction from [${Array.from(this.instanceFactories.keys()).join(", ")}]`));
    }
    return ("require" in config ?
      (<IDependentServiceConfig> config).require.reduce((p, req) => {
        return p.then((configArray) => {
          return this.start(req).then(function(info){
            return configArray.concat([ info ]);
          });
        });
      }, Promise.resolve(<Array<IServiceInstanceInfo>> []))
    :
      Promise.resolve([])
    ).then(function(instanceConfigs){
      const instanceFactory = instanceFactories.get(config.type);
      config.requireResults = instanceConfigs;
      return instanceFactory.constructInstance(config);
    }).then(function(containerInfo){
      createdServices.set(config.name, {
        config: config,
        containerInfo: containerInfo,
        hasError: false,
      });
      return containerInfo;
    }, (e) => {
      createdServices.set(config.name, {
        config: config,
        errorValue: e.message || e,
        hasError: true,
      });
      throw e;
    });
  }
}

export default ServiceRunner;
