# Framework: Vue 3
- **ALWAYS** use Vue 3.
- **ALWAYS** use the Composition API.
- **NEVER** use the Options API.
- **ALWAYS** use `<script setup lang="ts">`.
- Props and emits should be defined with `defineProps` and `defineEmits`.
- **REACTIVITY**: Use `ref()` for primitive values and `reactive()` for objects.