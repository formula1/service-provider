import { Bucket, Mock } from "couchbase";

const Cluster = Mock.Cluster;
const ViewQuery = Mock.ViewQuery;


import { IIndexedStoreHandle, IIndexedStoreInstance } from "../../abstract";
import { IServiceInstanceInfo, IServiceConfig } from "../../Service/Config";
import { IServiceInstanceFactory, IServiceHandle } from "../../Service/Usable";

const db = new Cluster();
const available = <Map<string, IndexStoreInstance<any>>> new Map();

interface IIndexStoreConfig extends IServiceConfig {
  views: { [key: string]: string };
}

interface IIndexStoreInstanceInfo extends IServiceInstanceInfo {
  name: string;
  views: Array<string>;
}

interface IViewQueryConfig<Value> {
  ascending?: boolean;
  limit: number;
  skip: number;
  key?: Value | Array<Value>;
  keyRange?: [undefined | Value, undefined | Value];
}

const DEFAULT_VIEWQUERY_CONFIG = {
  ascending: true,
  limit: 10,
  skip: 0,
};

const IndexStoreFactory: IServiceInstanceFactory<IIndexedStoreHandle<any>> = {
  constructInstance(config: IIndexStoreConfig) {
    if (available.has(config.name)) {
      return Promise.reject(new Error("Cannot create two dispatchers of the same name"));
    }
    if (!("views" in config)) {
      config.views = {};
    }
    return this.constructInternal(config).then(function(){
      return { config: config, name: config.name, views: Object.keys(config.views), args: [] };
    });
  },
  constructInternal(config: IIndexStoreConfig) {
    if (available.has(config.name)) {
      return Promise.resolve(available.get(config.name));
    }
    const instance = new IndexStoreInstance(config);
    return instance.registerViews().then(function(){
      available.set(config.name, instance);
      return instance;
    });
  },

  ensureExists(info: IIndexStoreInstanceInfo) {
    return Promise.resolve(available.has(info.name));
  },
  destructInstance(info: IIndexStoreInstanceInfo) {
    if (!available.has(info.name)) {
      return Promise.resolve(false);
    }
    const instance = available.get(info.name);
    available.delete(info.name);
    instance.destroy().then(function(){
      return true;
    });
  },
  constructHandle(info: IIndexStoreInstanceInfo) {
    if (!available.has(info.name)) {
      return Promise.reject(`${info.name} is not an available dispatcher`);
    }
    const kvstore = new IndexStoreHandle(info);
    return Promise.resolve(kvstore);
  },
};
class IndexStoreHandle<Value> implements IndexStoreHandle<Value> {
  public name;
  public info: IIndexStoreInstanceInfo;
  constructor(info: IIndexStoreInstanceInfo) {
    this.name = info.name;
    this.info = info;
  }
  public create(value: Value, id?: string): Promise<string> {
    if (!available.has(this.name)) {
      return Promise.reject("This store does not exist");
    }
    return available.get(this.name).create(value, id);
  }
  public get(id: string): Promise<Value> {
    if (!available.has(this.name)) {
      return Promise.reject("This store does not exist");
    }
    return available.get(this.name).get(id);
  }
  public delete(id: string): Promise<Value> {
    if (!available.has(this.name)) {
      return Promise.reject("This store does not exist");
    }
    return available.get(this.name).delete(id);
  }
  public update(id: string, newValues: Object): Promise<Value> {
    if (!available.has(this.name)) {
      return Promise.reject("This store does not exist");
    }
    return available.get(this.name).update(id, newValues);
  }
  public query(view: string, options: IViewQueryConfig<Value> = DEFAULT_VIEWQUERY_CONFIG): Promise<Array<Value>> {
    if (!available.has(this.name)) {
      return Promise.reject("This store does not exist");
    }
    return available.get(this.name).update(view, options);
  }
}

class IndexStoreInstance<Value> implements IIndexedStoreInstance<Value> {
  public name;
  public info: IIndexStoreInstanceInfo;
  private config: IIndexStoreConfig;
  private bucket: Bucket;
  constructor(config: IIndexStoreConfig) {
    this.name = config.name;
    this.config = config;
    const bucket = db.openBucket(config.name);
    this.bucket = bucket;
  }
  destroy() {
    this.bucket.disconnect();
    return Promise.resolve();
  }
  public registerViews() {
    const config = this.config;
    const manager = this.bucket.manager();
    const designconfig = { views: Object.keys(config.views).reduce(function(obj, key) {
      obj[key] = { map: config.views[key] };
      return obj;
    }, {}) };
    return new Promise(function(res, rej){
      manager.insertDesignDocument(config.name, designconfig, function (err, result) {
        if (err) {
          rej(err);
        } else {
          res(result);
        }
      });
    });
  }
  public create(value: Value, id?: string): Promise<string> {
    if (!id) {
      id = Date.now().toString(32) + "-" + Math.random().toString(32).substring(2);
    }
    const bucket = this.bucket;
    return new Promise(function(res, rej) {
      bucket.insert(id, value, function(err, doc){
        if (err) {
          rej(err);
        } else {
          res(id);
        }
      });
    });
  }
  public get(id: string): Promise<Value> {
    const bucket = this.bucket;
    return new Promise(function(res, rej) {
      bucket.get(id, function(err, doc) {
        if (err) {
          rej(err);
        } else {
          res(doc);
        }
      });
    });
  }
  public query(view: string, options: IViewQueryConfig<Value> = DEFAULT_VIEWQUERY_CONFIG): Promise<Array<Value>> {
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
    } else  if ("keyRange" in options) {
      if (options.keyRange[ 0 ] === undefined && options.keyRange[ 1 ] === undefined) {
        return Promise.reject(`When providing a keyrange, both cannot be undefined`);
      }
      vq = vq.range(options.keyRange[0], options.keyRange[1], true);
    }
    const bucket = this.bucket;
    return new Promise(function(res, rej){
      bucket.query(vq, function(err, docs){
        if (err) {
          rej(err);
        } else {
          res(docs);
        }
      });
    });
  }
  public update(id: string, newValues: Object): Promise<Value> {
    const bucket = this.bucket;
    return this.get(id).then(function(oldValues){
      return new Promise(function(res, rej) {
        bucket.replace(id, newValues, function(err, doc) {
          if (err) {
            rej(err);
          } else {
            res(doc);
          }
        });
      }).then(function(){
        return oldValues;
      });
    });
  }
  public delete(id: string): Promise<Value> {
    const bucket = this.bucket;
    return new Promise(function(res, rej) {
      bucket.remove(id, function(err, doc) {
        if (err) {
          rej(err);
        } else {
          res(doc);
        }
      });
    });
  }
}

export default IndexStoreFactory;
