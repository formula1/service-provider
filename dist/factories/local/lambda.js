"use strict";
var available = new Map();
var index_1 = require("./index");
var LambdaFactory = {
    constructInstance: function (config) {
        if (available.has(config.name)) {
            return Promise.reject(new Error("Cannot create two maps of the same name"));
        }
        return this.constructInternal(config).then(function () {
            return Promise.resolve({ name: config.name });
        });
    },
    constructInternal: function (config) {
        if (available.has(config.name)) {
            return Promise.resolve(available.get(config.name));
        }
        return easyGenerate(config, index_1.LocalFactoryMap).then(function (lambda) {
            available.set(config.name, lambda);
            return lambda;
        });
    },
    ensureExists: function (info) {
        return Promise.resolve(available.has(info.name));
    },
    destructInstance: function (info) {
        var boo = available.has(info.name);
        if (boo) {
            available.delete(info.name);
        }
        return Promise.resolve(boo);
    },
    constructHandle: function (info) {
        if (!available.has(info.name)) {
            return Promise.reject(info.name + " is not an available kvstore");
        }
        var kvstore = new LambdaHandle(info);
        return Promise.resolve(kvstore);
    },
};
var LambdaInstance = (function () {
    function LambdaInstance(info, serviceHandles, method) {
        this.info = info;
        this.services = serviceHandles;
        this.method = method;
    }
    LambdaInstance.prototype.run = function (input) {
        return this.method.call(this, input);
    };
    return LambdaInstance;
}());
var util_1 = require("../../abstract/util");
function easyGenerate(config, factoryMap) {
    return util_1.generateHandles(config.requireResults, factoryMap).then(function (handles) {
        var containerMethod = require(config.file);
        var container = new LambdaInstance(undefined, handles, containerMethod);
        return container;
    });
}
var LambdaHandle = (function () {
    function LambdaHandle(info) {
        this.name = info.name;
    }
    LambdaHandle.prototype.run = function (input) {
        if (!available.has(this.name)) {
            return Promise.reject("This Lambda Does not Exist");
        }
        var lambda = available.get(this.name);
        return lambda.run(input);
    };
    return LambdaHandle;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LambdaFactory;
