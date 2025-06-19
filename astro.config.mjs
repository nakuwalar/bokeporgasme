// astro.config.mjs
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server', // Mengaktifkan Server-Side Rendering (SSR)
  adapter: cloudflare(), // Adapter untuk deployment di Cloudflare Pages/Workers

  // Jika Anda memiliki masalah CORS, Anda bisa mencoba menambahkan ini (opsional)
  // server: {
  //   host: true, // Mengizinkan akses dari jaringan lokal (untuk dev)
  //   port: 4321,
  //   cors: true, // Mengaktifkan CORS headers untuk semua request (hati-hati di produksi)
  // },
});