<template>
  <div class="menu-bar" v-if="editor">
    <!-- Дропдаун для типа блока -->
    <div class="button-group">
      <div ref="blockTypeDropdownRef" class="dropdown" :class="{ 'is-open': isBlockTypeDropdownOpen }">
        <ui-button
          @click="toggleBlockTypeDropdown"
          class="dropdown-button"
          title="Тип блока"
        >
          <SvgIcon :name="currentBlockType" />
          <SvgIcon name="chevron" class="chevron" />
        </ui-button>
        <div v-if="isBlockTypeDropdownOpen" class="dropdown-menu">
          <ui-button
            v-for="blockType in blockTypes"
            :key="blockType.type"
            @click="setBlockType(blockType.type)"
            class="dropdown-item"
            :class="{ 'is-active': currentBlockType === blockType.type }"
          >
            <span>{{ blockType.label }}</span>
          </ui-button>
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <!-- Форматирование текста -->
    <div class="button-group">
      <ui-button
        @click="editor.chain().focus().toggleBold().run()"
        :class="{ 'is-active': editor.isActive('bold') }"
        title="Жирный (Ctrl+B)"
      >
        <SvgIcon name="bold" />
      </ui-button>
      <ui-button
        @click="editor.chain().focus().toggleItalic().run()"
        :class="{ 'is-active': editor.isActive('italic') }"
        title="Курсив (Ctrl+I)"
      >
        <SvgIcon name="italic" />
      </ui-button>
      <ui-button
        @click="editor.chain().focus().toggleUnderline().run()"
        :class="{ 'is-active': editor.isActive('underline') }"
        title="Подчеркнутый текст"
      >
        <SvgIcon name="underline" />
      </ui-button>
      <ui-button
        @click="editor.chain().focus().toggleStrike().run()"
        :class="{ 'is-active': editor.isActive('strike') }"
        title="Зачеркнутый текст"
      >
        <SvgIcon name="strike" />
      </ui-button>
      <ui-button
        @click="editor.chain().focus().toggleCode().run()"
        :class="{ 'is-active': editor.isActive('code') }"
        title="Встроенный код"
      >
        <SvgIcon name="code" />
      </ui-button>
      <ui-button
        @click="editor.chain().focus().toggleSubscript().run()"
        :class="{ 'is-active': editor.isActive('subscript') }"
        title="Подстрочный"
      >
        <span style="font-size: 14px; font-weight: 600;">X<sub>2</sub></span>
      </ui-button>
      <ui-button
        @click="editor.chain().focus().toggleSuperscript().run()"
        :class="{ 'is-active': editor.isActive('superscript') }"
        title="Надстрочный"
      >
        <span style="font-size: 14px; font-weight: 600;">X<sup>2</sup></span>
      </ui-button>
      <ui-button
        @click="editor.chain().focus().setHorizontalRule().run()"
        title="Горизонтальная линия"
      >
        <SvgIcon name="horizontal-rule" />
      </ui-button>
      <ui-button
        @click="editor.chain().focus().toggleHighlight().run()"
        :class="{ 'is-active': editor.isActive('highlight') }"
        title="Выделение цветом"
      >
        <SvgIcon name="highlight" />
      </ui-button>
      <input
        type="color"
        @input="onColorChange"
        value="#489735"
        title="Цвет текста"
      />
    </div>

    <div class="divider"></div>

    <!-- Дропдаун для выравнивания -->
    <div class="button-group">
      <div ref="alignmentDropdownRef" class="dropdown" :class="{ 'is-open': isAlignmentDropdownOpen }">
        <ui-button
          @click="toggleAlignmentDropdown"
          class="dropdown-button"
          title="Выравнивание"
        >
          <SvgIcon v-if="currentAlignment" :name="`align-${currentAlignment}`" />
          <SvgIcon name="chevron" class="chevron" />
        </ui-button>
        <div v-if="isAlignmentDropdownOpen" class="dropdown-menu">
          <ui-button
            v-for="alignment in alignments"
            :key="alignment.value"
            @click="setAlignment(alignment.value)"
            class="dropdown-item"
            :class="{ 'is-active': currentAlignment === alignment.value }"
          >
            <span>{{ alignment.label }}</span>
          </ui-button>
        </div>
      </div>
      <ui-button
        @click="editor.chain().focus().toggleBulletList().run()"
        :class="{ 'is-active': editor.isActive('bulletList') }"
        title="Маркированный список"
      >
        <SvgIcon name="bullet-list" />
      </ui-button>
      <div ref="orderedListDropdownRef" class="dropdown" :class="{ 'is-open': isOrderedListDropdownOpen }">
        <ui-button
          @click="toggleOrderedListDropdown"
          :class="{ 'is-active': editor.isActive('orderedList') }"
          class="dropdown-button"
          title="Нумерованный список"
        >
          <SvgIcon name="ordered-list" />
          <SvgIcon name="chevron" class="chevron" />
        </ui-button>
        <div v-if="isOrderedListDropdownOpen" class="dropdown-menu ordered-list-menu">
          <ui-button
            v-for="listType in orderedListTypes"
            :key="listType.value"
            @click="setOrderedListType(listType.value)"
            class="dropdown-item"
            :class="{ 'is-active': currentListType === listType.value }"
          >
            <span style="font-family: monospace; font-weight: 600;">{{ listType.example }}</span>
            <span>{{ listType.label }}</span>
          </ui-button>
        </div>
      </div>
    </div>
    <!-- Ссылки и изображения -->
    <div class="button-group">
      <ui-button
        @click="setLink"
        :class="{ 'is-active': editor.isActive('link') }"
        title="Вставить ссылку"
      >
        <SvgIcon name="link" />
      </ui-button>
    </div>
    <!-- Блоки -->
    <div class="button-group">
      <ui-button
        @click="editor.chain().focus().toggleBlockquote().run()"
        :class="{ 'is-active': editor.isActive('blockquote') }"
        title="Цитата"
      >
        <SvgIcon name="blockquote" />
      </ui-button>
    </div>
    <!-- История -->
    <div class="button-group">
      <ui-button
        @click="editor.chain().focus().undo().run()"
        :disabled="!editor.can().undo()"
        title="Отменить (Ctrl+Z)"
      >
        <SvgIcon name="undo" />
      </ui-button>
      <ui-button
        @click="editor.chain().focus().redo().run()"
        :disabled="!editor.can().redo()"
        title="Повторить (Ctrl+Shift+Z)"
      >
        <SvgIcon name="redo" />
      </ui-button>
    </div>

    <!-- Дополнительные действия -->
    <div class="button-group">
      <ui-button
        @click="editor.chain().focus().setHardBreak().run()"
        title="Жёсткий перенос строки"
      >
        <SvgIcon name="hard-break" />
      </ui-button>
      <div class="divider" />

      <!-- Кастомный заголовок -->
      <UiDropdown
        v-model:isOpen="isHeaderSnippetDropdownOpen"
        title="Кастомный заголовок"
        menuClass="header-form-dropdown"
        :menu-width="410"
        @toggle="toggleHeaderSnippetDropdown"
      >
        <template #button-content>
          <SvgIcon name="header-snippet" />
        </template>
        <template #menu-content>
          <div class="header-form">
            <UiTextarea
              v-model="headerText"
              placeholder="Введите текст заголовка"
              @keydown.enter="insertHeaderSnippetWithText"
            />
            <UiBlueButton @click="insertHeaderSnippetWithText">
              Вставить
            </UiBlueButton>
          </div>
        </template>
      </UiDropdown>

      <!-- Центрирование -->
      <UiDropdown
        v-model:isOpen="isCenterSnippetDropdownOpen"
        title="Центрирование"
        menuClass="center-form-dropdown"
        :menu-width="365"
        @toggle="toggleCenterSnippetDropdown"
      >
        <template #button-content>
          <SvgIcon name="align-center" />
        </template>
        <template #menu-content>
          <div class="center-form">
            <UiTextarea
              v-model="centerText"
              placeholder="Введите значение"
              @keydown.enter="insertCenterSnippetWithText"
            />
            <UiBlueButton @click="insertCenterSnippetWithText">
              Вставить
            </UiBlueButton>
          </div>
        </template>
      </UiDropdown>

      <!-- Flex колонки -->
      <UiDropdown
        v-model:isOpen="isFlexColumnsDropdownOpen"
        title="Колонки"
        :buttonClass="{ 'is-active': editor.isActive('flexSnippet') }"
        menuClass="columns-form-dropdown"
        :menu-width="500"
        @toggle="toggleFlexColumnsDropdown"
      >
        <template #button-content>
          <SvgIcon name="columns" />
        </template>
        <template #menu-content>
          <div class="columns-form">
            <div class="form-header">
              <label class="form-label">Количество колонок:</label>
              <select v-model="columnCount" class="column-count-select">
                <option :value="2">2</option>
                <option :value="3">3</option>
                <option :value="4">4</option>
              </select>
            </div>
            <div class="columns-inputs">
              <div
                v-for="(column, index) in flexColumnsData"
                :key="`column-${index}`"
                class="column-input-group"
              >
                <label class="column-label">Колонка {{ index + 1 }}</label>
                <input
                  v-model="column.title"
                  type="text"
                  :placeholder="`Заголовок ${index + 1}`"
                  class="column-input"
                />
                <textarea
                  v-model="column.content"
                  :placeholder="`Текст колонки ${index + 1}`"
                  class="column-textarea"
                  rows="4"
                />
              </div>
            </div>
            <UiBlueButton @click="insertFlexColumnsWithData">
              Вставить колонки
            </UiBlueButton>
          </div>
        </template>
      </UiDropdown>

      <!-- Вертикальные блоки -->
      <UiDropdown
        v-model:isOpen="isFlexRowsDropdownOpen"
        title="Блоки"
        :buttonClass="{ 'is-active': editor.isActive('blockSnippet') }"
        menuClass="rows-form-dropdown"
        :menu-width="420"
        @toggle="toggleBlockDropdown"
      >
        <template #button-content>
          <SvgIcon name="rows" />
        </template>
        <template #menu-content>
          <div class="rows-form">
            <div class="form-header">
              <label class="form-label">Количество блоков:</label>
              <select v-model="columnCount" class="rows-count-select">
                <option :value="2">2</option>
                <option :value="3">3</option>
                <option :value="4">4</option>
              </select>
            </div>
            <div class="rows-inputs">
              <div
                v-for="(row, index) in rowsColumnsData"
                :key="`rows-${index}`"
                class="rows-input-group"
              >
                <label class="column-label">Блок {{ index + 1 }}</label>
                <input
                  v-model="row.title"
                  type="text"
                  :placeholder="`Заголовок ${index + 1}`"
                  class="column-input"
                />
                <textarea
                  v-model="row.content"
                  :placeholder="`Текст блока ${index + 1}`"
                  class="row-textarea"
                  rows="4"
                />
              </div>
            </div>
            <UiBlueButton @click="insertRowsWithData">
              Вставить блоки
            </UiBlueButton>
          </div>
        </template>
      </UiDropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'
