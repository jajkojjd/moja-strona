(() => {
  "use strict";

  const gateToggle = document.getElementById("gate-enabled");
  const passwordInput = document.getElementById("admin-password");
  const saveButton = document.getElementById("save-settings");
  const status = document.getElementById("save-status");
  const controls = [...document.querySelectorAll("[data-button]")];

  function showStatus(message, isError = false) {
    status.textContent = message;
    status.classList.toggle("error", isError);
  }

  async function loadSettings() {
    try {
      const response = await fetch("/api/site-controls", { cache: "no-store" });
      if (!response.ok) throw new Error("Ustawień nie udało się pobrać.");
      const settings = await response.json();
      gateToggle.checked = settings.gateEnabled !== false;
      controls.forEach((input) => { input.checked = settings.buttons?.[input.dataset.button] !== false; });
    } catch {
      showStatus("Nie udało się pobrać ustawień. Sprawdź konfigurację prywatnego magazynu Vercel Blob.", true);
    }
  }

  saveButton.addEventListener("click", async () => {
    const password = passwordInput.value;
    if (!password) {
      showStatus("Wpisz hasło administratora.", true);
      passwordInput.focus();
      return;
    }
    const settings = {
      gateEnabled: gateToggle.checked,
      buttons: Object.fromEntries(controls.map((input) => [input.dataset.button, input.checked])),
    };
    saveButton.disabled = true;
    showStatus("Zapisuję ustawienia…");
    try {
      const response = await fetch("/api/site-controls", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${password}` },
        body: JSON.stringify(settings),
      });
      const result = await response.json();
      if (!response.ok) {
        const message = result.error === "unauthorized"
          ? "Hasło administratora jest nieprawidłowe."
          : result.error === "blob_store_not_configured"
            ? "Najpierw utwórz i połącz z projektem prywatny magazyn Vercel Blob."
            : "Nie udało się zapisać. Sprawdź konfigurację Vercel.";
        throw new Error(message);
      }
      passwordInput.value = "";
      showStatus("Zapisano. Zmiany są już aktywne dla odwiedzających.");
    } catch (error) {
      showStatus(error.message || "Nie udało się połączyć z serwerem.", true);
    } finally {
      saveButton.disabled = false;
    }
  });

  loadSettings();
})();
