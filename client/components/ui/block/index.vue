<script lang="ts" setup>
defineProps({
  hideLeft: { type: Boolean, default: false },
  hideRight: { type: Boolean, default: false },
});
</script>

<template>
  <v-app>
    <div class="ui-block d-flex mx-auto">
      <template v-if="!hideLeft">
        <template v-if="$vuetify.display.mdAndUp">
          <div class="ui-block__left mr-5 ml-10" style="">
            <slot v-if="$slots.left" name="left" />
            <template v-else>
              <ui-user-options
                v-if="Store.session.user"
                :user="Store.session.user"
              />
            </template>
          </div>
          <div class="line"></div>
        </template>
      </template>

      <div
        class="ui-block__middle"
        :style="{ maxWidth: $vuetify.display.mdAndUp ? '662px' : 'unset' }"
      >
        <div class="ui-block__middle--container">
          <slot />
        </div>

        <ui-block-bottom v-if="!$slots.bottom" />
        <slot name="bottom"> </slot>
      </div>
      <div v-if="$vuetify.display.mdAndUp" class="line"></div>

      <template v-if="!hideRight">
        <template v-if="$vuetify.display.lgAndUp">
          <div class="ui-block__right">
            <slot name="right" />
          </div>
        </template>
      </template>
    </div>
  </v-app>
</template>

<style lang="scss">
.ui-block {
  width: 1500px;
  max-width: 100%;
  position: relative;
  min-height: 100dvh;

  .ui-block__left {
    position: sticky;
    top: 0;
    height: max-content;
    width: 100%;
    max-width: 352px;
  }

  .ui-block__right {
    position: sticky;
    top: 0;
    height: max-content;
    padding-top: 40px;
    padding-bottom: 40px;

    width: 100%;
    max-width: 352px;
  }

  .line {
    height: 100%;
    inset: 0;
    width: 1px;
    background-color: rgba(var(--v-theme-on-background), 0.07);
    z-index: 70;
  }

  .ui-block__middle {
    // margin-left: auto;
    // margin-right: auto;
    width: 100%;
    min-height: calc(100dvh - 70px);
    z-index: 1;
    position: relative;
    display: flex;
    flex-direction: column;

    // border-left: 1px solid rgba(var(--v-theme-on-background), 0.07);
    // border-right: 1px solid rgba(var(--v-theme-on-background), 0.07);

    .ui-block__middle--heeader {
      position: sticky;
      top: 0;
      z-index: 50;
    }

    > .ui-block__middle--container {
      max-width: calc(100% - 0px);
      width: 100%;
      margin-left: auto;
      margin-right: auto;
      position: relative;
    }
  }
}
</style>
