// src/pages/api/search.ts
import type { APIRoute } from 'astro';
import videosData from '../../data/videos.json';

export const GET: APIRoute = async ({ url }) => {
  const query = url.searchParams.get('q');

  if (!query) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  const searchTerm = query.toLowerCase();
  const results = videosData.filter(video =>
    video.title.toLowerCase().includes(searchTerm) ||
    video.description.toLowerCase().includes(searchTerm) ||
    video.category.toLowerCase().includes(searchTerm)
  );

  return new Response(JSON.stringify(results), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};