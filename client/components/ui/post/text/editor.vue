<script lang="ts" setup>
const props = defineProps({
  modelValue: { type: String, default: "" },
  placeholder: { type: String, default: "" },
  autofocus: { type: Boolean, default: false },
});
const emit = defineEmits<(e: "update:modelValue", value: string) => void>();

const editor = ref<HTMLDivElement>();
const value = ref("");

onMounted(() => {
  if (editor.value) {
    editor.value.innerText = props.modelValue;
    value.value = props.modelValue;
    onEdit();

    setTimeout(() => {
      if (props.autofocus) editor.value?.focus();
    }, 100);
  }
});

watch(
  () => props.modelValue,
  (val) => {
    value.value = val;
    if (editor.value && editor.value.innerText !== val) {
      editor.value.innerText = val;
      onEdit();
    }
  }
);

function getCaretCharacterOffsetWithin(element: HTMLElement): number {
  const sel = window.getSelection();
  let caretOffset = 0;

  if (sel && sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    caretOffset = preCaretRange.toString().length;
  }

  return caretOffset;
}

function setCaretPosition(element: HTMLElement, offset: number) {
  const range = document.createRange();
  const sel = window.getSelection();

  let currentNode: Node | null = null;
  let currentOffset = 0;

  function findNode(node: Node): boolean {
    if (node.nodeType === Node.TEXT_NODE) {
      const textLength = node.textContent?.length || 0;
      if (currentOffset + textLength >= offset) {
        currentNode = node;
        offset -= currentOffset;
        return true;
      }
      currentOffset += textLength;
    } else {
      for (let i = 0; i < node.childNodes.length; i++) {
        if (findNode(node.childNodes[i])) return true;
      }
    }
    return false;
  }

  findNode(element);

  if (currentNode) {
    range.setStart(currentNode, offset);
    range.collapse(true);
    sel?.removeAllRanges();
    sel?.addRange(range);
  }
}

function onEdit() {
  if (!editor.value) return;

  // 🔸 1. Obtenir le caret dans le texte brut
  const caretOffset = getCaretCharacterOffsetWithin(editor.value);

  // 🔸 2. Récupérer le texte brut
  let rawText = editor.value.innerText || "";
  if (rawText === "\n") rawText = "";
  value.value = rawText;

  // 🔸 3. Transformer en HTML avec <span>
  const html = rawText
    .replace(/#[\p{L}\p{N}_]{0,}/gu, (e) => {
      const id = Lodash.random(100_000, 999_000);
      return `<span id="htag-${id}" class="ui-post--text__hashtag">${e}</span>`;
    })
    .replace(/@[\p{L}\p{N}_]{0,}/gu, (e) => {
      const id = Lodash.random(100_000, 999_000);
      return `<span id="htag-${id}" class="ui-post--text__quote">${e}</span>`;
    })
    .replace(/\n/g, "<br/>");

  // 🔸 4. Remplacer le innerHTML
  editor.value.innerHTML = html;

  // 🔸 5. Repositionner le curseur
  setCaretPosition(editor.value, caretOffset);

  // 🔸 6. Émettre la valeur
  emit("update:modelValue", value.value);
}

function onPaste(e: ClipboardEvent) {
  e.preventDefault();
  const text = e.clipboardData?.getData("text/plain");
  document.execCommand("insertText", false, text || "");
}
</script>

<template>
  <div class="ui-post-text-editor">
    <div v-if="!value" class="placeholder" v-html="placeholder"></div>

    <div
      ref="editor"
      class="editor"
      contenteditable
      @input="onEdit"
      @paste="onPaste"
    ></div>
  </div>
</template>

<style lang="scss">
.ui-post-text-editor {
  position: relative;

  .placeholder {
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0.5;
  }

  .editor {
    outline: none !important;
    position: relative;
  }
}
</style>