import type { Editor } from '@tiptap/vue-3'
import type { FlexColumn } from '@/extensions/FlexSnippet'
import type { BlocksRow } from '@/extensions/BlockSnippet'
import UiDropdown from './ui/UiDropdown.vue'
import UiButton from './ui/UiButton.vue'
import UiBlueButton from "@/components/ui/UiBlueButton.vue";
import UiTextarea from "@/components/ui/UiTextarea.vue";
import SvgIcon from '@/components/ui/SvgIcon.vue'

const props = defineProps<{
  editor: Editor | null
}>()

// Данные для дропдаунов
const blockTypes = [
  {
    type: 'paragraph',
    label: 'Параграф',
    icon: '<path d="M10 6H9a6 6 0 0 0 0 12h4"/><path d="M14 6h2"/><path d="M14 18h2"/><path d="M14 6v12"/>'
  },
  {
    type: 'heading1',
    label: 'Заголовок 1',
    icon: '<path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="m17 12 3-2v8"/>'
  },
  {
    type: 'heading2',
    label: 'Заголовок 2',
    icon: '<path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1"/>'
  },
  {
    type: 'heading3',
    label: 'Заголовок 3',
    icon: '<path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2"/><path d="M17 17.5c2 1.5 4 .3 4-1.5a2 2 0 0 0-2-2"/>'
  }
]

