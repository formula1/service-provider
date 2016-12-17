// /* global: serviceprovider */
//
// import {
//   DISPATCH_STRATEGY_TYPES,
//   IAbstractDispatchStrategy,
//   IContainerStrategy,
//   IDispatcherStrategy,
//   ILambdaStrategy,
// } from "./models";
//
// import { IContainer, IDispatcher, IKeyValueStore, ILambda } from "../../../abstract";
//
// interface IDispatchInput {
//   key: string;
//   input: any;
// };
//
// function userNotification(input: IDispatchInput): Promise<any> {
//   const KeyToDispatchStrategy: IKeySetStore<string, IAbstractDispatchStrategy> = this.services.get("")
//   return KeyToDispatchStrategy.getKey(input.key).then(function(dispatchStrategies){
//     return Promise.all(dispatchStrategies.map(function(dispatchStrategy){
//       return Promise.resolve().then(function(){
//         switch (dispatchStrategy.type) {
//           case DISPATCH_STRATEGY_TYPES.LAMBDA:
//             return serviceprovider.resolveName((<ILambdaStrategy> dispatchStrategy).identifier)
//             .then(function(lambda: ILambda<any, any>){
//               return lambda.run.bind(lambda);
//             });
//           case DISPATCH_STRATEGY_TYPES.DISPATCHER: {
//             let strat = (<IDispatcherStrategy> dispatchStrategy);
//             return serviceprovider.resolveName(strat.identifier)
//             .then(function(dispatcher: IDispatcher<any>){
//               return dispatcher.dispatch.bind(dispatcher, strat.key);
//             });
//           }
//           case DISPATCH_STRATEGY_TYPES.CONTAINER: {
//             let strat = (<IContainerStrategy> dispatchStrategy);
//             return serviceprovider.resolveLocation(strat.location)
//             .then(function(container: IContainer){
//               let lambda = container.lambdas[strat.key];
//               return lambda.run.bind(lambda);
//             });
//           }
//           default: throw new Error("invalid type");
//         }
//       }).then(function(fn){
//         return fn(input.input);
//       });
//     }));
//   });
// }
//
// export { userNotification };
