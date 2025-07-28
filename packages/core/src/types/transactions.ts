import type { BaseDetails, BaseDetailsEvent } from '../base/BaseManager'
import type { BrigeTransferParams } from './bridges'
import type { Action, Chain } from './common'

export enum TransactionEventType {
	TRANSACTION_STARTED = 'transaction:started',
	TRANSACTION_UPDATED = 'transaction:updated',
	TRANSACTION_PROCESSING = 'transaction:processing',
	TRANSACTION_COMPLETED = 'transaction:completed',
	TRANSACTION_FAILED = 'transaction:failed',
}

// type TransactionUpdatePayload = TransactionDetails;
export type TransactionEventTypeString = `${TransactionEventType}`

export enum TransactionStatus {
	Broadcast = 'broadcast',
	Casting = 'casting',
	Sign = 'sign',
	Block = 'block',
	Finalized = 'finalized',
	Unknown = '',
	Cancelled = 'cancelled',
}

export enum TransactionType {
	Teleport = 'Teleport',
	Action = 'Action',
}

export interface TransactionDetails
	extends BaseDetails<
		TransactionStatus,
		BaseDetailsEvent<{ status: TransactionStatus; error?: string }>
	> {
	name?: string
	chain: Chain
	details: BrigeTransferParams | Action
	teleportId: string
	type: TransactionType
	order: number
	txHash?: string
}

export type TransactionCallback = (
	params:
		| {
				status: TransactionStatus.Finalized
				txHash: string
				error?: string
		  }
		| {
				status: TransactionStatus.Block
				txHash: string
				error?: string
		  }
		| {
				status: TransactionStatus.Block
				txHash: string
				error?: string
		  }
		| {
				status: Exclude<
					TransactionStatus,
					TransactionStatus.Finalized | TransactionStatus.Block
				>
				error?: string
				txHash?: string
		  },
) => void

export type TransactionUnsubscribe = void | (() => void)
