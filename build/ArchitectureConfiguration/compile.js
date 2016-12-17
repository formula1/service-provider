"use strict";
const pathUtil = require("path");
function compileFolder(archConfig, rootFolder) {
    return readdirPromise(rootFolder).then(function (folders) {
        return Promise.all(folders.map(function (foldername) {
            const folderpath = pathUtil.join(rootFolder, foldername);
            return readdirPromise(folderpath).then(function (folderFiles) {
                if (folderFiles.indexOf("services.json") === -1) {
                    return false;
                }
                return readFilePromise(pathUtil.join(folderpath, "services.json"));
            }).then(function (serviceConfigs) {
                serviceConfigs.forEach(function (serviceConfig) {
                    serviceConfig.folder = foldername;
                    archConfig.register(serviceConfig);
                });
            });
        }));
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = compileFolder;
const fsUtil = require("fs");
function readFilePromise(filename, encoding = "utf-8") {
    return new Promise(function (res, rej) {
        fsUtil.readFile(filename, encoding, function (err, str) {
            if (err) {
                return rej(err);
            }
            res(str);
        });
    });
}
function readdirPromise(dir) {
    return new Promise(function (res, rej) {
        fsUtil.readdir(dir, function (err, files) {
            if (err) {
                return rej(err);
            }
            else {
                res(files);
            }
        });
    });
}
;
