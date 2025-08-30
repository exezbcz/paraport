<template>
    <div class="rounded-full bg-accent-background">
        <div class="animate-spin text-accent-blue">
            <LoaderCircle :size="20" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { LoaderCircle } from 'lucide-vue-next'
</script>
