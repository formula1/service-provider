
import Container from "./container";
import Dispatcher from "./dispatcher";
import IndexStore from "./indexed-store";
import KeyValueStore from "./key-value-store";
import Lambda from "./lambda";

const factoryMap = new Map();
factoryMap.set("container", Container);
factoryMap.set("dispatcher", Dispatcher);
factoryMap.set("indexed-store", IndexStore);
factoryMap.set("key-value-store", KeyValueStore);
factoryMap.set("lambda", Lambda);

type LocalRunnerConfig = void;

export { factoryMap as LocalFactoryMap, LocalRunnerConfig };
