// =====================================================================
// CrowdMix — Núcleo compartido (Firebase + helpers de datos)
// =====================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  collection,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  increment,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

/** Resuelve cuando hay una sesión anónima lista. Cada dispositivo
 *  (celular del asistente, laptop del DJ) obtiene su propio uid;
 *  se usa como "dueño" de sus propias solicitudes. */
export function ready() {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      if (user) resolve(user);
    });
    signInAnonymously(auth).catch(reject);
  });
}

export function genCode(len = 6) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin O/0/I/1 confusos
  let code = "";
  for (let i = 0; i < len; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

export function eventRef(code) {
  return doc(db, "events", code.toUpperCase());
}
export function requestsCol(code) {
  return collection(db, "events", code.toUpperCase(), "requests");
}
export function requestRef(code, id) {
  return doc(db, "events", code.toUpperCase(), "requests", id);
}

export async function createEvent({ eventName, djName, approvalMode, maxPerGuest, tipInfo }) {
  const user = await ready();
  let code = genCode();
  // evita colisiones improbables reintentando si ya existe
  for (let i = 0; i < 4; i++) {
    const snap = await getDoc(eventRef(code));
    if (!snap.exists()) break;
    code = genCode();
  }
  const hostToken = crypto.randomUUID();
  await setDoc(eventRef(code), {
    eventName: eventName || "Mi evento",
    djName: djName || "DJ",
    hostUid: user.uid,
    hostToken,
    status: "live",
    approvalMode: approvalMode || "manual",
    maxPerGuest: maxPerGuest ?? 3,
    tipInfo: tipInfo || {},
    nowPlaying: null,
    tipTotal: 0,
    tipConfirmedTotal: 0,
    createdAt: serverTimestamp(),
  });
  return { code, hostToken };
}

export function watchEvent(code, cb, onError) {
  return onSnapshot(eventRef(code), (snap) => cb(snap.exists() ? { id: snap.id, ...snap.data() } : null), onError);
}

export function watchRequests(code, cb, onError) {
  const q = query(requestsCol(code), orderBy("createdAt", "asc"));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  );
}

export async function submitRequest(code, { song, artist, note, tipPledged, requesterName, requesterId, approvalMode }) {
  return addDoc(requestsCol(code), {
    song: song.trim(),
    artist: (artist || "").trim(),
    note: (note || "").trim().slice(0, 140),
    tipPledged: tipPledged || 0,
    tipConfirmed: false,
    requesterName: requesterName || "Anónimo",
    requesterId,
    status: approvalMode === "auto" ? "accepted" : "pending",
    createdAt: serverTimestamp(),
  });
}

export async function setRequestStatus(code, id, status) {
  const patch = { status };
  if (status === "playing") patch.playingAt = serverTimestamp();
  return updateDoc(requestRef(code, id), patch);
}

export async function confirmTip(code, id, amount) {
  await updateDoc(requestRef(code, id), { tipConfirmed: true });
  await updateDoc(eventRef(code), { tipConfirmedTotal: increment(amount || 0) });
}

export async function setNowPlaying(code, request) {
  await updateDoc(eventRef(code), {
    nowPlaying: request ? { song: request.song, artist: request.artist, requestId: request.id } : null,
  });
  if (request) await setRequestStatus(code, request.id, "playing");
}

export async function deleteRequest(code, id) {
  return deleteDoc(requestRef(code, id));
}

export async function updateEventSettings(code, patch) {
  return updateDoc(eventRef(code), patch);
}

/** Orden sugerido para el tablero del DJ: primero lo que está sonando,
 *  luego pendientes/aceptadas por propina confirmada desc, luego por
 *  orden de llegada. El DJ igual puede aceptar/rechazar manualmente:
 *  la propina prioriza la vista, no decide sola. */
export function sortForHost(requests) {
  const rank = { playing: 0, accepted: 1, pending: 2, played: 3, rejected: 4 };
  return [...requests].sort((a, b) => {
    if (rank[a.status] !== rank[b.status]) return rank[a.status] - rank[b.status];
    if (a.status === "pending" || a.status === "accepted") {
      const tipDiff = (b.tipPledged || 0) - (a.tipPledged || 0);
      if (tipDiff !== 0) return tipDiff;
    }
    return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
  });
}

export function toast(msg, ms = 2400) {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  requestAnimationFrame(() => el.classList.add("show"));
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), ms);
}

export function getLocalGuestId() {
  let id = localStorage.getItem("crowdmix_guest_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("crowdmix_guest_id", id);
  }
  return id;
}

export function fmtSoles(n) {
  return `S/ ${Number(n || 0).toFixed(0)}`;
}
