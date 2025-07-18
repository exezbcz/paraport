import type { BridgeAdapter, BridgeProtocol } from '../types/bridges'

export default class BridgeRegistry {
	private bridges: Map<BridgeProtocol, BridgeAdapter> = new Map()

	register(bridge: BridgeAdapter): void {
		this.bridges.set(bridge.protocol, bridge)
	}

	get(protocol: BridgeProtocol): BridgeAdapter {
		const bridge = this.bridges.get(protocol)

		if (!bridge) {
			throw new Error(`No bridge found for protocol: ${protocol}`)
		}

		return bridge
	}

	getAll(): BridgeAdapter[] {
		return Array.from(this.bridges.values())
	}
}
