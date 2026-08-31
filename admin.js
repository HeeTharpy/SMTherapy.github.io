let managers = [];
let site = {};
let uploadedImage = "";
let uploadedPhotos = ["", "", "", "", ""];
let uploadedHeroImage = "";
let isLoaded = false;

const DEFAULT_SITE = {
  phone: "010-3819-5884",
  telegram: "https://t.me/sssssnaver",
  address: "경기도 수원시 팔달구 인계동 인계로108번길 39-4",
  hours: "10:00 ~ 05:00",
  heroTitle: "SM테라피",
  heroSubTitle: "도심 속, 편안한 프리미엄 힐링",
  heroDesc: "고객님만을 위한 편안하고 고급스러운 힐링을 선사합니다.",
  heroImage: "",
  eventTitle1: "실시간 예약 가능",
  eventText1: "텔레그램에서 빠르게 예약 가능합니다.",
  eventTitle2: "오늘의 출근부",
  eventText2: "관리사 출근 현황을 실시간으로 확인하세요."
};

function firebaseDb() {
  if (typeof db !== "undefined") return db;
  if (window.db) return window.db;
  if (window.firebase && firebase.database) return firebase.database();
  return null;
}

function managerPhotos(m) {
  const list = Array.isArray(m?.photos) ? m.photos : [];
  const merged = [...list];
  if (m?.image && !merged.includes(m.image)) merged.unshift(m.image);
  return merged.map(src => String(src || "").trim()).filter(Boolean).slice(0, 5);
}

function normalizeManagers(list) {
  let arr = [];
  if (Array.isArray(list)) arr = list;
  else if (list && typeof list === "object") arr = Object.keys(list).map(key => ({ id: list[key]?.id || key, ...(list[key] || {}) }));
  return arr.filter(Boolean).map((m, index) => {
    const photos = managerPhotos(m);
    const mainImage = photos[0] || m.image || "";
    return {
      id: m.id || Date.now() + index,
      name: m.name || "",
      age: m.age || "",
      height: m.height || "",
      body: m.body || "",
      work: m.work || "",
      telegram: m.telegram || DEFAULT_SITE.telegram,
      intro: m.intro || m.desc || "",
      image: mainImage,
      photos: photos.length ? photos : (mainImage ? [mainImage] : [])
    };
  });
}

function defaultManagers() {
  const fallback = window.therapists || (typeof therapists !== "undefined" ? therapists : []);
  return normalizeManagers(fallback);
}

function formatAgeText(age) {
  const value = String(age || "").trim();
  if (!value) return "나이 문의";
  if (value === "20중") return "20대 중반";
  if (value === "20초") return "20대 초반";
  if (value === "20후") return "20대 후반";
  return value;
}
function formatHeightText(height) {
  const value = String(height || "").trim();
  if (!value) return "키 문의";
  return /cm/i.test(value) ? value : `${value}cm`;
}
function formatBodyText(body) {
  const value = String(body || "").trim();
  if (!value) return "스펙 문의";
  const parts = value.replace(/,/g, " /").split(/[\/·]/).map(part => part.trim()).filter(Boolean);
  let weight = ""; let cup = "";
  parts.forEach((part) => {
    const weightMatch = part.match(/(\d{2,3})\s*(?:kg|키로)?/i);
    const cupMatch = part.match(/\b([A-F])\s*(?:컵|cup)?\b/i);
    if (!weight && weightMatch) weight = `${weightMatch[1]}kg`;
    if (!cup && cupMatch) cup = `${cupMatch[1].toUpperCase()}컵`;
  });
  if (weight && cup) return `${weight} · ${cup}`;
  if (weight) return weight;
  if (cup) return cup;
  return value.replace(/\s*\/\s*/g, " · ");
}

function login() {
  const id = document.getElementById("id").value.trim();
  const pw = document.getElementById("pw").value.trim();
  if (id !== "smtherapy" || pw !== "5884@") { alert("아이디 또는 비밀번호가 틀렸습니다."); return; }
  document.getElementById("loginBox").style.display = "none";
  document.getElementById("adminWrap").style.display = "block";
  loadAll();
}

