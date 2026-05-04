// Cloudflare Pages Function — POST /api/contact
// Stack: Resend + KV rate-limit + honeypot + walidacja
//
// Wymagane Environment Variables (Cloudflare Pages → Settings → Environment variables):
//   RESEND_API_KEY   — klucz API z https://resend.com/api-keys
//   CONTACT_TO       — adres odbiorcy (np. magnuwam@gmail.com)
//   CONTACT_FROM     — adres nadawcy zweryfikowany w Resend (np. kontakt@cosmobloom.pl)
//
// Opcjonalne KV namespace binding (Cloudflare Pages → Settings → Functions → KV namespace bindings):
//   RATE_LIMIT       — KV namespace dla rate-limitingu (jeśli brak, rate-limit jest pomijany)

const RATE_LIMIT_COUNT = 3;          // max zgłoszeń
const RATE_LIMIT_WINDOW = 600;       // w ciągu 600s = 10 minut
const MAX_NAME = 120;
const MAX_EMAIL = 200;
const MAX_MESSAGE = 5000;
const MAX_BUDGET = 40;

export async function onRequestPost({ request, env }) {
  try {
    // ── 1. Parse JSON ──
    let data;
    try {
      data = await request.json();
    } catch {
      return json({ ok: false, error: 'Niepoprawne dane (JSON).' }, 400);
    }

    const name    = (data.name    || '').toString().trim();
    const email   = (data.email   || '').toString().trim();
    const budget  = (data.budget  || '').toString().trim();
    const message = (data.message || '').toString().trim();
    const website = (data.website || '').toString();   // honeypot — musi być puste

    // ── 2. Honeypot (bot wypełnia ukryte pole "website") ──
    if (website) {
      // Udajemy sukces, żeby bot nie wiedział że został wykryty
      return json({ ok: true });
    }

    // ── 3. Walidacja ──
    if (!name || !email || !message) {
      return json({ ok: false, error: 'Imię, email i opis są wymagane.' }, 400);
    }
    if (name.length > MAX_NAME)       return json({ ok: false, error: `Imię max ${MAX_NAME} znaków.` }, 400);
    if (email.length > MAX_EMAIL)     return json({ ok: false, error: 'Email zbyt długi.' }, 400);
    if (budget.length > MAX_BUDGET)   return json({ ok: false, error: 'Budżet zbyt długi.' }, 400);
    if (message.length > MAX_MESSAGE) return json({ ok: false, error: `Opis max ${MAX_MESSAGE} znaków.` }, 400);
    if (message.length < 10)          return json({ ok: false, error: 'Opisz projekt nieco dokładniej (min. 10 znaków).' }, 400);
    if (!isValidEmail(email))         return json({ ok: false, error: 'Niepoprawny format adresu email.' }, 400);
    // Blokuj linki w polu "imię" — typowy spam
    if (/https?:\/\/|www\.|<a\s/i.test(name)) {
      return json({ ok: false, error: 'Niepoprawne imię.' }, 400);
    }

    // ── 4. Rate-limit (KV) ──
    if (env.RATE_LIMIT) {
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const key = `rl:${ip}`;
      const current = parseInt(await env.RATE_LIMIT.get(key) || '0', 10);
      if (current >= RATE_LIMIT_COUNT) {
        return json({ ok: false, error: 'Zbyt wiele zgłoszeń. Spróbuj ponownie za kilka minut.' }, 429);
      }
      await env.RATE_LIMIT.put(key, String(current + 1), { expirationTtl: RATE_LIMIT_WINDOW });
    }

    // ── 5. Wymagane env vars ──
    if (!env.RESEND_API_KEY || !env.CONTACT_TO || !env.CONTACT_FROM) {
      console.error('Missing env vars: RESEND_API_KEY, CONTACT_TO, CONTACT_FROM');
      return json({ ok: false, error: 'Server misconfigured.' }, 502);
    }

    // ── 6. Wysyłka maila do nas ──
    const subject = `Nowy sygnał z Cosmo Bloom — ${name}`;
    const adminMail = await sendResend(env.RESEND_API_KEY, {
      from: env.CONTACT_FROM,
      to: env.CONTACT_TO,
      reply_to: email,
      subject,
      html: adminEmailHtml({ name, email, budget, message }),
      text: adminEmailText({ name, email, budget, message }),
    });

    if (!adminMail.ok) {
      console.error('Resend admin send failed:', adminMail.error);
      return json({ ok: false, error: 'Nie udało się wysłać wiadomości. Napisz na ' + env.CONTACT_TO }, 502);
    }

    // ── 7. Auto-odpowiedź do nadawcy (best-effort, błąd nie blokuje sukcesu) ──
    sendResend(env.RESEND_API_KEY, {
      from: env.CONTACT_FROM,
      to: email,
      subject: 'Sygnał odebrany · Cosmo Bloom',
      html: replyEmailHtml({ name }),
      text: replyEmailText({ name }),
    }).catch(err => console.error('Auto-reply failed:', err));

    return json({ ok: true });
  } catch (err) {
    console.error('Contact handler error:', err);
    return json({ ok: false, error: 'Nieoczekiwany błąd serwera.' }, 500);
  }
}

