import { supabase } from "@/integrations/supabase/client";

export interface EventData {
  id: string;
  name: string;
  date: string;
  venue: string;
  cover_image: string;
  welcome_message?: string | null;
  welcome_title?: string | null;
  welcome_background_image?: string | null;
  qr_enabled?: boolean;
  uploads: number;
  contributors: number;
  created_at?: string;
}

// Map DB row to EventData (password column is no longer readable client-side)
const mapRow = (row: any): EventData => ({
  id: row.id,
  name: row.name,
  date: row.date,
  venue: row.venue || "",
  cover_image: row.cover_image || "",
  welcome_message: row.welcome_message,
  welcome_title: row.welcome_title ?? "Welcome!",
  welcome_background_image: row.welcome_background_image ?? null,
  qr_enabled: row.qr_enabled ?? true,
  uploads: row.uploads || 0,
  contributors: row.contributors || 0,
  created_at: row.created_at,
});

// ── Secure write layer ──
// All privileged writes go through the `event-write` edge function, which
// validates the admin password or the event (host) password server-side.

const ADMIN_PW_KEY = "mv_admin_pw";
const eventPwKey = (eventId: string) => `mv_event_pw_${eventId}`;

export const storeAdminPassword = (password: string) =>
  sessionStorage.setItem(ADMIN_PW_KEY, password);
export const clearAdminPassword = () => sessionStorage.removeItem(ADMIN_PW_KEY);
export const storeEventPassword = (eventId: string, password: string) =>
  sessionStorage.setItem(eventPwKey(eventId), password);

const credentials = (eventId?: string) => ({
  adminPassword: sessionStorage.getItem(ADMIN_PW_KEY) || undefined,
  eventPassword: eventId ? sessionStorage.getItem(eventPwKey(eventId)) || undefined : undefined,
});

// True when the current session holds admin or host (event password) credentials
export const hasEventAccess = (eventId: string) =>
  !!sessionStorage.getItem(ADMIN_PW_KEY) || !!sessionStorage.getItem(eventPwKey(eventId));

const callEventWrite = async <T = any>(
  action: string,
  payload: Record<string, unknown> = {}
): Promise<{ ok: boolean; data?: T }> => {
  const eventId = payload.eventId as string | undefined;
  const { data, error } = await supabase.functions.invoke("event-write", {
    body: { action, ...credentials(eventId), ...payload },
  });
  if (error) {
    console.error(`event-write ${action} failed`);
    return { ok: false };
  }
  return { ok: true, data: data as T };
};

// Verify an event password server-side; never reads the password client-side.
export const verifyEventPassword = async (eventId: string, password: string): Promise<boolean> => {
  const { data, error } = await supabase.functions.invoke("event-write", {
    body: { action: "verify_password", eventId, eventPassword: password },
  });
  if (error) return false;
  const valid = (data as { valid?: boolean })?.valid === true;
  if (valid) storeEventPassword(eventId, password);
  return valid;
};




export const fetchAllEvents = async (): Promise<EventData[]> => {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching events:", error);
    return [];
  }
  return (data || []).map(mapRow);
};

export const fetchEventById = async (eventId: string): Promise<EventData | null> => {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .maybeSingle();
  if (error || !data) return null;
  return mapRow(data);
};

export const createEvent = async (event: EventData, password: string): Promise<boolean> => {
  const { ok } = await callEventWrite("create_event", {
    password,
    event: {
      id: event.id,
      name: event.name,
      date: event.date,
      venue: event.venue,
      cover_image: event.cover_image,
      welcome_message: event.welcome_message || null,
      welcome_title: event.welcome_title || "Welcome!",
      welcome_background_image: event.welcome_background_image || null,
      qr_enabled: event.qr_enabled ?? true,
    },
  });
  return ok;
};

export const deleteEvent = async (eventId: string): Promise<boolean> => {
  const { ok } = await callEventWrite("delete_event", { eventId });
  return ok;
};

export const updateEventWelcome = async (eventId: string, title: string, message: string): Promise<boolean> => {
  const { ok } = await callEventWrite("update_event", {
    eventId,
    updates: { welcome_title: title, welcome_message: message },
  });
  return ok;
};

export const updateEventQrEnabled = async (eventId: string, enabled: boolean): Promise<boolean> => {
  const { ok } = await callEventWrite("update_event", {
    eventId,
    updates: { qr_enabled: enabled },
  });
  return ok;
};

export interface EventUpdatableFields {
  name?: string;
  date?: string;
  venue?: string;
  welcome_title?: string;
  welcome_message?: string | null;
  cover_image?: string;
  welcome_background_image?: string | null;
  qr_enabled?: boolean;
}

export const updateEventDetails = async (
  eventId: string,
  updates: EventUpdatableFields
): Promise<boolean> => {
  const { ok } = await callEventWrite("update_event", { eventId, updates });
  return ok;
};

export const updateEventImages = async (
  eventId: string,
  updates: { cover_image?: string; welcome_background_image?: string | null }
): Promise<boolean> => {
  const { ok } = await callEventWrite("update_event", { eventId, updates });
  return ok;
};

