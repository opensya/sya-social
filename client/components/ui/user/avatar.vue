<script lang="ts" setup>
import type { CSSProperties } from "vue";
import type { IUser } from "~/interfaces/User";

const props = defineProps({
  user: { type: Object as PropType<IUser>, required: true },
  size: { type: [String, Number], default: "48" },
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
  <div class="ui-user-avatar bg-surface" :style="_style">
    <img
      v-if="user.photo"
      style="
        object-fit: cover;
        object-position: center;
        overflow: hidden;
        width: 100%;
        height: 100%;
      "
      :src="user.photo?.url"
      :alt="user.name"
    />
    <ui-svg
      v-else
      name="avatar"
      class="text-dark opacity-40"
      style="width: 100%; height: 100%"
    />
  </div>
</template>

<style lang="scss">
.ui-user-avatar {
  border-radius: 100%;
  overflow: hidden;
}
</style>
