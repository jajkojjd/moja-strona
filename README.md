# Wdrożenie na Vercel

Umieść pliki w katalogu głównym repozytorium, zachowując strukturę:

```text
index.html
app.js
style.css
api/verify.mjs
```

1. W panelu hCaptcha utwórz witrynę i dodaj domenę, na której będzie działać strona.
2. W `app.js` ustaw `SITE_KEY` na publiczny sitekey. `index.html` pobierze go z tej zmiennej przy uruchomieniu.
3. W ustawieniach projektu Vercel → **Settings → Environment Variables** dodaj:
   - `HCAPTCHA_SECRET` — prywatny sekret hCaptcha;
   - `HCAPTCHA_SITEKEY` — ten sam publiczny sitekey.
4. Opcjonalnie dodaj `HCAPTCHA_HOSTNAME` z dokładnym hostname, np. `twoja-domena.pl` (bez `https://`).
5. Wdróż projekt na Vercel. Backend będzie dostępny pod `/api/verify`.

Po dodaniu lub zmianie zmiennych środowiskowych wykonaj nowy deployment. Nigdy nie umieszczaj `HCAPTCHA_SECRET` w plikach frontendu ani w repozytorium.

Ręczna weryfikacja jest trybem awaryjnym zgodnie z założeniem strony. Nie zapewnia ochrony przed botami takiej jak weryfikacja hCaptcha po stronie serwera.
