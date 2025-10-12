/** Interface implemented by classes that require asynchronous initialization. */
export type IInitializable = {
	initialize(): Promise<void>
}

/**
 * Base class for components that require an explicit initialize() call
 * prior to usage.
 */
export abstract class Initializable implements IInitializable {
	private initialized = false

	/**
	 * Throws if the instance has not been initialized.
	 * @returns Promise resolved when the instance is initialized
	 * @throws Error when not initialized
	 */
	protected async ensureInitialized(): Promise<void> {
		if (!this.initialized) {
			throw new Error('Not initialized. Call initialize() first')
		}
	}

	public abstract initialize(): Promise<void>

	/** Marks the instance as initialized. */
	protected markInitialized(): void {
		this.initialized = true
	}

	/**
	 * Indicates whether the instance has completed initialization.
	 * @returns True if initialized
	 */
	public isInitialized(): boolean {
		return this.initialized
	}
}
