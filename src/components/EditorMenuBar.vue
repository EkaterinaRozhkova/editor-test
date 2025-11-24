<template>
  <div class="menu-bar" v-if="editor">
    <!-- Дропдаун для типа блока -->
    <div class="button-group">
      <div ref="blockTypeDropdownRef" class="dropdown" :class="{ 'is-open': isBlockTypeDropdownOpen }">
        <button
          @click="toggleBlockTypeDropdown"
          class="dropdown-button"
          title="Тип блока"
        >
          <svg v-if="currentBlockType === 'paragraph'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 6H9a6 6 0 0 0 0 12h4"/><path d="M14 6h2"/><path d="M14 18h2"/><path d="M14 6v12"/></svg>
          <svg v-else-if="currentBlockType === 'heading1'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="m17 12 3-2v8"/></svg>
          <svg v-else-if="currentBlockType === 'heading2'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1"/></svg>
          <svg v-else-if="currentBlockType === 'heading3'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2"/><path d="M17 17.5c2 1.5 4 .3 4-1.5a2 2 0 0 0-2-2"/></svg>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chevron"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div v-if="isBlockTypeDropdownOpen" class="dropdown-menu">
          <button @click="setBlockType('paragraph')" class="dropdown-item" :class="{ 'is-active': currentBlockType === 'paragraph' }">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 6H9a6 6 0 0 0 0 12h4"/><path d="M14 6h2"/><path d="M14 18h2"/><path d="M14 6v12"/></svg>
            <span>Параграф</span>
          </button>
          <button @click="setBlockType('heading1')" class="dropdown-item" :class="{ 'is-active': currentBlockType === 'heading1' }">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="m17 12 3-2v8"/></svg>
            <span>Заголовок 1</span>
          </button>
          <button @click="setBlockType('heading2')" class="dropdown-item" :class="{ 'is-active': currentBlockType === 'heading2' }">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1"/></svg>
            <span>Заголовок 2</span>
          </button>
          <button @click="setBlockType('heading3')" class="dropdown-item" :class="{ 'is-active': currentBlockType === 'heading3' }">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2"/><path d="M17 17.5c2 1.5 4 .3 4-1.5a2 2 0 0 0-2-2"/></svg>
            <span>Заголовок 3</span>
          </button>
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <!-- Математические формулы -->
<!--     <div class="button-group"> -->
<!--       <button -->
<!--         @click="insertInlineFormula" -->
<!--         :class="{ 'is-active': editor.isActive('inlineMath') }" -->
<!--         title="Вставить строчную формулу" -->
<!--       > -->
<!--         <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 14-6 6h9v-3"/><path d="M18 6h-4a4 4 0 1 0 0 8h4"/><path d="M4 6h9a4 4 0 1 1 0 8H4"/></svg> -->
<!--       </button> -->
<!--       <button -->
<!--         @click="insertBlockFormula" -->
<!--         :class="{ 'is-active': editor.isActive('mathBlock') }" -->
<!--         title="Вставить блочную формулу" -->
<!--       > -->
<!--         <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="m8 10 2 2-2 2"/><path d="m16 10-2 2 2 2"/><path d="M8 16h8"/></svg> -->
<!--       </button> -->
<!--     </div> -->

