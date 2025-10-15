document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".toggle-button").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetSelector = btn.dataset.target;
      if (!targetSelector) return;

      const target = document.querySelector(targetSelector);
      if (!target) return;

      // Toggle Sichtbarkeit
      const isNowHidden = target.classList.toggle("hidden"); // true = jetzt versteckt

      // Pfeil im Button rotieren
      const arrow = btn.querySelector(".arrow");
      if (arrow) {
        arrow.style.transform = isNowHidden ? "rotate(0deg)" : "rotate(180deg)";
      }

      // aria-expanded aktualisieren
      btn.setAttribute("aria-expanded", String(!isNowHidden));

      // Beschriftung je nach Ziel anpassen
      if (target.id === "past-games") {
        btn.firstChild.nodeValue = isNowHidden
          ? "Spielhistorie anzeigen "
          : "Spielhistorie ausblenden ";
      } else if (target.id === "more-future-games") {
        btn.firstChild.nodeValue = isNowHidden
          ? "Alle Spiele anzeigen "
          : "Weniger Spiele anzeigen ";
      }
    });
  });
});
