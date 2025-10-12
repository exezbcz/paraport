import type { Asset, Chain } from '@paraport/static'
import type { Signer } from '@polkadot/api/types'
import type { BridgeProtocol } from './bridges'
import type { LogLevel } from './sdk'
import type { TeleportMode } from './teleport'

/**
 * Configuration options for initializing the SDK
 * @template T - Boolean type parameter that determines if certain fields are required (true) or optional (false)
 */
export type SDKConfig<T extends boolean = true> = {
	/**
	 * List of bridge protocols to be used for transfers
	 * Specifies which cross-chain bridge protocols are available for transactions
	 */
	bridgeProtocols?: BridgeProtocol[]

	/**
	 * List of chains supported by the SDK
	 */
	chains: T extends true ? Chain[] : Chain[] | undefined

	/**
	 * Function that returns a Signer instance for transaction signing
	 * Used for authenticating and signing transactions on supported chains
	 */
	getSigner?: () => Promise<Signer>

	/**
	 * Logging level configuration for SDK operations
	 */
	logLevel?: LogLevel | undefined

	/**
	 * Endpoints for each supported chain
	 */
	endpoints?: Partial<Record<Chain, string[]>> | undefined
}

export type Route = {
	/**
	 * The source chain from which the transfer originates.
	 * This is the chain where the assets will be transferred from.
	 */
	origin: Chain
	/**
	 * The target chain where the transfer will be received.
	 * This is the chain where the assets will end up after the transfer.
	 */
	destination: Chain
	/**
	 * The bridge protocol used for executing the transfer between chains.
	 * Defines the technical mechanism that enables the cross-chain communication.
	 */
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

	/**
	 * The asset type for this transfer (e.g., DOT, KSM).
	 * Identifies the cryptocurrency or token being transferred.
	 */
	asset: Asset

	/**
	 * Details about the execution requirements and timing of the transfer.
	 */
	execution: {
		/**
		 * The number of signatures required to complete this transfer.
		 */
		requiredSignatureCount: number

		/**
		 * Estimated time for the execution of the transfer in milliseconds.
		 */
		timeMs: number
	}

	/**
	 * The teleport mode used for this quote calculation.
	 * Can be 'expected', 'exact', or 'only'.
	 */
	teleportMode: TeleportMode
}
