import { Asset, Chain } from ".";

export type BridgeProtocol = 'XCM'

export type TransferParams = {
  address: string;
  sourceChainId: Chain;
  amount: string;
  asset: Asset;
};

export interface BridgeAdapter {
  protocol: BridgeProtocol;
  getQuote(params: TransferParams): Promise<Quote | null>;
  transfer(params: TransferParams): Promise<string>;
  getStatus(txHash: string): Promise<TransferStatus>;
}

export type TransferStatus = {
  status: 'pending' | 'completed' | 'failed';
};

export type Quote = {
  source: Chain;
  target: Chain;
  asset: Asset;
  bridge: BridgeProtocol;
  fee: string;
  amount: string;
};
