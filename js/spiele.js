async function loadCSV() {
  const response = await fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vRpdSbswGH_FBb2j8vwLVQMS2hHlfLwA1SPA89_aByWOUmMpLF65ojqxOHlV7W7PiO8PoxXGMvo9-Lj/pub?gid=0&single=true&output=csv");
  const text = await response.text();
  return parseCSV(text);
}

function parseCSV(csvText) {
  const rows = csvText.trim().split("\n");
  const headers = rows.shift().split(",").map(h => h.trim());
  return rows.map(row => {
    const values = row.split(",").map(v => v.trim());
    let obj = {};
    headers.forEach((h, i) => (obj[h] = values[i]));
    return obj;
  });
}

function dateToday() {
  const heute = new Date();
  return heute.toISOString().split("T")[0];
}

function dateInTwoWeeks() {
  const heute = new Date();
  const zweiWochen = new Date(heute);
  zweiWochen.setDate(heute.getDate() + 13);
  return zweiWochen.toISOString().split("T")[0];
}

function formatDateDELong(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("de-DE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "2-digit"
  });
}

function sortDates(games) {
  const futureDates = [];
  const pastDates = [];
  const moreFutureGames = []; // ✅ fehlte vorher!
  const today = dateToday();
  const twoWeeksLater = dateInTwoWeeks();

  for (const game of games) {
    if (game.Datum < today) {
      pastDates.push(game);
    } else if (game.Datum <= twoWeeksLater) {
      futureDates.push(game);
    } else {
      moreFutureGames.push(game);
    }
  }

  return { futureDates, pastDates, moreFutureGames }; // ✅ korrekt geschlossen
}

function groupByDate(games) {
  const groups = {};
  games.forEach(g => {
    if (!groups[g.Datum]) groups[g.Datum] = [];
    groups[g.Datum].push(g);
  });
  return groups;
}

function renderSpiele(futureDates, pastDates, moreFutureGames) {
  const container = document.querySelector("#future-games");
  const container2 = document.querySelector("#past-games");
  const container3 = document.querySelector("#more-future-games");

  // Kommende Spiele
  const futureGroups = groupByDate(futureDates);
  container.innerHTML = Object.entries(futureGroups)
    .map(([datum, spiele]) => {
      const spieleByFeld = {};
      spiele.forEach(g => {
        if (!spieleByFeld[g.Feld]) spieleByFeld[g.Feld] = [];
        spieleByFeld[g.Feld].push(g);
      });

      return `
        <details open>
          <summary><h3>${formatDateDELong(datum)}</h3></summary>
          ${Object.entries(spieleByFeld)
            .map(
              ([feld, feldSpiele]) => `
              <div class="field-group">
                <h4>Feld ${feld}</h4>
                ${feldSpiele
                  .map(
                    g => `
                  <div class="game">
                    <span style="font-weight:bold;">${g.TeamA} vs ${g.TeamB}</span><br>
                    <span>Schiedsrichter: ${g.Schiedsrichter} (Spiel ${g.Spiel})</span>
                  </div>`
                  )
                  .join("")}
              </div>`
            )
            .join("")}
        </details>
      `;
    })
    .join("");

  // Weitere Spiele
  const moreFutureGroups = groupByDate(moreFutureGames);
  container3.innerHTML = `
    <h2>Weitere Spiele</h2>
    ${Object.entries(moreFutureGroups)
      .map(([datum, spiele]) => {
        const spieleByFeld = {};
        spiele.forEach(g => {
          if (!spieleByFeld[g.Feld]) spieleByFeld[g.Feld] = [];
          spieleByFeld[g.Feld].push(g);
        });

        return `
          <details open>
            <summary><h3>${formatDateDELong(datum)}</h3></summary>
            ${Object.entries(spieleByFeld)
              .map(
                ([feld, feldSpiele]) => `
                <div class="field-group">
                  <h4>Feld ${feld}</h4>
                  ${feldSpiele
                    .map(
                      g => `
                    <div class="game">
                      <span style="font-weight:bold;">${g.TeamA} vs ${g.TeamB}</span><br>
                      <span>Schiedsrichter: ${g.Schiedsrichter} (Spiel ${g.Spiel})</span>
                    </div>`
                    )
                    .join("")}
                </div>`
              )
              .join("")}
          </details>
        `;
      })
      .join("")}
  `;

  // Vergangene Spiele
  const pastGroups = groupByDate(pastDates);
  container2.innerHTML = `
    <h2>Spielhistorie</h2>
    ${Object.entries(pastGroups)
      .map(
        ([datum, spiele]) => `
        <details open>
          <summary><h3>${formatDateDELong(datum)}</h3></summary>
          ${spiele
            .map(
              g => `
              <div class="game">
                ${g.TeamA}
                <span style="font-weight:bold;">${g.saetzeA} : ${g.saetzeB}</span>
                ${g.TeamB} (Spiel ${g.Spiel}, Feld ${g.Feld})
              </div>`
            )
            .join("")}
        </details>`
      )
      .join("")}
  `;
}

async function main() {
  const games = await loadCSV();
  const { futureDates, pastDates, moreFutureGames } = sortDates(games);
  renderSpiele(futureDates, pastDates, moreFutureGames);
}

main();
