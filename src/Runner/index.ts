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
    return Promise.resolve().then(() => {
      if (this.createdServices.has(name)) {
        return this.createdServices.get(name);
      }
      if (!this.availableServices.has(name)) {
        throw new Error(`${name} is not an available service`);
      }
      const config = this.availableServices.get(name);
      this.createContainer(config).then(
        this.finishPending.bind(this, name, false),
        this.finishPending.bind(this, name, true)
      );
      this.createdServices.set(name, {
        config: config,
        state: "pending",
        pending: [],
      });
      return this.createdServices.get(name);
    }).then(function(serviceModule: IServiceHandleInit): Promise<IServiceInstanceInfo> {
      return new Promise(function(res, rej){
        switch (serviceModule.state) {
          case "error" : return rej(serviceModule.error);
          case "ready" : return res(serviceModule.value);
          case "pending" : serviceModule.pending.push([res, rej]);
          default : rej("non-existant type");
        }
      });
    });
  }
  private createContainer(config: IServiceConfig): Promise<IServiceInstanceInfo> {
    const { createdServices, instanceFactories } = this;
    if (!instanceFactories.has(config.type)) {
      return Promise.reject(new Error(`Type[${config.type}] not available for construction from [${Array.from(this.instanceFactories.keys()).join(", ")}]`));
    }
    return ("require" in config ?
      Promise.all((<IDependentServiceConfig> config).require.map((req) => {
        return this.start(req);
      }))
    :
      Promise.resolve([])
    ).then(function(instanceConfigs){
      const instanceFactory = instanceFactories.get(config.type);
      config.requireResults = instanceConfigs;
      return instanceFactory.constructInstance(config);
    });
  }
  private finishPending(name, error, value) {
    const init = this.createdServices.get(name);
    const pending = init.pending;
    init.pending = [];
    this.createdServices.set(name, init);
    if (error) {
      init.state = "error";
      init.error = value;
      pending.forEach(function(resrejFns){
        return resrejFns[1](init.error);
      });
    } else {
      init.state = "ready";
      init.value = value;
      pending.forEach(function(resrejFns){
        return resrejFns[0](init.value);
      });
    }
  }
}

export default ServiceRunner;
