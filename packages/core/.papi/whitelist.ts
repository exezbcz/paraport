import type {
  AhkWhitelistEntry,
  AhpWhitelistEntry,
  DotWhitelistEntry,
  KsmWhitelistEntry,
  HydWhitelistEntry,
} from '../src/descriptors'

const hydrWhitelist: HydWhitelistEntry[] = [
  'api.*',
]

const assetHubWhitelist: AhkWhitelistEntry[] | AhpWhitelistEntry[] = [
  'tx.System.*',
  'tx.Balances.*',
]

const chainWhitelist: DotWhitelistEntry[] | KsmWhitelistEntry[] = [
  'query.*',
]

export const whitelist = [...assetHubWhitelist, ...chainWhitelist, ...hydrWhitelist]
