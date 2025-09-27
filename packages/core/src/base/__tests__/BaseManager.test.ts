import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	type BaseDetails,
	type BaseDetailsEvent,
	BaseManager,
} from '../BaseManager'
import { GenericEmitter } from '../GenericEmitter'

type TestStatus = 'idle' | 'running' | 'completed' | 'error'

interface TestEvent extends BaseDetailsEvent {
	type: string
	timestamp: number
	data: unknown
}

interface TestDetails extends BaseDetails<TestStatus, TestEvent> {
	id: string
	status: TestStatus
	events: TestEvent[]
	timestamp: number
	error?: string
	customField?: string
}

class TestManager extends BaseManager<
	TestDetails,
	TestStatus,
	TestEvent,
	'test-update' | 'other-update'
> {
	constructor(
		emitter: GenericEmitter<TestDetails, 'test-update' | 'other-update'>,
	) {
		super(emitter)
	}

	protected getUpdateEventType(): 'test-update' | 'other-update' {
		return 'test-update'
	}

	public testSetItem(id: string, item: TestDetails, emitUpdate = true): void {
		this.setItem(id, item, emitUpdate)
	}

	public createTestItem(id: string, status: TestStatus = 'idle'): TestDetails {
		const item: TestDetails = {
			id,
			status,
			events: [],
			timestamp: Date.now(),
		}
		this.setItem(id, item)
		return item
	}
}

describe('BaseManager', () => {
	let emitter: GenericEmitter<TestDetails, 'test-update' | 'other-update'>
	let manager: TestManager
	let mockDate: number

	beforeEach(() => {
		emitter = new GenericEmitter()
		manager = new TestManager(emitter)
		mockDate = 1234567890
		vi.spyOn(Date, 'now').mockImplementation(() => mockDate)
	})

	describe('Item Management', () => {
		it('should add and retrieve items', () => {
			const item = manager.createTestItem('item-1')

			expect(manager.getItem('item-1')).toEqual(item)
			expect(manager.getAllItems()).toHaveLength(1)
			expect(manager.getAllItems()[0]).toEqual(item)
		})

		it('should get items by predicate', () => {
			manager.createTestItem('item-1', 'idle')
			manager.createTestItem('item-2', 'running')
			manager.createTestItem('item-3', 'completed')

			const runningItems = manager.getItemsWhere(
				(item) => item.status === 'running',
			)
			expect(runningItems).toHaveLength(1)
			expect(runningItems[0].id).toBe('item-2')
		})

		it('should remove items', () => {
			manager.createTestItem('item-1')
			expect(manager.getItem('item-1')).toBeDefined()

			const result = manager.removeItem('item-1')
			expect(result).toBe(true)
			expect(manager.getItem('item-1')).toBeUndefined()
			expect(manager.removeItem('non-existent')).toBe(false)
		})

		it('should update items', () => {
			manager.createTestItem('item-1')

			const spy = vi.spyOn(emitter, 'emit')
			const updatedItem = manager.updateItem('item-1', {
				customField: 'updated',
			})

			expect(updatedItem?.customField).toBe('updated')
			expect(manager.getItem('item-1')?.customField).toBe('updated')
			expect(spy).toHaveBeenCalled()
			expect(
				manager.updateItem('non-existent', { customField: 'test' }),
			).toBeUndefined()
		})

		it('should update items without emitting events when specified', () => {
			manager.createTestItem('item-1')

			const spy = vi.spyOn(emitter, 'emit')
			manager.updateItem('item-1', { customField: 'updated' }, false)

			expect(manager.getItem('item-1')?.customField).toBe('updated')
			expect(spy).not.toHaveBeenCalled()
		})
	})

	describe('Event Handling', () => {
		it('should add events to items', () => {
			manager.createTestItem('item-1')

			const testEvent: TestEvent = {
				type: 'test-event',
				timestamp: mockDate,
				data: { value: 'test' },
			}

			manager.addEvent('item-1', testEvent)

			const item = manager.getItem('item-1')
			expect(item?.events).toHaveLength(1)
			expect(item?.events[0]).toEqual(testEvent)
		})

		it('should ignore addEvent for non-existent items', () => {
			const testEvent: TestEvent = {
				type: 'test-event',
				timestamp: mockDate,
				data: { value: 'test' },
			}

			expect(() => manager.addEvent('non-existent', testEvent)).not.toThrow()
		})

		it('should update status and add status-update event', () => {
			manager.createTestItem('item-1', 'idle')

			manager.updateStatus('item-1', 'running')

			const item = manager.getItem('item-1')
			expect(item?.status).toBe('running')
			expect(item?.events).toHaveLength(1)
			expect(item?.events[0].type).toBe('status-update')
			expect(item?.events[0].data).toEqual({
				status: 'running',
				error: undefined,
			})
		})

		it('should update status with error', () => {
			manager.createTestItem('item-1', 'idle')

			manager.updateStatus('item-1', 'error', { error: 'Test error' })

			const item = manager.getItem('item-1')
			expect(item?.status).toBe('error')
			expect(item?.error).toBe('Test error')
			expect(item?.events[0].data).toEqual({
				status: 'error',
				error: 'Test error',
			})
		})

		it('should ignore updateStatus for non-existent items', () => {
			expect(() =>
				manager.updateStatus('non-existent', 'running'),
			).not.toThrow()
		})
	})

	describe('Event Emission', () => {
		it('should emit events when items are updated', () => {
			const spy = vi.spyOn(emitter, 'emit')
			manager.createTestItem('item-1')

			expect(spy).toHaveBeenCalledWith({
				type: 'test-update',
				payload: expect.objectContaining({ id: 'item-1' }),
			})
		})

		it('should not emit events when emitUpdate is false', () => {
			const item = manager.createTestItem('item-1')

			const spy = vi.spyOn(emitter, 'emit')
			spy.mockClear()

			manager.testSetItem('item-1', item, false)
			expect(spy).not.toHaveBeenCalled()
		})
	})

	describe('Subscription', () => {
		it('should subscribe to events and receive updates', () => {
			const callback = vi.fn()
			const unsubscribe = manager.subscribe('test-update', callback)

			manager.createTestItem('item-1')

			expect(callback).toHaveBeenCalledWith(
				expect.objectContaining({
					id: 'item-1',
					status: 'idle',
				}),
			)

			unsubscribe()
			callback.mockClear()

			manager.createTestItem('item-1')
			expect(callback).not.toHaveBeenCalled()
		})

		it('should handle multiple subscribers', () => {
			const callback1 = vi.fn()
			const callback2 = vi.fn()

			manager.subscribe('test-update', callback1)
			manager.subscribe('test-update', callback2)

			manager.createTestItem('item-multi')

			expect(callback1).toHaveBeenCalledWith(
				expect.objectContaining({
					id: 'item-multi',
				}),
			)
			expect(callback2).toHaveBeenCalledWith(
				expect.objectContaining({
					id: 'item-multi',
				}),
			)
		})

		it('should not receive events for other event types', () => {
			const callback = vi.fn()
			manager.subscribe('other-update', callback)

			manager.createTestItem('item-1')

			expect(callback).not.toHaveBeenCalled()
		})
	})
})
