# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vue 3 + Vite project featuring a rich text editor built with TipTap. The application is a minimal implementation focused on providing a complete text editing experience with a custom toolbar.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server with hot-reload
npm run dev

# Type-check TypeScript files
npm run type-check

# Build for production (runs type-check first)
npm run build

# Build only (without type-check)
npm run build-only

# Preview production build
npm run preview

# Lint and auto-fix code
npm run lint
```

## Architecture

### Tech Stack
- **Vue 3** with Composition API (`<script setup>`)
- **Vite** for build tooling and dev server
- **TypeScript** for type safety
- **TipTap** (v3.11.0) for rich text editing, built on ProseMirror
- **Vue Router** for routing (currently unused, no routes defined)

### Project Structure
- `src/main.ts` - Application entry point, initializes Vue app and router
- `src/App.vue` - Root component, renders TiptapEditor
- `src/components/TiptapEditor.vue` - Main editor component with custom toolbar
- `src/router/index.ts` - Router configuration (currently empty)
- `vite.config.ts` - Vite configuration with `@` alias pointing to `src/`

### TipTap Editor Component

The editor (`src/components/TiptapEditor.vue`) is a self-contained component that:
- Uses TipTap's StarterKit with 10-level undo history
- Provides a custom toolbar with button groups for:
  - Text formatting (bold, italic, strikethrough, inline code)
  - Headings (H1, H2, H3) and paragraphs
  - Lists (bullet and ordered)
  - Blocks (code blocks, blockquotes, horizontal rules)
  - History (undo/redo)
  - Additional actions (hard break, clear formatting)
- Exposes `getHTML()` and `editor` via `defineExpose` for parent component access
- Contains Russian text in initial content ("Добро пожаловать в TipTap редактор!")
- Uses inline SVG icons for toolbar buttons
- Implements custom ProseMirror styling via deep selectors

### Key Configuration Details
- Path alias: `@` maps to `./src`
- Node version requirement: `^20.19.0 || >=22.12.0`
- Vue DevTools plugin enabled in development
- TypeScript strict mode enabled via vue-tsc

## Working with the Editor

When modifying the TipTap editor:
- The editor instance is created using `useEditor()` composable
- All editor commands use the chain syntax: `editor.chain().focus().command().run()`
- Button active states are managed via `editor.isActive()` checks
- The editor must be destroyed in `onBeforeUnmount` to prevent memory leaks
- ProseMirror styles are customized via `:deep()` pseudo-selector in scoped styles