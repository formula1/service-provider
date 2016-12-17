import { IDependentServiceConfig, IServiceConfig } from "../Service/Config";
import { IServiceHandle, IServiceHandleInit } from "../Service/Handle";
import { IServiceInstanceFactory, IServiceInstanceInfo } from "../Service/Instance";

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
  }
  private createContainer(config: IServiceConfig): Promise<IServiceInstanceInfo> {
    if (!this.instanceFactories.has(config.type)) {
      return Promise.reject(new Error("Type not available for construction"));
    }
    return ("require" in config ?
      Promise.all((<IDependentServiceConfig> config).require.map((req) => {
        return this.start(req);
      }))
    :
      Promise.resolve([])
    ).then(function(){
      const instanceFactory = this.instanceFactories.get(config.type);
      return instanceFactory.constructInstance(config);
    }).then(function(containerInfo){
      this.createdServices.set(config.name, {
        config: config,
        containerInfo: containerInfo,
        hasError: false,
      });
      return containerInfo;
    }, (e) => {
      this.createdServices.set(config.name, {
        config: config,
        errorValue: e.message || e,
        hasError: true,
      });
      throw e;
    });
  }
}

export default ServiceRunner;
