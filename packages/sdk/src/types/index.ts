import type {
	ParaPortSDK,
	SDKConfig,
	TeleportParams,
	TransactionType,
} from '@paraport/core'

export type AppProps = {
	sdk: ParaPortSDK
	autoteleport: TeleportParams<string>
	label: string
	disabled?: boolean
	displayMode?: DisplayMode
}

export enum DisplayMode {
	Integrated = 'integrated',
	// Modal = 'modal',
}

export enum TeleportStepStatus {
	Failed = 'failed',
	Cancelled = 'cancelled',
	Completed = 'completed',
	Waiting = 'waiting',
	Loading = 'loading',
}

export type TeleportStepType = TransactionType | 'balance-check'

export type TeleportStep = {
	id: string
	status: TeleportStepStatus
	isError?: boolean
	isActive: boolean
	txHash?: string
	type: TeleportStepType
	duration?: number
}

export type TeleportStepDetails = TeleportStep & {
	statusLabel: string
}

type ClientSDKConfig = SDKConfig<false>

export interface TeleportEvents {
	/**
	 * Callback fired when user submits the teleport form.
	 * @param autotelport - Boolean indicating if automatic teleport is enabled
	 */
	onSubmit?: (autotelport: boolean) => void

	/**
	 * Callback fired when the teleport operation completes successfully.
	 */
	onCompleted?: () => void

	/**
	 * Callback fired when the UI is ready for interaction.
	 */
	onReady?: () => void

	/**
	 * Callback fired when the user clicks adds funds.
	 */
	onAddFunds?: () => void
}

/**
 * Configuration options for initializing the ParaPort SDK UI component.
 */
export interface MountOptions extends TeleportEvents {
	/**
	 * HTML element ID where the ParaPort UI will be mounted.
	 * The element must exist in the DOM before initialization.
	 */
	integratedTargetId: string

	/**
	 * Controls how the UI is displayed. Currently supports 'integrated' mode
	 * which embeds the UI directly in the specified element.
	 * @default DisplayMode.Integrated
	 */
	displayMode?: DisplayMode | `${DisplayMode}`

	/**
	 * Function to get the signer for transactions. Typically returns a Web3 provider
	 * that can sign transactions on the source chain.
	 */
	getSigner?: ClientSDKConfig['getSigner']

	/**
	 * Configuration for the teleport operation including source chain,
	 * destination chain, asset, and amount to transfer.
	 */
	autoteleport: TeleportParams<string>

	/**
	 * Text label for the teleport button/widget.
	 */
	label: string

	/**
	 * Whether the teleport interface is disabled.
	 * @default false
	 */
	disabled?: boolean

	/**
	 * Log level for the SDK.
	 * @default 'INFO'
	 */
	logLevel?: ClientSDKConfig['logLevel']
}
