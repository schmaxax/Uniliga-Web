async function loadCSV() {
  const response = await fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vRpdSbswGH_FBb2j8vwLVQMS2hHlfLwA1SPA89_aByWOUmMpLF65ojqxOHlV7W7PiO8PoxXGMvo9-Lj/pub?gid=0&single=true&output=csv");
  const text = await response.text();
  const allGames = parseCSV(text);
    // 👇 Filter: nur Spiele mit mindestens einem Satzwert > 0; ist gerade unnötig durch verbesserte sortierung.
  const validGames = allGames.filter(g => {
    const saetzeA = parseInt(g.saetzeA) || 0;
    const saetzeB = parseInt(g.saetzeB) || 0;
    return saetzeA > 0 || saetzeB > 0;
  });
  return allGames;
  //return validGames;
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
      teams[g.TeamA] = { name: g.TeamA, spiele: 0, siege: 0, niederlagen: 0, punkte: 0, gSatz: 0, vSatz: 0,wonPointsTotal:0, lostPointsTotal:0 };
    }
    if (!teams[g.TeamB]) {
      teams[g.TeamB] = { name: g.TeamB, spiele: 0, siege: 0, niederlagen: 0, punkte: 0, gSatz: 0, vSatz: 0, wonPointsTotal:0, lostPointsTotal:0  };
    }
  });
  return teams;
}

function updateStats(game, teams) {
  const saetzeA = parseInt(game.saetzeA) || 0;
  const saetzeB = parseInt(game.saetzeB) || 0;
  const teamA = teams[game.TeamA];
  const teamB = teams[game.TeamB];
  const pointsA = parseInt(game.PunkteTotalA) || 0;
  const pointsB = parseInt(game.PunkteTotalB) || 0;
  const punktDiffA = a.wonPointsTotal - a.lostPointsTotal;
  const punktDiffB = b.wonPointsTotal - b.lostPointsTotal;
  teamA.spiele++;
  teamB.spiele++;

  teamA.gSatz += saetzeA;
  teamB.gSatz += saetzeB;
  teamA.vSatz += saetzeB;
  teamB.vSatz += saetzeA;

  teamA.wonPointsTotal += pointsA;
  teamA.lostPointsTotal += pointsB;
  teamB.wonPointsTotal += pointsB;
  teamB.lostPointsTotal += pointsA;
  
  
  if (saetzeA > saetzeB) {
    teamA.siege++;
    teamB.niederlagen++;
  } else if (saetzeB > saetzeA) {
    teamB.siege++;
    teamA.niederlagen++;
  } else if (saetzeA === 0 && saetzeB === 0) {
    teamA.spiele -= 1;
    teamB.spiele -= 1; // Beide Teams haben keine Spiele
  }else if (saetzeA === saetzeB ) {
    if(punktDiffA > punktDiffB){
      teamA.siege++;
      teamA.punkte +=1;
      teamB.niederlagen++;
    }else if(punktDiffB > punktDiffA){
      teamB.siege++;
      teamB.punkte +=1; 
      teamA.niederlagen++;
    }
  }

if (saetzeA ==2 && saetzeB <=1){
  teamA.punkte += 1;
}  else if(saetzeB === 2 && saetzeA <= 1){
  teamB.punkte += 1;
} 

/*
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
*/
}

function sortTable(teams) {
  return Object.values(teams).sort((a, b) => {
    const satzDiffA = a.gSatz - a.vSatz;
    const satzDiffB = b.gSatz - b.vSatz;
    const punktDiffA = a.wonPointsTotal - a.lostPointsTotal;
    const punktDiffB = b.wonPointsTotal - b.lostPointsTotal;
    if (b.punkte !== a.punkte) return b.punkte - a.punkte;              // 1. Satzpunkte
    if (b.siege !== a.siege) return b.siege - a.siege;                  // 2. Siege
    if (satzDiffB !== satzDiffA) return satzDiffB - satzDiffA;          // 3. Satzdifferenz
    if (b.gSatz !== a.gSatz) return b.gSatz - a.gSatz;                  // 4. Mehr gewonnene Sätze
    if (punktDiffB !== punktDiffA) return punktDiffB - punktDiffA;      // 5. Punktdifferenz
    return b.wonPointsTotal - a.wonPointsTotal;                         // 6. Mehr gewonnene Punkte
  });
}

function renderTable(sortedTeams, groupName) {
  const container = document.querySelector("#tabellen");
  const table = document.createElement("table");
  table.classList.add("gruppe");

  table.innerHTML = `
    <caption> ${groupName}</caption>
    <thead>
      <tr>
        <th>Platz</th><th>Team</th><th>Spiele</th><th>MP</th><th>W - L</th>
        <th>Sätze</th><th>Punkte</th>
      </tr>
    </thead>
    <tbody>
      ${sortedTeams.map((team, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${team.name}</td>
          <td>${team.spiele}</td>
          <td>${team.punkte}</td>
          <td>${team.siege} - ${team.niederlagen}</td>
          <td>${team.gSatz} : ${team.vSatz}</td>
          <td>${team.wonPointsTotal} : ${team.lostPointsTotal}</td>
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
