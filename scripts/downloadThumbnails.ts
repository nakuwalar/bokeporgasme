// scripts/downloadThumbnails.ts
import fs from 'node:fs/promises';
import path from 'node:path';
import fetch from 'node-fetch';
import { URL } from 'node:url'; // Explicitly import URL for Node.js environment

// Pastikan Anda memiliki file src/data/videos.json yang berisi data video
import videosData from '../src/data/videos.json';
import { slugify } from '../src/utils/slugify'; // Impor slugify helper

// Definisikan struktur Video untuk type safety
interface Video {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string; // Ini akan menjadi URL eksternal atau path lokal
  embedUrl: string;
  tags?: string; // Optional tags property
  slug?: string;
}

// Tentukan direktori tempat thumbnail akan disimpan
// Ini harus relatif ke root proyek, dan akan berakhir di `public/thumbnails`
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const THUMBNAILS_DIR = path.join(PUBLIC_DIR, 'thumbnails');

async function downloadAndProcessThumbnails() {
  console.log('[Thumbnail Downloader] Starting thumbnail download process...');

  await fs.mkdir(THUMBNAILS_DIR, { recursive: true });

  let updatedVideosData: Video[] = [];
  let downloadedCount = 0;
  let skippedCount = 0;

  for (const video of videosData as Video[]) {
    const originalThumbnailUrl = video.thumbnail;
    let newThumbnailPath = originalThumbnailUrl; // Default to original

    // Cek apakah thumbnail sudah berupa path lokal (misalnya, dimulai dengan /thumbnails/)
    // Atau jika itu bukan URL HTTP/HTTPS (misalnya, placeholder atau lokal)
    const isExternalUrl = originalThumbnailUrl.startsWith('http://') || originalThumbnailUrl.startsWith('https://');

    if (isExternalUrl) {
      try {
        console.log(`[Thumbnail Downloader] Processing: ${video.title} from ${originalThumbnailUrl}`);

        // Buat slug unik untuk nama file thumbnail
        const baseSlug = video.slug || slugify(video.title);
        let ext = path.extname(new URL(originalThumbnailUrl).pathname);
        if (!ext || ext.length > 5 || ext.includes('/')) {
            ext = '.jpg'; // Fallback
        }

        // Tambahkan hash unik agar thumbnail dari judul yang sama tidak konflik
        const uniqueHash = Math.random().toString(36).substring(2, 8);
        const fileName = `${baseSlug}-${uniqueHash}${ext}`;
        const filePath = path.join(THUMBNAILS_DIR, fileName);

        const response = await fetch(originalThumbnailUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status} from ${originalThumbnailUrl}`);
        }

        const imageBuffer = await response.arrayBuffer();
        await fs.writeFile(filePath, Buffer.from(imageBuffer));

        // Path yang akan disimpan di data JSON (relatif ke folder public Astro)
        newThumbnailPath = `/thumbnails/${fileName}`;
        downloadedCount++;
        console.log(`[Thumbnail Downloader] Downloaded: ${video.title} to ${newThumbnailPath}`);

      } catch (error: any) {
        console.error(`[Thumbnail Downloader] ERROR processing ${video.title}: ${error.message}`);
        // Jika gagal mengunduh, biarkan URL thumbnail tetap eksternal atau gunakan fallback
        console.warn(`[Thumbnail Downloader] Keeping original external URL for ${video.title} due to error.`);
      }
    } else {
      skippedCount++;
      // console.log(`[Thumbnail Downloader] Skipping local/non-HTTP thumbnail: ${video.title}`);
    }

    updatedVideosData.push({
      ...video,
      thumbnail: newThumbnailPath, // Perbarui path thumbnail
      slug: video.slug || slugify(video.title) // Pastikan slug ada
    });
  }

  // Tulis kembali data JSON yang telah diperbarui
  const jsonPath = path.join(process.cwd(), 'src', 'data', 'videos.json');
  await fs.writeFile(jsonPath, JSON.stringify(updatedVideosData, null, 2));

  console.log(`[Thumbnail Downloader] Process finished. Downloaded: ${downloadedCount}, Skipped: ${skippedCount}`);
  console.log('[Thumbnail Downloader] src/data/videos.json updated with local thumbnail paths.');
}

// Jalankan skrip
downloadAndProcessThumbnails().catch(console.error);