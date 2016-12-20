"use strict";
var pathUtil = require("path");
var SERVICE_FILE_NAME = "service.json";
function compileFolder(archConfig, rootFolder) {
    return readdirPromise(rootFolder).then(function (folders) {
        return Promise.all(folders.map(function (foldername) {
            var folderpath = pathUtil.join(rootFolder, foldername);
            return readdirPromise(folderpath).then(function (folderFiles) {
                if (folderFiles.indexOf(SERVICE_FILE_NAME) === -1) {
                    return false;
                }
                return readFilePromise(pathUtil.join(folderpath, SERVICE_FILE_NAME)).then(function (configBuffer) {
                    return JSON.parse(configBuffer.toString("utf-8"));
                }).then(function (serviceConfigs) {
                    serviceConfigs.forEach(function (serviceConfig) {
                        serviceConfig.folder = foldername;
                        archConfig.register(serviceConfig);
                    });
                });
            });
        }));
    }).then(function () {
        return archConfig.finalize();
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = compileFolder;
var fsUtil = require("fs");
function readFilePromise(filename, encoding) {
    if (encoding === void 0) { encoding = "utf-8"; }
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