const alignments = [
  {
    value: 'left',
    label: 'По левому краю',
    icon: '<line x1="21" x2="3" y1="6" y2="6"/><line x1="15" x2="3" y1="12" y2="12"/><line x1="17" x2="3" y1="18" y2="18"/>'
  },
  {
    value: 'center',
    label: 'По центру',
    icon: '<line x1="21" x2="3" y1="6" y2="6"/><line x1="17" x2="7" y1="12" y2="12"/><line x1="19" x2="5" y1="18" y2="18"/>'
  },
  {
    value: 'right',
    label: 'По правому краю',
    icon: '<line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="9" y1="12" y2="12"/><line x1="21" x2="7" y1="18" y2="18"/>'
  },
  {
    value: 'justify',
    label: 'По ширине',
    icon: '<line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="3" y1="12" y2="12"/><line x1="21" x2="3" y1="18" y2="18"/>'
  }
]

const orderedListTypes = [
  { value: '1' as const, example: '1 2 3', label: 'Арабские числа' },
  { value: 'A' as const, example: 'A B C', label: 'Прописные буквы' },
  { value: 'a' as const, example: 'a b c', label: 'Строчные буквы' },
  { value: 'I' as const, example: 'I II III', label: 'Римские (верхний регистр)' },
  { value: 'i' as const, example: 'i ii iii', label: 'Римские (нижний регистр)' }
]

