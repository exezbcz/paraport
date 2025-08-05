import { EventEmitter } from 'eventemitter3'

export type GenericEvent<P, T extends string> = {
	type: T
	payload: P
}

export class GenericEmitter<P, T extends string> {
	private eventEmitter = new EventEmitter()

	emit(event: GenericEvent<P, T>): void {
		this.eventEmitter.emit(event.type, event)
	}

	subscribe(
		eventType: T,
		callback: (event: GenericEvent<P, T>) => void,
	): () => void {
		this.eventEmitter.on(eventType, callback)
		return () => this.eventEmitter.removeListener(eventType, callback)
	}

	unsubscribe(
		eventType: T,
		callback: (event: GenericEvent<P, T>) => void,
	): void {
		this.eventEmitter.removeListener(eventType, callback)
	}

	removeAllListeners(eventType?: T): void {
		if (eventType) {
			this.eventEmitter.removeAllListeners(eventType)
		} else {
			this.eventEmitter.removeAllListeners()
		}
	}
}
