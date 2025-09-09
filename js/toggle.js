    function togglePastGames() {
      const pastGames = document.getElementById("past-games");
      const button = document.querySelector(".toggle-button");
      const arrow = document.getElementById("arrow");

      pastGames.classList.toggle("hidden");
      arrow.classList.toggle("rotate");

      if (pastGames.classList.contains("hidden")) {
        button.firstChild.textContent = "Spielhistorie anzeigen ";
      } else {
        button.firstChild.textContent = "Spielhistorie ausblenden ";
      }
    }