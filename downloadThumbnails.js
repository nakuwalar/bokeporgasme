// downloadThumbnails.js
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// Removed 'sharp' import as it's no longer needed for conversion/download
// Menghilangkan impor 'sharp' karena tidak lagi diperlukan untuk konversi/pengunduhan

// Resolusi __dirname untuk modul ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path ke file videos.json Anda
const VIDEOS_JSON_PATH = path.resolve(__dirname, './videos.json');
// Path ke folder tempat thumbnail akan disimpan (Tidak lagi digunakan untuk mengunduh,
// tetapi bisa tetap ada jika ada file lain yang mengacu padanya)
const OUTPUT_THUMBNAILS_DIR = path.resolve(__dirname, './public/thumbnails');


/**
 * Mengubah string menjadi slug yang ramah URL/nama file.
 * @param {string} text - Teks masukan.
 * @returns {string} - Slug yang dihasilkan.
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Ganti spasi dengan tanda hubung
    .replace(/[^\w-]+/g, '')   // Hapus semua karakter non-kata
    .replace(/--+/g, '-');      // Ganti beberapa tanda hubung dengan satu tanda hubung
}

// Removed the downloadAndConvertToWebP function as we are now using external URLs directly
// Menghilangkan fungsi downloadAndConvertToWebP karena kita sekarang menggunakan URL eksternal secara langsung

async function main() {
  console.log('Memulai proses pembaruan slug unik di videos.json...');

  try {
    // We no longer need to ensure the output directory for downloaded thumbnails
    // Kita tidak lagi perlu memastikan direktori output untuk thumbnail yang diunduh

    // Baca data videos.json
    let videosData = JSON.parse(await fs.readFile(VIDEOS_JSON_PATH, 'utf-8'));
    console.log(`Berhasil membaca ${VIDEOS_JSON_PATH}.`);

    const usedSlugs = new Set(); // Untuk melacak slug yang sudah digunakan

    const updatedVideosData = await Promise.all(
      videosData.map(async (video) => {
        // --- BAGIAN PENTING: MENGHASILKAN DAN MENETAPKAN SLUG DARI TITLE ---
        // Peringatan: Pastikan 'video.title' ada dan tidak kosong.
        // Jika tidak ada 'title', slug tidak akan dibuat untuk entri ini.
        if (!video.title || typeof video.title !== 'string') {
          console.warn(`Video dengan ID ${video.id || 'unknown'} tidak memiliki 'title' yang valid. Slug tidak akan dibuat.`);
          return video; // Lewati pemrosesan slug untuk video ini
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

        // Menetapkan slug unik sebagai properti baru di objek video
        // Ini adalah langkah krusial yang menambahkan 'slug' ke data JSON.
        // Properti 'id' asli tidak diubah.
        video.slug = uniqueSlug;
        // --- AKHIR BAGIAN SLUG ---

        // IMPORTANT: We are no longer modifying the 'thumbnail' URL.
        // It will remain as the external URL provided in videos.json.
        // PENTING: Kami tidak lagi memodifikasi URL 'thumbnail'.
        // Ini akan tetap menjadi URL eksternal yang disediakan di videos.json.

        return video;
      })
    );

    // Tulis kembali data videos.json yang telah diperbarui dengan slug unik
    // Thumbnail URL akan tetap menggunakan URL eksternal yang ada di file JSON asli.
    await fs.writeFile(VIDEOS_JSON_PATH, JSON.stringify(updatedVideosData, null, 2), 'utf-8');
    console.log(`File ${VIDEOS_JSON_PATH} telah diperbarui dengan slug unik.`);
    console.log('Proses pembaruan slug selesai. Thumbnail URL eksternal tetap digunakan.');

  } catch (error) {
    console.error('Terjadi error fatal saat memproses slug:', error);
    process.exit(1); // Keluar dengan kode error
  }
}

main();
