import { IServiceConfig, IAbstractServiceConfig } from "../Service/Config";
import * as fsUtil from "fs";
import * as pathUtil from "path";

function validateInstance(config: IServiceConfig) {
  if (!configRequiresFile(config)) {
    return;
  }
  const absoluteLocation = require.resolve(config.file ? pathUtil.join(config.folder, config.file) : config.folder);
  if (!fsUtil.existsSync(absoluteLocation)) {
    throw new Error(`location ${absoluteLocation} does not exist`);
  }
  config.file = pathUtil.basename(absoluteLocation);
}

function configRequiresFile(config: IServiceConfig): config is IAbstractServiceConfig {
  switch (config.type) {
    case "container" : {
      return true;
    }
    case "lambda" : {
      return true;
    }
    default : {
      return false;
    }
  }
}

export default validateInstance;
