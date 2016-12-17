
enum DISPATCH_STRATEGY_TYPES {
  LAMBDA,
  DISPATCHER,
  CONTAINER,
}

interface IAbstractDispatchStrategy {
  type: DISPATCH_STRATEGY_TYPES;
};

interface ILambdaStrategy extends IAbstractDispatchStrategy {
  identifier: string;
};

interface IDispatcherStrategy extends IAbstractDispatchStrategy {
  key: string;
};

interface IContainerStrategy extends IAbstractDispatchStrategy {
  location: string;
  key: string;
};

export {
  DISPATCH_STRATEGY_TYPES,
  IAbstractDispatchStrategy,
  IContainerStrategy,
  IDispatcherStrategy,
  ILambdaStrategy,
};
