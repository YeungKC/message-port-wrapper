import { nanoid } from 'nanoid';

export type InvokeHandler<T = any, R = any> = (
  data: T,
  error?: Error
) => R | Promise<R>;

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

export const MessagePortWrapper = (port: MessagePort): MessagePortWrapper => {
  const invokeHandlers: Map<string, InvokeHandler> = new Map();

  const send = <T = any>(data: {
    id?: string;
    channel?: string;
    data?: T;
    error?: any;
  }): void => {
    port.postMessage(data);
  };

  const post = <T = any>(channel: string, data: T): void => {
    send({
      channel,
      data,
    });
  };

  const onMessage = async (event: MessageEvent) => {
    const { channel, id, data, error } = event.data;
    const handler = invokeHandlers.get(id) || invokeHandlers.get(channel);

    if (!handler) {
      send({
        id,
        error: new Error('Handler not found'),
      });
      return;
    }

    try {
      const result = await handler(data, error);
      if (!id) return;

      send({
        id,
        data: result,
      });
    } catch (e) {
      if (!id) return;

      send({
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

  const call = <T = any, R = any>(channel: string, data: T): Promise<R> =>
    new Promise<R>((resolve, reject) => {
      const id = nanoid(11);
      once(id, (data: R, error?: Error) => {
        if (error) reject(error);
        else resolve(data);
      });

      send({
        channel,
        id,
        data,
      });
    });

  return Object.assign(call, {
    post,
    call,
    on,
    once,
    removeHandler,
    removeAllHandlers,
  });
};
