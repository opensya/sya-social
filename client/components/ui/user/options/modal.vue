<script lang="ts" setup>
import { VBottomSheet } from "vuetify/components/VBottomSheet";
import { VMenu } from "vuetify/components/VMenu";

import type { IUser } from "~/interfaces/User";

const props = defineProps({
  user: { type: Object as PropType<IUser>, required: true },
});
</script>

<template>
  <component
    :is="$vuetify.display.smAndDown ? VBottomSheet : VMenu"
    location="bottom end"
    offset="10"
    :width="$vuetify.display.smAndDown ? undefined : 332"
  >
    <!-- v-if="$vuetify.display.smAndDown"  -->
    <template #activator="{ props }">
      <slot name="activator" :props="props"></slot>

      <v-btn
        v-if="!$slots.activator"
        v-bind="props"
        icon
        variant="text"
        color="dark"
        size="x-small"
      >
        <i class="fi fi-br-menu-dots-vertical" style="font-size: 16px"></i>
      </v-btn>
    </template>

    <v-card
      color="background"
      class="elevation-1 rounded-lg border"
      :class="{ 'rounded-t-xl': $vuetify.display.smAndDown }"
    >
      <v-container>
        <ui-user-options :user="user" />
      </v-container>
    </v-card>
  </component>
</template>
