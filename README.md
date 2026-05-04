# Cosmo Bloom — Landing Page

Studio projektowo-inżynierskie. Single-page landing z animowanym tłem (Saturn, gwiazdy, statki), HUD-em telemetrii, bocznym pasem nawigacji i panelem Tweaks do live-tuningu.

---

## Stack

- **React 18** (UMD via unpkg) + **Babel Standalone** — JSX w przeglądarce, bez build-stepu.
- **Tailwind CSS** (CDN, `cdn.tailwindcss.com`) — utility classes + custom tokens w `tailwind.config` w `index.html`.
- **Google Fonts**: Outfit (display), Inter (body), JetBrains Mono (mono/HUD).
- **Vanilla canvas** (w `background.jsx`) dla starfield, planet i statków.

Brak bundlera, brak `npm install` — otwierasz `index.html` i działa.

---

## Struktura plików

```
index.html              Wejście. Ładuje React, Babel, Tailwind + wszystkie .jsx
app.jsx                 Główny komponent App: sekcje, formularz, FAQ, treść PL.
background.jsx          Animowane tło: Saturn, gwiazdy, statki, custom kursor.
hud.jsx                 Boczny pasek nawigacyjny + zegar UTC + scroll progress.
tweaks-panel.jsx        Panel ustawień (toggle z toolbara w preview).
functions/api/contact.js  Cloudflare Pages Function — backend formularza (Resend).
README.md               Ten plik.
```

---

## Uruchomienie lokalnie

Tailwind CDN i React UMD wymagają serwowania przez HTTP (nie `file://`) — dwie opcje:

### Opcja A — Python
```bash
python3 -m http.server 8000
# otwórz http://localhost:8000
```

### Opcja B — Node
```bash
npx serve .
# albo:
npx http-server -p 8000
```

### Opcja C — VS Code
Rozszerzenie **Live Server** → prawy klik na `index.html` → "Open with Live Server".

---

## Deploy (statyczny hosting)

Każdy z poniższych zadziała bez konfiguracji:

- **GitHub Pages** — push do repo → Settings → Pages → Source: `main` / root.
- **Vercel / Netlify** — drag-and-drop folderu albo połącz z GitHubem. Build command: *brak*. Output dir: `.` (root).
- **Cloudflare Pages** — to samo. **Z formularzem kontaktowym** patrz sekcja niżej.

Wszystko to jest statyczny HTML + JSX kompilowany w przeglądarce — żaden build nie jest potrzebny.

---

## Formularz kontaktowy · Cloudflare Pages + Resend

### Architektura

```
[ przeglądarka ]
      │ POST /api/contact  (JSON)
      ▼
[ Cloudflare Pages Function ]   ← functions/api/contact.js
      │ walidacja + honeypot + rate-limit
      │ KV: rate-limit (opcjonalny)
      ▼
[ Resend ]  ──→  inbox CONTACT_TO
              ──→  auto-reply do nadawcy
```

Cały stack pozostaje bez build-stepu. Pages serwuje `index.html`, a katalog `functions/` jest automatycznie deployowany jako Workers.

### Pliki

- **`functions/api/contact.js`** — endpoint POST `/api/contact`
- **`app.jsx`** — frontend (kontrolowany, fetch + obsługa błędów)

### Konfiguracja na Cloudflare Pages

1. **Połącz repo** Pages → Create project → Connect Git → wybierz repo.

2. **Build settings:**
   - Framework preset: **None**
   - Build command: *(puste)*
   - Build output directory: `/` (root)

