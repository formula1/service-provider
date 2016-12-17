import { Bucket, Mock } from "couchbase";

const Cluster = Mock.Cluster;
const ViewQuery = Mock.ViewQuery;

import { IServiceConfig } from "../../Service/Config";
import { IServiceHandle } from "../../Service/Handle";
import { IServiceInstanceFactory, IServiceInstanceInfo } from "../../Service/Instance";

const db = new Cluster();
const available = <Map<string, Bucket >> new Map();

interface IIndexStoreConfig extends IServiceConfig {
  views: Map<string, string>;
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

const IndexStoreFactory = <
  IServiceInstanceFactory<IIndexStoreInstanceInfo, IndexStoreHandle<any>>
> {
  constructInstance(config: IIndexStoreConfig) {
    if (available.has(config.name)) {
      return Promise.reject(new Error("Cannot create two dispatchers of the same name"));
    }
    const bucket = db.openBucket(config.name);
    available.set(config.name, bucket);
    const manager = bucket.manager();
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
    }).then(function(){
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

class IndexStoreHandle<Value> implements IServiceHandle {
  public name;
  private info: IIndexStoreInstanceInfo;
  constructor(info: IIndexStoreInstanceInfo) {
    this.name = info.name;
    this.info = info;
  }
  public create(value: Value, id?: string): Promise<string> {
    if (!available.has(this.name)) {
      return Promise.reject("This store does not exist");
    }
    if (!id) {
      id = Date.now().toString(32) + "-" + Math.random().toString(32).substring(2);
    }
    const bucket = available.get(this.name);
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
    if (!available.has(this.name)) {
      return Promise.reject("This store does not exist");
    }
    const bucket = available.get(this.name);
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
    } else  if ("keyRange" in options) {
      if (options.keyRange[ 0 ] === undefined && options.keyRange[ 1 ] === undefined) {
        return Promise.reject(`When providing a keyrange, both cannot be undefined`);
      }
      vq = vq.range(options.keyRange[0], options.keyRange[1], true);
    }
    const bucket = available.get(this.name);
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
    if (!available.has(this.name)) {
      return Promise.reject("This store does not exist");
    }
    const bucket = available.get(this.name);
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
    if (!available.has(this.name)) {
      return Promise.reject("This store does not exist");
    }
    const bucket = available.get(this.name);
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
