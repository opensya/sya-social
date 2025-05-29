<template>
  <div class="ui-post-skeleton d-flex flex-column ga-5 px-5">
    <div class="d-flex align-center ga-2">
      <div
        class="skeleton"
        style="width: 54px; height: 54px; border-radius: 100%"
      ></div>

      <div>
        <div class="skeleton" style="width: 150px"></div>
        <div
          class="skeleton"
          style="width: 100px; height: 10px; margin-top: 3px"
        ></div>
      </div>

      <v-spacer />

      <div
        class="skeleton"
        style="width: 50px; height: 10px; margin-top: 3px"
      ></div>
    </div>

    <div class="d-flex flex-column ga-1">
      <div class="skeleton" style="width: 70%; height: 14px"></div>
      <div class="skeleton" style="width: 90%; height: 14px"></div>
      <div class="skeleton" style="width: 80%; height: 14px"></div>
      <div class="skeleton" style="width: 100%; height: 14px"></div>
    </div>

    <div class="d-flex ga-2">
      <div class="skeleton" style="width: 100%; height: 32px"></div>
      <div class="skeleton" style="width: 100%; height: 32px"></div>
    </div>
  </div>
</template>

<style lang="scss">
.ui-post-skeleton {
  .skeleton {
    border-radius: 16em;
  }
}
</style>
