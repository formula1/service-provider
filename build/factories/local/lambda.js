"use strict";
const available = new Map();
const LambdaFactory = {
    constructInstance(config) {
        if (available.has(config.name)) {
            return Promise.reject(new Error("Cannot create two maps of the same name"));
        }
        const fn = require(config.file);
        available.set(config.name, fn);
        return Promise.resolve({ name: config.name });
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
class LambdaHandle {
    constructor(info) {
        this.name = info.name;
    }
    run(input) {
        if (!available.has(this.name)) {
            return Promise.reject("This Lambda Does not Exist");
        }
        let fn = available.get(this.name);
        return Promise.resolve(fn(input));
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LambdaFactory;
