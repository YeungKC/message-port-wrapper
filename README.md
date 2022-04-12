# MessagePort

> Simplified IPC communication for MessagePort.

## Installation

```shell
npm install message-port
```

## Usage

```typescript
const wrapper1 = MessagePortWrapper(port1);
const wrapper2 = MessagePortWrapper(port2);

wrapper1.on('test', () => 'foo');
wrapper2.on('test', (data: any) => data);


const data1 = await wrapper1<string>('test', 'test'); // 'foo'
const data2 = await wrapper2.call('test', 'test'); // 'test'
```

## API

```typescript
interface CallFunc {
  /**
   * invoke a handler with return value
   */
  <R = any, T = any>(channel: string, data: T): Promise<R>;
}

export interface MessagePortWrapper extends CallFunc {
  /**
   * invoke a handler without return value
   */
  send: <T = any>(channel: string, data: T) => void;
  invoke: CallFunc;
  /**
   * add a handler
   */
  on: <T = any, R = any>(channel: string, handler: InvokeHandler<T, R>) => void;
  /**
   * add a handler with once
   */
  once: <T = any, R = any>(
    channel: string,
    handler: InvokeHandler<T, R>
  ) => void;
  /**
   * remove a handler
   */
  removeHandler: (channel: string) => void;
  /**
   * remove all handlers
   */
  removeAllHandlers: () => void;
}
```

## Jest

Jest tests are set up to run with `npm test` or `yarn test`.
