import { EventEmitter } from 'eventemitter3'

export type GenericEvent<P, T extends string> = {
	type: T
	payload: P
}

/**
 * Thin wrapper around EventEmitter3 with typed channels and payloads.
 *
 * @typeParam P - Payload shape for events
 * @typeParam T - String union of event channels
 */
export class GenericEmitter<P, T extends string> {
	private eventEmitter = new EventEmitter()

	emit(event: GenericEvent<P, T>): void {
		this.eventEmitter.emit(event.type, event)
	}

	/**
	 * Subscribes to events by type.
	 * @param eventType - Event channel key
	 * @param callback - Handler receiving the full event object
	 * @returns Unsubscribe function
	 */
	subscribe(
		eventType: T,
		callback: (event: GenericEvent<P, T>) => void,
	): () => void {
		this.eventEmitter.on(eventType, callback)
		return () => this.eventEmitter.removeListener(eventType, callback)
	}

	/**
	 * Removes a specific listener for a channel.
	 * @param eventType - Event channel key
	 * @param callback - Listener to remove
	 */
	unsubscribe(
		eventType: T,
		callback: (event: GenericEvent<P, T>) => void,
	): void {
		this.eventEmitter.removeListener(eventType, callback)
	}

	/**
	 * Removes all listeners, optionally for a specific channel.
	 * @param eventType - Event channel key to clear (optional)
	 */
	removeAllListeners(eventType?: T): void {
		if (eventType) {
			this.eventEmitter.removeAllListeners(eventType)
		} else {
			this.eventEmitter.removeAllListeners()
		}
	}
}
