import type { BaseDetails, BaseDetailsEvent } from '@/base/BaseManager'
import type { Action, Asset, Chain, Route } from '@/types/common'
import type { TransactionDetails } from '@/types/transactions'

export type TeleportEvent = BaseDetailsEvent

export type TeleportParams<Amount = bigint> = {
	address: string
	chain: Chain
	amount: Amount
	asset: Asset
	actions: Action[]
}

export interface TeleportDetails
	extends BaseDetails<TeleportStatus, TeleportEvent> {
	id: string
	details: {
		address: string
		amount: bigint
		asset: Asset
		route: Route
	}
	events: TeleportEvent[]
	timestamp: number
	checked: boolean
}

export enum TeleportStatus {
	Pending = 'pending',
	Transferring = 'transferring',
	Waiting = 'waiting',
	Executing = 'executing',
	Completed = 'completed',
	Failed = 'failed',
}

export enum TeleportEventType {
	TELEPORT_STARTED = 'teleport:started',
	TELEPORT_UPDATED = 'teleport:updated',
	TELEPORT_COMPLETED = 'teleport:completed',
}

export type TeleportEventTypeString = `${TeleportEventType}`

export type TeleportEventPayload = TeleportDetails & {
	transactions: TransactionDetails[]
}
