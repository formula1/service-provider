"use strict";
const container_1 = require("./container");
const dispatcher_1 = require("./dispatcher");
const indexed_store_1 = require("./indexed-store");
const key_value_store_1 = require("./key-value-store");
const lambda_1 = require("./lambda");
const factoryMap = new Map();
exports.LocalFactoryMap = factoryMap;
factoryMap.set("container", container_1.default);
factoryMap.set("dispatcher", dispatcher_1.default);
factoryMap.set("indexed-store", indexed_store_1.default);
factoryMap.set("key-value-store", key_value_store_1.default);
factoryMap.set("lambda", lambda_1.default);