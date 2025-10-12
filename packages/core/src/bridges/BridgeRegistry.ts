import type { BridgeAdapter, BridgeProtocol } from '@/types/bridges'

/** Registry for bridge adapters keyed by their protocol. */
export default class BridgeRegistry {
	private bridges: Map<BridgeProtocol, BridgeAdapter> = new Map()

	/**
	 * Registers a bridge implementation for its protocol.
	 * @param bridge - Bridge adapter instance
	 */
	register(bridge: BridgeAdapter): void {
		this.bridges.set(bridge.protocol, bridge)
	}

	/**
	 * Retrieves a registered bridge by protocol.
	 * @param protocol - Bridge protocol key
	 * @returns Bridge adapter instance
	 * @throws Error if not found
	 */
	get(protocol: BridgeProtocol): BridgeAdapter {
		const bridge = this.bridges.get(protocol)

		if (!bridge) {
			throw new Error(`No bridge found for protocol: ${protocol}`)
		}

		return bridge
	}

	/**
	 * Lists all registered bridges.
	 * @returns Array of bridge adapters
	 */
	getAll(): BridgeAdapter[] {
		return Array.from(this.bridges.values())
	}
}
