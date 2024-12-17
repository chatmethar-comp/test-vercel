// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["vuetify-nuxt-module", "nuxt-vue3-google-signin", "@nuxt/ui"],
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  googleSignIn: {
    clientId: process.env.GOOGLE_CLIENT_ID
  },
  vuetify: {
    moduleOptions: {
      /* module specific options */
    },
    vuetifyOptions: {
      theme: {
        themes: {
          light: {
            colors: {
              "star-red-300": "#DB5461",
              "neutral-300": "#777777",
            },
          },
        },
      },
    },
  },
});