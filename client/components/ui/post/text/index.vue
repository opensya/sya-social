<script lang="ts" setup>
import type { IPost } from "~/interfaces/Post";

const props = defineProps({
  post: { type: Object as PropType<IPost>, required: true },
});

const content = ref("");
const text = ref<HTMLDivElement>();

onMounted(() => {
  if (!text.value) return;

  const re = /\#([A-Za-z0-1_]){1,}/gim;
  content.value = props.post.text
    .replace(/#[\p{L}\p{N}_]{0,}/gu, (e) => {
      const id = Lodash.random(100_000, 999_000);
      return `<span id="htag-${id}" class="ui-post--text__hashtag">${e}</span>`;
    })
    .replace(/@[\p{L}\p{N}_]{0,}/gu, (e) => {
      const id = Lodash.random(100_000, 999_000);
      return `<span id="htag-${id}" class="ui-post--text__quote">${e}</span>`;
    })
    .replaceAll("\n", "<br/>");

  text.value.innerHTML = content.value;

  setTimeout(() => {
    if (!text.value) return;
    text.value
      .querySelectorAll(".ui-post--text__hashtag")
      .forEach((hashtag) => {
        hashtag.addEventListener("click", () => {
          Use.router.push({
            name: "index",
            query: { hashtag: hashtag.textContent?.replace("#", "") },
          });
        });
      });
  }, 100);
});
</script>

<template>
  <div ref="text" class="ui-post--text"></div>
</template>

<style lang="scss">
.ui-post--text__quote,
.ui-post--text__hashtag {
  background-color: rgba(var(--v-theme-primary), 0.2);
  color: rgba(var(--v-theme-primary), 1);
  font-weight: bold;
  cursor: pointer;
}
</style>
