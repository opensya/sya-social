import session from "~/store/session";

class Store {
  get session() {
    return session();
  }
}

const store = new Store();
export default store;
