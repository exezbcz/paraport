import type { TransactionStatus } from '@autoteleport/core'

export enum TeleportStepStatus {
	Failed = 'failed',
	Completed = 'completed',
	Waiting = 'waiting',
	Loading = 'loading',
}

export type TeleportStep = {
	id: string
	title: string
	status: TeleportStepStatus
	isError?: boolean
	isActive: boolean
	txHash?: string
}

export type TeleportStepDetails = TeleportStep & {
	statusLabel: string
}