3. **Domena nadawcy w Resend** ([resend.com](https://resend.com) → Domains):
   1. Dodaj `cosmobloom.studio` (lub subdomenę typu `mail.cosmobloom.studio`).
   2. Dodaj zwrócone rekordy DNS (SPF, DKIM, DMARC, opcjonalnie DMARC) w Cloudflare DNS.
   3. Poczekaj na status "Verified".
   4. Wygeneruj API key w API Keys → **Create API Key** (uprawnienia: Sending access).

4. **Environment variables** Pages → Settings → **Environment variables**:

   | Klucz | Wartość | Środowisko |
   |---|---|---|
   | `RESEND_API_KEY` | klucz `re_...` | Production + Preview |
   | `CONTACT_TO` | `kontakt@twoja-domena.pl` | Production + Preview |
   | `CONTACT_FROM` | `Cosmo Bloom <onboarding@twoja-domena.pl>` | Production + Preview |

   Po ustawieniu zmiennych wymagany jest re-deploy. **Zaznacz "Encrypted"** przy `RESEND_API_KEY`.

5. **(Opcjonalne) Rate-limit przez KV** — wytrzymały na boty. Wymaga KV namespace + bindingu:
   1. Workers & Pages → **KV** → Create namespace → np. `cosmo_rate_limit`.
   2. Pages → Settings → Functions → **KV namespace bindings** → dodaj:
      - Variable name: `RATE_LIMIT`
      - KV namespace: `cosmo_rate_limit`
   3. Endpoint dalej działa — po prostu nie egzekwuje limitu, jeśli zmiennej nie ma.

6. **Lokalny dev** — bash w 1 wrangler wrangler pages dev . --compatibility-date=2025-01-01 (wymaga `npm i -D wrangler`); env vars trzeba przekazać `--var KEY:value` lub w `.dev.vars`.

### Sandbox Resend (bez weryfikacji domeny)

Na początek możesz wysyłać z `onboarding@resend.dev`. To działa bez weryfikacji, **ale wysyła tylko na adres właściciela konta Resend**.

Ustaw:
- `CONTACT_FROM=onboarding@resend.dev`
- `CONTACT_TO=<email konta Resend>`

Potem przejdź na własną domenę (krok 3 powyżej).

### Kontrakt API

**Request** (POST `/api/contact`, JSON):
```json
{
  "name": "Jan Kowalski",
  "email": "jan@firma.pl",
  "budget": "30–80k",
  "message": "Potrzebuję landing page na marzec…",
  "website": ""
}
```
- `website` to honeypot — musi być puste. Boty zwykle wypełniają wszystkie pola; jeśli to pole ma wartość, serwer zwraca 200 OK ale nie wysyła maila.

**Możliwe odpowiedzi:**

| Status | Body | Znaczenie |
|---|---|---|
| 200 | `{ ok: true }` | Wysłane |
| 400 | `{ ok: false, error: "…" }` | Błędy payload (`name`, `email`, `message`) |
| 429 | `{ ok: false, error: "Too many requests" }` | Rate-limit (gdy KV podpięte) |
| 500 | `{ ok: false, error: "Server misconfigured" }` | Brakuje env varów |
| 502 | `{ ok: false, error: "Email delivery failed" }` | Resend zwrócił błąd |

### Bezpieczeństwo · "Honeypot" (`website`) — łapie ~90% prostych botów bez CAPTCHA. **Walidacja długości** — `name` 2–120, email regex, `message` 10–5000 znaków. **HTML-escape** w treści maila — żadne wstrzyknięcia HTML do skrzynki. **Rate-limit** (przy KV) — 3 zgłoszenia/IP/10 min. **Reply-to** ustawione na adres nadawcy — odpisujesz bezpośrednio z inboxa.

### Diagnostyka

- Cloudflare Pages → Twój projekt → **Functions → Realtime logs** — widzisz każde wywołanie + błędy z `console.error`.
- Resend → **Logs** — historia wysłanych maili, statusy delivery, bounces.
- Test lokalny:
  ```bash
  curl -X POST http://localhost:8788/api/contact \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","email":"test@test.pl","message":"Test wiadomość ABCDE"}'
  ```

---

## Przejście na pełny build (gdy chcesz produkcyjnie)

Babel-in-browser jest super do prototypowania, ale wolny przy pierwszym ładowaniu. Gdy chcesz wersję produkcyjną:

1. **Vite + React**:
   ```bash
   npm create vite@latest cosmo-bloom -- --template react
   ```
2. Skopiuj zawartość plików `.jsx` do `src/components/` (zamień `Object.assign(window, {...})` na `export`).
3. Zainstaluj Tailwind v3 normalnie (`npm i -D tailwindcss postcss autoprefixer`) i przenieś tokeny z `index.html` do `tailwind.config.js`.
4. `npm run build` → folder `dist/` jest gotowy do deploya.

---

## Kontrakty między plikami

`app.jsx`, `background.jsx`, `hud.jsx`, `tweaks-panel.jsx` są ładowane jako osobne `<script type="text/babel">`. Żeby dzielić komponenty, każdy plik **eksportuje na `window`** na końcu:

```js
Object.assign(window, { App, Background, HUD, TweaksPanel });
```

`index.html` na końcu robi `ReactDOM.createRoot(...).render(<App />)`.

---

## Edytowanie

- **Treść / sekcje** → `app.jsx`
- **Animacje tła** → `background.jsx` (canvas API, requestAnimationFrame)
- **Boczny pasek / orbit rail** → `hud.jsx` (`SECTIONS` array — id musi pasować do `id` sekcji w `app.jsx`)
- **Kolory globalne** → `tailwind.config` w `<script>` w `index.html` (klasy `pink-1`, `pink-2`, `pink-deep`, `orange-1`)
- **Tweaks** → `tweaks-panel.jsx` — kontroluje runtime CSS variables / klasy

---

## Znane ograniczenia

- Pierwsze ładowanie ~1–2s wolniej (Babel transpiluje JSX w runtime).
- Tailwind CDN nie purguje — bundle większy niż w wersji produkcyjnej, ale dla landingu bez znaczenia.
- React/Babel/Tailwind ładowane z CDN — wymaga internetu przy pierwszym otwarciu (potem cache).
