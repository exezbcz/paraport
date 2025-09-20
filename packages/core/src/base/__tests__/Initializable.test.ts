import { describe, expect, it } from 'vitest'
import { Initializable } from '../Initializable'

class TestInitializable extends Initializable {
	public async initialize(): Promise<void> {
		this.markInitialized()
	}

	public async testEnsureInitialized(): Promise<void> {
		await this.ensureInitialized()
	}
}

describe('Initializable', () => {
	it('should start as not initialized', () => {
		const initializable = new TestInitializable()
		expect(initializable.isInitialized()).toBe(false)
	})

	it('should be initialized after calling initialize()', async () => {
		const initializable = new TestInitializable()
		await initializable.initialize()
		expect(initializable.isInitialized()).toBe(true)
	})

	it('should throw error when accessing protected method before initialization', async () => {
		const initializable = new TestInitializable()
		await expect(initializable.testEnsureInitialized()).rejects.toThrow(
			'Not initialized. Call initialize() first',
		)
	})

	it('should not throw error when accessing protected method after initialization', async () => {
		const initializable = new TestInitializable()
		await initializable.initialize()
		await expect(initializable.testEnsureInitialized()).resolves.not.toThrow()
	})
})
