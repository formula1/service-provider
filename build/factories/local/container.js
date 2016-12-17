"use strict";
const websocket_1 = require("websocket");
const available = new Map();
const ContainerFactory = {
    constructInstance(config) {
        if (available.has(config.name)) {
            return Promise.reject(new Error("Cannot create two maps of the same name"));
        }
        const container = require(config.file);
        return container.construct(config).then(function () {
            available.set(config.name, container);
            return { args: [], config: config, name: config.name };
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
