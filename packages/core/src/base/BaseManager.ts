import type { GenericEmitter, GenericEvent } from '@/base/GenericEmitter'

export interface BaseDetails<StatusType, EventType> {
	id: string
	status: StatusType
	events: EventType[]
	timestamp: number
	error?: string
}

export interface BaseDetailsEvent<T = unknown> {
	type: string
	timestamp: number
	data: T
}

export class BaseManager<
	DetailsType extends BaseDetails<StatusType, EventType>,
	StatusType,
	EventType extends BaseDetailsEvent,
	EventTypeString extends string,
	EventPayload = DetailsType,
	OnUpdateParams extends Record<string, unknown> = { error?: string },
> {
	protected items: Map<string, DetailsType> = new Map()
	protected eventEmitter: GenericEmitter<EventPayload, EventTypeString>

	constructor(eventEmitter: GenericEmitter<EventPayload, EventTypeString>) {
		this.eventEmitter = eventEmitter
	}

	getItem(id: string): DetailsType | undefined {
		return this.items.get(id)
	}

	getItemsWhere(predicate: (item: DetailsType) => boolean): DetailsType[] {
		return Array.from(this.items.values()).filter(predicate)
	}

	getAllItems(): DetailsType[] {
		return Array.from(this.items.values())
	}

	removeItem(id: string): boolean {
		return this.items.delete(id)
	}

	addEvent(id: string, event: EventType): void {
		const item = this.items.get(id)
		if (!item) return

		const updatedItem = {
			...item,
			events: [...item.events, event],
		}

		this.setItem(id, updatedItem)
	}

	updateStatus(id: string, status: StatusType, params?: OnUpdateParams): void {
		const item = this.items.get(id)
		if (!item) return

		const newEvent: BaseDetailsEvent = {
			type: 'status-update',
			timestamp: Date.now(),
			data: {
				status: status,
				error: params?.error,
			},
		}

		const updatedItem: DetailsType = {
			...item,
			status,
			...params,
			events: [...item.events, newEvent],
		}

		this.setItem(id, updatedItem)
	}

	protected emitUpdate(item: EventPayload): void {
		this.eventEmitter.emit({ type: this.getUpdateEventType(), payload: item })
	}

	protected getUpdateEventType(): EventTypeString {
		throw new Error('Method not implemented.')
	}

	protected getEmitUpdateEventPayload(item: unknown): EventPayload {
		return item as EventPayload
	}

	protected setItem(id: string, item: DetailsType, emitUpdate = true): void {
		this.items.set(id, item)

		if (emitUpdate) {
			this.emitUpdate(this.getEmitUpdateEventPayload(item))
		}
	}

	subscribe(
		eventType: EventTypeString,
		callback: (item: EventPayload) => void,
	): () => void {
		const subscription = (
			event: GenericEvent<EventPayload, EventTypeString>,
		) => {
			callback(event.payload)
		}

		this.eventEmitter.subscribe(eventType, subscription)

		return () => this.eventEmitter.unsubscribe(eventType, subscription)
	}
}
