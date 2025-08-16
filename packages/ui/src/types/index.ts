import type {
	ParaPortSDK,
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
