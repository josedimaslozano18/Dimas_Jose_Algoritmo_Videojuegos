// =====================
// 1) Videojuegos 2025
// =====================

const videojuegos = [
  "Fortnite",
  "Call of Duty: Warzone",
  "GTA Online",
  "EA Sports FC 25",
  "Minecraft",
  "Roblox",
  "Valorant",
  "League of Legends",
  "Counter-Strike 2",
  "Apex Legends"
];

// =====================
// 2) Segmentos (jugadores)
// =====================

const segmentos = {
  "C": "Jugador casual",
  "K": "Jugador competitivo",
  "S": "Streamer / creador",
  "M": "Multiplayer social"
};

// =====================
// 3) Contextos (criterios)
// =====================

const contextos = {
  "D": "¿Cuál es más divertido para jugar hoy?",
  "R": "¿Cuál recomiendas para jugar con amigos?",
  "C": "¿Cuál es mejor para competir en serio?",
  "L": "¿Cuál mantiene mejor comunidad activa?"
};

// =====================
// 4) Elo
// =====================

const RATING_INICIAL = 1000;
const K = 32;

// =====================
// 5) Estado
// =====================

const STORAGE_KEY = "gamemash_2025_state";

function defaultState(){
  const buckets = {};
  for (const s of Object.keys(segmentos)){
    for (const c of Object.keys(contextos)){
      const key = `${s}__${c}`;
      buckets[key] = {};
      videojuegos.forEach(v => buckets[key][v] = RATING_INICIAL);
    }
  }
  return { buckets };
}

let state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultState();

function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// =====================
// 6) Funciones Elo
// =====================

function expected(ra, rb){
  return 1 / (1 + Math.pow(10, (rb - ra) / 400));
}

function updateElo(bucket, a, b, winner){
  const ra = bucket[a], rb = bucket[b];
  const ea = expected(ra, rb);
  const eb = expected(rb, ra);

  bucket[a] = ra + K * ((winner === "A") - ea);
  bucket[b] = rb + K * ((winner === "B") - eb);
}

// =====================
// 7) UI
// =====================

const segmentSelect = document.getElementById("segmentSelect");
const contextSelect = document.getElementById("contextSelect");
const labelA = document.getElementById("labelA");
const labelB = document.getElementById("labelB");
const questionEl = document.getElementById("question");
const topBox = document.getElementById("topBox");

let currentA, currentB;

function fillSelect(el, obj){
  for (const k in obj){
    const opt = document.createElement("option");
    opt.value = k;
    opt.textContent = obj[k];
    el.appendChild(opt);
  }
}

fillSelect(segmentSelect, segmentos);
fillSelect(contextSelect, contextos);

function newDuel(){
  currentA = videojuegos[Math.floor(Math.random()*videojuegos.length)];
  do {
    currentB = videojuegos[Math.floor(Math.random()*videojuegos.length)];
  } while (currentA === currentB);

  labelA.textContent = currentA;
  labelB.textContent = currentB;
  questionEl.textContent = contextos[contextSelect.value];
}

function vote(w){
  const key = `${segmentSelect.value}__${contextSelect.value}`;
  updateElo(state.buckets[key], currentA, currentB, w);
  saveState();
  renderTop();
  newDuel();
}

function renderTop(){
  const key = `${segmentSelect.value}__${contextSelect.value}`;
  const list = Object.entries(state.buckets[key])
    .sort((a,b)=>b[1]-a[1])
    .slice(0,10);

  topBox.innerHTML = list.map((v,i)=>`
    <div class="toprow">
      <div>${i+1}. ${v[0]}</div>
      <div>${v[1].toFixed(1)}</div>
    </div>
  `).join("");
}

document.getElementById("btnA").onclick = ()=>vote("A");
document.getElementById("btnB").onclick = ()=>vote("B");
document.getElementById("btnNewPair").onclick = newDuel;
document.getElementById("btnShowTop").onclick = renderTop;

document.getElementById("btnReset").onclick = ()=>{
  state = defaultState();
  saveState();
  newDuel();
  renderTop();
};

newDuel();
renderTop();
