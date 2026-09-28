(() => {
  "use strict";

  const REDIRECT_PATH = "/nie-istnieje-404";
  const GATE_SECONDS = 20;
  const defaults = {
    gateEnabled: true,
    buttons: { nexil: true, random: true, discord: true, tiktok: true, youtube: true, report: true },
  };
  let verified = false;
  let seconds = GATE_SECONDS;
  let countdown;

  const screen = document.getElementById("gate-screen");
  const mainPage = document.getElementById("main-page");
  const secondsElement = document.getElementById("seconds");
  const status = document.getElementById("gate-status");
  const manualButton = document.getElementById("verify-btn");
  const notice = document.getElementById("site-notice");

  function finishVerification() {
    if (verified) return;
    verified = true;
    window.clearInterval(countdown);
    screen.hidden = true;
    mainPage.hidden = false;
    mainPage.style.display = "flex";
  }

  function showNotice(message) {
    notice.textContent = message;
    notice.classList.add("visible");
    window.clearTimeout(showNotice.timeout);
    showNotice.timeout = window.setTimeout(() => notice.classList.remove("visible"), 2500);
  }

  function applyButtonSettings(settings) {
    document.querySelectorAll("[data-link-key]").forEach((link) => {
      const enabled = settings.buttons?.[link.dataset.linkKey] !== false;
      link.classList.toggle("is-disabled", !enabled);
      link.setAttribute("aria-disabled", String(!enabled));
      if (!enabled) {
        link.dataset.disabledByControlPanel = "true";
        link.dataset.originalHref ||= link.getAttribute("href") || "";
        link.removeAttribute("href");
      } else {
        delete link.dataset.disabledByControlPanel;
        if (link.dataset.originalHref) link.setAttribute("href", link.dataset.originalHref);
      }
    });
    document.querySelectorAll("[data-button-key]").forEach((button) => {
      const enabled = settings.buttons?.[button.dataset.buttonKey] !== false;
      button.dataset.enabledByControlPanel = String(enabled);
      button.setAttribute("aria-disabled", String(!enabled));
    });
  }

  document.querySelectorAll("[data-link-key]").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (link.dataset.disabledByControlPanel === "true") {
        event.preventDefault();
        showNotice("Ten przycisk jest obecnie wyłączony.");
      }
    });
  });
  document.querySelectorAll("[data-button-key]").forEach((button) => {
    button.addEventListener("click", (event) => {
      if (button.dataset.enabledByControlPanel === "false") {
        event.preventDefault();
        showNotice("Ten przycisk jest obecnie wyłączony.");
      }
    });
  });

  function startCountdown() {
    countdown = window.setInterval(() => {
      if (verified) return;
      seconds -= 1;
      secondsElement.textContent = String(seconds);
      if (seconds <= 0) {
        window.clearInterval(countdown);
        window.location.replace(REDIRECT_PATH);
      }
    }, 1000);
  }

  async function initialize() {
    let settings = defaults;
    try {
      const response = await fetch("/api/site-controls", { cache: "no-store" });
      if (response.ok) settings = { ...defaults, ...(await response.json()) };
    } catch (error) {
      console.error("Could not load site controls; using defaults.", error);
    }

    applyButtonSettings(settings);
    if (settings.gateEnabled === false) {
      screen.hidden = true;
      mainPage.hidden = false;
      mainPage.style.display = "flex";
      verified = true;
    } else {
      status.textContent = "Kliknij, aby potwierdzić ręcznie, że nie jesteś botem.";
      manualButton.hidden = false;
      startCountdown();
    }
  }

  manualButton.addEventListener("click", finishVerification);
  document.getElementById("report-bug-btn").addEventListener("click", () => {
    const button = document.getElementById("report-bug-btn");
    if (button.dataset.enabledByControlPanel === "false") return;
    const address = "karolkwiatek5000@gmail.com";
    const subject = "Zgłoszenie błędu - xkarolx.pl";
    const body = "Cześć,\n\nCoś się zwaliło na stronie xkarolx.pl.\n\nOpis problemu:\n";
    window.location.href = `mailto:${address}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  initialize();
})();
