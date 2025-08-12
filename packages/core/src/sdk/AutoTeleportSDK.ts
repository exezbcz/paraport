import { GenericEmitter } from '@/base/GenericEmitter'
import { Initializable } from '@/base/Initializable'
import BridgeRegistry from '@/bridges/BridgeRegistry'
import XCMBridge from '@/bridges/xcm/XCMBridge'
import { SDKConfigManager } from '@/config/SDKConfigManager'
import SessionManager from '@/managers/SessionManager'
import { TeleportManager } from '@/managers/TeleportManager'
import BalanceService from '@/services/BalanceService'
import { Logger } from '@/services/LoggerService'
import SubstrateApi from '@/services/SubstrateApi'
import { Asset, Chain, type Quote, type SDKConfig } from '@/types/common'
import {
	type AutoTeleportSessionCalculation,
	type AutoTeleportSessionEventType,
	type TeleportSession,
	type TeleportSessionPayload,
	TeleportSessionStatus,
} from '@/types/sdk'
import {
	type TeleportEventPayload,
	TeleportEventType,
	type TeleportEventTypeString,
	type TeleportParams,
} from '@/types/teleport'
import { convertToBigInt } from '@/utils/number'

export default class AutoTeleportSDK extends Initializable {
	private readonly teleportManager: TeleportManager
	private readonly config: SDKConfig
	private readonly bridgeRegistry = new BridgeRegistry()
	private readonly balanceService: BalanceService
	private readonly subApi: SubstrateApi
	private readonly logger: Logger
	private readonly sessionManager: SessionManager

	constructor(config: SDKConfig<false>) {
		super()
		const combinedConfig = SDKConfigManager.getDefaultConfig(config)
		SDKConfigManager.validateConfig(combinedConfig)
		this.config = combinedConfig

		this.subApi = new SubstrateApi()
		this.logger = new Logger({ minLevel: this.config.logLevel })
		this.balanceService = new BalanceService(this.subApi, this.logger)
		this.sessionManager = new SessionManager(new GenericEmitter())

		this.teleportManager = new TeleportManager(
			new GenericEmitter<TeleportEventPayload, TeleportEventTypeString>(),
			this.bridgeRegistry,
			this.config,
			this.subApi,
			this.logger,
		)
	}

	async initialize() {
		if (this.isInitialized()) {
			throw new Error('SDK already initialized')
		}

		try {
			if (this.config.bridgeProtocols?.includes('XCM')) {
				this.bridgeRegistry.register(
					new XCMBridge(this.config, this.balanceService, this.subApi),
				)
			}

			await Promise.all(
				this.bridgeRegistry.getAll().map((bridge) => bridge.initialize()),
			)

			this.registerListeners()

			this.markInitialized()

			this.logger.info('SDK initialized successfully')
		} catch (error: unknown) {
			if (error instanceof Error) {
				throw new Error(`Failed to initialize SDK: ${error.message}`)
			}
			throw new Error('Failed to initialize SDK: Unknown error')
		}
	}

	onSession(
		event: AutoTeleportSessionEventType | `${AutoTeleportSessionEventType}`,
		callback: (item: TeleportSessionPayload) => void,
	): void {
		this.sessionManager.subscribe(event, callback)
	}

	onTeleport(
		event: TeleportEventType | `${TeleportEventType}`,
		callback: (item: TeleportEventPayload) => void,
	): void {
		this.teleportManager.subscribe(event, callback)
	}

	private async getQuotes(params: TeleportParams): Promise<Quote[]> {
		const bridges = this.bridgeRegistry.getAll()

		const quotePromises = bridges.map((bridge) =>
			bridge.getQuote(params).catch(() => null),
		)

		const results = await Promise.all(quotePromises)

		return results.filter((quote): quote is Quote => quote !== null)
	}

	private subscribeBalanceChanges(
		params: TeleportParams,
		callback: () => void,
	) {
		return this.balanceService.subscribeBalances(
			{
				address: params.address,
				asset: params.asset,
				chains: this.config?.chains || [],
			},
			callback,
		)
	}

