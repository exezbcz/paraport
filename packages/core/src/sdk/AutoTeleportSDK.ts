import ConfigValidationError from '../errors/ConfigError';
import { TransferParams, Quote } from '../types/bridges';
import { SDKConfig  } from '../types';
import XCMBridge from '../bridges/xcm/XCMBridge';
import BridgeRegistry from '../bridges/BridgeRegistry';

export default class AutoTeleportSDK {
  private readonly config: SDKConfig;
  private readonly bridgeRegistry = new BridgeRegistry();
  private initialized = false;

  constructor(config: SDKConfig) {
      const combinedConfig  = this.getDefaultConfig(config)
      this.validateConfig(combinedConfig);
      this.config = combinedConfig ;
      this.initialize();
  }

  private getDefaultConfig(config: SDKConfig): SDKConfig {
    return {
      ...config,
      bridgeProtocols: ['XCM']
    }
  }

  private initialize() {
    if (this.initialized) {
      throw new Error('SDK already initialized');
    }

    try {
      if (this.config.bridgeProtocols?.includes('XCM')) {
        this.bridgeRegistry.register(new XCMBridge(this.config));
      }

      this.initialized = true;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to initialize SDK: ${error.message}`);
      }
      throw new Error('Failed to initialize SDK: Unknown error');
    }
  }


  public async validateConfig(config: SDKConfig): Promise<void> {
    if (!config.bridgeProtocols?.length) {
      throw new ConfigValidationError('At least one bridge protocol must be specified');
    }
  }

  public async getQuotes(params: TransferParams): Promise<Quote[]> {
    this.ensureInitialized();
    this.validateTransferParams(params);

    const bridges = this.bridgeRegistry.getAll();

    const quotePromises = bridges.map(bridge =>
      bridge.getQuote(params)
        .then(quote => quote ? quote : null)
        .catch(error => {
          console.error(`${bridge.protocol} quote failed:`, error);
          return null;
        })
    );

    const results = await Promise.all(quotePromises);

    return results.filter((quote): quote is Quote => quote !== null);
  }

  private validateTransferParams(params: TransferParams) {
    // implement validation
  }

  private ensureInitialized (): void {
    if (!this.initialized) {
      throw new Error('SDK not initialized. Call initialize() first.');
    }
  }

}
