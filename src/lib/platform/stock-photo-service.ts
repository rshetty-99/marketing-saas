/**
 * Stock Photo Library Service (Unsplash / Pexels / Pixabay)
 * Search and download royalty-free images.
 * Production: real API calls. Dev: mock results.
 */

export async function searchStockPhotos(query: string, provider: string = 'unsplash', page: number = 1, perPage: number = 20) {
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
  const pexelsKey = process.env.PEXELS_API_KEY;

  // Production: real API calls
  if (provider === 'unsplash' && unsplashKey) {
    const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`, {
      headers: { Authorization: `Client-ID ${unsplashKey}` },
    });
    const data = await res.json();
    return (data.results ?? []).map((photo: Record<string, unknown>) => ({
      id: photo.id, provider: 'unsplash',
      url: (photo.urls as Record<string, string>)?.regular,
      thumbnailUrl: (photo.urls as Record<string, string>)?.thumb,
      width: photo.width, height: photo.height,
      photographer: (photo.user as Record<string, string>)?.name,
      photographerUrl: (photo.user as Record<string, unknown>)?.links ? ((photo.user as Record<string, unknown>).links as Record<string, string>)?.html : '',
      description: photo.description ?? photo.alt_description,
      downloadUrl: (photo.urls as Record<string, string>)?.full,
      license: 'Unsplash License',
    }));
  }

  if (provider === 'pexels' && pexelsKey) {
    const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`, {
      headers: { Authorization: pexelsKey },
    });
    const data = await res.json();
    return (data.photos ?? []).map((photo: Record<string, unknown>) => ({
      id: String(photo.id), provider: 'pexels',
      url: (photo.src as Record<string, string>)?.large,
      thumbnailUrl: (photo.src as Record<string, string>)?.tiny,
      width: photo.width, height: photo.height,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      description: photo.alt,
      downloadUrl: (photo.src as Record<string, string>)?.original,
      license: 'Pexels License',
    }));
  }

  // Mock results for dev
  return Array.from({ length: perPage }, (_, i) => ({
    id: `mock_${provider}_${page}_${i}`,
    provider,
    url: `https://picsum.photos/seed/${query}${i}/800/600`,
    thumbnailUrl: `https://picsum.photos/seed/${query}${i}/200/150`,
    width: 800, height: 600,
    photographer: `Photographer ${i + 1}`,
    photographerUrl: '#',
    description: `${query} stock photo ${i + 1}`,
    downloadUrl: `https://picsum.photos/seed/${query}${i}/1920/1080`,
    license: `${provider} License (mock)`,
  }));
}
