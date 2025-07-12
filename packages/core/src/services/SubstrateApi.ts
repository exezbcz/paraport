import { ApiFactory } from '@kodadot1/sub-api'
import type { Chain } from '../types'
import { chainPrefixOf } from '../utils'

interface IApiFactory<T> {
	getInstance(chain: Chain): Promise<T>
}

type ApiPromise = Awaited<ReturnType<(typeof ApiFactory)['useApiInstance']>>

export default class SubstrateApi implements IApiFactory<ApiPromise> {
	async getInstance(chain: Chain): Promise<ApiPromise> {
		return ApiFactory.useApiInstance(chainPrefixOf(chain))
	}
}
