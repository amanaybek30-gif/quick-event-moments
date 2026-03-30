// Persistent media storage using localStorage (per-event)

export interface StoredMedia {
  id: string;
  dataUrl: string;
  type: "image" | "video";
  uploadedAt: string;
  uploaderName: string;
}

const MEDIA_KEY_PREFIX = "momentique_media_";

export const getEventMedia = (eventId: string): StoredMedia[] => {
  try {
    const stored = localStorage.getItem(`${MEDIA_KEY_PREFIX}${eventId}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveEventMedia = (eventId: string, media: StoredMedia[]) => {
  try {
    localStorage.setItem(`${MEDIA_KEY_PREFIX}${eventId}`, JSON.stringify(media));
  } catch (e) {
    console.warn("Storage full, could not save media", e);
  }
};

export const addMediaToEvent = (eventId: string, item: StoredMedia) => {
  const existing = getEventMedia(eventId);
  saveEventMedia(eventId, [item, ...existing]);
};

export const deleteMediaFromEvent = (eventId: string, mediaId: string) => {
  const existing = getEventMedia(eventId);
  saveEventMedia(eventId, existing.filter((m) => m.id !== mediaId));
};

export const clearEventMedia = (eventId: string) => {
  localStorage.removeItem(`${MEDIA_KEY_PREFIX}${eventId}`);
};

export const blobToDataUrl = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
