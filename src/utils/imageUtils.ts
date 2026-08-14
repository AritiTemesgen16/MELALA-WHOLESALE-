/**
 * Utility to generate optimized Cloudinary image URLs with automatic format (AVIF/WebP)
 * and dynamic quality and width constraints, preventing oversized image payloads.
 */
export function getOptimizedImageUrl(
  url: string,
  options?: { width?: number; height?: number; crop?: 'limit' | 'fill' | 'fit' | 'thumb' }
): string {
  if (!url) {
    return 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80';
  }

  // If not a Cloudinary image URL, return original
  if (!url.includes('cloudinary.com') || !url.includes('/upload/')) {
    return url;
  }

  const { width = 800, crop = 'limit' } = options || {};
  const transformation = `c_${crop},w_${width},q_auto,f_auto`;

  // Avoid duplicating transformations if already present
  if (url.includes('/upload/c_')) {
    return url;
  }

  return url.replace('/upload/', `/upload/${transformation}/`);
}

/**
 * Extracts public_id from Cloudinary URL if it belongs to Melala folders
 */
export function extractCloudinaryPublicId(url: string): string | null {
  if (!url || !url.includes('cloudinary.com')) return null;

  try {
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) return null;

    let pathAfterUpload = url.substring(uploadIndex + 8); // after '/upload/'
    // Remove version string if present e.g. v123456789/
    if (pathAfterUpload.match(/^v\d+\//)) {
      pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, '');
    }

    // Remove file extension
    const lastDotIndex = pathAfterUpload.lastIndexOf('.');
    if (lastDotIndex !== -1) {
      pathAfterUpload = pathAfterUpload.substring(0, lastDotIndex);
    }

    // Only allow operations for melala/ or melala_owners/ assets
    if (pathAfterUpload.startsWith('melala/') || pathAfterUpload.startsWith('melala_owners/')) {
      return pathAfterUpload;
    }
  } catch (err) {
    console.error('Error extracting Cloudinary public_id:', err);
  }

  return null;
}
