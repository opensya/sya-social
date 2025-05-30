<template>
  <div
    class="bg-primary"
    style="
      min-height: 100dvh;
      display: flex;
      align-items: center;
      justify-content: center;
    "
  >
    <div
      style="
        max-width: 662px;
        width: 90%;
        display: flex;
        justify-content: center;
        flex-direction: column;
        gap: 30px;
      "
      class="mx-auto"
    >
      <ui-svg name="logo" size="72" />
      <p style="font-size: 22px" class="mt-5">
        Notre objectif est d’ouvrir un dialogue public en permettant à toutes et
        à tous de contribuer à la réflexion collective — des ouvriers de
        chantiers aux universitaires, nous pensons que chaque citoyen doit
        pouvoir y participer pleinement. 
      </p>

      <div class="d-flex flex-column ga-2 mt-auto w-100">
        <v-btn
          color="white"
          variant="flat"
          size="x-large"
          :to="$localePath({ name: 'session-login' })"
          rounded
          block
        >
          {{ Lodash.capitalize($t("words.tosignin")) }}
        </v-btn>
        <v-btn
          color="white"
          variant="flat"
          size="x-large"
          :to="$localePath({ name: 'session-register' })"
          rounded
          block
        >
          {{ Lodash.capitalize($t("words.createAccount")) }}
        </v-btn>
      </div>
    </div>
  </div>
</template>
