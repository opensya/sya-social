<script setup lang="ts">
import type { CSSProperties } from "vue";

const { $svgOptions } = useNuxtApp();

const props = defineProps({
  name: { type: String, required: true },
  size: { type: String },
  style: { type: Object as PropType<CSSProperties>, default: () => {} },
});

const _style = computed(() => {
  const styles: any = { ...props.style };

  if (props.size) {
    if (!props.style?.width) styles.width = `${props.size}px`;
    if (!props.style?.height) styles.height = `${props.size}px`;
  }

  return styles;
});
</script>

<template>
  <component
    :is="`${($svgOptions as any).component}-${name.replaceAll('/', '-')}`"
    :style="_style"
  />
</template>
