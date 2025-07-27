import type { BaseDetails } from '../base/BaseManager'
import type { Action, Asset, Chain, Route } from './common'
import type { TransactionDetails } from './transactions'

type TeleportEvent = any

export type TeleportParams = {
	address: string
	chain: Chain
	amount: string
	asset: Asset
	actions: Action[]
}

export interface TeleportDetails
	extends BaseDetails<TeleportStatus, TeleportEvent> {
	id: string
	details: {
		address: string
		amount: string
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
