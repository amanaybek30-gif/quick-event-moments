import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } }
);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const str = (v: unknown, max = 2000) =>
  typeof v === "string" && v.length <= max ? v : null;

const isAdmin = (pw: unknown) => {
  const expected = Deno.env.get("ADMIN_PASSWORD");
  return !!expected && typeof pw === "string" && pw === expected;
};

const isHost = async (eventId: unknown, pw: unknown) => {
  if (typeof eventId !== "string" || typeof pw !== "string") return false;
  const { data } = await admin
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("password", pw)
    .maybeSingle();
  return !!data;
};

// Resolves the signed-in user (if any) from the request's bearer token.
const getUserId = async (req: Request): Promise<string | null> => {
  const auth = req.headers.get("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
};

const isOwner = async (eventId: unknown, userId: string | null) => {
  if (!userId || typeof eventId !== "string") return false;
  const { data } = await admin
    .from("events")
    .select("owner_id")
    .eq("id", eventId)
    .maybeSingle();
  return !!data && data.owner_id === userId;
};

const EVENT_FIELDS = [
  "name",
  "date",
  "description",
  "venue",
  "cover_image",
  "welcome_message",
  "welcome_title",
  "welcome_background_image",
  "qr_enabled",
] as const;

// Server-side source of truth for guest tiers and pricing (in Birr).
const GUEST_PRICING: Record<number, number | null> = {
  10: 0,
  25: 500,
  50: 1000,
  100: 1500,
  150: 2000,
  200: 3000,
  201: null, // more than 200 guests -> custom price, quoted manually
};

// Photos/videos allowed per guest, and the add-on price (in Birr).
const PHOTO_PRICING: Record<number, number> = {
  5: 0,
  10: 300,
  20: 500,
  30: 800, // 30+ -> unlimited
};

const UNLIMITED_GUESTS = 201;
const UNLIMITED_PHOTOS = 30;

const resolvePlan = (guests: unknown, photos: unknown) => {
  const g = typeof guests === "number" && Number.isInteger(guests) ? guests : 10;
  if (!(g in GUEST_PRICING)) return null;
  const p = typeof photos === "number" && Number.isInteger(photos) ? photos : 5;
  if (!(p in PHOTO_PRICING)) return null;
  const guestPrice = GUEST_PRICING[g];
  const price = (guestPrice ?? 0) + PHOTO_PRICING[p];
  return {
    guest_limit: g,
    photo_limit: p,
    plan_price: price,
    payment_status: price === 0 ? "free" : "pending",
  };
};


const pickUpdates = (input: Record<string, unknown>) => {
  const out: Record<string, unknown> = {};
  for (const key of EVENT_FIELDS) {
    if (key in input) {
      const v = input[key];
      if (key === "qr_enabled") {
        if (typeof v !== "boolean") return null;
        out[key] = v;
      } else if (v === null) {
        out[key] = null;
      } else {
        const s = str(v, 5000);
        if (s === null) return null;
        out[key] = s;
      }
    }
  }
  return out;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const action = str(body.action, 40);
  const eventId = str(body.eventId, 200);
  const adminPassword = body.adminPassword;
  const eventPassword = body.eventPassword;

  try {
    // Public action: verify an event password without exposing it
    if (action === "verify_password") {
      if (!eventId || typeof eventPassword !== "string") {
        return json({ error: "Invalid request" }, 400);
      }
      return json({ valid: await isHost(eventId, eventPassword) });
    }

    const userId = await getUserId(req);

    // Claim a legacy (unowned) event with its event password
    if (action === "claim_event") {
      if (!eventId || typeof eventPassword !== "string") {
        return json({ error: "Invalid request" }, 400);
      }
      if (!userId) return json({ error: "Sign in required" }, 401);
      const { data: ev } = await admin
        .from("events")
        .select("id,owner_id,password")
        .eq("id", eventId)
        .maybeSingle();
      if (!ev) return json({ error: "Event not found" }, 404);
      if (ev.owner_id && ev.owner_id !== userId) {
        return json({ error: "Event already claimed" }, 403);
      }
      if (ev.password !== eventPassword) {
        return json({ error: "Incorrect password" }, 401);
      }
      const { error } = await admin
        .from("events")
        .update({ owner_id: userId })
        .eq("id", eventId);
      if (error) return json({ error: "Could not claim event" }, 400);
      return json({ ok: true });
    }

    // Self-service creation by a signed-in user
    if (action === "create_event_self") {
      if (!userId) return json({ error: "Sign in required" }, 401);
      const ev = (body.event ?? {}) as Record<string, unknown>;
      const id = str(ev.id, 200);
      const name = str(ev.name, 300);
      const date = str(ev.date, 100);
      if (!id || !name || !date) return json({ error: "Missing required event fields" }, 400);
      const updates = pickUpdates(ev);
      if (updates === null) return json({ error: "Invalid event fields" }, 400);
      const plan = resolvePlan(ev.guest_limit);
      if (!plan) return json({ error: "Invalid guest tier" }, 400);

      // Paid tiers require proof of payment before the event is created.
      const paid = plan.plan_price > 0;
      const payerPhone = str(body.payer_phone, 40);
      const transactionRef = str(body.transaction_ref, 120);
      const paymentMethod = str(body.payment_method, 60);
      if (paid && (!payerPhone || payerPhone.length < 7 || !transactionRef ||
        transactionRef.trim().length < 4)) {
        return json({ error: "Phone number and transaction ID are required" }, 400);
      }

      const { error } = await admin.from("events").insert({
        ...updates,
        ...plan,
        id,
        name,
        date,
        password: "",
        owner_id: userId,
        uploads: 0,
        contributors: 0,
        // Paid events stay locked until the payment is confirmed by the team.
        qr_enabled: paid ? false : (updates.qr_enabled ?? true),
        payer_phone: paid ? payerPhone : null,
        transaction_ref: paid ? transactionRef : null,
        payment_method: paid ? paymentMethod : null,
        payment_submitted_at: paid ? new Date().toISOString() : null,
      });
      if (error) return json({ error: "Could not create event" }, 400);
      return json({ ok: true, pending: paid });
    }

    // Admin password gate (used by the hidden admin dashboard)
    if (action === "verify_admin") {
      return json({ valid: isAdmin(body.password ?? adminPassword) });
    }

    const admin_ok = isAdmin(adminPassword);
    const owner_ok = await isOwner(eventId, userId);
    const host_ok = admin_ok || owner_ok || (await isHost(eventId, eventPassword));

    switch (action) {
      case "create_event": {
        if (!admin_ok) return json({ error: "Unauthorized" }, 401);
        const ev = (body.event ?? {}) as Record<string, unknown>;
        const id = str(ev.id, 200);
        const name = str(ev.name, 300);
        const date = str(ev.date, 100);
        const password = str(body.password, 200);
        if (!id || !name || !date || !password) {
          return json({ error: "Missing required event fields" }, 400);
        }
        const updates = pickUpdates(ev);
        if (updates === null) return json({ error: "Invalid event fields" }, 400);
        const { error } = await admin.from("events").insert({
          ...updates,
          id,
          name,
          date,
          password,
          uploads: 0,
          contributors: 0,
        });
        if (error) return json({ error: "Could not create event" }, 400);
        return json({ ok: true });
      }

      case "set_payment_status": {
        if (!admin_ok || !eventId) return json({ error: "Unauthorized" }, 401);
        const status = str(body.status, 20);
        if (status !== "confirmed" && status !== "declined") {
          return json({ error: "Invalid status" }, 400);
        }
        const { error } = await admin
          .from("events")
          .update({ payment_status: status, qr_enabled: status === "confirmed" })
          .eq("id", eventId);
        if (error) return json({ error: "Could not update payment" }, 400);
        return json({ ok: true });
      }

      case "update_event": {
        if (!eventId || !host_ok) return json({ error: "Unauthorized" }, 401);
        const updates = pickUpdates((body.updates ?? {}) as Record<string, unknown>);
        if (updates === null) return json({ error: "Invalid fields" }, 400);
        if (Object.keys(updates).length === 0) return json({ ok: true });
        const { error } = await admin.from("events").update(updates).eq("id", eventId);
        if (error) return json({ error: "Could not update event" }, 400);
        return json({ ok: true });
      }

      case "delete_event": {
        if ((!admin_ok && !owner_ok) || !eventId) return json({ error: "Unauthorized" }, 401);
        await admin.from("event_media").delete().eq("event_id", eventId);
        await admin.from("event_showcase_media").delete().eq("event_id", eventId);
        const { error } = await admin.from("events").delete().eq("id", eventId);
        if (error) return json({ error: "Could not delete event" }, 400);
        return json({ ok: true });
      }

      case "add_media": {
        if (!eventId || !host_ok) return json({ error: "Unauthorized" }, 401);
        const mediaId = str(body.mediaId, 200);
        const fileUrl = str(body.file_url, 2000);
        const type = str(body.type, 20);
        const uploaderName = str(body.uploader_name, 200) || "Guest";
        if (!mediaId || !fileUrl || (type !== "image" && type !== "video")) {
          return json({ error: "Invalid media" }, 400);
        }
        const { error } = await admin.from("event_media").insert({
          id: mediaId,
          event_id: eventId,
          file_url: fileUrl,
          type,
          uploader_name: uploaderName,
        });
        if (error) return json({ error: "Could not add media" }, 400);
        return json({ ok: true });
      }

      case "delete_media": {
        const mediaId = str(body.mediaId, 200);
        if (!eventId || !mediaId || !host_ok) return json({ error: "Unauthorized" }, 401);
        const { error } = await admin
          .from("event_media")
          .delete()
          .eq("id", mediaId)
          .eq("event_id", eventId);
        if (error) return json({ error: "Could not delete media" }, 400);
        return json({ ok: true });
      }

      case "clear_media": {
        if (!eventId || !host_ok) return json({ error: "Unauthorized" }, 401);
        const { error } = await admin.from("event_media").delete().eq("event_id", eventId);
        if (error) return json({ error: "Could not clear media" }, 400);
        const { data: files } = await admin.storage.from("event-media").list(eventId);
        if (files && files.length > 0) {
          await admin.storage
            .from("event-media")
            .remove(files.map((f) => `${eventId}/${f.name}`));
        }
        return json({ ok: true });
      }

      case "add_showcase": {
        if (!eventId || !host_ok) return json({ error: "Unauthorized" }, 401);
        const fileUrl = str(body.file_url, 2000);
        const type = str(body.type, 20);
        if (!fileUrl || (type !== "image" && type !== "video")) {
          return json({ error: "Invalid showcase media" }, 400);
        }
        const sortOrder = typeof body.sort_order === "number" ? body.sort_order : 0;
        const { error } = await admin.from("event_showcase_media").insert({
          event_id: eventId,
          file_url: fileUrl,
          type,
          sort_order: sortOrder,
        });
        if (error) return json({ error: "Could not add showcase media" }, 400);
        return json({ ok: true });
      }

      case "delete_showcase": {
        const mediaId = str(body.mediaId, 200);
        if (!eventId || !mediaId || !host_ok) return json({ error: "Unauthorized" }, 401);
        const { error } = await admin
          .from("event_showcase_media")
          .delete()
          .eq("id", mediaId)
          .eq("event_id", eventId);
        if (error) return json({ error: "Could not delete showcase media" }, 400);
        return json({ ok: true });
      }

      case "change_password": {
        if (!eventId) return json({ error: "Invalid request" }, 400);
        const currentPassword = str(body.currentPassword, 200);
        const newPassword = str(body.newPassword, 200);
        if (!newPassword || newPassword.length < 6) {
          return json({ error: "New password must be at least 6 characters" }, 400);
        }
        // Admin may change without knowing the current password; hosts must provide it.
        if (!admin_ok && !owner_ok) {
          if (!currentPassword || !(await isHost(eventId, currentPassword))) {
            return json({ error: "Current password is incorrect" }, 401);
          }
        }
        const { error } = await admin
          .from("events")
          .update({ password: newPassword })
          .eq("id", eventId);
        if (error) return json({ error: "Could not change password" }, 400);
        return json({ ok: true });
      }

      default:
        return json({ error: "Unknown action" }, 400);
    }
  } catch (e) {
    console.error("event-write error:", e);
    return json({ error: "Request failed" }, 500);
  }
});