<!--     <div class="divider"></div> -->

    <!-- Форматирование текста -->
    <div class="button-group">
      <button
        @click="editor.chain().focus().toggleBold().run()"
        :class="{ 'is-active': editor.isActive('bold') }"
        title="Жирный (Ctrl+B)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"/></svg>
      </button>
      <button
        @click="editor.chain().focus().toggleItalic().run()"
        :class="{ 'is-active': editor.isActive('italic') }"
        title="Курсив (Ctrl+I)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" x2="10" y1="4" y2="4"/><line x1="14" x2="5" y1="20" y2="20"/><line x1="15" x2="9" y1="4" y2="20"/></svg>
      </button>
      <button
        @click="editor.chain().focus().toggleUnderline().run()"
        :class="{ 'is-active': editor.isActive('underline') }"
        title="Подчеркнутый текст"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4v7a6 6 0 0 0 12 0V4"/><line x1="4" x2="20" y1="21" y2="21"/></svg>
      </button>
      <button
        @click="editor.chain().focus().toggleCode().run()"
        :class="{ 'is-active': editor.isActive('code') }"
        title="Встроенный код"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
      </button>
      <button
        @click="editor.chain().focus().toggleSubscript().run()"
        :class="{ 'is-active': editor.isActive('subscript') }"
        title="Подстрочный"
      >
        <span style="font-size: 14px; font-weight: 600;">X<sub>2</sub></span>
      </button>
      <button
        @click="editor.chain().focus().toggleSuperscript().run()"
        :class="{ 'is-active': editor.isActive('superscript') }"
        title="Надстрочный"
      >
        <span style="font-size: 14px; font-weight: 600;">X<sup>2</sup></span>
      </button>
      <button
        @click="editor.chain().focus().setHorizontalRule().run()"
        title="Горизонтальная линия"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" x2="21" y1="12" y2="12"/></svg>
      </button>
      <button
        @click="editor.chain().focus().toggleHighlight().run()"
        :class="{ 'is-active': editor.isActive('highlight') }"
        title="Выделение цветом"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/></svg>
      </button>
    </div>

    <div class="divider"></div>

    <!-- Дропдаун для выравнивания -->
    <div class="button-group">
      <div ref="alignmentDropdownRef" class="dropdown" :class="{ 'is-open': isAlignmentDropdownOpen }">
        <button
          @click="toggleAlignmentDropdown"
          class="dropdown-button"
          title="Выравнивание"
        >
          <svg v-if="currentAlignment === 'left'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="15" x2="3" y1="12" y2="12"/><line x1="17" x2="3" y1="18" y2="18"/></svg>
          <svg v-else-if="currentAlignment === 'center'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="17" x2="7" y1="12" y2="12"/><line x1="19" x2="5" y1="18" y2="18"/></svg>
          <svg v-else-if="currentAlignment === 'right'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="9" y1="12" y2="12"/><line x1="21" x2="7" y1="18" y2="18"/></svg>
          <svg v-else-if="currentAlignment === 'justify'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="3" y1="12" y2="12"/><line x1="21" x2="3" y1="18" y2="18"/></svg>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chevron"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div v-if="isAlignmentDropdownOpen" class="dropdown-menu">
          <button @click="setAlignment('left')" class="dropdown-item" :class="{ 'is-active': currentAlignment === 'left' }">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="15" x2="3" y1="12" y2="12"/><line x1="17" x2="3" y1="18" y2="18"/></svg>
            <span>По левому краю</span>
          </button>
          <button @click="setAlignment('center')" class="dropdown-item" :class="{ 'is-active': currentAlignment === 'center' }">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="17" x2="7" y1="12" y2="12"/><line x1="19" x2="5" y1="18" y2="18"/></svg>
            <span>По центру</span>
          </button>
          <button @click="setAlignment('right')" class="dropdown-item" :class="{ 'is-active': currentAlignment === 'right' }">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="9" y1="12" y2="12"/><line x1="21" x2="7" y1="18" y2="18"/></svg>
            <span>По правому краю</span>
          </button>
          <button @click="setAlignment('justify')" class="dropdown-item" :class="{ 'is-active': currentAlignment === 'justify' }">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="3" y1="12" y2="12"/><line x1="21" x2="3" y1="18" y2="18"/></svg>
            <span>По ширине</span>
          </button>
        </div>
      </div>
      <button
        @click="editor.chain().focus().toggleBulletList().run()"
        :class="{ 'is-active': editor.isActive('bulletList') }"
        title="Маркированный список"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
      </button>
      <div ref="orderedListDropdownRef" class="dropdown" :class="{ 'is-open': isOrderedListDropdownOpen }">
        <button
          @click="toggleOrderedListDropdown"
          :class="{ 'is-active': editor.isActive('orderedList') }"
          class="dropdown-button"
          title="Нумерованный список"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" x2="21" y1="6" y2="6"/><line x1="10" x2="21" y1="12" y2="12"/><line x1="10" x2="21" y1="18" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chevron"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div v-if="isOrderedListDropdownOpen" class="dropdown-menu">
          <button @click="setOrderedListType('1')" class="dropdown-item" :class="{ 'is-active': currentListType === '1' }">
            <span style="font-family: monospace; font-weight: 600;">1 2 3</span>
            <span>Арабские числа</span>
          </button>
          <button @click="setOrderedListType('A')" class="dropdown-item" :class="{ 'is-active': currentListType === 'A' }">
            <span style="font-family: monospace; font-weight: 600;">A B C</span>
            <span>Прописные буквы</span>
          </button>
          <button @click="setOrderedListType('a')" class="dropdown-item" :class="{ 'is-active': currentListType === 'a' }">
            <span style="font-family: monospace; font-weight: 600;">a b c</span>
            <span>Строчные буквы</span>
          </button>
          <button @click="setOrderedListType('I')" class="dropdown-item" :class="{ 'is-active': currentListType === 'I' }">
            <span style="font-family: monospace; font-weight: 600;">I II III</span>
            <span>Римские (верхний регистр)</span>
          </button>
          <button @click="setOrderedListType('i')" class="dropdown-item" :class="{ 'is-active': currentListType === 'i' }">
            <span style="font-family: monospace; font-weight: 600;">i ii iii</span>
            <span>Римские (нижний регистр)</span>
          </button>
        </div>
      </div>
    </div>
    <div class="divider"></div>

    <!-- Блоки -->
    <div class="button-group">
