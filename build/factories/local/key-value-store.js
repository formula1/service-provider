"use strict";
const available = new Map();
const KeyValueStoreFactory = {
    constructInstance(config) {
        if (available.has(config.name)) {
            return Promise.reject(new Error("Cannot create two maps of the same name"));
        }
        available.set(config.name, new Map());
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
        const kvstore = new KeyValueStoreHandle(info);
        return Promise.resolve(kvstore);
    },
};
class KeyValueStoreHandle {
    constructor(info) {
        this.name = info.name;
    }
    get(key) {
        if (!available.has(this.name)) {
            return Promise.reject("This Key Value Store Does not Exist");
        }
        const kv = available.get(this.name);
        return Promise.resolve(kv.get(key));
    }
    set(key, value) {
        if (!available.has(this.name)) {
            return Promise.reject("This Key Value Store Does not Exist");
        }
        const kv = available.get(this.name);
        const previousValue = kv.get(key);
        kv.set(key, value);
        return Promise.resolve(previousValue);
    }
    delete(key) {
        if (!available.has(this.name)) {
            return Promise.reject("This Key Value Store Does not Exist");
        }
        const kv = available.get(this.name);
        const previousValue = kv.get(key);
        kv.delete(key);
        return Promise.resolve(previousValue);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = KeyValueStoreFactory;
