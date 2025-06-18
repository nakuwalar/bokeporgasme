// src/pages/api/download-thumbnail.ts
import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pastikan jalur ini benar untuk direktori `public` proyek Astro Anda
const THUMBNAILS_DIR = path.join(__dirname, '../../../public/thumbnails');

export const POST: APIRoute = async ({ request }) => {
  if (request.headers.get('Content-Type') !== 'application/json') {
    return new Response('Content-Type must be application/json', { status: 400 });
  }

  const { imageUrl, videoTitle } = await request.json();

  if (!imageUrl || !videoTitle) {
    return new Response(JSON.stringify({ error: 'imageUrl and videoTitle are required.' }), { status: 400 });
  }

  let cleanedTitle = videoTitle
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[-\s]+/g, '-')
    .toLowerCase();

  if (!cleanedTitle) {
    // Fallback jika judul video menghasilkan nama file kosong
    cleanedTitle = 'default-thumbnail-' + Date.now();
  }

  let ext = path.extname(new URL(imageUrl).pathname);
  if (!ext || ext.length > 5) { // Batasi panjang ekstensi, antisipasi URL aneh
    ext = '.jpg';
  }

  // Tambahkan hash unik untuk menghindari konflik nama file jika judul sama
  const uniqueHash = Math.random().toString(36).substring(2, 8);
  const fileName = `${cleanedTitle}-${uniqueHash}${ext}`;
  const filePath = path.join(THUMBNAILS_DIR, fileName);

  try {
    await fs.mkdir(THUMBNAILS_DIR, { recursive: true });

    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const imageBuffer = await response.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(imageBuffer));

    const publicPath = `/thumbnails/${fileName}`; // Path yang akan digunakan di HTML

    return new Response(
      JSON.stringify({
        message: 'Thumbnail downloaded successfully!',
        localPath: publicPath,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error(`Failed to download or save thumbnail: ${error.message}`);
    return new Response(
      JSON.stringify({ error: `Failed to process request: ${error.message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};