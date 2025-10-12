/**
 * Asset utilities built on top of the Paraspell assets catalog.
 *
 * - Look up chain-specific asset metadata (native and foreign)
 * - Produce a Paraspell `TCurrencyInput` for builder APIs (location/alias/id/symbol)
 * - Read existential deposits when provided by the catalog
 * - Check whether an asset is supported for a given origin→destination pair
 */
import type { Asset, Chain } from '@paraport/static'
import {
	ForeignAbstract,
	type TCurrencyInput,
	type TForeignAssetInfo,
	getAssetsObject,
	getSupportedAssets,
} from '@paraspell/sdk'

/**
 * Chain→asset→alias overrides used to disambiguate assets with multiple
 * catalog entries. For example, on AssetHubKusama, DOT is represented as
 * `DOT2` in Paraspell's catalog.
 */
const aliasMap: Partial<Record<Chain, Partial<Record<Asset, string>>>> = {
	AssetHubKusama: {
		DOT: 'DOT2',
	},
}

/**
 * Returns asset metadata (native or foreign) from Paraspell's catalog.
 *
 * - Searches both `nativeAssets` and `otherAssets` for the first match.
 * - When `autoalias` is true (default), additionally requires the entry's
 *   `alias` to match the chain-specific override in `aliasMap` (when present).
 *
 * @param chain - Chain identifier
 * @param symbol - Asset symbol to look up (e.g., 'DOT', 'KSM')
 * @param options.autoalias - Enforce alias matching when configured
 * @returns Matching asset info or undefined when not found
 */
export const getAssetInfo = (
	chain: Chain,
	symbol: Asset,
	{ autoalias = true } = {},
) => {
	const { nativeAssets, otherAssets } = getAssetsObject(chain)
	const alias = aliasMap[chain]?.[symbol]

	return [...nativeAssets, ...otherAssets].find((asset) =>
		autoalias
			? asset.symbol === symbol && asset.alias === alias
			: asset.symbol === symbol,
	)
}

/**
 * Looks up asset metadata and throws when the asset is not found on `chain`.
 *
 * @param chain - Chain identifier
 * @param symbol - Asset symbol to look up
 * @param options.autoalias - Enforce alias matching when configured
 * @throws Error when the asset cannot be found for the chain
 * @returns Matching asset info
 */
export const getAssetInfoOrThrow = (
	chain: Chain,
	symbol: Asset,
	{ autoalias = true } = {},
) => {
	const assetInfo = getAssetInfo(chain, symbol, { autoalias })

	if (!assetInfo) {
		throw new Error(`Asset ${symbol} not found for ${chain}`)
	}

	return assetInfo
}

/**
 * Translates an asset on `chain` to a Paraspell `TCurrencyInput` discriminator.
 *
 * Order of precedence:
 * - If the asset has a `location`, return `{ location }` (ForeignAssets/XCM)
 * - Else if it has an `alias`, return `{ symbol: ForeignAbstract(alias) }`
 * - Else if it has an `assetId`, return `{ id }` (Assets pallet)
 * - Else fall back to `{ symbol }` (native or symbol-only identification)
 *
 * @param chain - Chain identifier
 * @param symbol - Asset symbol
 * @returns Paraspell-compatible currency input discriminator
 * @throws Error when the asset is not present in the catalog for the chain
 */
export const getParaspellCurrencyInput = (
	chain: Chain,
	symbol: Asset,
): TCurrencyInput => {
	const assetInfo = getAssetInfoOrThrow(chain, symbol)

	if (assetInfo.location) {
		return { location: assetInfo.location }
	}

	if (assetInfo.alias) {
		return { symbol: ForeignAbstract(assetInfo.alias) }
	}

	const assetId = (assetInfo as TForeignAssetInfo).assetId

	if (assetId) {
		return { id: assetId }
	}

	return { symbol: assetInfo.symbol }
}

/**
 * Resolves the existential deposit for a given asset on `chain`, when
 * available in the catalog entry.
 *
 * @param chain - Chain identifier
 * @param symbol - Asset symbol
 * @returns Existential deposit value if present; otherwise undefined
 */
export const getAssetExistentialDeposit = (chain: Chain, symbol: Asset) => {
	const asset = getAssetInfo(chain, symbol)

	return asset?.existentialDeposit
}

/**
 * Checks whether `asset` is supported from `origin` to `destination` using
 * Paraspell's `getSupportedAssets` list for the pair.
 *
 * @param origin - Origin chain
 * @param destination - Destination chain
 * @param asset - Asset symbol
 * @returns True when supported; false otherwise
 */
export const isAssetSupported = (
	origin: Chain,
	destination: Chain,
	asset: Asset,
): boolean => {
	const originInfo = getAssetInfo(origin, asset)
	const supported = getSupportedAssets(origin, destination)

	if (originInfo?.alias) {
		return supported.some(
			(info: any) => info.symbol === asset && info.alias === originInfo.alias,
		)
	}

	return supported.some((info: any) => info.symbol === asset)
}
