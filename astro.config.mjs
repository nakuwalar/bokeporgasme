import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// Ganti dengan URL situs Anda yang sebenarnya!
const SITE_URL = 'https://bokeporgasme.pages.dev/';

export default defineConfig({
  site: SITE_URL,
  integrations: [
    tailwind(),
    sitemap(),
  ],
});
