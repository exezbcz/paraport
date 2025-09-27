<template>
    <span>{{ formattedAmount }}</span>
</template>

<script setup lang="ts">
import { formatAmount } from '@/utils/amount'
import { chainPropListOf } from '@paraport/core'
import { Chain } from '@paraport/core'
import { computed } from 'vue'

const props = defineProps<{
	amount: number | string | bigint
	chain: Chain
}>()

const chainProperties = computed(() => chainPropListOf(props.chain))
const decimals = computed(() => chainProperties.value.tokenDecimals)
const symbol = computed(() => chainProperties.value.tokenSymbol)
const formattedAmount = computed(() =>
	formatAmount(props.amount, decimals.value, symbol.value),
)
</script>
