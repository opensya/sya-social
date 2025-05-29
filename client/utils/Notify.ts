export interface INotification {
  [key: string]: any;
}

export default {
  push(notification: INotification) {
    notification.id = Lodash.random(10_000_000, 80_000_000).toString();

    dispatchEvent(new CustomEvent("notify:push", { detail: notification }));
  },
};
