import { api } from "@/lib/axios";
import { SPLITS } from "@/lib/endpoints";

export const splitsService = {
  getAll: () => api.get(SPLITS.ALL),

  create: (data: {
    title: string;
    category: string;
    split_method: string;
    start_date: string;
    end_date: string;
    location: string;
  }) => api.post(SPLITS.CREATE, data),

  update: (id: number, data: any) =>
    api.patch(SPLITS.UPDATE(id), data),

  join: (id: number) => api.post(SPLITS.JOIN(id)),

  mySplits: () => api.get(SPLITS.MY_SPLITS),
};
