import type { LocationQueryRaw } from "vue-router";

export default {
  get(query: LocationQueryRaw) {
    const router = useRouter();
    const localePath = useLocalePath();
    return localePath({
      query: { ...(router.currentRoute.value.query ?? {}), ...query },
    });
  },

  push(query: LocationQueryRaw) {
    const router = useRouter();
    router.push(this.get(query));
  },
};