// Состояния для дропдаунов
const isBlockTypeDropdownOpen = ref(false)
const isAlignmentDropdownOpen = ref(false)
const isOrderedListDropdownOpen = ref(false)
const isFlexColumnsDropdownOpen = ref(false)
const isFlexRowsDropdownOpen = ref(false)
const isHeaderSnippetDropdownOpen = ref(false)
const isCenterSnippetDropdownOpen = ref(false)
const currentListType = ref<'1' | 'A' | 'a' | 'I' | 'i'>('1')

// Данные для snippet форм
const headerText = ref('')
const centerText = ref('')

// Данные для формы flex колонок
const columnCount = ref(2)
const flexColumnsData = ref<FlexColumn[]>([
  { title: '', content: '' },
  { title: '', content: '' },
])

// Данные для формы блоков (rows)
const rowsColumnsData = ref<BlocksRow[]>([
  { title: '', content: '' },
  { title: '', content: '' },
])

// Обновляем данные колонок при изменении количества
watch(columnCount, (newCount) => {
  const currentLength = flexColumnsData.value.length

  if (newCount > currentLength) {
    // Добавляем новые колонки
    for (let i = currentLength; i < newCount; i++) {
      flexColumnsData.value.push({ title: '', content: '' })
    }
  } else if (newCount < currentLength) {
    // Удаляем лишние колонки
    flexColumnsData.value = flexColumnsData.value.slice(0, newCount)
  }

  // Также обновляем данные для блоков
  const currentRowsLength = rowsColumnsData.value.length

  if (newCount > currentRowsLength) {
    // Добавляем новые блоки
    for (let i = currentRowsLength; i < newCount; i++) {
      rowsColumnsData.value.push({ title: '', content: '' })
    }
  } else if (newCount < currentRowsLength) {
    // Удаляем лишние блоки
    rowsColumnsData.value = rowsColumnsData.value.slice(0, newCount)
  }
})

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

// Универсальная функция для закрытия всех дропдаунов
const closeAllDropdowns = () => {
  isBlockTypeDropdownOpen.value = false
  isAlignmentDropdownOpen.value = false
  isOrderedListDropdownOpen.value = false
  isFlexColumnsDropdownOpen.value = false
  isFlexRowsDropdownOpen.value = false
  isHeaderSnippetDropdownOpen.value = false
  isCenterSnippetDropdownOpen.value = false
}

// Переключатели дропдаунов
const toggleBlockTypeDropdown = () => {
  closeAllDropdowns()
  isBlockTypeDropdownOpen.value = !isBlockTypeDropdownOpen.value
}

const toggleAlignmentDropdown = () => {
  closeAllDropdowns()
  isAlignmentDropdownOpen.value = !isAlignmentDropdownOpen.value
}

const toggleOrderedListDropdown = () => {
  closeAllDropdowns()
  isOrderedListDropdownOpen.value = !isOrderedListDropdownOpen.value
}

const toggleFlexColumnsDropdown = () => {
  closeAllDropdowns()
  isFlexColumnsDropdownOpen.value = !isFlexColumnsDropdownOpen.value
}

const toggleHeaderSnippetDropdown = () => {
  closeAllDropdowns()
  isHeaderSnippetDropdownOpen.value = !isHeaderSnippetDropdownOpen.value
}

const toggleCenterSnippetDropdown = () => {
  closeAllDropdowns()
  isCenterSnippetDropdownOpen.value = !isCenterSnippetDropdownOpen.value
}

