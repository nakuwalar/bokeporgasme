// scripts/downloadThumbnails.ts
import fs from 'node:fs/promises';
import path from 'node:path';
import fetch from 'node-fetch';
import { URL } from 'node:url';
import videosData from '../src/data/videos.json';
import { slugify } from '../src/utils/slugify.ts'; // Ensure this has .ts

interface Video {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  embedUrl: string;
  tags?: string;
  slug?: string;
}

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const THUMBNAILS_DIR = path.join(PUBLIC_DIR, 'thumbnails');

async function downloadAndProcessThumbnails() {
  console.log('[Thumbnail Downloader] Starting thumbnail download process...');

  try { // <-- Add a try-catch block for the initial mkdir
    await fs.mkdir(THUMBNAILS_DIR, { recursive: true });
  } catch (mkdirError: any) {
    console.error(`[Thumbnail Downloader] FATAL ERROR: Could not create thumbnail directory: ${mkdirError.message}`);
    process.exit(1); // Exit with error if dir cannot be created
  }

  let updatedVideosData: Video[] = [];
  let downloadedCount = 0;
  let skippedCount = 0;
  let failedCount = 0; // <-- New counter for failed downloads

  for (const video of videosData as Video[]) {
    const originalThumbnailUrl = video.thumbnail;
    let newThumbnailPath = originalThumbnailUrl;

    const isExternalUrl = originalThumbnailUrl.startsWith('http://') || originalThumbnailUrl.startsWith('https://');

    if (isExternalUrl) {
      try {
        console.log(`[Thumbnail Downloader] Processing: ${video.title} from ${originalThumbnailUrl}`);

        let fileName: string;
        try { // <-- Nested try-catch for URL parsing and filename generation
            const baseSlug = video.slug || slugify(video.title);
            let ext = path.extname(new URL(originalThumbnailUrl).pathname);
            if (!ext || ext.length > 5 || ext.includes('/')) {
                ext = '.jpg'; // Fallback for invalid or missing extension
            }
            const uniqueHash = Math.random().toString(36).substring(2, 8);
            fileName = `${baseSlug}-${uniqueHash}${ext}`;
        } catch (urlParseError: any) {
            console.error(`[Thumbnail Downloader] ERROR: Invalid URL or filename generation for ${video.title} (${originalThumbnailUrl}): ${urlParseError.message}`);
            failedCount++;
            continue; // Skip to next video if URL or filename is bad
        }


        const filePath = path.join(THUMBNAILS_DIR, fileName);

        const response = await fetch(originalThumbnailUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText} from ${originalThumbnailUrl}`);
        }

        const imageBuffer = await response.arrayBuffer();
        await fs.writeFile(filePath, Buffer.from(imageBuffer));

        newThumbnailPath = `/thumbnails/${fileName}`;
        downloadedCount++;
        console.log(`[Thumbnail Downloader] Downloaded: ${video.title} to ${newThumbnailPath}`);

      } catch (error: any) {
        console.error(`[Thumbnail Downloader] ERROR processing ${video.title} (${originalThumbnailUrl}): ${error.message}`);
        failedCount++; // Increment failed count
        // If download/save fails, keep original external URL or use a fallback.
        // For now, we'll keep the original external URL so the site doesn't break if an image is missing.
        newThumbnailPath = originalThumbnailUrl; // Revert to original if failed
        console.warn(`[Thumbnail Downloader] Keeping original external URL for ${video.title} due to download/save error.`);
      }
    } else {
      skippedCount++;
      // If it's not an external URL, ensure the slug is still generated for consistency
      newThumbnailPath = originalThumbnailUrl; // No change if it's already local or not external
    }

    updatedVideosData.push({
      ...video,
      thumbnail: newThumbnailPath,
      slug: video.slug || slugify(video.title)
    });
  }

  // --- Final Step: Write back the updated JSON data ---
  try {
    const jsonPath = path.join(process.cwd(), 'src', 'data', 'videos.json');
    await fs.writeFile(jsonPath, JSON.stringify(updatedVideosData, null, 2));
    console.log(`[Thumbnail Downloader] src/data/videos.json updated with local thumbnail paths (Downloaded: ${downloadedCount}, Skipped: ${skippedCount}, Failed: ${failedCount}).`);
  } catch (writeError: any) {
    console.error(`[Thumbnail Downloader] FATAL ERROR: Could not write updated videos.json: ${writeError.message}`);
    process.exit(1); // Exit with error if cannot write JSON
  }

  if (failedCount > 0) {
      console.error(`[Thumbnail Downloader] WARNING: ${failedCount} thumbnails failed to download. Check logs above for details.`);
      // Optionally, you could exit with a non-zero code here if you want the build to fail
      // if any thumbnails didn't download. For now, we'll let it pass to avoid breaking builds
      // over individual image failures.
  }
}

// Global error handling for the entire script execution
downloadAndProcessThumbnails().catch((err) => {
  console.error('[Thumbnail Downloader] UNCAUGHT ERROR in script execution:', err);
  process.exit(1); // Ensure the script exits with an error code if something truly unexpected happens
});
