// chats.js — chat em tempo real por sala, usando Firebase Firestore.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, addDoc, query, where, orderBy,
  onSnapshot, serverTimestamp, limit
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const ROOM_LABELS = {
  ansiedade: "Ansiedade 🌿",
  tristeza: "Tristeza 🌧️",
  motivacao: "Motivação 🌻",
};

// Lista simples de palavras que, se aparecerem, mostram um aviso extra de apoio
// (moderação leve baseada em palavras-chave — não é diagnóstico nem bloqueio automático).
const ALERT_KEYWORDS = ["desistir", "acabar com tudo", "sem saída", "não aguento mais"];

let app, db;
let currentRoom = null;
let nickname = null;
let unsubscribe = null;

function initFirebase() {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    return true;
  } catch (e) {
    console.error("Erro ao iniciar Firebase:", e);
    return false;
  }
}

function showConnectionWarning() {
  const area = document.getElementById("rooms-area");
  const warn = document.createElement("div");
  warn.className = "disclaimer";
  warn.style.borderColor = "#B3401B";
  warn.innerHTML = "⚠️ Não foi possível conectar ao chat em tempo real. Confira se as credenciais do Firebase em <code>js/firebase-config.js</code> foram preenchidas corretamente (veja o README).";
  area.prepend(warn);
}

// ---------- Etapa 1: apelido ----------
document.getElementById("nickname-confirm").addEventListener("click", () => {
  const input = document.getElementById("nickname-input");
  const value = input.value.trim();
  if (!value) {
    input.focus();
    return;
  }
  nickname = value.slice(0, 24);
  sessionStorage.setItem("setembroAmarelo_nickname", nickname);
  document.getElementById("nickname-gate").style.display = "none";
  document.getElementById("rooms-area").style.display = "block";
});

// Reaproveita apelido se a pessoa já tinha definido nesta sessão do navegador
window.addEventListener("DOMContentLoaded", () => {
  const saved = sessionStorage.getItem("setembroAmarelo_nickname");
  if (saved) {
    nickname = saved;
    document.getElementById("nickname-gate").style.display = "none";
    document.getElementById("rooms-area").style.display = "block";
  }
  const ok = initFirebase();
  if (!ok) showConnectionWarning();
});

// ---------- Etapa 2: escolher sala ----------
document.getElementById("rooms-grid").addEventListener("click", (e) => {
  const card = e.target.closest(".room-card");
  if (!card) return;
  openRoom(card.dataset.room);
});

document.getElementById("chat-back").addEventListener("click", () => {
  closeRoom();
});

function openRoom(roomId) {
  currentRoom = roomId;
  document.getElementById("rooms-grid").style.display = "none";
  document.getElementById("chat-window").classList.add("active");
  document.getElementById("chat-title").textContent = ROOM_LABELS[roomId] || roomId;
  document.getElementById("chat-messages").innerHTML = "";
  listenToRoom(roomId);
}

function closeRoom() {
  if (unsubscribe) unsubscribe();
  currentRoom = null;
  document.getElementById("chat-window").classList.remove("active");
  document.getElementById("rooms-grid").style.display = "grid";
}

function listenToRoom(roomId) {
  if (!db) return;
  if (unsubscribe) unsubscribe();
  const q = query(
    collection(db, "messages"),
    where("room", "==", roomId),
    orderBy("createdAt", "asc"),
    limit(200)
  );
  unsubscribe = onSnapshot(q, (snapshot) => {
    const container = document.getElementById("chat-messages");
    container.innerHTML = "";
    snapshot.forEach((doc) => {
      const msg = doc.data();
      renderMessage(container, msg);
    });
    container.scrollTop = container.scrollHeight;
  }, (error) => {
    console.error("Erro ao ler mensagens:", error);
    showConnectionWarning();
  });
}

function renderMessage(container, msg) {
  const div = document.createElement("div");
  const isOwn = msg.nickname === nickname;
  div.className = "msg" + (isOwn ? " own" : "");
  const safeName = escapeHTML(msg.nickname || "anônimo");
  const safeText = escapeHTML(msg.text || "");
  div.innerHTML = `<span class="msg__meta">${safeName}</span>${safeText}`;
  container.appendChild(div);
}

function escapeHTML(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

// ---------- Etapa 3: enviar mensagem ----------
document.getElementById("chat-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = document.getElementById("chat-input");
  const text = input.value.trim();
  if (!text || !currentRoom || !db) return;

  input.value = "";

  try {
    await addDoc(collection(db, "messages"), {
      room: currentRoom,
      nickname: nickname,
      text: text,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("Erro ao enviar mensagem:", err);
    showConnectionWarning();
    return;
  }

  const lower = text.toLowerCase();
  if (ALERT_KEYWORDS.some((k) => lower.includes(k))) {
    showSupportReminder();
  }
});

function showSupportReminder() {
  const container = document.getElementById("chat-messages");
  const div = document.createElement("div");
  div.className = "disclaimer";
  div.style.alignSelf = "center";
  div.innerHTML = "💛 Percebemos que você pode estar passando por um momento difícil. Você não está sozinha(o) — o CVV está disponível agora, gratuitamente, ligando para <strong>188</strong>.";
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}
