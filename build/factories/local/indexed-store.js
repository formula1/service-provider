"use strict";
const couchbase_1 = require("couchbase");
const Cluster = couchbase_1.Mock.Cluster;
const ViewQuery = couchbase_1.Mock.ViewQuery;
const db = new Cluster();
const available = new Map();
const DEFAULT_VIEWQUERY_CONFIG = {
    ascending: true,
    limit: 10,
    skip: 0,
};
const IndexStoreFactory = {
    constructInstance(config) {
        if (available.has(config.name)) {
            return Promise.reject(new Error("Cannot create two dispatchers of the same name"));
        }
        const bucket = db.openBucket(config.name);
        available.set(config.name, bucket);
        const manager = bucket.manager();
        const designconfig = { views: Object.keys(config.views).reduce(function (obj, key) {
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
        }).then(function () {
            return { name: config.name, views: Object.keys(designconfig) };
        });
    },
    ensureExists(info) {
        return Promise.resolve(available.has(info.name));
    },
    destructInstance(info) {
        const boo = available.has(info.name);
        if (boo) {
            const bucket = available.get(info.name);
            bucket.disconnect();
            available.delete(info.name);
        }
        return Promise.resolve(boo);
    },
    constructHandle(info) {
        if (!available.has(info.name)) {
            return Promise.reject(`${info.name} is not an available dispatcher`);
        }
        const kvstore = new IndexStoreHandle(info);
        return Promise.resolve(kvstore);
    },
};
class IndexStoreHandle {
    constructor(info) {
        this.name = info.name;
        this.info = info;
    }
    create(value, id) {
        if (!available.has(this.name)) {
            return Promise.reject("This store does not exist");
        }
        if (!id) {
            id = Date.now().toString(32) + "-" + Math.random().toString(32).substring(2);
        }
        const bucket = available.get(this.name);
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
    }
    get(id) {
        if (!available.has(this.name)) {
            return Promise.reject("This store does not exist");
        }
        const bucket = available.get(this.name);
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
    }
    query(view, options = DEFAULT_VIEWQUERY_CONFIG) {
        if (!available.has(this.name)) {
            return Promise.reject("This store does not exist");
        }
        if (this.info.views.indexOf(view) === -1) {
            return Promise.reject(`View[${view}] does not exist for database[${this.name}]`);
        }
        options = Object.assign({}, DEFAULT_VIEWQUERY_CONFIG, options);
        let vq = ViewQuery.from(this.name, view);
        vq = vq.order(options.ascending ? ViewQuery.Order.ASCENDING : ViewQuery.Order.DESCENDING);
        vq = vq.limit(options.limit);
        vq = vq.skip(options.skip);
        if ("key" in options) {
            vq = vq.key(options.key);
        }
        else if ("keyRange" in options) {
            if (options.keyRange[0] === undefined && options.keyRange[1] === undefined) {
                return Promise.reject(`When providing a keyrange, both cannot be undefined`);
            }
            vq = vq.range(options.keyRange[0], options.keyRange[1], true);
        }
        const bucket = available.get(this.name);
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
    }
    update(id, newValues) {
        if (!available.has(this.name)) {
            return Promise.reject("This store does not exist");
        }
        const bucket = available.get(this.name);
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
    }
    delete(id) {
        if (!available.has(this.name)) {
            return Promise.reject("This store does not exist");
        }
        const bucket = available.get(this.name);
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
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = IndexStoreFactory;
