import { MessageChannelPolyfill } from 'message-port-polyfill';
import { MessagePortWrapper } from '../src/wrapper/index';

describe('MessagePortWrapper', () => {
  let wrapper1: MessagePortWrapper;
  let wrapper2: MessagePortWrapper;
  beforeEach(() => {
    const { port1, port2 } = new MessageChannelPolyfill();
    wrapper1 = MessagePortWrapper(port1);
    wrapper2 = MessagePortWrapper(port2);
  });

  afterEach(() => {
    wrapper1?.removeAllHandlers();
    wrapper2?.removeAllHandlers();
  });

  it('works', async () => {
    wrapper1.on('test', () => 'foo');
    wrapper2.on('test', (data: any) => data);

    const data1 = await wrapper1('test', 'test');
    const data2 = await wrapper2.call('test', 'test');
    expect(data1).toBe('test');
    expect(data2).toBe('foo');
  });

  it('error', async () => {
    wrapper1.on('test', () => {
      throw new Error('test');
    });

    let data: any;
    let e: any;
    try {
      data = await wrapper2('test', 'test');
    } catch (err) {
      e = err;
    }

    expect(data).toBeUndefined();
    expect(e).not.toBeUndefined();
    expect(e.message).toBe('test');
  });

  it('not found error', async () => {
    let data: any;
    let e: any;
    try {
      data = await wrapper2('test', 'test');
    } catch (err) {
      e = err;
    }

    expect(data).toBeUndefined();
    expect(e).not.toBeUndefined();
    expect(e.message).toBe('Handler not found');
  });

  it('undefined', async () => {
    wrapper1.on('test', (data: any) => data);

    const data = await wrapper2('test', undefined);

    expect(data).toBe(undefined);
  });

  it('null', async () => {
    wrapper1.on('test', (data: any) => data);

    const data = await wrapper2('test', null);

    expect(data).toBe(null);
  });
});
