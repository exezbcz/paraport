import BalanceService from "../../services/BalanceService";
import SubstrateApi from "../../services/SubstrateApi";
import { Chain, SDKConfig } from "../../types";
import { BridgeAdapter, BridgeProtocol, Quote, TransferParams, TransferStatus } from "../../types/bridges";
import { getChainsOfAsset } from "../../utils";
import * as paraspell from '@paraspell/sdk-pjs'
import { maxBy } from 'lodash'

type TeleportParams = {
  amount: string
  from: Chain
  to: Chain
  address: string
  asset: string
}

export default class XCMBridge implements BridgeAdapter {
  protocol: BridgeProtocol = 'XCM';
  private readonly config: SDKConfig;
  private balanceService: BalanceService;
  private readonly api: SubstrateApi;

  constructor(config: SDKConfig) {
    this.config = config;
    this.api = new SubstrateApi()
    this.balanceService = new BalanceService(this.api);
  }

  private async teleport ({ amount, from, to, address, asset }: TeleportParams) {
    const api = await this.api.getInstance(from)

    return paraspell
      .Builder(api)
      .from(from)
      .to(to)
      .currency({ symbol: asset, amount: amount })
      .address(address)
      .build()
  }


  private async getTransactionFees({ amount, from, to, address, asset }: TeleportParams): Promise<string> {
    const tx = await this.teleport({
      amount: amount,
      from,
      to,
      address,
      asset
    })

    const paymentInfo = await tx.paymentInfo(address);

    return paymentInfo.partialFee.toString()
  }

  async getQuote({ address, asset, sourceChainId, amount }: TransferParams): Promise<Quote | null> {

      // 1. get chains where the token is avaialbe
      const chains = getChainsOfAsset(asset)

      // 2. get address balances on all chains where the token is avaialbe
      const balances = await this.balanceService.getBalances({ address, chains, asset })

      // 3. from possible target chains find the one with the highest transferable balance
      const targetChainBalances = balances.filter(balance => balance.chain !== sourceChainId)

      const highestBalanceChain = maxBy(targetChainBalances, balance => Number(balance.transferable))

      if (!highestBalanceChain) {
          return null
        }

      // 4. calculate tx fees asoociated action and telport
      const telportFees = await this.getTransactionFees({
        amount,
        from: sourceChainId,
        to: highestBalanceChain.chain,
        address,
        asset
      })

      if (Number(highestBalanceChain.transferable) > Number(telportFees) + Number(amount)) {
        return null
      }

      const fee = telportFees

      return {
        source: sourceChainId,
        target: highestBalanceChain.chain,
        asset,
        bridge: this.protocol,
        fee,
        amount,
      }
  }

  transfer(params: TransferParams): Promise<string> {
      throw new Error("Method not implemented.");
  }

  getStatus(teleportId: string): Promise<TransferStatus> {
      throw new Error("Method not implemented.");
  }
}
