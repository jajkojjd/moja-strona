# xkarolx.pl — panel sterowania

Ta wersja zachowuje oryginalne linki, favicon i CNAME. Wejście wymaga wyłącznie ręcznego kliknięcia. Panel steruje bramką wejścia oraz każdym przyciskiem globalnie.

## Wdrożenie na Vercel

1. Wgraj zawartość tego folderu do głównego katalogu repozytorium GitHub podłączonego do projektu Vercel.
2. W Vercel otwórz **Storage → Create Database → Blob**, utwórz magazyn **Private** i połącz go z projektem. Vercel doda `BLOB_READ_WRITE_TOKEN`.
3. W **Settings → Environment Variables** dodaj `ADMIN_PASSWORD` jako **Secret** dla **Production**.
4. Wypchnij zmiany na GitHub i poczekaj na deployment **Ready**.

## Aplikacja Windows

Uruchom przenośny plik `PanelSterowania-xkarolx-1.0.0-x64.exe` z osobnej paczki aplikacji. Wpisz `ADMIN_PASSWORD`, aby zapisywać ustawienia strony. Aplikacja łączy się z `/api/site-controls` przez HTTPS.