async function loadAll() {
  const database = firebaseDb();
  if (!database) { alert("Firebase 연결을 찾지 못했습니다. 새로고침 후 다시 시도해주세요."); return; }
  try {
    const snap = await database.ref("/").once("value");
    const data = snap.val() || {};
    site = { ...DEFAULT_SITE, ...(data.site || {}) };
    managers = normalizeManagers(data.managers || defaultManagers());
    if (!data.site || !data.managers) await database.ref("/").update({ site, managers, lastSaved: new Date().toLocaleString("ko-KR") });
    isLoaded = true;
    fillSiteForm();
    renderManagers(data.lastSaved || "-");
  } catch (error) { console.error(error); alert("Firebase 데이터를 불러오지 못했습니다. Console 오류를 확인해주세요."); }
}

async function saveAll(successMessage) {
  const database = firebaseDb();
  if (!database) { alert("Firebase 연결을 찾지 못했습니다."); return; }
  try {
    const lastSaved = new Date().toLocaleString("ko-KR");
    managers = normalizeManagers(managers);
    await database.ref("/").update({ site, managers, lastSaved });
    renderManagers(lastSaved);
    if (successMessage) alert(successMessage);
  } catch (error) { console.error(error); alert("저장 실패: Firebase 규칙 또는 연결 상태를 확인해주세요."); }
}

function fillSiteForm() {
  document.getElementById("sitePhone").value = site.phone || "";
  document.getElementById("siteTelegram").value = site.telegram || "";
  document.getElementById("siteAddress").value = site.address || "";
  document.getElementById("siteHours").value = site.hours || "";
  document.getElementById("siteHeroTitle").value = site.heroTitle || "";
  document.getElementById("siteHeroSubTitle").value = site.heroSubTitle || "";
  document.getElementById("siteHeroDesc").value = site.heroDesc || "";
  showHeroPreview(site.heroImage || "");
  document.getElementById("eventTitle1").value = site.eventTitle1 || "";
  document.getElementById("eventText1").value = site.eventText1 || "";
  document.getElementById("eventTitle2").value = site.eventTitle2 || "";
  document.getElementById("eventText2").value = site.eventText2 || "";
}
function saveSite() {
  site.phone = document.getElementById("sitePhone").value.trim();
  site.telegram = document.getElementById("siteTelegram").value.trim();
  site.address = document.getElementById("siteAddress").value.trim();
  site.hours = document.getElementById("siteHours").value.trim();
  site.heroTitle = document.getElementById("siteHeroTitle").value.trim();
  site.heroSubTitle = document.getElementById("siteHeroSubTitle").value.trim();
  site.heroDesc = document.getElementById("siteHeroDesc").value.trim();
  if (uploadedHeroImage) site.heroImage = uploadedHeroImage;
  uploadedHeroImage = "";
  saveAll("기본 정보가 Firebase에 저장되었습니다.");
}
function saveEvents() {
  site.eventTitle1 = document.getElementById("eventTitle1").value.trim();
  site.eventText1 = document.getElementById("eventText1").value.trim();
  site.eventTitle2 = document.getElementById("eventTitle2").value.trim();
  site.eventText2 = document.getElementById("eventText2").value.trim();
  saveAll("이벤트가 Firebase에 저장되었습니다.");
}

function getFormPhotos(existing = []) {
  const typedMain = document.getElementById("managerImage").value.trim();
  const result = [];
  for (let i = 0; i < 5; i++) {
    const src = uploadedPhotos[i] || (i === 0 ? (uploadedImage || typedMain) : existing[i]) || "";
    const clean = src === "사진 파일 선택됨" || src === "대표사진 파일 선택됨" ? (uploadedPhotos[i] || existing[i] || "") : src;
    if (String(clean || "").trim()) result.push(String(clean).trim());
  }
  return [...new Set(result)].slice(0, 5);
}

