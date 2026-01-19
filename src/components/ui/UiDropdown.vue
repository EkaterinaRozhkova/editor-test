<template>
  <div ref="dropdownRef" class="ui-dropdown" :class="{ 'is-open': isOpen }">
    <button
      @click="toggleDropdown"
      :class="buttonClass"
      class="ui-dropdown-button"
      :title="title"
    >
      <slot name="button-content"></slot>
      <svg
        v-if="showChevron"
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="chevron"
      >
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </button>
    <div
      v-if="isOpen"
      class="ui-dropdown-menu"
      :class="menuClass"
      :style="menuStyle"
    >
      <slot name="menu-content"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onClickOutside } from '@vueuse/core'

interface Props {
  isOpen: boolean
  title?: string
  buttonClass?: string | Record<string, boolean>
  menuClass?: string
  showChevron?: boolean
  menuWidth?: number
}

const props = withDefaults(defineProps<Props>(), {
  showChevron: true,
  title: '',
  menuClass: '',
  menuWidth: 180
})

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  'toggle': []
}>()

const dropdownRef = ref<HTMLElement | null>(null)

const menuStyle = computed(() => {
  const width = `${props.menuWidth}px`

  return {
    width,
    minWidth: width
  }
})

const toggleDropdown = () => {
  emit('update:isOpen', !props.isOpen)
  emit('toggle')
}

onClickOutside(dropdownRef, () => {
  if (props.isOpen) {
    emit('update:isOpen', false)
  }
})
</script>

<style scoped>
.ui-dropdown {
  position: relative;
}

.ui-dropdown-button {
  width: max-content;
  gap: 4px;
  padding: 3px 5px;
  border: 1px solid var(--button-border);
  background: var(--button-bg);
  border-radius: 4px;
  cursor: pointer;
  font-size: 10px;
  font-weight: 500;
  color: var(--button-text);
  transition: all 0.15s ease;
  min-height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ui-dropdown-button:hover {
  background: var(--button-hover-bg);
  border-color: var(--button-hover-border);
}

.ui-dropdown-button:active {
  background: var(--button-active-bg);
}

.ui-dropdown-button.is-active {
  background: var(--button-is-active-bg);
  color: var(--button-is-active-text);
  border-color: var(--button-is-active-border);
}

.ui-dropdown-button .chevron {
  margin-left: 2px;
  transition: transform 0.2s ease;
}

.ui-dropdown.is-open .dropdown-button .chevron {
  transform: rotate(180deg);
}

.ui-dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: var(--button-bg);
  border: 1px solid var(--button-border);
  border-radius: 4px;
  box-shadow: var(--dropdown-shadow);
  z-index: 1000;
  overflow: hidden;
}
</style>
