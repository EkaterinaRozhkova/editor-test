<template>
  <component :is="iconComponent" v-if="iconComponent" />
</template>

<script setup lang="ts">
import { shallowRef, watch } from 'vue'

const props = defineProps<{
  name: string
}>()

const iconComponent = shallowRef<any>(null)

const loadIcon = async (iconName: string) => {
  try {
    const icon = await import(`../../assets/icons/${iconName}.svg`)
    iconComponent.value = icon.default
  } catch (error) {
    console.error(`Icon "${iconName}" not found:`, error)
    iconComponent.value = null
  }
}

watch(() => props.name, (newName) => {
  loadIcon(newName)
}, { immediate: true })
</script>

<style scoped>
svg {
  display: block;
}
</style>
