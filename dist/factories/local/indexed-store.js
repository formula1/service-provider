"use strict";
var couchbase_1 = require("couchbase");
var Cluster = couchbase_1.Mock.Cluster;
var ViewQuery = couchbase_1.Mock.ViewQuery;
var db = new Cluster();
var available = new Map();
var DEFAULT_VIEWQUERY_CONFIG = {
    ascending: true,
    limit: 10,
    skip: 0,
};
var IndexStoreFactory = {
    constructInstance: function (config) {
        if (available.has(config.name)) {
            return Promise.reject(new Error("Cannot create two dispatchers of the same name"));
        }
        if (!("views" in config)) {
            config.views = {};
        }
        return this.constructInternal(config).then(function () {
            return { config: config, name: config.name, views: Object.keys(config.views), args: [] };
        });
    },
    constructInternal: function (config) {
        if (available.has(config.name)) {
            return Promise.resolve(available.get(config.name));
        }
        var instance = new IndexStoreInstance(config);
        return instance.registerViews().then(function () {
            available.set(config.name, instance);
            return instance;
        });
    },
    ensureExists: function (info) {
        return Promise.resolve(available.has(info.name));
    },
    destructInstance: function (info) {
        if (!available.has(info.name)) {
            return Promise.resolve(false);
        }
        var instance = available.get(info.name);
        available.delete(info.name);
        instance.destroy().then(function () {
            return true;
        });
    },
    constructHandle: function (info) {
        if (!available.has(info.name)) {
            return Promise.reject(info.name + " is not an available dispatcher");
        }
        var kvstore = new IndexStoreHandle(info);
        return Promise.resolve(kvstore);
    },
};
var IndexStoreHandle = (function () {
    function IndexStoreHandle(info) {
        this.name = info.name;
        this.info = info;
    }
    IndexStoreHandle.prototype.create = function (value, id) {
        if (!available.has(this.name)) {
            return Promise.reject("This store does not exist");
        }
        return available.get(this.name).create(value, id);
    };
    IndexStoreHandle.prototype.get = function (id) {
        if (!available.has(this.name)) {
            return Promise.reject("This store does not exist");
        }
        return available.get(this.name).get(id);
    };
    IndexStoreHandle.prototype.delete = function (id) {
        if (!available.has(this.name)) {
            return Promise.reject("This store does not exist");
        }
        return available.get(this.name).delete(id);
    };
    IndexStoreHandle.prototype.update = function (id, newValues) {
        if (!available.has(this.name)) {
            return Promise.reject("This store does not exist");
        }
        return available.get(this.name).update(id, newValues);
    };
    IndexStoreHandle.prototype.query = function (view, options) {
        if (options === void 0) { options = DEFAULT_VIEWQUERY_CONFIG; }
        if (!available.has(this.name)) {
            return Promise.reject("This store does not exist");
        }
        return available.get(this.name).update(view, options);
    };
    return IndexStoreHandle;
}());
var IndexStoreInstance = (function () {
    function IndexStoreInstance(config) {
        this.name = config.name;
        this.config = config;
        var bucket = db.openBucket(config.name);
        this.bucket = bucket;
    }
    IndexStoreInstance.prototype.destroy = function () {
        this.bucket.disconnect();
        return Promise.resolve();
    };
    IndexStoreInstance.prototype.registerViews = function () {
        var config = this.config;
        var manager = this.bucket.manager();
        var designconfig = { views: Object.keys(config.views).reduce(function (obj, key) {
                obj[key] = { map: config.views[key] };
                return obj;
            }, {}) };
        return new Promise(function (res, rej) {
            manager.insertDesignDocument(config.name, designconfig, function (err, result) {
                if (err) {
                    rej(err);
                }
                else {
                    res(result);
                }
            });
        });
    };
    IndexStoreInstance.prototype.create = function (value, id) {
        if (!id) {
            id = Date.now().toString(32) + "-" + Math.random().toString(32).substring(2);
        }
        var bucket = this.bucket;
        return new Promise(function (res, rej) {
            bucket.insert(id, value, function (err, doc) {
                if (err) {
                    rej(err);
                }
                else {
                    res(id);
                }
            });
        });
    };
    IndexStoreInstance.prototype.get = function (id) {
        var bucket = this.bucket;
        return new Promise(function (res, rej) {
            bucket.get(id, function (err, doc) {
                if (err) {
                    rej(err);
                }
                else {
                    res(doc);
                }
            });
        });
    };
    IndexStoreInstance.prototype.query = function (view, options) {
        if (options === void 0) { options = DEFAULT_VIEWQUERY_CONFIG; }
        if (this.info.views.indexOf(view) === -1) {
            return Promise.reject("View[" + view + "] does not exist for database[" + this.name + "]");
        }
        options = Object.assign({}, DEFAULT_VIEWQUERY_CONFIG, options);
        var vq = ViewQuery.from(this.name, view);
        vq = vq.order(options.ascending ? ViewQuery.Order.ASCENDING : ViewQuery.Order.DESCENDING);
        vq = vq.limit(options.limit);
        vq = vq.skip(options.skip);
        if ("key" in options) {
            vq = vq.key(options.key);
        }
        else if ("keyRange" in options) {
            if (options.keyRange[0] === undefined && options.keyRange[1] === undefined) {
                return Promise.reject("When providing a keyrange, both cannot be undefined");
            }
            vq = vq.range(options.keyRange[0], options.keyRange[1], true);
        }
        var bucket = this.bucket;
        return new Promise(function (res, rej) {
            bucket.query(vq, function (err, docs) {
                if (err) {
                    rej(err);
                }
                else {
                    res(docs);
                }
            });
        });
    };
    IndexStoreInstance.prototype.update = function (id, newValues) {
        var bucket = this.bucket;
        return this.get(id).then(function (oldValues) {
            return new Promise(function (res, rej) {
                bucket.replace(id, newValues, function (err, doc) {
                    if (err) {
                        rej(err);
                    }
                    else {
                        res(doc);
                    }
                });
            }).then(function () {
                return oldValues;
            });
        });
    };
    IndexStoreInstance.prototype.delete = function (id) {
        var bucket = this.bucket;
        return new Promise(function (res, rej) {
            bucket.remove(id, function (err, doc) {
                if (err) {
                    rej(err);
                }
                else {
                    res(doc);
                }
            });
        });
    };
    return IndexStoreInstance;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = IndexStoreFactory;
