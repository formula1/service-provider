"use strict";
var available = new Map();
var DispatcherFactory = {
    constructInstance: function (config) {
        if (available.has(config.name)) {
            return Promise.reject(new Error("Cannot create two dispatchers of the same name"));
        }
        return this.constructInternal(config).then(function () {
            return { config: config, name: config.name, args: [] };
        });
    },
    constructInternal: function (config) {
        if (available.has(config.name)) {
            return Promise.resolve(available.get(config.name));
        }
        var ret = new DispatcherInstance(config);
        available.set(config.name, ret);
        return Promise.resolve(ret);
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
            return Promise.reject(info.name + " is not an available dispatcher");
        }
        var kvstore = new DispatcherHandle(info);
        return Promise.resolve(kvstore);
    },
};
var DispatcherInstance = (function () {
    function DispatcherInstance(config) {
        this.map = new Map();
    }
    DispatcherInstance.prototype.dispatch = function (key, input) {
        var map = this.map;
        var set = map.get(key);
        if (!set) {
            return Promise.resolve(0);
        }
        Array.from(set.values()).forEach(function (fn) {
            fn(input);
        });
        return Promise.resolve(set.size);
    };
    DispatcherInstance.prototype.subscribe = function (key, fn) {
        var map = this.map;
        if (!map.has(key)) {
            map.set(key, new Set());
        }
        var set = map.get("key");
        if (set.has(fn)) {
            return Promise.resolve(true);
        }
        set.add(fn);
        return Promise.resolve(false);
    };
    DispatcherInstance.prototype.unsubscribe = function (key, fn) {
        var map = this.map;
        var set = map.get(key);
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
    };
    return DispatcherInstance;
}());
var DispatcherHandle = (function () {
    function DispatcherHandle(info) {
        this.name = info.name;
        this.info = info;
    }
    DispatcherHandle.prototype.dispatch = function (key, input) {
        if (!available.has(this.name)) {
            return Promise.reject("This dispatcher does not exist");
        }
        var i = available.get(this.name);
        return i.dispatch(key, input);
    };
    DispatcherHandle.prototype.subscribe = function (key, fn) {
        if (!available.has(this.name)) {
            return Promise.reject("This dispatcher does not exist");
        }
        var i = available.get(this.name);
        return i.subscribe(key, fn);
    };
    DispatcherHandle.prototype.unsubscribe = function (key, fn) {
        if (!available.has(this.name)) {
            return Promise.reject("This dispatcher does not exist");
        }
        var i = available.get(this.name);
        return i.unsubscribe(key, fn);
    };
    return DispatcherHandle;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DispatcherFactory;
