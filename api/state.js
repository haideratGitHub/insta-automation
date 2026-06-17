// Vercel serverless function: cloud persistence for the whole app state.
// Backed by Vercel KV / Upstash Redis, gated by a single shared password.
//
// Required env vars (set in Vercel project settings):
//   SYNC_PASSWORD          — the password this device must send to read/write
//   KV_REST_API_URL        — from Vercel KV / Upstash (or UPSTASH_REDIS_REST_URL)
//   KV_REST_API_TOKEN      — from Vercel KV / Upstash (or UPSTASH_REDIS_REST_TOKEN)

import { Redis } from "@upstash/redis";

const KEY = "carouselforge:state";

function getRedis() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export default async function handler(req, res) {
  const password = process.env.SYNC_PASSWORD;
  if (!password) {
    return res
      .status(500)
      .json({ error: "SYNC_PASSWORD is not configured on the server." });
  }

  // auth: shared password sent in a header
  const given = req.headers["x-sync-key"];
  if (given !== password) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const redis = getRedis();
  if (!redis) {
    return res
      .status(500)
      .json({ error: "KV store is not configured on the server." });
  }

  try {
    if (req.method === "GET") {
      const data = await redis.get(KEY); // already a parsed object (or null)
      return res.status(200).json(data ?? null);
    }

    if (req.method === "PUT" || req.method === "POST") {
      let body = req.body;
      if (typeof body === "string") {
        try {
          body = JSON.parse(body);
        } catch {
          body = null;
        }
      }
      if (!body || !body.state) {
        return res.status(400).json({ error: "missing state" });
      }
      await redis.set(KEY, body);
      return res.status(200).json({ ok: true, updatedAt: body.updatedAt });
    }

    res.setHeader("Allow", "GET, PUT");
    return res.status(405).json({ error: "method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: String((e && e.message) || e) });
  }
}
