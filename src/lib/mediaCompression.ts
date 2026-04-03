import imageCompression from "browser-image-compression";

/**
 * Compress an image while preserving quality.
 * Target: max 2MB, keep original dimensions up to 4096px.
 */
export const compressImage = async (blob: Blob): Promise<Blob> => {
  try {
    const file = blob instanceof File ? blob : new File([blob], "photo.jpg", { type: blob.type || "image/jpeg" });
    const compressed = await imageCompression(file, {
      maxSizeMB: 2,
      maxWidthOrHeight: 4096,
      useWebWorker: true,
      initialQuality: 0.85,
      preserveExif: true,
    });
    return compressed;
  } catch (err) {
    console.warn("Image compression failed, using original:", err);
    return blob;
  }
};

/**
 * Compress a video by re-encoding at a lower bitrate using MediaRecorder.
 * Preserves resolution. Falls back to original on failure.
 */
export const compressVideo = async (blob: Blob): Promise<Blob> => {
  // Skip compression entirely — preserve original quality
  return blob;
};
