import { IServiceConfig } from "../Service/Config";
import ArchitectureConfiguration from "./index";
import * as pathUtil from "path";

const SERVICE_FILE_NAME = "service.json";

function compileFolder(archConfig: ArchitectureConfiguration, rootFolder: string) {
  return readdirPromise(rootFolder).then(function(folders){
    return Promise.all(folders.map(function(foldername){
      const folderpath = pathUtil.join(rootFolder, foldername);
      return readdirPromise(folderpath).then(function(folderFiles){
        if (folderFiles.indexOf(SERVICE_FILE_NAME) === -1) {
          return false;
        }
        return readFilePromise(pathUtil.join(folderpath, SERVICE_FILE_NAME)).then(function(configBuffer: Buffer){
          return JSON.parse(configBuffer.toString("utf-8"));
        }).then(function(serviceConfigs: Array<IServiceConfig>){
          serviceConfigs.forEach(function(serviceConfig){
            serviceConfig.folder = foldername;
            archConfig.register(serviceConfig);
          });
        });
      });
    }));
  }).then(function() {
    return archConfig.finalize();
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