// ─── Helpers ───

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function isValidEmail(email) {
  // Pragmatyczna walidacja: lokalna część @ domena.tld
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

async function sendResend(apiKey, payload) {
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      const text = await r.text();
      return { ok: false, error: `${r.status}: ${text}` };
    }
    return { ok: true, data: await r.json() };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ─── Templates ───

function adminEmailHtml({ name, email, budget, message }) {
  return `<!doctype html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;background:#0a0014;color:#fff;padding:32px;">
  <div style="max-width:560px;margin:0 auto;background:#15001f;border:1px solid #ff008033;border-radius:16px;padding:32px;">
    <div style="font-size:11px;letter-spacing:0.3em;color:#FF0080;font-weight:bold;margin-bottom:8px;">● COSMO BLOOM · NOWY SYGNAŁ</div>
    <h2 style="margin:0 0 24px;font-size:22px;">Nowe zapytanie z formularza</h2>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:8px 0;color:#aaa;width:100px;">Imię:</td><td style="padding:8px 0;"><strong>${escapeHtml(name)}</strong></td></tr>
      <tr><td style="padding:8px 0;color:#aaa;">Email:</td><td style="padding:8px 0;"><a href="mailto:${escapeHtml(email)}" style="color:#FF0080;">${escapeHtml(email)}</a></td></tr>
      ${budget ? `<tr><td style="padding:8px 0;color:#aaa;">Budżet:</td><td style="padding:8px 0;">${escapeHtml(budget)} PLN</td></tr>` : ''}
    </table>
    <div style="margin-top:24px;padding-top:24px;border-top:1px solid #ffffff15;">
      <div style="color:#aaa;font-size:11px;letter-spacing:0.2em;margin-bottom:12px;">OPIS PROJEKTU</div>
      <div style="white-space:pre-wrap;line-height:1.6;">${escapeHtml(message)}</div>
    </div>
    <div style="margin-top:32px;padding-top:16px;border-top:1px solid #ffffff15;font-size:11px;color:#666;">
      Wysłane z formularza na cosmobloom.pl · Kliknij Reply, żeby odpowiedzieć bezpośrednio nadawcy.
    </div>
  </div>
</body></html>`;
}

function adminEmailText({ name, email, budget, message }) {
  return [
    'COSMO BLOOM · NOWY SYGNAŁ',
    '',
    `Imię:   ${name}`,
    `Email:  ${email}`,
    budget ? `Budżet: ${budget} PLN` : null,
    '',
    'OPIS PROJEKTU',
    '─────────────',
    message,
    '',
    '— Wysłane z formularza na cosmobloom.pl',
  ].filter(Boolean).join('\n');
}

function replyEmailHtml({ name }) {
  const firstName = name.split(/\s+/)[0] || name;
  return `<!doctype html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;background:#0a0014;color:#fff;padding:32px;">
  <div style="max-width:520px;margin:0 auto;background:#15001f;border:1px solid #ff008033;border-radius:16px;padding:36px;">
    <div style="font-size:11px;letter-spacing:0.3em;color:#FF0080;font-weight:bold;margin-bottom:16px;">● SYGNAŁ ODEBRANY</div>
    <h2 style="margin:0 0 16px;font-size:24px;">Cześć ${escapeHtml(firstName)},</h2>
    <p style="line-height:1.7;color:#e5e5e5;margin:0 0 16px;">
      Dziękujemy za wiadomość — Twój sygnał dotarł na pokład Cosmo Bloom.
    </p>
    <p style="line-height:1.7;color:#e5e5e5;margin:0 0 16px;">
      Odpowiemy w ciągu <strong>24 godzin roboczych</strong> z propozycją krótkiej rozmowy
      lub konkretnymi pytaniami o Twój projekt.
    </p>
    <p style="line-height:1.7;color:#e5e5e5;margin:0 0 24px;">
      W międzyczasie możesz spojrzeć na nasze ostatnie misje — po prostu nie odpowiadaj na ten mail,
      napiszemy do Ciebie z prawdziwego adresu.
    </p>
    <div style="margin-top:32px;padding-top:24px;border-top:1px solid #ffffff15;">
      <div style="font-weight:bold;color:#FF0080;font-size:14px;letter-spacing:0.05em;">— Załoga Cosmo Bloom</div>
      <div style="font-size:11px;color:#888;letter-spacing:0.2em;margin-top:8px;text-transform:uppercase;">Warszawa · cosmobloom.pl</div>
    </div>
  </div>
</body></html>`;
}

function replyEmailText({ name }) {
  const firstName = name.split(/\s+/)[0] || name;
  return [
    `Cześć ${firstName},`,
    '',
    'Dziękujemy za wiadomość — Twój sygnał dotarł na pokład Cosmo Bloom.',
    '',
    'Odpowiemy w ciągu 24 godzin roboczych z propozycją krótkiej rozmowy',
    'lub konkretnymi pytaniami o Twój projekt.',
    '',
    'Nie odpowiadaj na ten mail — napiszemy do Ciebie z prawdziwego adresu.',
    '',
    '— Załoga Cosmo Bloom',
    'Warszawa · cosmobloom.pl',
  ].join('\n');
}