	private async calculateTeleport(
		params: TeleportParams,
	): Promise<AutoTeleportSessionCalculation> {
		const hasEnoughBalance = await this.balanceService.hasEnoughBalance(params)

		if (hasEnoughBalance) {
			return {
				quotes: {
					available: [],
					selected: undefined,
					bestQuote: undefined,
				},
				funds: {
					needed: false,
					available: false,
					noFundsAtAll: false,
				},
			}
		}

		const quotes = await this.getQuotes(params)

		const bestQuote = this.teleportManager.selectBestQuote(quotes)

		return {
			quotes: {
				available: quotes,
				selected: bestQuote,
				bestQuote: bestQuote,
			},
			funds: {
				needed: !hasEnoughBalance,
				available: quotes.length > 0,
				noFundsAtAll: !hasEnoughBalance && quotes.length === 0,
			},
		}
	}

	async initSession(p: TeleportParams<string>): Promise<TeleportSession> {
		this.ensureInitialized()
		this.validateTeleportParams(p)

		const params = convertToBigInt(p, ['amount'])

		const { quotes, funds } = await this.calculateTeleport(params)

		const unsubscribe = await this.subscribeBalanceChanges(params, async () => {
			const newState = await this.calculateTeleport(params)

			this.sessionManager.updateSession(sessionId, {
				quotes: newState.quotes,
				funds: newState.funds,
			})
		})

		const sessionId = this.sessionManager.createSession(params, {
			status: TeleportSessionStatus.Ready,
			quotes,
			funds,
			unsubscribe,
		})

		const session = this.sessionManager.getItem(sessionId)

		if (!session) {
			throw new Error('Session not found')
		}

		return session
	}

	public async executeSession(sessionId: string): Promise<string> {
		this.ensureInitialized()

		if (!this.teleportManager) {
			throw new Error('No teleport manager found.')
		}

		const session = this.sessionManager.getItem(sessionId)

		if (!session?.quotes.selected || !session?.funds.needed) {
			throw new Error('Invalid session or no quote selected')
		}

		session.unsubscribe()

		const teleport = await this.teleportManager.createTeleport(
			session.params,
			session.quotes.selected,
		)

		this.sessionManager.updateSession(sessionId, {
			teleportId: teleport.id,
		})

		this.teleportManager.initiateTeleport(
			teleport,
			session.params,
			session.quotes.selected,
		)

		return teleport.id
	}

	public retrySession(sessionId: string): void {
		const session = this.sessionManager.getItem(sessionId)

		if (!session?.teleportId) {
			throw new Error('Session has no teleport ID')
		}

		this.teleportManager.retryTeleport(session.teleportId)
	}

	private registerListeners() {
		if (!this.teleportManager) return

		this.teleportManager.subscribe(
			TeleportEventType.TELEPORT_STARTED,
			(payload) => {
				const session = this.sessionManager.getSessionByTeleportId(payload.id)

				console.log('session', session)

				if (!session) return

				this.sessionManager.updateSession(session.id, {
					status: TeleportSessionStatus.Processing,
				})
			},
		)

		this.teleportManager.subscribe(
			TeleportEventType.TELEPORT_COMPLETED,
			(payload) => {
				const session = this.sessionManager.getSessionByTeleportId(payload.id)

				if (!session) return

				this.sessionManager.updateSession(session.id, {
					status: TeleportSessionStatus.Completed,
				})
			},
		)
	}

	private validateTeleportParams(params: TeleportParams<string>) {
		const validAsset = Object.values(Asset).includes(params.asset)
		const validChain = Object.values(Chain).includes(params.chain)
		const validAmount = BigInt(params.amount) > BigInt(0)

		const validActions = [].every(
			(action) =>
				Object.hasOwn(action, 'section') && Object.hasOwn(action, 'method'),
		)

		const validAddress = Boolean(params.address) // TODO: validate address

		const valid =
			validActions && validAddress && validAsset && validAmount && validChain

		if (!valid) {
			throw new Error('Invalid actions')
		}
	}
}
