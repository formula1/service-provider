"use strict";
var available = new Map();
var KeyValueStoreFactory = {
    constructInstance: function (config) {
        if (available.has(config.name)) {
            return Promise.reject(new Error("Cannot create two maps of the same name"));
        }
        return this.constructInternal(config).then(function () {
            return { config: config, name: config.name, args: [] };
        });
    },
    constructInternal: function (config) {
        if (available.has(config.name)) {
            return Promise.resolve(available.get(config.name));
        }
        var instance = new KeyValueStoreInstance(config);
        available.set(config.name, instance);
        return instance;
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
        var kvstore = new KeyValueStoreHandle(info);
        return Promise.resolve(kvstore);
    },
};
var KeyValueStoreHandle = (function () {
    function KeyValueStoreHandle(info) {
        this.name = info.name;
    }
    KeyValueStoreHandle.prototype.get = function (key) {
        if (!available.has(this.name)) {
            return Promise.reject("This Key Value Store Does not Exist");
        }
        return available.get(this.name).get(key);
    };
    KeyValueStoreHandle.prototype.set = function (key, value) {
        if (!available.has(this.name)) {
            return Promise.reject("This Key Value Store Does not Exist");
        }
        return available.get(this.name).set(key, value);
    };
    KeyValueStoreHandle.prototype.delete = function (key) {
        if (!available.has(this.name)) {
            return Promise.reject("This Key Value Store Does not Exist");
        }
        return available.get(this.name).delete(key);
    };
    return KeyValueStoreHandle;
}());
var KeyValueStoreInstance = (function () {
    function KeyValueStoreInstance(info) {
        this.name = info.name;
        this.map = new Map();
    }
    KeyValueStoreInstance.prototype.get = function (key) {
        var kv = this.map;
        return Promise.resolve(kv.get(key));
    };
    KeyValueStoreInstance.prototype.set = function (key, value) {
        var kv = this.map;
        var previousValue = kv.get(key);
        kv.set(key, value);
        return Promise.resolve(previousValue);
    };
    KeyValueStoreInstance.prototype.delete = function (key) {
        var kv = this.map;
        var previousValue = kv.get(key);
        kv.delete(key);
        return Promise.resolve(previousValue);
    };
    return KeyValueStoreInstance;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = KeyValueStoreFactory;
