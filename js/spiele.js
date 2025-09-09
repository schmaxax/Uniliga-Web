async function loadCSV() {
  const response = await fetch("data/spiele.csv");
  const text = await response.text();
  return parseCSV(text);
}

function parseCSV(csvText) {
  const rows = csvText.trim().split("\n");
  const headers = rows.shift().split(",").map(h => h.trim());
  return rows.map(row => {
    const values = row.split(",").map(v => v.trim());
    let obj = {};
    headers.forEach((h, i) => obj[h] = values[i]);
    return obj;
  });
}

function dateToday() {
  const heute = new Date();
  return heute.toISOString().split("T")[0]; // "YYYY-MM-DD"
}

function dateInTwoWeeks() {
  const heute = new Date();
  const zweiWochen = new Date(heute);
  zweiWochen.setDate(heute.getDate() + 14);
  return zweiWochen.toISOString().split("T")[0]; // "YYYY-MM-DD"
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
  const today = dateToday();
  const twoWeeksLater = dateInTwoWeeks();

  for (const game of games) {
    if (game.Datum < today) {
      pastDates.push(game);
    } else if (game.Datum <= twoWeeksLater) {
      futureDates.push(game);
    }
  }
  return { futureDates, pastDates };
}

// Hilfsfunktion: Gruppieren nach Datum
function groupByDate(games) {
  const groups = {};
  games.forEach(g => {
    if (!groups[g.Datum]) groups[g.Datum] = [];
    groups[g.Datum].push(g);
  });
  return groups;
}

function renderSpiele(futureDates, pastDates) {
  const container = document.querySelector("#future-games");
  const container2 = document.querySelector("#past-games");

  // kommende Spiele
  const futureGroups = groupByDate(futureDates);
  container.innerHTML = Object.entries(futureGroups)
    .map(([datum, spiele]) => `
      <div class="day-group">
        <h3>${formatDateDELong(datum)}</h3>
        ${spiele.map(g => `<div class="game">${g.TeamA} vs ${g.TeamB} (${g.Feld})</div>`).join("")}
      </div>
    `).join("");

  // vergangene Spiele
  const pastGroups = groupByDate(pastDates);
  container2.innerHTML = `
  <h2>Spielhistorie</h2>
  ${Object.entries(pastGroups)
    .map(([datum, spiele]) => `
    
      <div class="day-group">
      
        <h3>${formatDateDELong(datum)}</h3>
        ${spiele.map(g => `<div class="game">${g.TeamA} vs ${g.TeamB} (${g.Feld})</div>`).join("")}
      </div>
    `).join("")}
`;
}

async function main() {
  const games = await loadCSV();
  const { futureDates, pastDates } = sortDates(games);
  renderSpiele(futureDates, pastDates);
}

main();
