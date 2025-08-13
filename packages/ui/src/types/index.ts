import type { TransactionType } from '@paraport/core'

export type DisplayMode = 'integrated' | 'modal'

export enum TeleportStepStatus {
	Failed = 'failed',
	Completed = 'completed',
	Waiting = 'waiting',
	Loading = 'loading',
}

export type TeleportStep = {
	id: string
	status: TeleportStepStatus
	isError?: boolean
	isActive: boolean
	txHash?: string
	type: TransactionType | 'balance-check'
	duration?: number
}

export type TeleportStepDetails = TeleportStep & {
	statusLabel: string
}
