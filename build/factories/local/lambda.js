"use strict";
const available = new Map();
const index_1 = require("./index");
const LambdaFactory = {
    constructInstance(config) {
        if (available.has(config.name)) {
            return Promise.reject(new Error("Cannot create two maps of the same name"));
        }
        return this.constructInternal(config).then(function () {
            return Promise.resolve({ name: config.name });
        });
    },
    constructInternal(config) {
        if (available.has(config.name)) {
            return Promise.resolve(available.get(config.name));
        }
        return easyGenerate(config, index_1.LocalFactoryMap).then(function (lambda) {
            available.set(config.name, lambda);
            return lambda;
        });
    },
    ensureExists(info) {
        return Promise.resolve(available.has(info.name));
    },
    destructInstance(info) {
        const boo = available.has(info.name);
        if (boo) {
            available.delete(info.name);
        }
        return Promise.resolve(boo);
    },
    constructHandle(info) {
        if (!available.has(info.name)) {
            return Promise.reject(`${info.name} is not an available kvstore`);
        }
        const kvstore = new LambdaHandle(info);
        return Promise.resolve(kvstore);
    },
};
class LambdaInstance {
    constructor(info, serviceHandles, method) {
        this.info = info;
        this.services = serviceHandles;
        this.method = method;
    }
    run(input) {
        return this.method.call(this, input);
    }
}
const util_1 = require("../../abstract/util");
function easyGenerate(config, factoryMap) {
    return util_1.generateHandles(config.requireResults, factoryMap).then(function (handles) {
        const containerMethod = require(config.file);
        const container = new LambdaInstance(undefined, handles, containerMethod);
        return container;
    });
}
class LambdaHandle {
    constructor(info) {
        this.name = info.name;
    }
    run(input) {
        if (!available.has(this.name)) {
            return Promise.reject("This Lambda Does not Exist");
        }
        let lambda = available.get(this.name);
        return lambda.run(input);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LambdaFactory;
