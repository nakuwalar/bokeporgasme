// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import tailwindcss from '@tailwindcss/vite';

import node from '@astrojs/node';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },

  output: 'server',

  adapter: node({
    mode: 'standalone'
  }),
  site: 'https://bokeporgasme.pages.dev',
  integrations: [
    sitemap(),
    tailwind(),
  ],
  
});
