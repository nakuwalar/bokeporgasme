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

export async function getAllVideos(): Promise<VideoData[]> {
  console.log(`[getAllVideos] Data video dimuat. Total video: ${videosData.length}`);
  return videosData as VideoData[];
}
