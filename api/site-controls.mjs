import { get, put } from "@vercel/blob";
import { createHash, timingSafeEqual } from "node:crypto";

const STORE_PATH = "site-controls.json";
const DEFAULTS = {
  gateEnabled: true,
  buttons: { nexil: true, random: true, discord: true, tiktok: true, youtube: true, report: true },
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

function cleanSettings(value) {
  return {
    gateEnabled: value?.gateEnabled !== false,
    buttons: Object.fromEntries(Object.keys(DEFAULTS.buttons).map((key) => [key, value?.buttons?.[key] !== false])),
  };
}

function isAdmin(request) {
  const password = process.env.ADMIN_PASSWORD;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  if (!password || !supplied) return false;
  const expectedHash = createHash("sha256").update(password).digest();
  const suppliedHash = createHash("sha256").update(supplied).digest();
  return timingSafeEqual(expectedHash, suppliedHash);
}

async function readSettings() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return DEFAULTS;
  const blob = await get(STORE_PATH, { access: "private" });
  if (!blob || blob.statusCode !== 200) return DEFAULTS;
  const stored = await new Response(blob.stream).json();
  return cleanSettings(stored);
}

export default {
  async fetch(request) {
    if (request.method === "GET") {
      try {
        return json(await readSettings());
      } catch (error) {
        console.error("Failed to read control settings:", error);
        return json({ error: "settings_unavailable" }, 503);
      }
    }

    if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
    if (!isAdmin(request)) return json({ error: "unauthorized" }, 401);
    if (!process.env.BLOB_READ_WRITE_TOKEN) return json({ error: "blob_store_not_configured" }, 503);

    try {
      const submitted = await request.json();
      if (typeof submitted?.gateEnabled !== "boolean" || !submitted.buttons || typeof submitted.buttons !== "object") {
        return json({ error: "invalid_settings" }, 400);
      }
      const settings = cleanSettings(submitted);
      await put(STORE_PATH, JSON.stringify(settings), {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
        cacheControlMaxAge: 60,
      });
      return json({ success: true, settings });
    } catch (error) {
      console.error("Failed to save control settings:", error);
      return json({ error: "settings_save_failed" }, 500);
    }
  },
};
