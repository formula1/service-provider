import { IAbstractServiceConfig } from "../Service/Config";
import * as fsUtil from "fs";
import * as pathUtil from "path";

function validateInstance(config: IAbstractServiceConfig) {
  const absoluteLocation = pathUtil.resolve(config.folder, config.file);
  if (!fsUtil.existsSync(absoluteLocation)) {
    throw new Error(`location ${absoluteLocation} does not exist`);
  }
  if (config.file.indexOf(config.folder) !== 0) {
    throw new Error(`location must be relative to the folder`);
  }
}

export default validateInstance;
