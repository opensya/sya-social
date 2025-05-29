import forge from "node-forge";
import { createVNode } from "vue";

function encrypter(data: string, side: "client" | "api") {
  const keys = Store.session.keys;
  let key: string | undefined;
  if (side === "api") key = Store.session.apiPublicKey;
  else key = keys.public;

  if (!key) throw "crypto.needKey";

  const max_length = 86;

  if (typeof data === "string" && data.length > max_length) {
    const datas: string[] = [];

    for (let i = 0; i < data.length; i += max_length) {
      const dt = data.slice(i, i + max_length);
      const enc = encrypter(dt, side);
      datas.push(enc as string);
    }

    return datas;
  }

  const publicKeyObj = forge.pki.publicKeyFromPem(key);
  const encrypted = publicKeyObj.encrypt(data);
  return forge.util.encode64(encrypted);
}

function decrypter(data: string) {
  const key = Store.session.keys.private;
  if (!key) throw "crypto.needKey";

  if (Array.isArray(data)) {
    let datas = "";
    for (const dt of data) {
      datas += decrypter(dt);
    }
    return datas;
  }

  const privateKeyObj = forge.pki.privateKeyFromPem(key);
  const decrypted = privateKeyObj.decrypt(forge.util.decode64(data));

  return decrypted;
}

export default {
  request<T = any>(params: {
    url: string;
    method?: "post" | "get" | "delete";
    body?: { [x: string]: any };
    signal?: AbortSignal;
  }): Promise<T> {
    params.method ||= "get";

    return new Promise((resolve, reject) => {
      const $decrypter = (obj?: { [key: string]: any }) => {
        const _decrypter = (datas: any) => {
          if (!datas) {
            // ne rien faire
          } else if (Array.isArray(datas)) {
            for (let i = 0; i < datas.length; i++) {
              datas[i] = _decrypter(datas[i]);
            }
          } else if (
            Object.prototype.toString.call(datas) === "[object Object]"
          ) {
            if ("_RSA_ENCODED_" in datas) {
              datas = decrypter(datas._RSA_ENCODED_);
            } else {
              for (const key in datas) {
                datas[key] = _decrypter(datas[key]);
              }
            }
          }

          return datas;
        };

        return _decrypter(obj);
      };

      const $encrypter = (obj?: { [key: string]: any }) => {
        const _encrypter = (datas: any) => {
          if (!datas) {
            // ne rien faire
          } else if (Array.isArray(datas)) {
            for (let i = 0; i < datas.length; i++) {
              datas[i] = _encrypter(datas[i]);
            }
          } else if (
            Object.prototype.toString.call(datas) === "[object Object]"
          ) {
            if ("_RSA_ENCODED_" in datas) {
              if (Store.session.apiPublicKey) {
                datas._RSA_ENCODED_ = encrypter(datas._RSA_ENCODED_, "api");
              } else {
                datas = null;
              }
            } else {
              for (const key in datas) {
                datas[key] = _encrypter(datas[key]);
              }
            }
          }

          return datas;
        };

        return _encrypter(obj);
      };

      params.body = $encrypter(params.body || {});

      const onError = async (data: any) => {
        const errors: string[] = data.error || ["unknown_error"];

        for (const error of errors) {
          Notify.push({
            text: createVNode(
              "div",
              { class: "d-flex flex-colum align-center ga-2" },
              [
                createVNode("i", {
                  class: "fi fi-sr-cross-circle text-red",
                  style: { fontSize: "22px" },
                }),
                Use.i18n.t(`error.${error}`),
              ]
            ),
          });
        }

        if (errors.includes("session_closed")) {
          await Store.session.clean();
          await Store.session.fetchUser();
          useRouter().push({ name: "session-login" });
        }

        return data;
      };

      const apiUrl = "http://localhost:22300";
      const sessionId = Store.session.sessionId;

      fetch(`${apiUrl}/${params.url}`, {
        method: params.method,
        headers: {
          "Content-Type": "Application/json",
          Accept: "Application/json",
          authorization: sessionId ? `Bearer ${sessionId}` : "",
        },
        body:
          params.method !== "get"
            ? JSON.stringify({ ...params.body })
            : undefined,
        signal: params.signal,
      })
        .then((response) => {
          response
            .json()
            .then((data) => {
              response.ok
                ? resolve($decrypter(data._RESPONSE_) as T)
                : reject(onError(data));
            })
            .catch((error) => reject(error));
        })
        .catch((error: TypeError) => {
          console.log(error);

          if (error.name !== "AbortError") reject("abort");
          else reject(error);
        });

      // const data = await response.json();
    });
  },
};
