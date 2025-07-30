export type IInitializable = {
	initialize(): Promise<void>
}

export abstract class Initializable implements IInitializable {
	private initialized = false

	protected async ensureInitialized(): Promise<void> {
		if (!this.initialized) {
			throw new Error('Not initialized. Call initialize() first')
		}
	}

	public abstract initialize(): Promise<void>

	protected markInitialized(): void {
		this.initialized = true
	}

	public isInitialized(): boolean {
		return this.initialized
	}
}
