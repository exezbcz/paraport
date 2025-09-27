import type { BaseDetails, BaseDetailsEvent } from '@/base/BaseManager'
import type { Route } from '@/types/common'
import type { TransactionDetails } from '@/types/transactions'
import type { Asset, Chain } from '@paraport/static'
import type { ObjectValues } from './utils'

export type TeleportEvent = BaseDetailsEvent

export type TeleportParams<Amount = bigint> = {
	address: string
	chain: Chain
	amount: Amount
	asset: Asset
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

export const TeleportStatuses = {
	Pending: 'pending',
	Transferring: 'transferring',
	Waiting: 'waiting',
	Completed: 'completed',
	Failed: 'failed',
} as const

export type TeleportStatus = ObjectValues<typeof TeleportStatuses>

export const TeleportEventTypes = {
	TELEPORT_STARTED: 'teleport:started',
	TELEPORT_UPDATED: 'teleport:updated',
	TELEPORT_COMPLETED: 'teleport:completed',
} as const

export type TeleportEventType = ObjectValues<typeof TeleportEventTypes>

export type TeleportEventPayload = TeleportDetails & {
	transactions: TransactionDetails[]
}
