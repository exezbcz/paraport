import { EventEmitter } from 'node:events'

export type GenericEvent<T, E extends string> = {
	type: E
	payload: T
}

export class GenericEmitter<T, E extends string> {
	private eventEmitter = new EventEmitter()

	emit(event: GenericEvent<T, E>): void {
		this.eventEmitter.emit(event.type, event)
	}

	subscribe(
		eventType: E,
		callback: (event: GenericEvent<T, E>) => void,
	): () => void {
		this.eventEmitter.on(eventType, callback)
		return () => this.eventEmitter.removeListener(eventType, callback)
	}

	unsubscribe(
		eventType: E,
		callback: (event: GenericEvent<T, E>) => void,
	): void {
		this.eventEmitter.removeListener(eventType, callback)
	}

	removeAllListeners(eventType?: E): void {
		if (eventType) {
			this.eventEmitter.removeAllListeners(eventType)
		} else {
			this.eventEmitter.removeAllListeners()
		}
	}
}
