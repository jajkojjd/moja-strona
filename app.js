(() => {
  "use strict";

  const REDIRECT_PATH = "/nie-istnieje-404";
  const GATE_SECONDS = 20;
  const SITE_KEY = "904255a8-9638-44b2-ad68-15d8c3c09302";
  let verified = false;
  let seconds = GATE_SECONDS;
  let hcaptchaReady = false;

  const screen = document.getElementById("captcha-screen");
  const mainPage = document.getElementById("main-page");
  const secondsElement = document.getElementById("seconds");
  const status = document.getElementById("captcha-status");
  const manualButton = document.getElementById("verify-btn");
  const fallbackNote = document.getElementById("fallback-note");
  const widget = document.getElementById("captcha-widget");

  function showManualFallback(message) {
    if (verified) return;
    widget.hidden = true;
    manualButton.hidden = false;
    fallbackNote.hidden = false;
    status.textContent = "Nasz system wykrył problem z CAPTCHA. Naprawiamy to.";
  }

  function finishVerification(method) {
    if (verified) return;
    verified = true;
    window.clearInterval(countdown);
    status.textContent = method === "captcha" ? "Zweryfikowano przez hCaptcha ✅" : "Potwierdzono ręcznie ✅";
    screen.hidden = true;
    mainPage.hidden = false;
    mainPage.style.display = "flex";
  }

  // hCaptcha invokes these callbacks from the markup.
  window.onHCaptchaSuccess = async function (token) {
    if (typeof token !== "string" || token.length === 0) {
      showManualFallback("Nie udało się odczytać odpowiedzi hCaptcha.");
      return;
    }
    status.textContent = "Sprawdzam odpowiedź hCaptcha…";
    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const result = await response.json();
      if (response.ok && result.success === true) finishVerification("captcha");
      else showManualFallback("Nie udało się potwierdzić hCaptcha. Możesz potwierdzić ręcznie.");
    } catch {
      showManualFallback("Nie można połączyć się z serwerem weryfikacji. Możesz potwierdzić ręcznie.");
    }
  };
  window.onHCaptchaExpired = function () {
    if (!verified) status.textContent = "Odpowiedź hCaptcha wygasła. Rozwiąż ją ponownie.";
  };
  window.onHCaptchaError = function () {
    showManualFallback("hCaptcha zgłosiła błąd. Możesz spróbować ponownie lub potwierdzić ręcznie.");
  };

  const configured = SITE_KEY !== "YOUR_HCAPTCHA_SITEKEY" && SITE_KEY.trim().length > 0;
  if (!configured) {
    showManualFallback("Nie skonfigurowano klucza hCaptcha.");
  } else {
    widget.dataset.sitekey = SITE_KEY;
    const apiCheck = window.setInterval(() => {
      if (window.hcaptcha) {
        hcaptchaReady = true;
        window.clearInterval(apiCheck);
        status.textContent = "Zaznacz pole hCaptcha, aby kontynuować.";
      }
    }, 250);
    window.setTimeout(() => {
      window.clearInterval(apiCheck);
      if (!hcaptchaReady) showManualFallback("Nie udało się połączyć z hCaptcha. Możesz potwierdzić ręcznie.");
    }, 8000);
  }

  const countdown = window.setInterval(() => {
    if (verified) return;
    seconds -= 1;
    secondsElement.textContent = String(seconds);
    if (seconds <= 0) {
      window.clearInterval(countdown);
      window.location.replace(REDIRECT_PATH);
    }
  }, 1000);

  manualButton.addEventListener("click", () => finishVerification("manual"));
  document.getElementById("report-bug-btn").addEventListener("click", () => {
    const address = "karolkwiatek5000@gmail.com";
    const subject = "Zgłoszenie błędu - xkarolx.pl";
    const body = "Cześć,\n\nCoś się zwaliło na stronie xkarolx.pl.\n\nOpis problemu:\n";
    window.location.href = `mailto:${address}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
})();
