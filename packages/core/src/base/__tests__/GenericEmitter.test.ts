import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GenericEmitter } from '../GenericEmitter'

type TestPayload = { value: number }
type TestEventType = 'test' | 'other'

describe('GenericEmitter', () => {
	let emitter: GenericEmitter<TestPayload, TestEventType>

	beforeEach(() => {
		emitter = new GenericEmitter()
	})

	it('should emit and receive events', () => {
		const callback = vi.fn()
		emitter.subscribe('test', callback)

		const event = { type: 'test' as TestEventType, payload: { value: 42 } }
		emitter.emit(event)

		expect(callback).toHaveBeenCalledWith(event)
	})

	it('should handle multiple subscribers', () => {
		const callback1 = vi.fn()
		const callback2 = vi.fn()

		emitter.subscribe('test', callback1)
		emitter.subscribe('test', callback2)

		const event = { type: 'test' as TestEventType, payload: { value: 42 } }
		emitter.emit(event)

		expect(callback1).toHaveBeenCalledWith(event)
		expect(callback2).toHaveBeenCalledWith(event)
	})

	it('should unsubscribe correctly', () => {
		const callback = vi.fn()
		emitter.subscribe('test', callback)

		const event = { type: 'test' as TestEventType, payload: { value: 42 } }
		emitter.emit(event)

		emitter.unsubscribe('test', callback)
		emitter.emit(event)

		expect(callback).toHaveBeenCalledTimes(1)
	})

	it('should remove all listeners for specific event type', () => {
		const callback1 = vi.fn()
		const callback2 = vi.fn()

		emitter.subscribe('test', callback1)
		emitter.subscribe('other', callback2)

		emitter.removeAllListeners('test')

		const testEvent = { type: 'test' as TestEventType, payload: { value: 42 } }
		const otherEvent = {
			type: 'other' as TestEventType,
			payload: { value: 24 },
		}

		emitter.emit(testEvent)
		emitter.emit(otherEvent)

		expect(callback1).not.toHaveBeenCalled()
		expect(callback2).toHaveBeenCalledWith(otherEvent)
	})

	it('should remove all listeners when no event type specified', () => {
		const callback1 = vi.fn()
		const callback2 = vi.fn()

		emitter.subscribe('test', callback1)
		emitter.subscribe('other', callback2)

		emitter.removeAllListeners()

		const testEvent = { type: 'test' as TestEventType, payload: { value: 42 } }
		const otherEvent = {
			type: 'other' as TestEventType,
			payload: { value: 24 },
		}

		emitter.emit(testEvent)
		emitter.emit(otherEvent)

		expect(callback1).not.toHaveBeenCalled()
		expect(callback2).not.toHaveBeenCalled()
	})

	it('should return unsubscribe function from subscribe', () => {
		const callback = vi.fn()
		const unsubscribe = emitter.subscribe('test', callback)

		const event = { type: 'test' as TestEventType, payload: { value: 42 } }
		emitter.emit(event)

		unsubscribe()
		emitter.emit(event)

		expect(callback).toHaveBeenCalledTimes(1)
	})
})
