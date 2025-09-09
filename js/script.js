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

function groupGamesByGroup(games) {
  const groups = {};
  games.forEach(g => {
    const group = g.Gruppe; // CSV-Feld
    if (!groups[group]) groups[group] = [];
    groups[group].push(g);
  });
  return groups;
}


function initTeams(games) {
  let teams = {};
  games.forEach(g => {
    if (!teams[g.TeamA]) {
      teams[g.TeamA] = { name: g.TeamA, spiele: 0, siege: 0, niederlagen: 0, punkte: 0, gSatz: 0, vSatz: 0 };
    }
    if (!teams[g.TeamB]) {
      teams[g.TeamB] = { name: g.TeamB, spiele: 0, siege: 0, niederlagen: 0, punkte: 0, gSatz: 0, vSatz: 0 };
    }
  });
  return teams;
}

function updateStats(game, teams) {
  const saetzeA = parseInt(game.saetzeA) || 0;
  const saetzeB = parseInt(game.saetzeB) || 0;
  const teamA = teams[game.TeamA];
  const teamB = teams[game.TeamB];

  teamA.spiele++;
  teamB.spiele++;

  teamA.gSatz += saetzeA;
  teamB.gSatz += saetzeB;
  teamA.vSatz += saetzeB;
  teamB.vSatz += saetzeA;

  if (saetzeA > saetzeB) {
    teamA.siege++;
    teamB.niederlagen++;
  } else {
    teamB.siege++;
    teamA.niederlagen++;
  }

if (saetzeA ==2 && saetzeB <=1){
  teamA.punkte += 1;
}  else if(saetzeB === 2 && saetzeA <= 1){
  teamB.punkte += 1;
} 

if (saetzeA === 3 && saetzeB < 3) {
  // A gewinnt
  if (saetzeB <= 1) {
    teamA.punkte += 3;
  } else {
    teamA.punkte += 2;
    teamB.punkte += 1;
  }
} else if (saetzeB === 3 && saetzeA < 3) {
  // B gewinnt
  if (saetzeA <= 1) {
    teamB.punkte += 3;
  } else {
    teamB.punkte += 2;
    teamA.punkte += 1;
  }
}
}

function sortTable(teams) {
  return Object.values(teams).sort((a, b) => {
    if (b.punkte !== a.punkte) return b.punkte - a.punkte; //mehr Punkte zuerst
    if(b.siege !== a.siege) return b.siege - a.siege; // mehr Siege zuerst  
    const diffA = a.gSatz - a.vSatz;
    const diffB = b.gSatz - b.vSatz;
    if(diffB !== diffA)return diffB - diffA; //größere Differenz zuerst
    if (b.gSatz !== a.gSatz) return b.gSatz - a.gSatz; // mehr gewonnene Sätze zuerst
    return a.name.localeCompare(b.name); 
  });
}
function renderTable(sortedTeams, groupName) {
  const container = document.querySelector("#tabellen");
  const table = document.createElement("table");
  table.classList.add("gruppe");

  table.innerHTML = `
    <caption>Gruppe ${groupName}</caption>
    <thead>
      <tr>
        <th>Platz</th><th>Team</th><th>Spiele</th><th>Wins - Loses</th>
        <th>Punkte</th><th>Sätze</th>
      </tr>
    </thead>
    <tbody>
      ${sortedTeams.map((team, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${team.name}</td>
          <td>${team.spiele}</td>
          <td>${team.siege} - ${team.niederlagen}</td>
          <td>${team.punkte}</td>
          <td>${team.gSatz} : ${team.vSatz}</td>
        </tr>`).join("")}
    </tbody>
  `;

  container.appendChild(table);
}

async function main() {
  const games = await loadCSV();
  const groups = groupGamesByGroup(games);

  Object.keys(groups).forEach(groupName => {
    const teams = initTeams(groups[groupName]);
    groups[groupName].forEach(g => updateStats(g, teams));
    const sortedTeams = sortTable(teams);

    renderTable(sortedTeams, groupName); // jetzt mit Gruppennamen
  });
}


main();
