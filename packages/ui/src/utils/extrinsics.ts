import type { Action } from '@autoteleport/core'

type ExtrinsicDetails = {
	docs: string
}

const EXTRINSICS_DETAILS_MAP: Record<
	string,
	Record<string, ExtrinsicDetails>
> = {
	system: {
		remark: {
			docs: 'On-chain remark',
		},
		setHeapPages: {
			docs: 'Set heap pages',
		},
		setCode: {
			docs: 'Set runtime code',
		},
		setCodeWithoutChecks: {
			docs: 'Set code unchecked',
		},
		setStorage: {
			docs: 'Set storage items',
		},
		killStorage: {
			docs: 'Kill storage items',
		},
		killPrefix: {
			docs: 'Kill storage prefix',
		},
		remarkWithEvent: {
			docs: 'Remark with event',
		},
		authorizeUpgrade: {
			docs: 'Authorize upgrade',
		},
		authorizeUpgradeWithoutChecks: {
			docs: 'Authorize upgrade unchecked',
		},
		applyAuthorizedUpgrade: {
			docs: 'Apply upgrade',
		},
	},
	parachainSystem: {
		setValidationData: {
			docs: 'Set validation data',
		},
		sudoSendUpwardMessage: {
			docs: 'Send upward message',
		},
	},
	timestamp: {
		set: {
			docs: 'Set timestamp',
		},
	},
	parachainInfo: {},
	balances: {
		transferAllowDeath: {
			docs: 'Transfer funds',
		},
		forceTransfer: {
			docs: 'Force transfer',
		},
		transferKeepAlive: {
			docs: 'Transfer keep alive',
		},
		transferAll: {
			docs: 'Transfer all funds',
		},
		forceUnreserve: {
			docs: 'Force unreserve',
		},
		upgradeAccounts: {
			docs: 'Upgrade account',
		},
		forceSetBalance: {
			docs: 'Force set balance',
		},
		forceAdjustTotalIssuance: {
			docs: 'Adjust total issuance',
		},
		burn: {
			docs: 'Burn funds',
		},
	},
	vesting: {
		vest: {
			docs: 'Unlock vested funds',
		},
		vestOther: {
			docs: "Unlock other's funds",
		},
		vestedTransfer: {
			docs: 'Create vested transfer',
		},
		forceVestedTransfer: {
			docs: 'Force vested transfer',
		},
		mergeSchedules: {
			docs: 'Merge vesting schedules',
		},
		forceRemoveVestingSchedule: {
			docs: 'Force remove vesting',
		},
	},
	collatorSelection: {
		setInvulnerables: {
			docs: 'Set invulnerables',
		},
		setDesiredCandidates: {
			docs: 'Set desired candidates',
		},
		setCandidacyBond: {
			docs: 'Set candidacy bond',
		},
		registerAsCandidate: {
			docs: 'Register candidate',
		},
		leaveIntent: {
			docs: 'Leave intent',
		},
		addInvulnerable: {
			docs: 'Add invulnerable',
		},
		removeInvulnerable: {
			docs: 'Remove invulnerable',
		},
		updateBond: {
			docs: 'Update bond',
		},
		takeCandidateSlot: {
			docs: 'Take candidate slot',
		},
	},
	session: {
		setKeys: {
			docs: 'Set session keys',
		},
		purgeKeys: {
			docs: 'Purge session keys',
		},
	},
	xcmpQueue: {
		suspendXcmExecution: {
			docs: 'Suspend XCM',
		},
		resumeXcmExecution: {
			docs: 'Resume XCM',
		},
		updateSuspendThreshold: {
			docs: 'Update suspend threshold',
		},
		updateDropThreshold: {
			docs: 'Update drop threshold',
		},
		updateResumeThreshold: {
			docs: 'Update resume threshold',
		},
	},
	polkadotXcm: {
		send: {
			docs: 'Send XCM message',
		},
		teleportAssets: {
			docs: 'Teleport assets',
		},
		reserveTransferAssets: {
			docs: 'Reserve transfer assets',
		},
		execute: {
			docs: 'Execute XCM message',
		},
		forceXcmVersion: {
			docs: 'Force XCM version',
		},
		forceDefaultXcmVersion: {
			docs: 'Force default version',
		},
		forceSubscribeVersionNotify: {
			docs: 'Subscribe XCM updates',
		},
		forceUnsubscribeVersionNotify: {
			docs: 'Unsubscribe XCM updates',
		},
		limitedReserveTransferAssets: {
			docs: 'Limited reserve transfer',
		},
		limitedTeleportAssets: {
			docs: 'Limited teleport assets',
		},
		forceSuspension: {
			docs: 'Force suspension',
		},
		transferAssets: {
			docs: 'Transfer Assets',
		},
		claimAssets: {
			docs: 'Claim Trapped Assets',
		},
		transferAssetsUsingTypeAndThen: {
			docs: 'Transfer Assets typed',
		},
	},
	cumulusXcm: {},
	toPolkadotXcmRouter: {
		reportBridgeStatus: {
			docs: 'Report bridge status',
		},
	},
	messageQueue: {
		reapPage: {
			docs: 'Remove page',
		},
		executeOverweight: {
			docs: 'Execute overweight message',
		},
	},
	utility: {
		batch: {
			docs: 'Send batch calls',
		},
		asDerivative: {
			docs: 'Send indexed pseudonym',
		},
		batchAll: {
			docs: 'Send batch atomically',
		},
		dispatchAs: {
			docs: 'Dispatch with origin',
		},
		forceBatch: {
			docs: 'Send batch errors',
		},
		withWeight: {
			docs: 'Send weight',
		},
	},
	multisig: {
		asMultiThreshold1: {
			docs: 'Dispatch multi-signature',
		},
		asMulti: {
			docs: 'Register multi-signature',
		},
		approveAsMulti: {
			docs: 'Approve multi-signature',
		},
		cancelAsMulti: {
			docs: 'Cancel multi-signature',
		},
	},
	proxy: {
		proxy: {
			docs: 'Dispatch proxy call',
		},
		addProxy: {
			docs: 'Register proxy',
		},
		removeProxy: {
			docs: 'Unregister proxy',
		},
		removeProxies: {
			docs: 'Unregister all proxies',
		},
		createPure: {
			docs: 'Spawn pure proxy',
		},
		killPure: {
			docs: 'Remove pure proxy',
		},
		announce: {
			docs: 'Publish proxy hash',
		},
		removeAnnouncement: {
			docs: 'Remove announcement',
		},
		rejectAnnouncement: {
			docs: 'Reject announcement',
		},
		proxyAnnounced: {
			docs: 'Dispatch announced proxy',
		},
	},
	assets: {
		create: {
			docs: 'Create Asset',
		},
		forceCreate: {
			docs: 'Force create Asset',
		},
		startDestroy: {
			docs: 'Start Destroy Asset',
		},
		destroyAccounts: {
			docs: 'Destroy Asset Accounts',
		},
		destroyApprovals: {
			docs: 'Destroy Asset Approvals',
		},
		finishDestroy: {
			docs: 'Finish Destroy Asset',
		},
		mint: {
			docs: 'Mint Asset',
		},
		burn: {
			docs: 'Burn Asset',
		},
		transfer: {
			docs: 'Transfer Asset',
		},
		transferKeepAlive: {
			docs: 'Transfer Asset KeepAlive',
		},
		forceTransfer: {
			docs: 'Force Transfer Asset',
		},
		freeze: {
			docs: 'Freeze Account',
		},
		thaw: {
			docs: 'Thaw Account',
		},
		freezeAsset: {
			docs: 'Freeze Asset',
		},
		thawAsset: {
			docs: 'Thaw Asset',
		},
		transferOwnership: {
			docs: 'Transfer Ownership',
		},
		setTeam: {
			docs: 'Set Team',
		},
		setMetadata: {
			docs: 'Set Metadata',
		},
		clearMetadata: {
			docs: 'Clear Metadata',
		},
		forceSetMetadata: {
			docs: 'Force Set Metadata',
		},
		forceClearMetadata: {
			docs: 'Force Clear Metadata',
		},
		forceAssetStatus: {
			docs: 'Force Asset Status',
		},
		approveTransfer: {
			docs: 'Approve Transfer',
		},
		cancelApproval: {
			docs: 'Cancel Approval',
		},
		forceCancelApproval: {
			docs: 'Force Cancel Approval',
		},
		transferApproved: {
			docs: 'Transfer Approved',
		},
		touch: {
			docs: 'Create Account',
		},
		refund: {
			docs: 'Refund Account',
		},
		setMinBalance: {
			docs: 'Set Min Balance',
		},
		touchOther: {
			docs: 'Create Other Account',
		},
		refundOther: {
			docs: 'Refund Other Account',
		},
		block: {
			docs: 'Block Account',
		},
		transferAll: {
			docs: 'Transfer All Assets',
		},
	},
	uniques: {
		create: {
			docs: 'Create Collection',
		},
		forceCreate: {
			docs: 'Force Create Collection',
		},
		destroy: {
			docs: 'Destroy Collection',
		},
		mint: {
			docs: 'Mint NFT',
		},
		burn: {
			docs: 'Burn NFT',
		},
		transfer: {
			docs: 'Transfer NFT',
		},
		redeposit: {
			docs: 'Redeposit NFTs',
		},
		freeze: {
			docs: 'Freeze NFT',
		},
		thaw: {
			docs: 'Thaw NFT',
		},
		freezeCollection: {
			docs: 'Freeze Collection',
		},
		thawCollection: {
			docs: 'Thaw Collection',
		},
		transferOwnership: {
			docs: 'Transfer Ownership',
		},
		setTeam: {
			docs: 'Set Team',
		},
		approveTransfer: {
			docs: 'Approve Transfer',
		},
		cancelApproval: {
			docs: 'Cancel Approval',
		},
		forceItemStatus: {
			docs: 'Force Item Status',
		},
		setAttribute: {
			docs: 'Set Attribute',
		},
		clearAttribute: {
			docs: 'Clear Attribute',
		},
		setMetadata: {
			docs: 'Set Metadata',
		},
		clearMetadata: {
			docs: 'Clear Metadata',
		},
		setCollectionMetadata: {
			docs: 'Set Collection Metadata',
		},
		clearCollectionMetadata: {
			docs: 'Clear Collection Metadata',
		},
		setAcceptOwnership: {
			docs: 'Accept Ownership',
		},
		setCollectionMaxSupply: {
			docs: 'Set Max Supply',
		},
		setPrice: {
			docs: 'Set price',
		},
		buyItem: {
			docs: 'Buying',
		},
	},
	nfts: {
		create: {
			docs: 'Create Collection',
		},
		forceCreate: {
			docs: 'Force Create Collection',
		},
		destroy: {
			docs: 'Destroy Collection',
		},
		mint: {
			docs: 'Minting',
		},
		forceMint: {
			docs: 'Force minting',
		},
		burn: {
			docs: 'Burning',
		},
		transfer: {
			docs: 'Transferring',
		},
		redeposit: {
			docs: 'Redeposit',
		},
		lockItemTransfer: {
			docs: 'Lock item transfer',
		},
		unlockItemTransfer: {
			docs: 'Unlock item transfer',
		},
		lockCollection: {
			docs: 'Lock Collection',
		},
		transferOwnership: {
			docs: 'Transfer Ownership',
		},
		setTeam: {
			docs: 'Set Team',
		},
		forceCollectionOwner: {
			docs: 'Force Collection Owner',
		},
		forceCollectionConfig: {
			docs: 'Force Collection Config',
		},
		approveTransfer: {
			docs: 'Approve Transfer',
		},
		cancelApproval: {
			docs: 'Cancel Approval',
		},
		clearAllTransferApprovals: {
			docs: 'Clear All Transfer Approvals',
		},
		lockItemProperties: {
			docs: 'Lock item properties',
		},
		setAttribute: {
			docs: 'Set Attribute',
		},
		forceSetAttribute: {
			docs: 'Force Set Attribute',
		},
		clearAttribute: {
			docs: 'Clear Attribute',
		},
		approveItemAttributes: {
			docs: 'Approve Item Attributes',
		},
		cancelItemAttributesApproval: {
			docs: 'Cancel Item Attributes Approval',
		},
		setMetadata: {
			docs: 'Set Metadata',
		},
		clearMetadata: {
			docs: 'Clear Metadata',
		},
		setCollectionMetadata: {
			docs: 'Set Collection Metadata',
		},
		clearCollectionMetadata: {
			docs: 'Clear Collection Metadata',
		},
		setAcceptOwnership: {
			docs: 'Accept Ownership',
		},
		setCollectionMaxSupply: {
			docs: 'Set Collection Max Supply',
		},
		updateMintSettings: {
			docs: 'Update Mint Settings',
		},
		setPrice: {
			docs: 'Set price',
		},
		buyItem: {
			docs: 'Buying',
		},
		payTips: {
			docs: 'Pay Tips',
		},
		createSwap: {
			docs: 'Create Swap',
		},
		cancelSwap: {
			docs: 'Cancel Swap',
		},
		claimSwap: {
			docs: 'Claim Swap',
		},
		mintPreSigned: {
			docs: 'Mint Pre Signed',
		},
		setAttributesPreSigned: {
			docs: 'Set Attributes Pre Signed',
		},
	},
	foreignAssets: {
		create: {
			docs: 'Create Asset',
		},
		forceCreate: {
			docs: 'Force create Asset',
		},
		startDestroy: {
			docs: 'Start Destroy Asset',
		},
		destroyAccounts: {
			docs: 'Destroy Asset Accounts',
		},
		destroyApprovals: {
			docs: 'Destroy Asset Approvals',
		},
		finishDestroy: {
			docs: 'Finish Destroy Asset',
		},
		mint: {
			docs: 'Mint Asset',
		},
		burn: {
			docs: 'Burn Asset',
		},
		transfer: {
			docs: 'Transfer Asset',
		},
		transferKeepAlive: {
			docs: 'Transfer Asset KeepAlive',
		},
		forceTransfer: {
			docs: 'Force Transfer Asset',
		},
		freeze: {
			docs: 'Freeze Account',
		},
		thaw: {
			docs: 'Thaw Account',
		},
		freezeAsset: {
			docs: 'Freeze Asset',
		},
		thawAsset: {
			docs: 'Thaw Asset',
		},
		transferOwnership: {
			docs: 'Transfer Ownership',
		},
		setTeam: {
			docs: 'Set Team',
		},
		setMetadata: {
			docs: 'Set Metadata',
		},
		clearMetadata: {
			docs: 'Clear Metadata',
		},
		forceSetMetadata: {
			docs: 'Force Set Metadata',
		},
		forceClearMetadata: {
			docs: 'Force Clear Metadata',
		},
		forceAssetStatus: {
			docs: 'Force Asset Status',
		},
		approveTransfer: {
			docs: 'Approve Transfer',
		},
		cancelApproval: {
			docs: 'Cancel Approval',
		},
		forceCancelApproval: {
			docs: 'Force Cancel Approval',
		},
		transferApproved: {
			docs: 'Transfer Approved',
		},
		touch: {
			docs: 'Create Account',
		},
		refund: {
			docs: 'Refund Account',
		},
		setMinBalance: {
			docs: 'Set Min Balance',
		},
		touchOther: {
			docs: 'Create Other Account',
		},
		refundOther: {
			docs: 'Refund Other Account',
		},
		block: {
			docs: 'Block Account',
		},
		transferAll: {
			docs: 'Transfer All Assets',
		},
	},
	nftFractionalization: {
		fractionalize: {
			docs: 'Fractionalize NFT',
		},
		unify: {
			docs: 'Unify NFT',
		},
	},
	poolAssets: {
		create: {
			docs: 'Create Asset',
		},
		forceCreate: {
			docs: 'Force create Asset',
		},
		startDestroy: {
			docs: 'Start Destroy Asset',
		},
		destroyAccounts: {
			docs: 'Destroy Asset Accounts',
		},
		destroyApprovals: {
			docs: 'Destroy Asset Approvals',
		},
		finishDestroy: {
			docs: 'Finish Destroy Asset',
		},
		mint: {
			docs: 'Mint Asset',
		},
		burn: {
			docs: 'Burn Asset',
		},
		transfer: {
			docs: 'Transfer Asset',
		},
		transferKeepAlive: {
			docs: 'Transfer Asset KeepAlive',
		},
		forceTransfer: {
			docs: 'Force Transfer Asset',
		},
		freeze: {
			docs: 'Freeze Account',
		},
		thaw: {
			docs: 'Thaw Account',
		},
		freezeAsset: {
			docs: 'Freeze Asset',
		},
		thawAsset: {
			docs: 'Thaw Asset',
		},
		transferOwnership: {
			docs: 'Transfer Ownership',
		},
		setTeam: {
			docs: 'Set Team',
		},
		setMetadata: {
			docs: 'Set Metadata',
		},
		clearMetadata: {
			docs: 'Clear Metadata',
		},
		forceSetMetadata: {
			docs: 'Force Set Metadata',
		},
		forceClearMetadata: {
			docs: 'Force Clear Metadata',
		},
		forceAssetStatus: {
			docs: 'Force Asset Status',
		},
		approveTransfer: {
			docs: 'Approve Transfer',
		},
		cancelApproval: {
			docs: 'Cancel Approval',
		},
		forceCancelApproval: {
			docs: 'Force Cancel Approval',
		},
		transferApproved: {
			docs: 'Transfer Approved',
		},
		touch: {
			docs: 'Create Account',
		},
		refund: {
			docs: 'Refund Account',
		},
		setMinBalance: {
			docs: 'Set Min Balance',
		},
		touchOther: {
			docs: 'Create Other Account',
		},
		refundOther: {
			docs: 'Refund Other Account',
		},
		block: {
			docs: 'Block Account',
		},
		transferAll: {
			docs: 'Transfer All Assets',
		},
	},
	assetConversion: {
		createPool: {
			docs: 'Create Liquidity Pool',
		},
		addLiquidity: {
			docs: 'Add Liquidity',
		},
		removeLiquidity: {
			docs: 'Remove Liquidity',
		},
		swapExactTokensForTokens: {
			docs: 'Swap Exact Tokens',
		},
		swapTokensForExactTokens: {
			docs: 'Swap For Exact',
		},
		touch: {
			docs: 'Touch Pool',
		},
	},
}

export const getExtrinsicDetails = ({ section, method }: Action) => {
	return EXTRINSICS_DETAILS_MAP?.[section]?.[method]
}
