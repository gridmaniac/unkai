import { defineMongooseModel } from "#nuxt/mongoose";

export const Memory = defineMongooseModel<Memory>("Memory", {
  title: { type: String, required: true },
  text: { type: String, default: null },
  dateFrom: { type: Date, required: true },
  dateTo: { type: Date, default: null },
  images: { type: [String], default: [] },
  chunks: { type: [String], default: [] },
  requiresSync: { type: Boolean, default: false },
});