<!--       <button -->
<!--         @click="editor.chain().focus().toggleCodeBlock().run()" -->
<!--         :class="{ 'is-active': editor.isActive('codeBlock') }" -->
<!--         title="Блок кода" -->
<!--       > -->
<!--         <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="m10 10-2 2 2 2"/><path d="m14 14 2-2-2-2"/></svg> -->
<!--       </button> -->
      <button
        @click="editor.chain().focus().toggleBlockquote().run()"
        :class="{ 'is-active': editor.isActive('blockquote') }"
        title="Цитата"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
      </button>
    </div>

    <div class="divider"></div>

    <!-- Ссылки и изображения -->
    <div class="button-group">
      <button
        @click="setLink"
        :class="{ 'is-active': editor.isActive('link') }"
        title="Вставить ссылку"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
      </button>
<!--       <button -->
<!--         @click="addImage" -->
<!--         title="Вставить изображение" -->
<!--       > -->
<!--         <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg> -->
<!--       </button> -->
    </div>

    <div class="divider"></div>

    <!-- История -->
    <div class="button-group">
      <button
        @click="editor.chain().focus().undo().run()"
        :disabled="!editor.can().undo()"
        title="Отменить (Ctrl+Z)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
      </button>
      <button
        @click="editor.chain().focus().redo().run()"
        :disabled="!editor.can().redo()"
        title="Повторить (Ctrl+Shift+Z)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
      </button>
    </div>

    <div class="divider"></div>

    <!-- Дополнительные действия -->
    <div class="button-group">
      <button
        @click="editor.chain().focus().setHardBreak().run()"
        title="Жёсткий перенос строки"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 10 20 15 15 20"/><path d="M4 4v7a4 4 0 0 0 4 4h12"/></svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onClickOutside } from '@vueuse/core'
import type { Editor } from '@tiptap/vue-3'

const props = defineProps<{
  editor: Editor | null
}>()

// Состояния для дропдаунов
const isBlockTypeDropdownOpen = ref(false)
const isAlignmentDropdownOpen = ref(false)
const isOrderedListDropdownOpen = ref(false)
const currentListType = ref<'1' | 'A' | 'a' | 'I' | 'i'>('1')

// Refs для дропдаунов
const blockTypeDropdownRef = ref<HTMLElement | null>(null)
const alignmentDropdownRef = ref<HTMLElement | null>(null)
const orderedListDropdownRef = ref<HTMLElement | null>(null)

// Определяем текущий тип блока
const currentBlockType = computed(() => {
  if (!props.editor) return 'paragraph'

  if (props.editor.isActive('heading', { level: 1 })) return 'heading1'
  if (props.editor.isActive('heading', { level: 2 })) return 'heading2'
  if (props.editor.isActive('heading', { level: 3 })) return 'heading3'
  return 'paragraph'
})

// Определяем текущее выравнивание
const currentAlignment = computed(() => {
  if (!props.editor) return 'left'

  if (props.editor.isActive({ textAlign: 'center' })) return 'center'
  if (props.editor.isActive({ textAlign: 'right' })) return 'right'
  if (props.editor.isActive({ textAlign: 'justify' })) return 'justify'
  return 'left'
})

// Переключатели дропдаунов
const toggleBlockTypeDropdown = () => {
  isBlockTypeDropdownOpen.value = !isBlockTypeDropdownOpen.value
  isAlignmentDropdownOpen.value = false
}

const toggleAlignmentDropdown = () => {
  isAlignmentDropdownOpen.value = !isAlignmentDropdownOpen.value
  isBlockTypeDropdownOpen.value = false
  isOrderedListDropdownOpen.value = false
}

const toggleOrderedListDropdown = () => {
  isOrderedListDropdownOpen.value = !isOrderedListDropdownOpen.value
  isBlockTypeDropdownOpen.value = false
  isAlignmentDropdownOpen.value = false
}

// Установка типа блока
const setBlockType = (type: string) => {
  if (!props.editor) return

  switch (type) {
    case 'heading1':
      props.editor.chain().focus().toggleHeading({ level: 1 }).run()
      break
    case 'heading2':
      props.editor.chain().focus().toggleHeading({ level: 2 }).run()
      break
    case 'heading3':
      props.editor.chain().focus().toggleHeading({ level: 3 }).run()
      break
    case 'paragraph':
      props.editor.chain().focus().setParagraph().run()
      break
  }

  isBlockTypeDropdownOpen.value = false
}

