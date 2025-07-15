<template>
    <OSwitch
         v-model="modelValue"
    />
</template>
<script lang="ts" setup>
import { OSwitch } from '@oruga-ui/oruga-next'

const modelValue = defineModel()
</script>
