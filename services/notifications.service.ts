import { api } from "@/lib/axios";
import { NOTIFICATIONS } from "@/lib/endpoints";

export const notificationsService = {
  getAll: () => api.get(NOTIFICATIONS.ALL),

  getOne: (id: number) => api.get(NOTIFICATIONS.SINGLE(id)),

  markRead: (id: number) =>
    api.post(NOTIFICATIONS.MARK_READ(id)),

  markAllRead: () =>
    api.post(NOTIFICATIONS.MARK_ALL_READ),
};
