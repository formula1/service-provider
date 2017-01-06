# Public: External
- externally exposed methods can only recieve IncomingMessage and output something that can be handled by ServerResponses
- What can be handled by server response is
  - Mime Content
    - Mime is a valid mimetype string
    - Content can be a stream or something that resolves to a buffer
  - UnboundServerResponse
    - UnboundServerResponse is a class which has the same methods as ServerResponse
    - It is different in that it doesn't do anything
    - It retains all of its information until it can be bound to an actual server response
    - Generally, the developer is expected to return the UnboundServerResponse early then use it as if it was the actual server response
      - To acheive this, the developer can delay the actual execution of its scripts until the next cycle
        - `setImmediate(runCode.bind(void 0, incomingMessage, serverResponse))`
      - Then immediate return the server response
      - in all it will look something along the lines of
        - ```
        export default function(incomingMessage){
          var unboundServerResponse = new UnboundServerResponse();
          setImmediate(runCode.bind(void 0, incomingMessage, unboundServerResponse));
          return unboundServerResponse;
        }
        ```

# Concept: ChainProcessing
- Runs a series of lambdas to be performed, each one sending the result to the appropriate next lambda
  - issue: there will be a context necessary for the chain that is set early on and used much later
    - The currently executing thread should only recieve what it expects, not have to ignore and resend data
  - issue: there may be lambdas that can run in parrallel
  - issue: a single result may be used to run multiple lambdas
  - issue: a lambda may wait for results from arbitrary senders
  - concept: a larger chain may be consolidated in concept as a single chain with a single input and a single output
  - concept: there are...
    - Chain Enders
      - Require one Starter
      - May optionally provide an output
    - Chain Starters
      - Require one Ender
    - Chain Transformers
      - Is considered both a Starter and an Ender
      - Requires one Starter
      - Requires one Ender
    - Chain Enders with result
      - Require one Starter
      - May accept an optional ender
      - Provides an output everytime which may be ignored
    - Chain Lambda
      - Is considered a starter and an Ender
      - Expects the chain that started from it to end with itself
      - Expects to be considered the final ender everytime
    - Chain LambdaLongPoll Transformer
      - is considered a Starter and an Ender
      - Requires a Timeout Integer
      - Requires a Starter as "LongPoll Starter"
      - Requires a Starter as "TriggeredEvent Starter"
      - Requires an Ender as "LongPoll Ender"
    - Chain Dispatcher Starter
      - is considered a Starter
      - Requires a Dispatcher
  - issue: because there may be multiple enders, there does need to be a definitive "final ender"
    - This ender will recieve...
      - The lambda file that was run
      - The arguments that file recieved
      - The stack trace/error that resulted from the lambda
Important!
  - There should be no if statements
  - All if statements are handled within the lambdas themselves
Important!
  - There are no Loops
  - With all chains there is a definitive start and definitive end
  - If a loop will be done or an iteration over a group, that will be done in a lambda
Important!
  - All errors are sent to the last ender
  - There is no try catch, only fail/not fail
  - If another thread will be dispatched, that is handled by the final ender
Ideally....
  - there isn't a centralized thread that is waiting for the others to finish executing
  - When the final Link ends, all else is ignored
Possibility
  - Because arguments sent to each part are known ahead of time
    - There can be a predictable garbage collection procedure for all outputs


examples

Starter -> ATransform -> BTransform -> [ CEnder, DTransform -> ETransform -> FTransform ]
  [BTransform, FTransform] -> GTransform -> HEnder
  [DTransform, GTransform] -> ZFinalEnder

In all B gets stored in memory, D gets Stored In Memory
