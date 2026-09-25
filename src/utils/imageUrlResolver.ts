const SUPABASE_MEDIA_BASE_URL = 'https://rmvhgoewsegyohdbsjsd.supabase.co/storage/v1/object/public/media/';

/**
 * Centralized image URL resolution utility ensuring Supabase Storage is always prioritized.
 * Adheres strictly to the rule:
 * 1. Finds the first Supabase Storage URL among candidates.
 * 2. If storage_path is present (e.g. images/file.jpg), constructs the full Supabase public URL.
 * 3. Falls back to any valid non-blob, non-data candidate.
 */
export function resolveImageUrl(itemOrUrl: any, fallback = ''): string {
  if (!itemOrUrl) return fallback;

  // If itemOrUrl is a string directly
  if (typeof itemOrUrl === 'string') {
    const trimmed = itemOrUrl.trim();
    if (!trimmed || trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
      return fallback;
    }
    if (trimmed.includes('supabase.co/storage/')) {
      return trimmed;
    }
    if (trimmed.startsWith('images/') || trimmed.startsWith('videos/')) {
      return `${SUPABASE_MEDIA_BASE_URL}${trimmed}`;
    }
    if (trimmed.startsWith('media/images/') || trimmed.startsWith('media/videos/')) {
      return `${SUPABASE_MEDIA_BASE_URL}${trimmed.replace(/^media\//, '')}`;
    }
    return trimmed;
  }

  const candidates = [
    itemOrUrl?.image,
    itemOrUrl?.imageUrl,
    itemOrUrl?.url,
    itemOrUrl?.public_url,
    itemOrUrl?.publicUrl,
    itemOrUrl?.photo,
    itemOrUrl?.coverImage,
    itemOrUrl?.thumbnailUrl,
    itemOrUrl?.thumbnail,
  ];

  // 1. First priority: any Supabase storage full URL
  const supabaseUrl = candidates.find(
    (val) => typeof val === 'string' && val.includes('supabase.co/storage/')
  );

  if (supabaseUrl && typeof supabaseUrl === 'string') {
    return supabaseUrl.trim();
  }

  // 2. Second priority: storage_path inside media bucket
  const storagePath = itemOrUrl?.storage_path || itemOrUrl?.storagePath;
  if (typeof storagePath === 'string' && storagePath.trim() !== '') {
    const cleanPath = storagePath.trim().replace(/^media\//, '');
    if (cleanPath.startsWith('images/') || cleanPath.startsWith('videos/')) {
      return `${SUPABASE_MEDIA_BASE_URL}${cleanPath}`;
    }
  }

  // 3. Third priority: any non-empty valid string candidate (excluding transient blob/data)
  const validCandidate = candidates.find(
    (val) =>
      typeof val === 'string' &&
      val.trim() !== '' &&
      !val.startsWith('blob:') &&
      !val.startsWith('data:')
  );

  if (validCandidate && typeof validCandidate === 'string') {
    const trimmed = validCandidate.trim();
    if (trimmed.startsWith('images/') || trimmed.startsWith('videos/')) {
      return `${SUPABASE_MEDIA_BASE_URL}${trimmed}`;
    }
    return trimmed;
  }

  return fallback;
}
