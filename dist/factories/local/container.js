"use strict";
var index_1 = require("./index");
var websocket_1 = require("websocket");
var available = new Map();
var ContainerFactory = {
    constructInstance: function (config) {
        if (available.has(config.name)) {
            return Promise.reject(new Error("Cannot create two maps of the same name"));
        }
        this.constructInternal(config).then(function () {
            return { args: [], config: config, name: config.name };
        });
    },
    constructInternal: function (config) {
        if (available.has(config.name)) {
            return Promise.resolve(available.get(config.name));
        }
        return easyGenerate(config, index_1.LocalFactoryMap).then(function (container) {
            available.set(config.name, container);
            return container;
        });
    },
    ensureExists: function (info) {
        return Promise.resolve(available.has(info.name));
    },
    destructInstance: function (info) {
        return Promise.resolve().then(function () {
            var boo = available.has(info.name);
            if (!boo) {
                return boo;
            }
            var container = available.get(info.name);
            available.delete(info.name);
            return container.destruct().then(function () {
                return boo;
            });
        });
    },
    constructHandle: function (info) {
        if (!available.has(info.name)) {
            return Promise.reject(info.name + " is not an available kvstore");
        }
        var container = new ContainerHandle(info);
        return Promise.resolve(container);
    },
};
var ContainerInstance = (function () {
    function ContainerInstance(info, serviceHandles, methods) {
        this.info = info;
        this.services = serviceHandles;
        this.methods = methods;
    }
    ContainerInstance.prototype.construct = function (config) {
        return this.methods.construct.call(this, config);
    };
    ContainerInstance.prototype.handleConnection = function (req, socket) {
        return this.methods.handleConnection.call(this, req, socket);
    };
    ContainerInstance.prototype.destruct = function () {
        return this.methods.destruct.call(this);
    };
    return ContainerInstance;
}());
var util_1 = require("../../abstract/util");
function easyGenerate(config, factoryMap) {
    return util_1.generateHandles(config.requireResults, factoryMap).then(function (handles) {
        var containerMethods = require(config.file);
        var container = new ContainerInstance(undefined, handles, containerMethods);
        return container.construct(config).then(function () {
            return container;
        });
    });
}
var ContainerHandle = (function () {
    function ContainerHandle(info) {
        this.name = info.name;
    }
    ContainerHandle.prototype.createConnection = function () {
        return new websocket_1.w3cwebsocket("http://127.0.0.1/" + this.name);
    };
    ;
    ContainerHandle.prototype.destroy = function () { return Promise.resolve(); };
    return ContainerHandle;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ContainerFactory;