export const uploadCoverImage = async (eventId: string, file: File): Promise<string | null> => {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${eventId}/cover-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("event-covers").upload(path, file);
  if (error) {
    console.error("Cover upload error:", error);
    return null;
  }
  const { data } = supabase.storage.from("event-covers").getPublicUrl(path);
  return data.publicUrl;
};

export const uploadWelcomeBackgroundImage = async (eventId: string, file: File): Promise<string | null> => {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${eventId}/welcome-bg-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("event-covers").upload(path, file);
  if (error) {
    console.error("Welcome background upload error:", error);
    return null;
  }
  const { data } = supabase.storage.from("event-covers").getPublicUrl(path);
  return data.publicUrl;
};

export interface MediaItem {
  id: string;
  event_id: string;
  file_url: string;
  type: "image" | "video";
  uploader_name: string;
  uploaded_at: string;
}

export const fetchEventMedia = async (eventId: string): Promise<MediaItem[]> => {
  const { data, error } = await supabase
    .from("event_media")
    .select("*")
    .eq("event_id", eventId)
    .order("uploaded_at", { ascending: false });
  if (error) return [];
  return (data || []) as MediaItem[];
};

const getUploadMimeType = (blob: Blob, type: "image" | "video") => {
  const fallback = type === "image" ? "image/jpeg" : "video/webm";
  return (blob.type || fallback).split(";")[0].toLowerCase();
};

const getUploadExtension = (mimeType: string, type: "image" | "video") => {
  if (mimeType.includes("mp4")) return "mp4";
  if (mimeType.includes("quicktime")) return "mov";
  if (mimeType.includes("webm")) return "webm";
  if (mimeType.includes("png")) return "png";
  if (mimeType.includes("heic")) return "heic";
  return type === "image" ? "jpg" : "webm";
};

export const uploadMedia = async (
  eventId: string,
  blob: Blob,
  type: "image" | "video",
  uploaderName: string
): Promise<MediaItem | null> => {
  const id = `media-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const mimeType = getUploadMimeType(blob, type);
  const ext = getUploadExtension(mimeType, type);
  const path = `${eventId}/${id}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("event-media")
    .upload(path, blob, { contentType: mimeType });
  if (uploadError) {
    console.error("Media upload error:", uploadError);
    return null;
  }

  const { data: urlData } = supabase.storage.from("event-media").getPublicUrl(path);
  const fileUrl = urlData.publicUrl;

  const item: MediaItem = {
    id,
    event_id: eventId,
    file_url: fileUrl,
    type,
    uploader_name: uploaderName || "Guest",
    uploaded_at: new Date().toISOString(),
  };

  if (hasEventAccess(eventId)) {
    // Host/admin session: insert via secure edge function (works even if QR is off)
    const { ok } = await callEventWrite("add_media", {
      eventId,
      mediaId: id,
      file_url: fileUrl,
      type,
      uploader_name: item.uploader_name,
    });
    if (!ok) return null;
    return item;
  }

  const { error: insertError } = await supabase.from("event_media").insert(item);
  if (insertError) {
    console.error("Media record insert error:", insertError);
    return null;
  }

  return item;
};

export const deleteMedia = async (eventId: string, mediaId: string): Promise<boolean> => {
  const { ok } = await callEventWrite("delete_media", { eventId, mediaId });
  return ok;
};

export const clearEventMedia = async (eventId: string): Promise<boolean> => {
  const { ok } = await callEventWrite("clear_media", { eventId });
  return ok;
};

// ── Showcase media (admin-uploaded photos/videos for event page) ──

export interface ShowcaseMediaItem {
  id: string;
  event_id: string;
  file_url: string;
  type: "image" | "video";
  sort_order: number;
  created_at: string;
}

export const fetchShowcaseMedia = async (eventId: string): Promise<ShowcaseMediaItem[]> => {
  const { data, error } = await supabase
    .from("event_showcase_media")
    .select("*")
    .eq("event_id", eventId)
    .order("sort_order", { ascending: true });
  if (error) return [];
  return (data || []) as ShowcaseMediaItem[];
};

export const uploadShowcaseMedia = async (
  eventId: string,
  file: File
): Promise<ShowcaseMediaItem | null> => {
  const id = `showcase-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${eventId}/showcase/${id}.${ext}`;
  const type: "image" | "video" = file.type.startsWith("video") ? "video" : "image";

  const { error: uploadError } = await supabase.storage
    .from("event-media")
    .upload(path, file, { contentType: file.type });
  if (uploadError) {
    console.error("Showcase upload error:", uploadError);
    return null;
  }

  const { data: urlData } = supabase.storage.from("event-media").getPublicUrl(path);

  const item: ShowcaseMediaItem = {
    id,
    event_id: eventId,
    file_url: urlData.publicUrl,
    type,
    sort_order: 0,
    created_at: new Date().toISOString(),
  };

  const { ok } = await callEventWrite("add_showcase", {
    eventId,
    file_url: item.file_url,
    type: item.type,
    sort_order: item.sort_order,
  });
  if (!ok) return null;

  return item;
};

export const deleteShowcaseMedia = async (eventId: string, mediaId: string): Promise<boolean> => {
  const { ok } = await callEventWrite("delete_showcase", { eventId, mediaId });
  return ok;
};
