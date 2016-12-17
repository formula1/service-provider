import { IServiceConfig } from "../Service/Config";
import ArchitectureConfiguration from "./index";
import * as pathUtil from "path";

function compileFolder(archConfig: ArchitectureConfiguration, rootFolder: string) {
  return readdirPromise(rootFolder).then(function(folders){
    return Promise.all(folders.map(function(foldername){
      const folderpath = pathUtil.join(rootFolder, foldername);
      return readdirPromise(folderpath).then(function(folderFiles){
        if (folderFiles.indexOf("services.json") === -1) {
          return false;
        }
        return readFilePromise(pathUtil.join(folderpath, "services.json"));
      }).then(function(serviceConfigs: Array<IServiceConfig>){
        serviceConfigs.forEach(function(serviceConfig){
          serviceConfig.folder = foldername;
          archConfig.register(serviceConfig);
        });
      });
    }));
  });
}

export default compileFolder;

import * as fsUtil from "fs";

function readFilePromise(filename, encoding = "utf-8") {
  return new Promise(function(res, rej){
    fsUtil.readFile(filename, encoding, function(err, str){
      if (err) {
        return rej(err);
      }
      res(str);
    });
  });
}

function readdirPromise(dir): Promise<Array<string>> {
  return new Promise(function(res, rej){
    fsUtil.readdir(dir, function(err, files){
      if (err) {
        return rej(err);
      } else {
        res(files);
      }
    });
  });
};
