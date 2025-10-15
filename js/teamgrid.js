async function loadCSV() {
  const response = await fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vRpdSbswGH_FBb2j8vwLVQMS2hHlfLwA1SPA89_aByWOUmMpLF65ojqxOHlV7W7PiO8PoxXGMvo9-Lj/pub?gid=0&single=true&output=csv");
  const text = await response.text();
  return text;
}

function readCsvColumn(file, columnName1, columnName2, callback) {
  Papa.parse(file, {
    header: true,        
    complete: function(results) {
      const teamA = results.data.map(row => row[columnName1]).filter(Boolean);
      const teamB = results.data.map(row => row[columnName2]).filter(Boolean);

      const allTeams = [...teamA, ...teamB];
      const uniqueTeams = [...new Set(allTeams)];

      callback(uniqueTeams);
    }
  });
}

function renderGrid(uniqueTeams) {
  const container = document.querySelector("#grid");
  


  container.innerHTML = uniqueTeams
    .map(team => `<div class="team-card">${team}</div>`)
    .join("");
}

async function main() {
  const csvText = await loadCSV();
  const uniqueTeams = await new Promise(resolve => {
    readCsvColumn(csvText, "TeamA", "TeamB", resolve);
  });
  renderGrid(uniqueTeams);
}

main();
