<template>
    <div class="button-wrapper bg-red-100">

        <Button
            expanded
            :disabled="laoding"
            :label="label"
        />
    </div>
</template>

<script setup lang="ts">
import { Asset, type AutoTeleportSDK, Chain } from '@autoteleport/core'
import { computed, inject, onBeforeMount, ref } from 'vue'
import Button from './ui/Button.vue'

const sdk = inject('sdk') as AutoTeleportSDK

const laoding = ref(true)

const label = computed(() => {
	return laoding.value ? 'Loading...' : 'Teleport'
})

onBeforeMount(async () => {
	console.log('AutoTeleportSDK', sdk)

	if (!sdk.isInitialized()) {
		await sdk.initialize()
	}

	const quotes = await sdk.getQuotes({
		address: 'CykZSc3szpVd95PmmJ45wE4ez7Vj3xkhRFS9H4U1WdrkaFY',
		amount: '1000000000000',
		sourceChain: Chain.POLKADOT,
		asset: Asset.DOT,
		actions: [
			{
				section: 'balances',
				method: 'transferAllowDeath',
				args: [
					'CykZSc3szpVd95PmmJ45wE4ez7Vj3xkhRFS9H4U1WdrkaFY',
					'1000000000000',
				],
			},
		],
	})

	laoding.value = false

	console.log('Quotes', quotes)
})
</script>

<style scoped>
.button-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
}
</style>
