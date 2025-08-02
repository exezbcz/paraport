import type { Prefix } from '@kodadot1/static'
import type { Signer } from '@polkadot/api/types'
import type { BridgeProtocol } from './bridges'

export type ChainPrefix = Prefix

export enum Asset {
	DOT = 'DOT',
	KSM = 'KSM',
}

export type SDKConfig = {
	bridgeProtocols?: BridgeProtocol[]
	rpcUrls?: Record<number | string, string>
	chains: Chain[]
	getSigner: () => Promise<Signer>
}

export enum Chain {
	POLKADOT = 'Polkadot',
	ASSETHUBKUSAMA = 'AssetHubKusama',
	KUSAMA = 'Kusama',
	ASSETHUBPOLKADOT = 'AssetHubPolkadot',
}

export type Action = {
	section: string
	method: string
	args: unknown[]
}

export type Route = {
	source: Chain
	target: Chain
	protocol: BridgeProtocol
}

/**
 * Represents a quote for a bridge transfer, providing details about the transfer route, fees,
 * and amounts involved.  This object is returned by the SDK when requesting a transfer quote.
 */
export type Quote<Amount = bigint> = {
	/**
	 * The route the bridge transfer will take.  Examine this object to understand the involved
	 * chains and any intermediate hops. Useful for displaying route information to the user.
	 */
	route: Route
	/**
	 * Breakdown of the fees associated with the bridge transfer.  Use this information to inform
	 * the user about the costs involved.
	 */
	fees: {
		/**
		 * The fee charged by the bridge for relaying the message.  Consider this when
		 * evaluating the overall cost of the transfer.
		 */
		bridge: Amount
		/**
		 * Fees associated with actions performed during the transfer, such as executing specific
		 * instructions on the destination chain (e.g., depositing tokens into a specific account).
		 * This is optional in case there is no fees for actions to be performed
		 */
		actions: Amount
		/**
		 * The total of all fees involved in the bridge transfer. `total = fees.bridge + fees.actions`.
		 */
		total: Amount
	}
	/**
	 * The net amount of the asset the user will receive on the destination chain.  This is the
	 * amount *after* all fees have been deducted.  Display this value to the user as the
	 * "receiving amount."
	 */
	amount: Amount
	/**
	 * The gross amount of the asset the user's account on the origin chain must have to initiate
	 * the transfer.  This includes the `amount` to be transferred plus all fees (`fees.total`).
	 * Display this value to the user as the "amount to be sent."  Ensure the user has sufficient
	 * balance before submitting the transfer.
	 */
	total: Amount

	asset: Asset
}
