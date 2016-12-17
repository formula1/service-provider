import { INetworkConfig, IServiceConfig } from "../Service/Config";
import { LocalRunnerConfig } from "../factories/local";

type RunnerType = "local";
type RunnerConfig = LocalRunnerConfig;

interface IServiceRunner {
  constructor(
    availableServices: Map<string, IServiceConfig>,
    networkConfig: INetworkConfig,
    runnerConfig: RunnerConfig
  );
}

export { IServiceRunner, RunnerType, RunnerConfig };
