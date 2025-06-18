// src/utils/slugify.ts

/**
 * Mengubah teks menjadi slug yang ramah URL.
 * Menambahkan angka jika slug yang dihasilkan sudah ada dalam daftar existingSlugs.
 *
 * @param text Teks asli (misalnya, judul video).
 * @param existingSlugs (Opsional) Set atau Array dari slug yang sudah ada untuk memeriksa duplikasi.
 * @returns Slug yang unik.
 */
export function slugify(text: string, existingSlugs?: Set<string> | string[]): string {
  let baseSlug = text
    .toString()
    .normalize('NFD') // Normalisasi unicode characters (misal: "é" -> "e")
    .replace(/[\u0300-\u036f]/g, '') // Hapus diacritics
    .toLowerCase() // Ubah ke huruf kecil
    .trim() // Hapus spasi awal/akhir
    .replace(/\s+/g, '-') // Ganti spasi dengan hyphen
    .replace(/[^\w-]+/g, '') // Hapus semua karakter non-word kecuali hyphen
    .replace(/--+/g, '-'); // Ganti hyphen berulang dengan satu hyphen

  // Jika tidak ada existingSlugs atau tidak ada duplikasi, kembalikan baseSlug
  if (!existingSlugs || !new Set(existingSlugs).has(baseSlug)) {
    return baseSlug;
  }

  // Jika ada duplikasi, tambahkan angka di akhir
  let uniqueSlug = baseSlug;
  let counter = 1;
  const slugsSet = new Set(existingSlugs); // Konversi ke Set untuk pencarian yang lebih cepat

  while (slugsSet.has(uniqueSlug)) {
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }

  return uniqueSlug;
}