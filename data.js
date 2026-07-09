// data.js — shared by index.html and admin.html
// This is the single source of truth for the league table.

const STORAGE_KEY = 'dls_group_rankings_v1';

const DEFAULT_TEAMS = [
  { name: "Perfect XI FC" },
  { name: "Snipper FC" },
  { name: "Real Teddy FC" },
  { name: "Big boys FC" },
  { name: "Come We Play FC" }
];

function freshTeams() {
  return DEFAULT_TEAMS.map(t => ({
    name: t.name, played: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0
  }));
}

function loadTeams() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch (e) {}
  const fresh = freshTeams();
  saveTeams(fresh);
  return fresh;
}

function saveTeams(teams) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
}

function sortTeams(list) {
  return [...list].sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    const gdA = a.gf - a.ga, gdB = b.gf - b.ga;
    if (gdB !== gdA) return gdB - gdA;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.name.localeCompare(b.name);
  });
}

function recordResult(teams, nameA, scoreA, nameB, scoreB) {
  if (nameA === nameB) return false;
  const a = teams.find(t => t.name === nameA);
  const b = teams.find(t => t.name === nameB);
  if (!a || !b) return false;

  a.played++; b.played++;
  a.gf += scoreA; a.ga += scoreB;
  b.gf += scoreB; b.ga += scoreA;

  if (scoreA > scoreB) { a.w++; a.pts += 3; b.l++; }
  else if (scoreA < scoreB) { b.w++; b.pts += 3; a.l++; }
  else { a.d++; b.d++; a.pts += 1; b.pts += 1; }

  saveTeams(teams);
  return true;
}

function resetSeason() {
  const fresh = freshTeams();
  saveTeams(fresh);
  return fresh;
}

function addTeam(teams, name) {
  const trimmed = (name || '').trim();
  if (!trimmed) return false;
  if (teams.some(t => t.name.toLowerCase() === trimmed.toLowerCase())) return false;
  teams.push({ name: trimmed, played: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 });
  saveTeams(teams);
  return true;
}

function removeTeam(teams, name) {
  const index = teams.findIndex(t => t.name === name);
  if (index === -1) return false;
  teams.splice(index, 1);
  saveTeams(teams);
  return true;
}
