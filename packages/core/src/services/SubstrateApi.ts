import { endpointOf } from '@/utils'
import { ApiFactory } from '@kodadot1/sub-api'
import type { Chain } from '@paraport/static'

interface IApiFactory<T> {
	getInstance(chain: Chain): Promise<T>
}

type ApiPromise = Awaited<ReturnType<(typeof ApiFactory)['useApiInstance']>>

export default class SubstrateApi implements IApiFactory<ApiPromise> {
	async getInstance(chain: Chain): Promise<ApiPromise> {
		return ApiFactory.useApiInstance(endpointOf(chain))
	}
}
