export type LambdaResponseStream = {
  cork: () => void;
  uncork: () => void;
  write: (chunk: string | Buffer) => boolean;
  end: (chunk?: string | Buffer) => void;
  destroy: (error?: Error) => void;
  addListener: (event: string, listener: (...args: any[]) => void) => LambdaResponseStream;
  emit: (event: string, ...args: any[]) => boolean;
  eventNames: () => (string | symbol)[];
  getMaxListeners: () => number;
  listenerCount: (event: string) => number;
  listeners: (event: string) => Function[];
  off: (event: string, listener: (...args: any[]) => void) => LambdaResponseStream;
  on: (event: string, listener: (...args: any[]) => void) => LambdaResponseStream;
  once: (event: string, listener: (...args: any[]) => void) => LambdaResponseStream;
  prependListener: (event: string, listener: (...args: any[]) => void) => LambdaResponseStream;
  prependOnceListener: (event: string, listener: (...args: any[]) => void) => LambdaResponseStream;
  rawListeners: (event: string) => Function[];
  removeAllListeners: (event?: string) => LambdaResponseStream;
  removeListener: (event: string, listener: (...args: any[]) => void) => LambdaResponseStream;
  setMaxListeners: (n: number) => LambdaResponseStream;

  setContentType: (contentType: string) => void;
};
