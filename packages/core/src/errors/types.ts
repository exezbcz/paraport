export interface SDKErrorOptions {
  code?: string;
  cause?: Error | unknown;
  context?: Record<string, unknown>;
}

export abstract class SDKError extends Error {
  public readonly code?: string;
  public readonly cause?: Error | unknown;
  public readonly context?: Record<string, unknown>;

  constructor(message: string, options: SDKErrorOptions = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = options.code;
    this.cause = options.cause;
    this.context = options.context;
  }
}
