"use strict";
const index_1 = require("./index");
const websocket_1 = require("websocket");
const available = new Map();
const ContainerFactory = {
    constructInstance(config) {
        if (available.has(config.name)) {
            return Promise.reject(new Error("Cannot create two maps of the same name"));
        }
        this.constructInternal(config).then(function () {
            return { args: [], config: config, name: config.name };
        });
    },
    constructInternal(config) {
        if (available.has(config.name)) {
            return Promise.resolve(available.get(config.name));
        }
        return easyGenerate(config, index_1.LocalFactoryMap).then(function (container) {
            available.set(config.name, container);
            return container;
        });
    },
    ensureExists(info) {
        return Promise.resolve(available.has(info.name));
    },
    destructInstance(info) {
        return Promise.resolve().then(function () {
            const boo = available.has(info.name);
            if (!boo) {
                return boo;
            }
            const container = available.get(info.name);
            available.delete(info.name);
            return container.destruct().then(function () {
                return boo;
            });
        });
    },
    constructHandle(info) {
        if (!available.has(info.name)) {
            return Promise.reject(`${info.name} is not an available kvstore`);
        }
        const container = new ContainerHandle(info);
        return Promise.resolve(container);
    },
};
class ContainerInstance {
    constructor(info, serviceHandles, methods) {
        this.info = info;
        this.services = serviceHandles;
        this.methods = methods;
    }
    construct(config) {
        return this.methods.construct.call(this, config);
    }
    handleConnection(req, socket) {
        return this.methods.handleConnection.call(this, req, socket);
    }
    destruct() {
        return this.methods.destruct.call(this);
    }
}
const util_1 = require("../../abstract/util");
function easyGenerate(config, factoryMap) {
    return util_1.generateHandles(config.requireResults, factoryMap).then(function (handles) {
        const containerMethods = require(config.file);
        const container = new ContainerInstance(undefined, handles, containerMethods);
        return container.construct(config).then(function () {
            return container;
        });
    });
}
class ContainerHandle {
    constructor(info) {
        this.name = info.name;
    }
    createConnection() {
        return new websocket_1.w3cwebsocket(`http://127.0.0.1/${this.name}`);
    }
    ;
    destroy() { return Promise.resolve(); }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ContainerFactory;
