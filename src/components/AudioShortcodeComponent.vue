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

const deleteNode = () => {
  props.deleteNode()
}
</script>
