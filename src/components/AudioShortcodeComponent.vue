<template>
  <node-view-wrapper class="audio-shortcode-wrapper">
    <div
      class="audio-shortcode"
      :class="{ 'text-right': node.attrs.textPosition === 'right' }"
    >
      <span
        v-if="node.attrs.text && node.attrs.textPosition === 'left'"
        class="audio-text audio-text-left"
        contenteditable="true"
        @blur="updateText"
        ref="textLeft"
      >
        {{ node.attrs.text }}
      </span>

      <audio
        controls
        :src="node.attrs.path"
        class="audio-player"
      >
        Ваш браузер не поддерживает аудио элемент.
      </audio>

      <span
        v-if="node.attrs.text && node.attrs.textPosition === 'right'"
        class="audio-text audio-text-right"
        contenteditable="true"
        @blur="updateText"
        ref="textRight"
      >
        {{ node.attrs.text }}
      </span>
    </div>

    <div v-if="selected" class="audio-controls">
      <button @click="togglePosition" class="control-btn">
        {{ node.attrs.textPosition === 'left' ? '← Текст слева' : 'Текст справа →' }}
      </button>
      <button @click="deleteNode" class="control-btn delete-btn">Удалить</button>
    </div>
  </node-view-wrapper>
</template>

<script setup lang="ts">
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/vue-3'
import { ref } from 'vue'

interface AudioShortcodeAttrs {
  path: string
  text: string
  textPosition: 'left' | 'right'
}

interface Props extends NodeViewProps {
  node: NodeViewProps['node'] & {
    attrs: AudioShortcodeAttrs
  }
}

const props = defineProps<Props>()

const textLeft = ref<HTMLSpanElement>()
const textRight = ref<HTMLSpanElement>()

const updateText = (e: FocusEvent) => {
  const target = e.target as HTMLSpanElement
  props.updateAttributes({
    text: target.innerText,
  })
}

const togglePosition = () => {
  props.updateAttributes({
    textPosition: props.node.attrs.textPosition === 'left' ? 'right' : 'left',
  })
}
</script>

<style scoped>
.audio-shortcode-wrapper {
  margin: 1rem 0;
}

.audio-shortcode {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  border: 2px solid transparent;
  border-radius: 8px;
  background: #f5f5f5;
}

.audio-shortcode.text-right {
  flex-direction: row-reverse;
}

.audio-text {
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
  min-width: 100px;
  outline: none;
}

.audio-text:focus {
  background: #fff9e6;
  box-shadow: 0 0 0 2px #ffd700;
}

.audio-player {
  flex: 1;
  max-width: 400px;
}

.audio-controls {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.control-btn {
  padding: 0.25rem 0.75rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.control-btn:hover {
  background: #0056b3;
}

.delete-btn {
  background: #dc3545;
}

.delete-btn:hover {
  background: #c82333;
}
</style>
