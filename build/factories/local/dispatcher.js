"use strict";
const available = new Map();
const DispatcherFactory = {
    constructInstance(config) {
        if (available.has(config.name)) {
            return Promise.reject(new Error("Cannot create two dispatchers of the same name"));
        }
        available.set(config.name, new Map());
        return Promise.resolve({ config: config, name: config.name, args: [] });
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
            return Promise.reject(`${info.name} is not an available dispatcher`);
        }
        const kvstore = new DispatcherHandle(info);
        return Promise.resolve(kvstore);
    },
};
class DispatcherHandle {
    constructor(info) {
        this.name = info.name;
    }
    dispatch(key, input) {
        if (!available.has(this.name)) {
            return Promise.reject("This dispatcher does not exist");
        }
        const map = available.get(this.name);
        const set = map.get(key);
        if (!set) {
            return Promise.resolve(0);
        }
        Array.from(set.values()).forEach(function (fn) {
            fn(input);
        });
        return Promise.resolve(set.size);
    }
    subscribe(key, fn) {
        if (!available.has(this.name)) {
            return Promise.reject("This dispatcher does not exist");
        }
        const map = available.get(this.name);
        if (!map.has(key)) {
            map.set(key, new Set());
        }
        const set = map.get("key");
        if (set.has(fn)) {
            return Promise.resolve(true);
        }
        set.add(fn);
        return Promise.resolve(false);
    }
    unsubscribe(key, fn) {
        if (!available.has(this.name)) {
            return Promise.reject("This dispatcher does not exist");
        }
        const map = available.get(this.name);
        let set = map.get(key);
        if (!set) {
            return Promise.resolve(false);
        }
        if (!set.has(fn)) {
            return Promise.resolve(false);
        }
        set.delete(fn);
        if (set.size === 0) {
            map.delete(key);
        }
        return Promise.resolve(true);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DispatcherFactory;