// Установка выравнивания
const setAlignment = (alignment: string) => {
  if (!props.editor) return

  props.editor.chain().focus().setTextAlign(alignment).run()
  isAlignmentDropdownOpen.value = false
}

// Установка типа нумерованного списка
const setOrderedListType = (listType: '1' | 'A' | 'a' | 'I' | 'i') => {
  if (!props.editor) return

  currentListType.value = listType

  // Если список не активен, создаем его
  if (!props.editor.isActive('orderedList')) {
    props.editor.chain().focus().toggleOrderedList().run()
  }

  // Устанавливаем атрибут type
  props.editor.chain().focus().setOrderedListType(listType).run()

  isOrderedListDropdownOpen.value = false
}

// Функция для добавления ссылки
const setLink = () => {
  if (!props.editor) return

  const previousUrl = props.editor.getAttributes('link').href
  const url = window.prompt('URL:', previousUrl)

  if (url === null) {
    return
  }

  if (url === '') {
    props.editor.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }

  // Устанавливаем ссылку
  props.editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

// Функция для добавления строчной формулы
// const insertInlineFormula = () => {
//   if (!props.editor) return
//
//   initialLatex.value = 'E = mc^2'
//   isBlockFormula.value = false
//   isMathModalOpen.value = true
// }

// Функция для добавления блочной формулы
// const insertBlockFormula = () => {
//   if (!props.editor) return
//
//   initialLatex.value = '\\int_{a}^{b} f(x) dx'
//   isBlockFormula.value = true
//   isMathModalOpen.value = true
// }

// Обработчик подтверждения формулы
// const handleMathConfirm = (latex: string) => {
//   if (!props.editor || !latex) return
//
//   if (isBlockFormula.value) {
//     props.editor.chain().focus().insertContent({
//       type: 'mathBlock',
//       attrs: { latex }
//     }).run()
//   } else {
//     props.editor.chain().focus().insertInlineMath({ latex }).run()
//   }
//
// }

// Закрытие дропдаунов при клике вне их
onClickOutside(blockTypeDropdownRef, () => {
  isBlockTypeDropdownOpen.value = false
})

onClickOutside(alignmentDropdownRef, () => {
  isAlignmentDropdownOpen.value = false
})

onClickOutside(orderedListDropdownRef, () => {
  isOrderedListDropdownOpen.value = false
})
</script>

<style scoped>
.menu-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 8px;
  border-radius: 8px;
  background: var(--menu-bg);
  border: 1px solid var(--menu-border);
  align-items: center;
}

.button-group {
  display: flex;
  gap: 2px;
}

.divider {
  width: 1px;
  height: 24px;
  background: var(--divider-bg);
  margin: 0 4px;
}

button {
  padding: 3px 5px;
  border: 1px solid var(--button-border);
  background: var(--button-bg);
  border-radius: 4px;
  cursor: pointer;
  font-size: 10px;
  font-weight: 500;
  color: var(--button-text);
  transition: all 0.15s ease;
  min-width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
}

button svg {
  display: block;
}

button:hover:not(:disabled) {
  background: var(--button-hover-bg);
  border-color: var(--button-hover-border);
}

button:active:not(:disabled) {
  background: var(--button-active-bg);
}

button.is-active {
  background: var(--button-is-active-bg);
  color: var(--button-is-active-text);
  border-color: var(--button-is-active-border);
}

button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Стили для дропдаунов */
.dropdown {
  position: relative;
}

.dropdown-button {
  min-width: 60px;
  gap: 4px;
}

.dropdown-button .chevron {
  margin-left: 2px;
  transition: transform 0.2s ease;
}

.dropdown.is-open .dropdown-button .chevron {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  background: var(--button-bg);
  border: 1px solid var(--button-border);
  border-radius: 4px;
  box-shadow: var(--dropdown-shadow);
  z-index: 1000;
  min-width: 180px;
  overflow: hidden;
}

.dropdown-item {
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-radius: 0;
  text-align: left;
  min-width: auto;
  height: auto;
  gap: 8px;
  justify-content: flex-start;
}

.dropdown-item:hover {
  background: var(--dropdown-item-hover-bg);
}

.dropdown-item.is-active {
  background: var(--dropdown-item-active-bg);
  color: var(--dropdown-item-active-text);
  border-color: transparent;
}

.dropdown-item span {
  font-size: 14px;
}
</style>
