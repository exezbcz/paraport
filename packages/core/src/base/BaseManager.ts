import type { GenericEmitter, GenericEvent } from '../utils/GenericEmitter'

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
> {
	protected items: Map<string, DetailsType> = new Map()
	protected eventEmitter: GenericEmitter<DetailsType, EventTypeString>

	constructor(eventEmitter: GenericEmitter<DetailsType, EventTypeString>) {
		this.eventEmitter = eventEmitter
	}

	getItem(id: string): DetailsType | undefined {
		return this.items.get(id)
	}

	getAllItems(): DetailsType[] {
		return Array.from(this.items.values())
	}

	addEvent(id: string, event: EventType): void {
		const item = this.items.get(id)
		if (!item) return

		const updatedItem = {
			...item,
			events: [...item.events, event],
		}

		this.items.set(id, updatedItem)
		this.emitUpdate(updatedItem)
	}

	updateStatus(id: string, status: StatusType, error?: string): void {
		const item = this.items.get(id)
		if (!item) return

		const newEvent: BaseDetailsEvent = {
			type: 'status-update',
			timestamp: Date.now(),
			data: {
				status: status,
				error: error,
			},
		}

		const updatedItem: DetailsType = {
			...item,
			status,
			...(error && { error }),
			events: [...item.events, newEvent],
		}

		this.items.set(id, updatedItem)
		this.emitUpdate(updatedItem)
	}

	protected emitUpdate(item: DetailsType): void {
		this.eventEmitter.emit({ type: this.getUpdateEventType(), payload: item })
	}

	protected getUpdateEventType(): EventTypeString {
		throw new Error('Method not implemented.')
	}

	protected setItem(id: string, item: DetailsType, emitUpdate = true): void {
		this.items.set(id, item)

		if (emitUpdate) {
			this.emitUpdate(item)
		}
	}

	subscribe(
		eventType: EventTypeString,
		callback: (item: DetailsType) => void,
	): () => void {
		const subscription = (
			event: GenericEvent<DetailsType, EventTypeString>,
		) => {
			callback(event.payload)
		}

		this.eventEmitter.subscribe(eventType, subscription)

		return () => this.eventEmitter.unsubscribe(eventType, subscription)
	}
}
