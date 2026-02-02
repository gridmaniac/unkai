import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "@nuxt/eslint",
    "nuxt-mongoose",
    "@pinia/nuxt",
    "@pinia/colada-nuxt",
  ],
  imports: {
    dirs: ["queries", "mutations"],
  },
  mongoose: {
    uri: process.env.DB_URI,
    options: {},
    modelsDir: "models",
    devtools: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
  css: ["~/assets/app.css"],
});
