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


const data1 = await wrapper1('test', 'test'); // 'foo'
const data2 = await wrapper2.call('test', 'test'); // 'test'
```

## API

```typescript
export interface MessagePortWrapper {
  /**
   * post a message without return value
   */
  post: <T = any>(channel: string, data: T) => void;
  /**
   * post a message with return value
   */
  call: <T = any, R = any>(channel: string, data: T) => Promise<R>;
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
  /**
   * post a message with return value
   */
  <T = any, R = any>(channel: string, data: T): Promise<R>;
}
```

## Jest

Jest tests are set up to run with `npm test` or `yarn test`.
