<template>
    <Modal v-model="isOpen">
        <h1>Hello</h1>
    </Modal>
</template>

<script setup lang="ts">
import Modal from './ui/Modal/Modal.vue'

const isOpen = defineModel<boolean>()
</script>
