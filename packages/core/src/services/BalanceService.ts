import { balanceOf } from "@kodadot1/sub-api";
import { Chain } from "../types";
import { chainPropListOf, formatAddress, transferableBalanceOf } from "../utils";
import SubstrateApi from "./SubstrateApi";

type Balance = {
  chain: Chain;
  address: string;
  asset: string;
  amount: string;
  transferable: string;
};

export default class BalanceService {
  private api: SubstrateApi;

   constructor(api: SubstrateApi) {
     this.api = api;
   }

  async getBalances({ address, asset, chains } :{ address: string, asset: string, chains: Chain[] }): Promise<Balance[]> {
     try {
       const balancePromises = chains.map(async (chainId) => {
         const api = await this.api.getInstance(chainId);

         // TODO: support non native assets
         const balance = await balanceOf(api, address)
         const amount = balance.toString();

         return {
           chain: chainId,
           asset,
           address: formatAddress(address, chainPropListOf(chainId).ss58Format),
           amount,
           transferable: transferableBalanceOf(amount, chainId).toString(),
         } as Balance
       });

       const balances = await Promise.all(balancePromises);

       return balances;
     } catch (error: any) {
       throw new Error(`Failed to fetch balances: ${error.message}`);
     }
  }
}
