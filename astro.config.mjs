import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://bokepjilbabsmp.pages.dev',
  output: 'hybrid',
  adapter: cloudflare(),
});