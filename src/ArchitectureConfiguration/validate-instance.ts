import { IAbstractServiceConfig } from "../Service/Config";
import * as fsUtil from "fs";
import * as pathUtil from "path";

function validateInstance(config: IAbstractServiceConfig) {
  const absoluteLocation = require.resolve(pathUtil.join(config.folder, config.file));
  if (!fsUtil.existsSync(absoluteLocation)) {
    throw new Error(`location ${absoluteLocation} does not exist`);
  }
}

export default validateInstance;
