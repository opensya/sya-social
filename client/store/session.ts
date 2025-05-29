import forge from "node-forge";
import { defineStore } from "pinia";
import type { IUser } from "~/interfaces/User";

export interface IAppMode {
  value: "light" | "dark" | null;
  use: "light" | "dark";
}

const store = defineStore(
  "session",
  () => {
    const statusBar = ref<{ height: number }>({ height: 0 });
    function setStatusBar(value: { height: number }) {
      statusBar.value = value;
    }

    const mode = ref<IAppMode>({ value: null, use: "light" });
    function setMode(value: "light" | "dark" | null = null) {
      function nativeMode() {
        let nativeThemeMode: "dark" | "light" = "dark";

        if (
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches
        ) {
          nativeThemeMode = "dark";
        } else {
          nativeThemeMode = "light";
        }

        return nativeThemeMode;
      }

      mode.value.value = value;

      let _mode = mode.value.value;
      if (_mode === null) _mode = nativeMode();

      mode.value.use = _mode;
    }

    const lang = ref<{ code: string }>({ code: "" });
    function setLang(value?: string) {
      value ||= navigator.language.split("-")[0];

      lang.value ||= { code: "fr" };
      lang.value.code = value;

      const { $i18n, $dayjs } = useNuxtApp();
      if (!$i18n.localeCodes.value.includes(lang.value.code as "fr")) {
        lang.value.code = $i18n.locales.value[0].code;
      }

      $i18n.setLocale(lang.value.code as "fr");
      $dayjs.locale(lang.value.code);
    }

    const sessionId = ref<string>();
    function setSessionId(id?: string) {
      sessionId.value = id;
    }

    const apiPublicKey = ref<string>();
    function setApiPublicKey(key?: string) {
      apiPublicKey.value = key;
    }

    const keys = ref({ public: "", private: "" });
    function generateKeys() {
      const rsaKeyPair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
      const publicKey = forge.pki.publicKeyToPem(rsaKeyPair.publicKey);
      const privateKey = forge.pki.privateKeyToPem(rsaKeyPair.privateKey);
      const keys = { public: publicKey, private: privateKey };

      return keys;
    }

    function setKeys(_keys: { public: string; private: string }) {
      keys.value = _keys;
    }

    const user = ref<IUser>();
    function setUser(u?: IUser) {
      user.value = u;
      setMode(user.value?.preferencies?.mode);
      setLang(user.value?.preferencies?.lang);
    }
    async function fetchUser() {
      if (!keys.value.private) setKeys(generateKeys());

      try {
        const response = await Api.request({
          url: "session/init",
          method: "post",
          body: { publicKey: keys.value.public },
        });

        setSessionId(response.sessionId);
        // setIsAuthenticated(response.user ? true : false);
        setApiPublicKey(response.apiPublicKey);
        setUser(response.user);
        // setInitilized(true);
      } catch (error) {}
    }

    async function logout() {
      await Api.request({ url: "session/logout", method: "post" });

      clean();
      await fetchUser();
      await useRouter().replace({ name: "session-login" });
    }

    async function init() {
      const code = navigator.language.split("-")[0];
      setLang(code);
    }

    async function clean() {
      const code = navigator.language.split("-")[0];
      setLang(code);
      setMode(null);
      setKeys(generateKeys());
      setApiPublicKey();
      setSessionId();
      setUser();
    }

    return {
      statusBar,
      setStatusBar,

      mode,
      setMode,

      lang,
      setLang,

      init,
      clean,

      sessionId,
      setSessionId,

      user,
      setUser,
      fetchUser,

      keys,
      generateKeys,
      setKeys,

      apiPublicKey,
      setApiPublicKey,

      logout,
    };
  },
  { persist: true }
);

export default store;
