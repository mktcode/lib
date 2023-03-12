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
      clientId: 'acf1b9890f41cf7daf8e',
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
