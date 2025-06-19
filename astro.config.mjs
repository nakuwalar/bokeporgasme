// astro.config.mjs
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import { getAllVideos } from './src/utils/data.ts'; // Sesuaikan path jika berbeda
import { slugify } from './src/utils/slugify.ts'; // Sesuaikan path jika berbeda

// Fungsi async untuk mendapatkan URL tag kustom
async function getCustomTagUrls() {
  const allVideos = await getAllVideos();
  const uniqueTags = new Set();
  allVideos.forEach(video => {
    if (typeof video.tags === 'string') {
      video.tags.split(',').forEach(tag => {
        const trimmedTag = tag.trim();
        if (trimmedTag) {
          uniqueTags.add(trimmedTag.toLowerCase()); // Simpan dalam lowercase untuk konsistensi
        }
      });
    }
  });

  // Buat array URL untuk setiap tag unik, mengarah ke halaman pertama pencarian tag
  const tagUrls = Array.from(uniqueTags).map(tag => `/cari/${slugify(tag)}/1`);

  return tagUrls;
}

// https://astro.build/config
export default defineConfig({
  output: 'server', // Mengaktifkan Server-Side Rendering (SSR)
  adapter: cloudflare(), // Adapter untuk deployment di Cloudflare Pages/Workers
  site: 'https://bokeporgasme.pages.dev', // ✨ PENTING: Ganti dengan URL domain Anda yang sebenarnya
  integrations: [
    sitemap({
      // Fungsi untuk menambahkan halaman kustom
      customPages: async () => {
        const tagUrls = await getCustomTagUrls();
        return tagUrls;
      },
    }),
  ],
});
