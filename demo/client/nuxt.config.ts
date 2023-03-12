// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
    clientSecret: process.env.NUXT_CLIENT_SECRET,
    public: {
      clientId: process.env.NUXT_CLIENT_ID,
    }
  },
  vite: {
    resolve: {
      alias: {
        "node-fetch": "isomorphic-fetch",
      },
    },
  }
})
