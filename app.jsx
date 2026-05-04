/**
 * Cloudflare Pages Function — POST /api/contact
 *
 * Wymagane zmienne środowiskowe (Pages → Settings → Environment variables):
 *   RESEND_API_KEY    — klucz API z resend.com
 *   CONTACT_TO        — adres odbiorcy (np. kontakt@cosmobloom.studio)
 *   CONTACT_FROM      — adres nadawcy zweryfikowany w Resend
 *                       (np. "Cosmo Bloom <noreply@cosmobloom.studio>")
 *   CONTACT_REPLY_TO  — opcjonalnie, domyślnie używamy adresu z formularza
 *
 * Opcjonalnie (KV namespace dla rate-limit):
 *   RATE_LIMIT_KV     — KV binding (Pages → Settings → Functions → KV bindings)
 */

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

const ok = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });

const err = (message, status = 400, extra = {}) =>
  new Response(JSON.stringify({ ok: false, error: message, ...extra }), {
    status,
    headers: JSON_HEADERS,
  });

// ─── walidacja ────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_BUDGETS = new Set(["< 30k", "30–80k", "80–200k", "> 200k", ""]);

function sanitize(s, max = 2000) {
  if (typeof s !== "string") return "";
  return s.replace(/\u0000/g, "").trim().slice(0, max);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function validate(payload) {
  const name = sanitize(payload.name, 120);
  const email = sanitize(payload.email, 180).toLowerCase();
  const budget = sanitize(payload.budget, 32);
  const message = sanitize(payload.message, 5000);
  const website = sanitize(payload.website, 200); // honeypot

  const errors = [];
  if (name.length < 2) errors.push("name");
  if (!EMAIL_RE.test(email)) errors.push("email");
  if (message.length < 10) errors.push("message");
  if (budget && !ALLOWED_BUDGETS.has(budget)) errors.push("budget");

  return { name, email, budget, message, website, errors };
}

// ─── rate limit (best-effort, działa tylko gdy KV jest podpięte) ───
async function checkRateLimit(env, ip) {
  if (!env.RATE_LIMIT_KV || !ip) return { allowed: true };
  const key = `contact:${ip}`;
  try {
    const raw = await env.RATE_LIMIT_KV.get(key);
    const now = Date.now();
    const windowMs = 60 * 60 * 1000; // 1h
    const limit = 5;
    let bucket = raw ? JSON.parse(raw) : { count: 0, reset: now + windowMs };
    if (now > bucket.reset) bucket = { count: 0, reset: now + windowMs };
    if (bucket.count >= limit) {
      return { allowed: false, retryAfter: Math.ceil((bucket.reset - now) / 1000) };
    }
    bucket.count += 1;
    await env.RATE_LIMIT_KV.put(key, JSON.stringify(bucket), {
      expirationTtl: Math.ceil(windowMs / 1000),
    });
    return { allowed: true };
  } catch {
    return { allowed: true }; // fail-open
  }
}

// ─── Resend API ───────────────────────────────────────────────
async function sendViaResend(env, data) {
  const subject = `Nowy sygnał z cosmobloom.studio · ${data.name}`;

  const html = `
  <!doctype html>
  <html lang="pl"><head><meta charset="utf-8"></head>
  <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0a0a0a;color:#fff;margin:0;padding:32px;">
    <div style="max-width:560px;margin:0 auto;background:#121214;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:32px;">
      <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.3em;color:#ff007f;margin-bottom:8px;">
        ● COSMO BLOOM · NOWY SYGNAŁ
      </div>
      <h1 style="font-size:22px;margin:0 0 24px;color:#fff;">${escapeHtml(data.name)}</h1>

      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:8px 0;color:#999;width:120px;">Email</td>
            <td style="padding:8px 0;"><a href="mailto:${escapeHtml(data.email)}" style="color:#ff007f;">${escapeHtml(data.email)}</a></td></tr>
        <tr><td style="padding:8px 0;color:#999;">Budżet</td>
            <td style="padding:8px 0;color:#fff;">${escapeHtml(data.budget || "—")} ${data.budget ? "PLN" : ""}</td></tr>
      </table>

      <div style="margin-top:24px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.1);">
        <div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.2em;margin-bottom:12px;">Wiadomość</div>
        <div style="font-size:15px;line-height:1.6;color:#eee;white-space:pre-wrap;">${escapeHtml(data.message)}</div>
      </div>

      <div style="margin-top:32px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.05);font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.2em;color:#666;text-transform:uppercase;">
        Wysłane z formularza /api/contact · ${new Date().toISOString()}
      </div>
    </div>
  </body></html>`;

  const text =
    `Nowy sygnał z cosmobloom.studio\n\n` +
    `Imię: ${data.name}\n` +
    `Email: ${data.email}\n` +
    `Budżet: ${data.budget || "—"}${data.budget ? " PLN" : ""}\n\n` +
    `Wiadomość:\n${data.message}\n`;

  const body = {
    from: env.CONTACT_FROM,
    to: [env.CONTACT_TO],
    reply_to: data.email,
    subject,
    html,
    text,
  };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${env.RESEND_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend API ${res.status}: ${detail.slice(0, 300)}`);
  }
  return res.json();
}

// ─── handler ──────────────────────────────────────────────────
export async function onRequestPost({ request, env }) {
  // sanity check zmiennych środowiskowych
  const missing = ["RESEND_API_KEY", "CONTACT_TO", "CONTACT_FROM"].filter(
    (k) => !env[k]
  );
  if (missing.length) {
    return err(`Server misconfigured: missing ${missing.join(", ")}`, 500);
  }

  // parsowanie ciała
  let payload;
  try {
    payload = await request.json();
  } catch {
    return err("Invalid JSON body", 400);
  }

  // honeypot — bot wypełnił ukryte pole
  const data = validate(payload || {});
  if (data.website) return ok({ ok: true }); // cicho odrzucamy

  if (data.errors.length) {
    return err("Validation failed", 422, { fields: data.errors });
  }

  // rate-limit po IP
  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for") ||
    "";
  const rl = await checkRateLimit(env, ip);
  if (!rl.allowed) {
    return new Response(
      JSON.stringify({ ok: false, error: "Too many requests" }),
      {
        status: 429,
        headers: { ...JSON_HEADERS, "retry-after": String(rl.retryAfter || 3600) },
      }
    );
  }

  try {
    const result = await sendViaResend(env, data);
    return ok({ ok: true, id: result?.id });
  } catch (e) {
    console.error("[contact] resend error:", e?.message || e);
    return err("Email delivery failed", 502);
  }
}

// odrzucamy inne metody jasnym 405
export const onRequest = ({ request }) => {
  if (request.method === "POST") return; // przejdzie do onRequestPost
  return new Response("Method Not Allowed", {
    status: 405,
    headers: { allow: "POST" },
  });
};
