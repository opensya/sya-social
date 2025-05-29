class Use {
  get i18n() {
    const { $i18n } = useNuxtApp();
    return $i18n;
  }

  get localePath() {
    const { $localePath } = useNuxtApp();
    return $localePath;
  }

  get route() {
    const { $route } = useNuxtApp();
    return $route;
  }
  get router() {
    const { $router } = useNuxtApp();
    return $router;
  }
}

export default new Use();
