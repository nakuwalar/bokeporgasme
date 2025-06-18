// downloadThumbnails.js
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp'; // Import the sharp library

// Resolve __dirname for ES modules
// Resolusi __dirname untuk modul ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to your videos.json file
// Path ke file videos.json Anda
const VIDEOS_JSON_PATH = path.resolve(__dirname, './videos.json');
// Path to the folder where thumbnails will be saved in Astro's public folder
// Path ke folder tempat thumbnail akan disimpan di folder public Astro
const OUTPUT_THUMBNAILS_DIR = path.resolve(__dirname, './public/thumbnails');

/**
 * Converts a string into a URL/filename-friendly slug.
 * Mengubah string menjadi slug yang ramah URL/nama file.
 * @param {string} text - The input text.
 * @returns {string} - The generated slug.
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Replace spaces with hyphens
    .replace(/[^\w-]+/g, '')   // Remove all non-word characters
    .replace(/--+/g, '-');      // Replace multiple hyphens with a single hyphen
}

/**
 * Downloads a file from a URL, converts it to WebP, and saves it to the destination path.
 * Mengunduh file dari URL, mengonversinya ke WebP, dan menyimpannya ke path tujuan.
 * @param {string} url - The URL of the file to download.
 * @param {string} destPath - The destination path to save the file (filename should already have .webp extension).
 * @returns {Promise<void>}
 */
async function downloadAndConvertToWebP(url, destPath) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download ${url}: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer); // Get the original image buffer

    // Convert the image to WebP using sharp
    // Konversi gambar ke WebP menggunakan sharp
    const webpBuffer = await sharp(imageBuffer)
      .webp({ quality: 80 }) // Set WebP quality (0-100), 80 is a good value
      .toBuffer();

    await fs.writeFile(destPath, webpBuffer);
    console.log(`Successfully downloaded and converted to WebP: ${url} to ${destPath}`);
  } catch (error) {
    console.error(`Error downloading or converting ${url}:`, error);
    throw error; // Re-throw the error so the process knows if there was a failure
  }
}

async function main() {
  console.log('Starting thumbnail download and WebP conversion process, ensuring unique slugs...');
  // Memulai proses pengunduhan dan konversi thumbnail ke WebP, serta memastikan slug unik...

  try {
    // Ensure the output directory exists
    // Pastikan direktori output ada
    await fs.mkdir(OUTPUT_THUMBNAILS_DIR, { recursive: true });
    console.log(`Ensured directory '${OUTPUT_THUMBNAILS_DIR}' exists.`);

    // Read videos.json data
    // Baca data videos.json
    let videosData = JSON.parse(await fs.readFile(VIDEOS_JSON_PATH, 'utf-8'));
    console.log(`Successfully read ${VIDEOS_JSON_PATH}.`);

    const usedSlugs = new Set(); // To track used slugs
    // Untuk melacak slug yang sudah digunakan

    const updatedVideosData = await Promise.all(
      videosData.map(async (video) => {
        // --- BAGIAN PENTING: MENGHASILKAN DAN MENETAPKAN SLUG DARI TITLE ---
        // Peringatan: Pastikan 'video.title' ada dan tidak kosong.
        // Jika tidak ada 'title', slug tidak akan dibuat untuk entri ini.
        if (!video.title || typeof video.title !== 'string') {
          console.warn(`Video dengan ID ${video.id || 'unknown'} tidak memiliki 'title' yang valid. Slug tidak akan dibuat.`);
          return video; // Lewati pemrosesan slug dan thumbnail untuk video ini
        }

        let baseSlug = slugify(video.title);
        let uniqueSlug = baseSlug;
        let counter = 0;

        // Pastikan slug unik. Tambahkan angka jika ada duplikasi (misal: "judul-video-1", "judul-video-2").
        while (usedSlugs.has(uniqueSlug)) {
          counter++;
          uniqueSlug = `${baseSlug}-${counter}`;
        }
        usedSlugs.add(uniqueSlug); // Tambahkan slug yang baru dihasilkan ke daftar yang sudah digunakan

        // Menetapkan slug unik sebagai properti baru di objek video.
        // Ini adalah langkah krusial yang menambahkan 'slug' ke data JSON.
        video.slug = uniqueSlug;
        // --- AKHIR BAGIAN SLUG ---

        if (video.thumbnail && video.thumbnail.startsWith('http')) {
          const originalUrl = video.thumbnail;
          // Nama file thumbnail sekarang berdasarkan slug yang telah dibuat
          const newFileName = `${uniqueSlug}.webp`; // Menggunakan uniqueSlug untuk nama file
          const newFilePath = path.join(OUTPUT_THUMBNAILS_DIR, newFileName);

          try {
            await downloadAndConvertToWebP(originalUrl, newFilePath);
            // Perbarui path thumbnail di data video untuk menunjuk ke file WebP lokal
            video.thumbnail = `/thumbnails/${newFileName}`;
          } catch (error) {
            console.warn(`Melewatkan konversi thumbnail untuk "${video.title}" (slug: ${uniqueSlug}) karena error. Menggunakan URL asli.`);
            // Jika gagal mengunduh/mengonversi, biarkan URL thumbnail tetap URL aslinya.
          }
        }
        // Jika video tidak memiliki thumbnail URL eksternal, atau tidak perlu diproses,
        // properti 'thumbnail' akan tetap seperti adanya di JSON awal atau akan diabaikan
        // jika sebelumnya kosong.

        return video;
      })
    );

    // Tulis kembali data videos.json yang telah diperbarui dengan slug dan path thumbnail lokal
    await fs.writeFile(VIDEOS_JSON_PATH, JSON.stringify(updatedVideosData, null, 2), 'utf-8');
    console.log(`File ${VIDEOS_JSON_PATH} telah diperbarui dengan slug unik dan path thumbnail lokal WebP.`);
    console.log('Pengunduhan dan konversi thumbnail selesai.');

  } catch (error) {
    console.error('Terjadi error fatal saat memproses thumbnail:', error);
    process.exit(1); // Keluar dengan kode error
  }
}

main();
