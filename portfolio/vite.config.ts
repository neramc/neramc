import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'
import { remix } from 'vite-plugin-remix3'

export default defineConfig({
  plugins: [nitro(), remix()],
  nitro: {
    // `public/` is served by Nitro from the output's static directory. Keep the
    // bounded cache policy the old `staticFiles` middleware gave these files.
    routeRules: {
      '/favicon.svg': { headers: { 'cache-control': 'public, max-age=3600' } },
    },
  },
})
