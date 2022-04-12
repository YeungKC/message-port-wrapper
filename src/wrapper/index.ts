import { nanoid } from 'nanoid';

export type InvokeHandler<T = any, R = any> = (
  data: T,
  error?: Error
) => R | Promise<R>;

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

export const MessagePortWrapper = (
  port: MessagePort,
  nanoSize = 11
): MessagePortWrapper => {
  const invokeHandlers: Map<string, InvokeHandler> = new Map();

  const _send = <T = any>(data: {
    id?: string;
    channel?: string;
    data?: T;
    error?: any;
  }): void => {
    port.postMessage(data);
  };

  const send = <T = any>(channel: string, data: T): void => {
    _send({
      channel,
      data,
    });
  };

  const onMessage = async (event: MessageEvent) => {
    const { channel, id, data, error } = event.data;
    const handler = invokeHandlers.get(id) || invokeHandlers.get(channel);

    if (!handler) {
      _send({
        id,
        error: new Error('Handler not found'),
      });
      return;
    }

    try {
      const result = await handler(data, error);
      if (!id) return;

      _send({
        id,
        data: result,
      });
    } catch (e) {
      if (!id) return;

      _send({
        id,
        error: e,
      });
    }
  };

  port.onmessage = onMessage;

  const removeHandler = (channel: string) => {
    invokeHandlers.delete(channel);
  };

  const removeAllHandlers = () => {
    invokeHandlers.clear();
  };

  const on = <T = any, R = any>(
    channel: string,
    handler: InvokeHandler<T, R>
  ) => {
    if (invokeHandlers.has(channel)) {
      throw new Error(`channel ${channel} already exists`);
    }

    invokeHandlers.set(channel, handler);
  };

  const once = <T = any, R = any>(
    channel: string,
    handler: InvokeHandler<T, R>
  ) => {
    on(channel, (data: T, error?: Error) => {
      removeHandler(channel);
      return handler(data, error);
    });
  };

  const invoke = <R = any, T = any>(channel: string, data: T): Promise<R> =>
    new Promise<R>((resolve, reject) => {
      const id = nanoid(nanoSize);
      once(id, (data: R, error?: Error) => {
        if (error) reject(error);
        else resolve(data);
      });

      _send({
        channel,
        id,
        data,
      });
    });

  invoke.invoke = invoke;
  invoke.send = send;
  invoke.on = on;
  invoke.once = once;
  invoke.removeHandler = removeHandler;
  invoke.removeAllHandlers = removeAllHandlers;

  return invoke;
};
