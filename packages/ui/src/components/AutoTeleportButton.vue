
<template>
    <div class="button-wrapper">
        <div v-if="laoding"> 
            <span> Loading... </span>    
        </div>

        <button id="button" v-else>
            <span> AutoTeleport </span>
        </button>
    </div>
</template>

<script setup lang="ts">
import { ref, inject, onBeforeMount } from 'vue'
import { type AutoTeleportSDK } from '@autoteleport/core'

const sdk = inject('sdk') as AutoTeleportSDK

const laoding = ref(true)

onBeforeMount(async () => {
    console.log('AutoTeleportSDK', sdk)

    await sdk.initialize()

    const quotes = await sdk.getQuotes({
    address: 'CykZSc3szpVd95PmmJ45wE4ez7Vj3xkhRFS9H4U1WdrkaFY',
    amount: '1000000000000',
    sourceChain: 'Polkadot' as const,
    asset: 'DOT' as const,
    actions: [
        {
        section: 'balances',
        method: 'transferAllowDeath',
        args: [
            'CykZSc3szpVd95PmmJ45wE4ez7Vj3xkhRFS9H4U1WdrkaFY',
            '1000000000000',
            ]
        },
    ]})

    laoding.value = false

    console.log('Quotes', quotes)
})
</script>

<style lang="scss" scoped>
.button-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;

    #button {
        width: 100%;
        padding: 10px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s ease;

        &:hover {
            background-color: #45a049;
        }

        span {
            font-weight: bold;
        }
    }
}
</style>