function saveManager() {
  const idValue = document.getElementById("managerId").value;
  const oldItem = idValue ? managers.find(m => String(m.id) === String(idValue)) : null;
  const photos = getFormPhotos(managerPhotos(oldItem || {}));
  const item = {
    id: idValue ? Number(idValue) : Date.now(),
    name: document.getElementById("managerName").value.trim(),
    age: document.getElementById("managerAge").value.trim(),
    height: document.getElementById("managerHeight").value.trim(),
    body: document.getElementById("managerBody").value.trim(),
    work: document.getElementById("managerWork").value.trim(),
    telegram: document.getElementById("managerTelegram").value.trim() || site.telegram || DEFAULT_SITE.telegram,
    intro: document.getElementById("managerIntro").value.trim(),
    image: photos[0] || "",
    photos
  };
  if (!item.name) { alert("관리사 이름을 입력해주세요."); return; }
  if (idValue) {
    const index = managers.findIndex(m => String(m.id) === String(idValue));
    if (index >= 0) managers[index] = item;
  } else managers.push(item);
  saveAll("관리사 정보가 Firebase에 저장되었습니다.");
  clearForm();
}

function editManager(id) {
  const item = managers.find(m => String(m.id) === String(id));
  if (!item) return;
  const photos = managerPhotos(item);
  document.getElementById("managerId").value = item.id;
  document.getElementById("managerName").value = item.name || "";
  document.getElementById("managerAge").value = item.age || "";
  document.getElementById("managerHeight").value = item.height || "";
  document.getElementById("managerBody").value = item.body || "";
  document.getElementById("managerWork").value = item.work || "";
  document.getElementById("managerTelegram").value = item.telegram || "";
  document.getElementById("managerIntro").value = item.intro || item.desc || "";
  document.getElementById("managerImage").value = photos[0] || item.image || "";
  uploadedImage = ""; uploadedPhotos = ["", "", "", "", ""];
  showPreview(photos[0] || item.image || "");
  showGalleryPreview(photos);
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function deleteManager(id) {
  if (!confirm("정말 삭제하시겠습니까?")) return;
  managers = managers.filter(m => String(m.id) !== String(id));
  saveAll("삭제되었습니다.");
}
function moveManager(id, direction) {
  const index = managers.findIndex(m => String(m.id) === String(id));
  const next = index + direction;
  if (index < 0 || next < 0 || next >= managers.length) return;
  const temp = managers[index]; managers[index] = managers[next]; managers[next] = temp;
  saveAll("");
}
function clearForm() {
  ["managerId", "managerName", "managerAge", "managerHeight", "managerBody", "managerWork", "managerTelegram", "managerIntro", "managerImage"].forEach(id => document.getElementById(id).value = "");
  ["managerImageFile", "managerImageFile1", "managerImageFile2", "managerImageFile3", "managerImageFile4"].forEach(id => { const el = document.getElementById(id); if (el) el.value = ""; });
  uploadedImage = ""; uploadedPhotos = ["", "", "", "", ""];
  document.getElementById("imagePreview").innerHTML = "대표사진 미리보기";
  showGalleryPreview([]);
}
function showPreview(src) {
  const preview = document.getElementById("imagePreview");
  if (!src) { preview.innerHTML = "대표사진 미리보기"; return; }
  preview.innerHTML = `<img src="${src}" alt="미리보기">`;
}
function showGalleryPreview(photos = []) {
  const wrap = document.getElementById("photoGalleryPreview");
  if (!wrap) return;
  const list = photos.map(src => String(src || "").trim()).filter(Boolean).slice(0, 5);
  if (!list.length) { wrap.innerHTML = ""; return; }
  wrap.innerHTML = list.map((src, i) => `<div><img src="${src}" alt="사진${i + 1}" onerror="this.parentElement.remove()"><span>${i === 0 ? "대표" : `추가${i}`}</span></div>`).join("");
}
function renderManagers(lastSaved = "-") {
  const list = document.getElementById("managerList");
  const keyword = (document.getElementById("managerSearch")?.value || "").trim();
  document.getElementById("totalManagers").textContent = managers.length;
  document.getElementById("todayManagers").textContent = managers.filter(m => String(m.work || "").trim()).length;
  document.getElementById("lastSaved").textContent = lastSaved;
  const filtered = managers.filter(m => !keyword || String(m.name || "").includes(keyword) || String(m.work || "").includes(keyword));
  if (!filtered.length) { list.innerHTML = `<div class="empty">검색 결과가 없습니다.</div>`; return; }
  list.innerHTML = filtered.map((m) => {
    const i = managers.findIndex(item => String(item.id) === String(m.id));
    const photos = managerPhotos(m);
    return `<div class="manager-item">
      <div class="manager-photo"><img src="${photos[0] || ''}" alt="${m.name}" onerror="this.parentElement.innerHTML='사진 없음'"></div>
      <div class="manager-text"><strong>${m.name}</strong><span>${formatAgeText(m.age)} · ${formatHeightText(m.height)} · ${formatBodyText(m.body)} · 사진 ${photos.length}/5</span><em>${m.work || "출근시간 문의"}</em></div>
      <div class="manager-actions"><button class="small" onclick="moveManager('${m.id}', -1)" ${i === 0 ? "disabled" : ""}>▲</button><button class="small" onclick="moveManager('${m.id}', 1)" ${i === managers.length - 1 ? "disabled" : ""}>▼</button><button class="small" onclick="editManager('${m.id}')">수정</button><button class="small danger" onclick="deleteManager('${m.id}')">삭제</button></div>
    </div>`;
  }).join("");
}
function previewHome() { window.open("index.html", "_blank"); }
function loadDefaultManagers() { if (!confirm("기본 관리사 목록으로 복구할까요?")) return; managers = defaultManagers(); saveAll("기본 관리사 목록으로 복구되었습니다."); clearForm(); }
function resetAll() { if (!confirm("Firebase 저장 내용을 초기화하고 기본값으로 되돌릴까요?")) return; site = { ...DEFAULT_SITE }; managers = defaultManagers(); uploadedHeroImage = ""; fillSiteForm(); renderManagers(); clearForm(); saveAll("초기화되었습니다."); }

function compressImageFile(file, maxWidth = 900, quality = 0.72) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) { reject(new Error("이미지 파일만 사용할 수 있습니다.")); return; }
    const reader = new FileReader(); reader.onerror = () => reject(new Error("사진을 읽지 못했습니다."));
    reader.onload = function (e) {
      const img = new Image(); img.onerror = () => reject(new Error("사진을 불러오지 못했습니다."));
      img.onload = function () {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas"); canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d"); ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
function showHeroPreview(src) {
  const preview = document.getElementById("heroImagePreview"); if (!preview) return;
  if (!src) { preview.innerHTML = "메인 사진 미리보기"; return; }
  preview.innerHTML = `<img src="${src}" alt="메인 사진 미리보기">`;
}

document.addEventListener("DOMContentLoaded", () => {
  const search = document.getElementById("managerSearch"); if (search) search.addEventListener("input", () => renderManagers());
  const heroFileInput = document.getElementById("siteHeroImageFile");
  if (heroFileInput) heroFileInput.addEventListener("change", async function () {
    const file = this.files && this.files[0]; if (!file) return;
    try { document.getElementById("heroImagePreview").innerHTML = "압축 중..."; uploadedHeroImage = await compressImageFile(file, 1500, 0.72); showHeroPreview(uploadedHeroImage); }
    catch (error) { alert(error.message || "메인 사진 처리 중 오류가 발생했습니다."); this.value = ""; uploadedHeroImage = ""; showHeroPreview(site.heroImage || ""); }
  });
  document.querySelectorAll('input[type="file"][data-photo-index]').forEach((input) => {
    input.addEventListener("change", async function () {
      const file = this.files && this.files[0]; if (!file) return;
      const index = Number(this.dataset.photoIndex || 0);
      try {
        if (index === 0) document.getElementById("imagePreview").innerHTML = "압축 중...";
        uploadedPhotos[index] = await compressImageFile(file);
        if (index === 0) { uploadedImage = uploadedPhotos[0]; document.getElementById("managerImage").value = "대표사진 파일 선택됨"; showPreview(uploadedPhotos[0]); }
        const oldId = document.getElementById("managerId").value;
        const oldItem = oldId ? managers.find(m => String(m.id) === String(oldId)) : null;
        showGalleryPreview(getFormPhotos(managerPhotos(oldItem || {})));
      } catch (error) { alert(error.message || "사진 처리 중 오류가 발생했습니다."); this.value = ""; uploadedPhotos[index] = ""; if (index === 0) { uploadedImage = ""; showPreview(""); } }
    });
  });
  const managerImage = document.getElementById("managerImage");
  if (managerImage) managerImage.addEventListener("input", function () { uploadedImage = ""; uploadedPhotos[0] = ""; showPreview(this.value.trim()); showGalleryPreview(getFormPhotos([])); });
});
