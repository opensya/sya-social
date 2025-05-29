export default defineNuxtPlugin(() => {
  const x = ref(0);
  const y = ref(0);

  addEventListener("scroll", onScroll);

  onScroll();

  function onScroll() {
    x.value = window.scrollX;
    y.value = window.scrollY;
  }

  return { provide: { scroll: { x, y } } };
});
