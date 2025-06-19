// src/utils/data.ts
import videosData from '../data/videos.json';

export interface VideoData {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  embedUrl: string;
  tags: string; // Tipe data diubah menjadi string
}

// src/utils/data.ts (Contoh, pastikan fungsi ini ada dan benar)
export async function getAllVideos() {
  const response = await fetch('http://localhost:4321/data/videos.json'); // Sesuaikan URL atau path ke file JSON Anda
  // Jika Anda membaca dari file lokal saat build, gunakan metode Node.js
  // const filePath = new URL('../../data/videos.json', import.meta.url);
  // const fileContent = await fs.promises.readFile(filePath, 'utf-8');
  // return JSON.parse(fileContent);
  const data = await response.json();
  return videosData as VideoData[];
}

// src/utils/slugify.ts (Contoh, pastikan fungsi ini ada dan benar)
export function slugify(text: string) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}