const toggleBlockDropdown = () => {
  closeAllDropdowns()
  isFlexRowsDropdownOpen.value = !isFlexRowsDropdownOpen.value
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

const onColorChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  props.editor?.chain().focus().setColor(target.value).run();
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

// Функция для вставки flex колонок с данными из формы
const insertFlexColumnsWithData = () => {
  if (!props.editor) return

  // Создаем колонки с заполненными данными или дефолтными значениями
  const columns = flexColumnsData.value.map((col, index) => ({
    title: col.title || `Заголовок ${index + 1}`,
    content: col.content || `текст колонки ${index + 1}`,
  }))

  props.editor.chain().focus().insertFlexSnippet({ columns }).run()

  // Сбрасываем форму
  flexColumnsData.value = Array.from({ length: columnCount.value }, () => ({
    title: '',
    content: '',
  }))

  isFlexColumnsDropdownOpen.value = false
}

// Функция для вставки header snippet
const insertHeaderSnippetWithText = () => {
  if (!props.editor) return

  props.editor.chain().focus().insertHeaderSnippet({ text: headerText.value }).run()

  // Сбрасываем форму и закрываем dropdown
  headerText.value = ''
  isHeaderSnippetDropdownOpen.value = false
}

// Функция для вставки center snippet
const insertCenterSnippetWithText = () => {
  if (!props.editor) return

  props.editor.chain().focus().insertCenterSnippet({ text: centerText.value }).run()

  // Сбрасываем форму и закрываем dropdown
  centerText.value = ''
  isCenterSnippetDropdownOpen.value = false
}

// Функция для вставки блоков с данными из формы
const insertRowsWithData = () => {
  if (!props.editor) return

  // Создаем блоки с заполненными данными или дефолтными значениями
  const rows = rowsColumnsData.value.map((row, index) => ({
    title: row.title || `Заголовок ${index + 1}`,
    content: row.content || `текст блока ${index + 1}`,
  }))

  props.editor.chain().focus().insertBlockSnippet({ rows }).run()

  // Сбрасываем форму
  rowsColumnsData.value = Array.from({ length: columnCount.value }, () => ({
    title: '',
    content: '',
  }))

  isFlexRowsDropdownOpen.value = false
}

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

input {
  min-width: 26px;
  height: 26px;
  border: 1px solid var(--button-border);
  background: var(--button-bg);
  border-radius: 4px;
  cursor: pointer;
}

/* Стили для дропдаунов */
.dropdown {
  position: relative;
}

.dropdown-button {
  width: max-content;
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
  width: max-content;
  overflow: hidden;
}

.ordered-list-menu {
  right: 0;
  left: auto;
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


.columns-form {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 379px;
  overflow-y: auto;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.form-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--button-text);
}

.column-count-select {
  padding: 3px 6px;
  border: 1px solid var(--button-border);
  background: var(--button-bg);
  border-radius: 4px;
  font-size: 12px;
  color: var(--button-text);
  cursor: pointer;
}

.columns-inputs {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: calc(100% - 70px);
  min-height: calc(100% -70px);
  max-height: 100%;
  overflow-y: auto;
}

.column-input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px;
  border: 1px solid var(--button-border);
  border-radius: 4px;
  background: var(--menu-bg);
}

.column-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--button-text);
}

.column-input,
.column-textarea {
  padding: 4px 6px;
  border: 1px solid var(--button-border);
  background: var(--button-bg);
  border-radius: 4px;
  font-size: 12px;
  color: var(--button-text);
  font-family: inherit;
  resize: vertical;
}

.column-input:focus,
.column-textarea:focus {
  outline: none;
  border-color: var(--button-hover-border);
}

/* Стили для формы header snippet */

.header-form {
  min-height: 150px;
  padding: 8px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.center-form {
  min-height: 345px;
  overflow: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Стили для формы блоков */
.rows-form {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 379px;
  overflow-y: auto;
}

.rows-count-select {
  padding: 3px 6px;
  border: 1px solid var(--button-border);
  background: var(--button-bg);
  border-radius: 4px;
  font-size: 12px;
  color: var(--button-text);
  cursor: pointer;
}

.rows-inputs {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: calc(100% - 70px);
  min-height: calc(100% -70px);
  overflow-y: auto;
}

.rows-input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px;
  border: 1px solid var(--button-border);
  border-radius: 4px;
  background: var(--menu-bg);
}

.row-textarea {
  padding: 4px 6px;
  border: 1px solid var(--button-border);
  background: var(--button-bg);
  border-radius: 4px;
  font-size: 12px;
  color: var(--button-text);
  font-family: inherit;
  resize: vertical;
}

.row-textarea:focus {
  outline: none;
  border-color: var(--button-hover-border);
}
</style>
