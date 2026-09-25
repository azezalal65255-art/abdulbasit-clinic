/**
 * Centralized image URL resolution utility ensuring Supabase Storage is always prioritized.
 */
export function resolveImageUrl(itemOrUrl: any, fallback = ''): string {
  if (!itemOrUrl) return fallback;

  if (typeof itemOrUrl === 'string') {
    const trimmed = itemOrUrl.trim();
    if (!trimmed || trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
      return fallback;
    }
    return trimmed;
  }

  const candidates = [
    itemOrUrl?.url,
    itemOrUrl?.image,
    itemOrUrl?.imageUrl,
    itemOrUrl?.public_url,
    itemOrUrl?.photo,
    itemOrUrl?.coverImage,
    itemOrUrl?.thumbnailUrl,
    itemOrUrl?.thumbnail,
  ];

  // Find the first valid Supabase storage URL
  const supabaseUrl = candidates.find(
    (val) => typeof val === 'string' && val.includes('supabase.co/storage/')
  );

  if (supabaseUrl) {
    return supabaseUrl.trim();
  }

  // Find any non-empty valid string candidate
  const validCandidate = candidates.find(
    (val) =>
      typeof val === 'string' &&
      val.trim() !== '' &&
      !val.startsWith('blob:') &&
      !val.startsWith('data:')
  );

  if (validCandidate) {
    return validCandidate.trim();
  }

  return fallback;
}
