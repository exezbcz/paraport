<template>
    <span>{{ formattedAmount }}</span>
</template>

<script setup lang="ts">
import { formatAmount } from '@/utils/amount'
import { getAssetDecimals } from '@paraport/core'
import { Chain } from '@paraport/core'
import { computed } from 'vue'

const props = defineProps<{
	amount: number | string | bigint
	chain: Chain
	asset: string
}>()

const decimals = computed(() => getAssetDecimals(props.chain, props.asset))
const formattedAmount = computed(() =>
	formatAmount(props.amount, decimals.value || 0, props.asset),
)
</script>
