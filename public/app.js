// =========================================================
// SERVİSPLAN - Frontend Uygulama Mantığı (Bugün + Yarın Akışı)
// =========================================================

let todayDateString = '';
let tomorrowDateString = '';
let yesterdayDateString = '';
let showHistory = false;

let personnelList = [];
let rosterData = {
  yesterday: {
    '07:00': { toplama: [], dagitim: [] },
    '15:00': { toplama: [], dagitim: [] },
    '23:00': { toplama: [], dagitim: [] }
  },
  today: {
    '07:00': { toplama: [], dagitim: [] },
    '15:00': { toplama: [], dagitim: [] },
    '23:00': { toplama: [], dagitim: [] }
  },
  tomorrow: {
    '07:00': { toplama: [], dagitim: [] },
    '15:00': { toplama: [], dagitim: [] },
    '23:00': { toplama: [], dagitim: [] }
  }
};

// Target for adding passenger
let pendingTargetDay = 'today';   // 'today' or 'tomorrow'
let pendingTargetShift = '07:00'; // '07:00', '15:00', '23:00'
let pendingTargetType = 'toplama'; // 'toplama' or 'dagitim'

// Target for driver time assignment
let editingPassenger = null; // { id, name, shiftKey, currentTime }

// Turkish Month & Day Names
const MONTHS_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];
const DAYS_TR = [
  'Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'
];

function getDayNameTr(date) {
  return DAYS_TR[date.getDay()];
}

function formatDateTr(date) {
  const day = date.getDate();
  const month = MONTHS_TR[date.getMonth()];
  const weekday = DAYS_TR[date.getDay()];
  return `${day} ${month} ${weekday}`;
}

function formatDateWithDashTr(date) {
  const day = date.getDate();
  const month = MONTHS_TR[date.getMonth()];
  const weekday = DAYS_TR[date.getDay()];
  return `${day} ${month} - ${weekday}`;
}

function getDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initDates();
  initPwa();
  fetchPersonnel();
  fetchDayRoster();

  // Background Auto-sync (every 4 seconds)
  setInterval(() => {
    fetchDayRoster(true); // silent sync
  }, 4000);
});

// Live Clock & 1-Hour Rule Check
function initClock() {
  const clockEl = document.getElementById('current-clock');
  function update() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    clockEl.innerText = `${h}:${m}`;
    applyOneHourRule(now);
  }
  update();
  setInterval(update, 1000);
}

// 1-Hour Rule:
// - Yesterday 23:00 Night Shift (ends at 07:00 today) is marked past after 08:00 (480 min)
// - Today Sabah Vardiyası (finishes at 15:00) is marked past after 16:00 (960 min)
// - Today Öğlen Vardiyası (finishes at 23:00) is marked past after 24:00 (1440 min)
function applyOneHourRule(now) {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Yesterday 23:00 night shift (ends at 07:00 today -> past at 08:00 = 480 min)
  const isPastYesterday2300 = currentMinutes >= 480;
  updateShiftBlockVisibility('yesterday-2300', isPastYesterday2300, 'Tamamlandı (07:00)');

  // Today 07:00 shift (ends at 15:00 -> past at 16:00 = 960 min)
  const isPast0700 = currentMinutes >= 960;
  updateShiftBlockVisibility('today-0700', isPast0700, 'Tamamlandı (15:00)');

  // Today 15:00 shift (ends at 23:00 -> past at 24:00 = 1440 min)
  const isPast1500 = currentMinutes >= 1440;
  updateShiftBlockVisibility('today-1500', isPast1500, 'Tamamlandı (23:00)');
}

function updateShiftBlockVisibility(elementId, isPast, pastLabel) {
  const block = document.getElementById(`shift-block-${elementId}`);
  const statusEl = document.getElementById(`status-${elementId}`);
  if (!block) return;

  if (isPast) {
    block.classList.add('past-shift');
    if (statusEl) statusEl.innerText = pastLabel;

    if (!showHistory) {
      block.classList.add('hidden-shift');
    } else {
      block.classList.remove('hidden-shift');
    }
  } else {
    block.classList.remove('past-shift', 'hidden-shift');
    if (statusEl) statusEl.innerText = '';
  }
}

function toggleHistoryView() {
  const toggle = document.getElementById('show-history-toggle');
  showHistory = toggle.checked;
  applyOneHourRule(new Date());
}

// Dates Setup
function initDates() {
  const now = new Date();
  todayDateString = getDateString(now);

  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  tomorrowDateString = getDateString(tomorrow);

  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  yesterdayDateString = getDateString(yesterday);

  const todayDay = getDayNameTr(now);
  const tomorrowDay = getDayNameTr(tomorrow);
  const yesterdayDay = getDayNameTr(yesterday);

  // Top header date bar badge & label:
  const badgeEl = document.getElementById('today-day-badge');
  if (badgeEl) badgeEl.innerText = todayDay.toUpperCase();

  const todayDateLabel = document.getElementById('today-date-label');
  if (todayDateLabel) todayDateLabel.innerText = `${now.getDate()} ${MONTHS_TR[now.getMonth()]} ${now.getFullYear()}`;

  // Date labels with dash on cards:
  const yesterdayWithDash = formatDateWithDashTr(yesterday);
  const todayWithDash = formatDateWithDashTr(now);
  const tomorrowWithDash = formatDateWithDashTr(tomorrow);

  const elYesterday = document.getElementById('shift-date-yesterday-2300');
  if (elYesterday) elYesterday.innerText = yesterdayWithDash;

  ['shift-date-today-0700', 'shift-date-today-1500', 'shift-date-today-2300'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerText = todayWithDash;
  });

  const elTomorrow = document.getElementById('shift-date-tomorrow-0700');
  if (elTomorrow) elTomorrow.innerText = tomorrowWithDash;

  // Day pills:
  const pillYesterday = document.getElementById('pill-yesterday');
  if (pillYesterday) pillYesterday.innerText = yesterdayDay.toUpperCase();

  document.querySelectorAll('.pill-today').forEach(el => {
    el.innerText = todayDay.toUpperCase();
  });

  const pillTomorrow = document.getElementById('pill-tomorrow');
  if (pillTomorrow) pillTomorrow.innerText = tomorrowDay.toUpperCase();

  // Column titles for bridging night shifts:
  const titleYestToplama = document.getElementById('title-yesterday-2300-toplama');
  if (titleYestToplama) titleYestToplama.innerText = `🟢 23:00 Toplama (${yesterdayDay})`;
  const titleYestDagitim = document.getElementById('title-yesterday-2300-dagitim');
  if (titleYestDagitim) titleYestDagitim.innerText = `🟡 07:00 Dağıtım (${todayDay})`;

  const titleTodayToplama = document.getElementById('title-today-2300-toplama');
  if (titleTodayToplama) titleTodayToplama.innerText = `🟢 23:00 Toplama (${todayDay})`;
  const titleTodayDagitim = document.getElementById('title-today-2300-dagitim');
  if (titleTodayDagitim) titleTodayDagitim.innerText = `🟡 07:00 Dağıtım (${tomorrowDay})`;

  // Tomorrow mega banner:
  const tomorrowBadge = document.getElementById('tomorrow-badge-label');
  if (tomorrowBadge) tomorrowBadge.innerText = tomorrowDay.toUpperCase();

  const tomorrowBannerTitle = document.getElementById('tomorrow-banner-title');
  if (tomorrowBannerTitle) tomorrowBannerTitle.innerText = `${tomorrowDay.toUpperCase()} VARDİYALARI`;

  const tomorrowDateLabel = document.getElementById('tomorrow-date-label');
  if (tomorrowDateLabel) tomorrowDateLabel.innerText = formatDateTr(tomorrow);
}

// ================= API CALLS =================

// 1. Fetch Roster for Today & Tomorrow (with cache-busting)
async function fetchDayRoster(isSilent = false) {
  try {
    const res = await fetch(`/api/roster/day?date=${todayDateString}&_t=${Date.now()}`, {
      cache: 'no-store'
    });
    if (!res.ok) throw new Error('Roster fetch error');
    const data = await res.json();

    const defaultGroup = () => ({
      '07:00': { toplama: [], dagitim: [] },
      '15:00': { toplama: [], dagitim: [] },
      '23:00': { toplama: [], dagitim: [] }
    });
    rosterData.yesterday = Object.assign(defaultGroup(), data.yesterday || {});
    rosterData.today = Object.assign(defaultGroup(), data.today || {});
    rosterData.tomorrow = Object.assign(defaultGroup(), data.tomorrow || {});

    renderAllShifts();
    setLiveIndicator(true);
  } catch (err) {
    console.error('Fetch roster error:', err);
    if (!isSilent) showToast('Bağlantı hatası, tekrar deneniyor...');
    setLiveIndicator(false);
  }
}

// Force Refresh from UI button
async function forceRefreshRoster() {
  const btn = document.querySelector('.header-refresh-btn');
  if (btn) btn.style.transform = 'rotate(360deg)';
  showToast('🔄 Güncelleniyor...');
  await fetchPersonnel();
  await fetchDayRoster();
  setTimeout(() => {
    if (btn) btn.style.transform = 'none';
  }, 400);
}

// 2. Fetch Personnel (with cache-busting)
async function fetchPersonnel() {
  try {
    const res = await fetch(`/api/personnel?_t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Personnel fetch error');
    personnelList = await res.json();
    renderManagePersonnelList();
  } catch (err) {
    console.error('Personnel error:', err);
  }
}

// 3. Add to Roster (Instant Optimistic UI + Server Call)
async function addToRoster(dayKey, shift, type, name) {
  try {
    let targetDate = todayDateString;
    if (dayKey === 'tomorrow') targetDate = tomorrowDateString;
    if (dayKey === 'yesterday') targetDate = yesterdayDateString;

    // Optimistic UI Update: add temporary placeholder immediately so user sees it in 0ms!
    if (!rosterData[dayKey]) rosterData[dayKey] = {};
    if (!rosterData[dayKey][shift]) rosterData[dayKey][shift] = { toplama: [], dagitim: [] };
    const list = type === 'toplama' ? rosterData[dayKey][shift].toplama : rosterData[dayKey][shift].dagitim;
    
    const tempId = 'temp-' + Date.now();
    const tempItem = { id: tempId, name: name, shift: shift, type: type, date: targetDate, pickup_time: null };
    if (!list.some(item => item.name === name)) {
      list.push(tempItem);
      renderAllShifts();
    }

    const res = await fetch('/api/roster', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: targetDate,
        shift: shift,
        type: type,
        name: name,
        pickup_time: null
      })
    });

    const data = await res.json();
    if (!res.ok) {
      // Revert optimistic add if server rejected
      const idx = list.findIndex(item => item.id === tempId);
      if (idx !== -1) list.splice(idx, 1);
      renderAllShifts();
      showToast(data.error || 'Eklenemedi');
      return false;
    }

    // Replace temp item with real item from server
    const idx = list.findIndex(item => item.id === tempId);
    if (idx !== -1) {
      list[idx] = data;
    }
    renderAllShifts();

    const now = new Date();
    const dayName = dayKey === 'tomorrow'
      ? getDayNameTr(new Date(now.getTime() + 24 * 60 * 60 * 1000))
      : (dayKey === 'yesterday'
          ? getDayNameTr(new Date(now.getTime() - 24 * 60 * 60 * 1000))
          : getDayNameTr(now));
    showToast(`✅ ${name} ${dayName} ${shift} ${type === 'toplama' ? 'Toplamaya' : 'Dağıtıma'} eklendi`);
    closeNameSelector();
    await fetchDayRoster(true);
    return true;
  } catch (err) {
    console.error('Add error:', err);
    showToast('Sunucuya bağlanılamadı');
    fetchDayRoster(true);
    return false;
  }
}

// 4. Update Pickup Time (Driver Time Assignment with Optimistic UI)
async function updatePickupTime(id, time) {
  try {
    // Optimistic UI update
    for (const dKey of ['yesterday', 'today', 'tomorrow']) {
      const dayGroup = rosterData[dKey] || {};
      for (const sKey of Object.keys(dayGroup)) {
        if (dayGroup[sKey].toplama) {
          const item = dayGroup[sKey].toplama.find(it => String(it.id) === String(id));
          if (item) item.pickup_time = time;
        }
      }
    }
    renderAllShifts();

    const res = await fetch(`/api/roster/${id}/time`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pickup_time: time })
    });

    const data = await res.json();
    if (!res.ok) throw new Error('Update time error');

    showToast(`⏱️ Saat belirlendi: ${time || 'Kaldırıldı'}`);
    closeTimeModal();
    await fetchDayRoster(true);
  } catch (err) {
    console.error('Time update error:', err);
    showToast('Saat kaydedilemedi');
    fetchDayRoster(true);
  }
}

// 5. Delete from Roster (With User Confirmation Dialog)
let pendingDeleteTarget = null;

function deleteFromRoster(id, name) {
  pendingDeleteTarget = { id, name };
  const modal = document.getElementById('confirm-delete-modal');
  const nameEl = document.getElementById('confirm-delete-name');
  if (nameEl) nameEl.innerText = `"${name}"`;

  if (modal) {
    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('open'));
  } else {
    // Fallback if modal DOM is not available
    if (confirm(`"${name}" listeden silinecek. Onaylıyor musunuz?`)) {
      executeDeleteFromRoster();
    }
  }
}

function closeConfirmDeleteModal(e) {
  if (e && e.target !== e.currentTarget && !e.target.classList.contains('btn-cancel')) return;
  const modal = document.getElementById('confirm-delete-modal');
  if (!modal) return;
  modal.classList.remove('open');
  setTimeout(() => {
    modal.style.display = 'none';
    pendingDeleteTarget = null;
  }, 200);
}

async function executeDeleteFromRoster() {
  if (!pendingDeleteTarget) return;
  const { id, name } = pendingDeleteTarget;

  // Close modal first
  const modal = document.getElementById('confirm-delete-modal');
  if (modal) {
    modal.classList.remove('open');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 200);
  }
  pendingDeleteTarget = null;

  try {
    // Optimistic UI deletion
    for (const dKey of ['today', 'tomorrow']) {
      const dayGroup = rosterData[dKey] || {};
      for (const sKey of Object.keys(dayGroup)) {
        if (dayGroup[sKey].toplama) {
          dayGroup[sKey].toplama = dayGroup[sKey].toplama.filter(item => String(item.id) !== String(id) && item.name !== name);
        }
        if (dayGroup[sKey].dagitim) {
          dayGroup[sKey].dagitim = dayGroup[sKey].dagitim.filter(item => String(item.id) !== String(id) && item.name !== name);
        }
      }
    }
    renderAllShifts();

    const res = await fetch(`/api/roster/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete error');
    showToast(`✅ ${name} listeden çıkarıldı`);
    await fetchDayRoster(true);
  } catch (err) {
    console.error('Delete error:', err);
    showToast('Silinemedi');
    fetchDayRoster(true);
  }
}

// 5.1 Toggle Shift Edit Mode (Shows/Hides ✕ delete buttons)
function toggleShiftEditMode(blockId) {
  const block = document.getElementById(blockId);
  if (!block) return;
  const isEditing = block.classList.toggle('edit-mode');
  const btn = block.querySelector('.shift-edit-btn');
  if (btn) {
    const icon = btn.querySelector('.edit-btn-icon');
    const text = btn.querySelector('.edit-btn-text');
    if (isEditing) {
      if (icon) icon.innerText = '✓';
      if (text) text.innerText = 'Tamam';
      showToast('✏️ Düzenleme modu: Silmek için ✕ simgesine dokunun');
    } else {
      if (icon) icon.innerText = '✏️';
      if (text) text.innerText = 'Düzenle';
    }
  }
}

// ================= RENDER ALL SHIFTS =================

function renderAllShifts() {
  try {
    // 0. Dün Gece: 23:00 Toplama (Dün) -> 07:00 Dağıtım (Bugün)
    renderVardiyaBlock(
      'yesterday-2300',
      '23:00',
      '07:00',
      rosterData.yesterday?.['23:00']?.toplama || [],
      rosterData.today?.['07:00']?.dagitim || []
    );

    // 1. Bugün Sabah: 07:00 Toplama -> 15:00 Dağıtım
    renderVardiyaBlock(
      'today-0700',
      '07:00',
      '15:00',
      rosterData.today?.['07:00']?.toplama || [],
      rosterData.today?.['15:00']?.dagitim || []
    );

    // 2. Bugün Öğlen: 15:00 Toplama -> 23:00 Dağıtım
    renderVardiyaBlock(
      'today-1500',
      '15:00',
      '23:00',
      rosterData.today?.['15:00']?.toplama || [],
      rosterData.today?.['23:00']?.dagitim || []
    );

    // 3. Bugün Gece: 23:00 Toplama (Bugün) -> 07:00 Dağıtım (Yarın)
    renderVardiyaBlock(
      'today-2300',
      '23:00',
      '07:00',
      rosterData.today?.['23:00']?.toplama || [],
      rosterData.tomorrow?.['07:00']?.dagitim || []
    );

    // 4. Yarın Sabah: 07:00 Toplama -> 15:00 Dağıtım
    renderVardiyaBlock(
      'tomorrow-0700',
      '07:00',
      '15:00',
      rosterData.tomorrow?.['07:00']?.toplama || [],
      rosterData.tomorrow?.['15:00']?.dagitim || []
    );

    applyOneHourRule(new Date());
    updatePickupReminders();
  } catch (err) {
    console.error('renderAllShifts error:', err);
  }
}

// ================= ⚠️ TOPLAMA REMINDERS UNDER DAĞITIM =================

function updatePickupReminders() {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const todayDay = getDayNameTr(now);
  const tomorrowDay = getDayNameTr(tomorrow);

  // 0. 07:00 Dağıtım (Dün Gece: yesterday-2300 bloğu) -> Bugün 07:00 Toplama kontrolü
  const countToday07 = (rosterData.today?.['07:00']?.toplama || []).length;
  renderReminderAlert(
    'reminder-yesterday-2300',
    countToday07,
    `${todayDay} 07:00 Toplama`,
    'shift-block-today-0700'
  );

  // 1. 15:00 Dağıtım (Bugün Sabah: 07:00 bloğu) -> 15:00 Toplama kontrolü
  const countToday15 = (rosterData.today?.['15:00']?.toplama || []).length;
  renderReminderAlert(
    'reminder-today-0700',
    countToday15,
    `${todayDay} 15:00 Toplama`,
    'shift-block-today-1500'
  );

  // 2. 23:00 Dağıtım (Bugün Öğlen: 15:00 bloğu) -> 23:00 Toplama kontrolü
  const countToday23 = (rosterData.today?.['23:00']?.toplama || []).length;
  renderReminderAlert(
    'reminder-today-1500',
    countToday23,
    `${todayDay} 23:00 Toplama`,
    'shift-block-today-2300'
  );

  // 3. 07:00 Dağıtım (Gece: 23:00 bloğu) -> Ertesi Gün 07:00 Toplama kontrolü
  const countTomorrow07 = (rosterData.tomorrow?.['07:00']?.toplama || []).length;
  renderReminderAlert(
    'reminder-today-2300',
    countTomorrow07,
    `${tomorrowDay} 07:00 Toplama`,
    'shift-block-tomorrow-0700'
  );

  // 4. 15:00 Dağıtım (Sabah: 07:00 bloğu) -> Ertesi Gün 15:00 Toplama kontrolü
  const countTomorrow15 = (rosterData.tomorrow?.['15:00']?.toplama || []).length;
  renderReminderAlert(
    'reminder-tomorrow-0700',
    countTomorrow15,
    `${tomorrowDay} 15:00 Toplama`,
    null
  );
}

function renderReminderAlert(elementId, count, toplamaLabel, targetBlockId) {
  const el = document.getElementById(elementId);
  if (!el) return;

  if (count > 0) {
    el.style.display = 'block';
    el.innerHTML = `
      <div class="reminder-alert-content">
        <span class="reminder-alert-icon">⚠️</span>
        <div class="reminder-alert-text">
          <div class="reminder-alert-title">Gelirken <strong>${count} kişi</strong> toplanacak!</div>
          <div class="reminder-alert-sub">Lütfen toplanacak kişilere bakın (${escapeHtml(toplamaLabel)}) ${targetBlockId ? '👇' : ''}</div>
        </div>
      </div>
    `;
    if (targetBlockId) {
      el.onclick = () => scrollToShiftTarget(targetBlockId);
      el.title = `${toplamaLabel} listesine gitmek için dokunun`;
    } else {
      el.onclick = null;
      el.title = '';
    }
  } else {
    el.style.display = 'none';
    el.innerHTML = '';
  }
}

function scrollToShiftTarget(targetBlockId) {
  const block = document.getElementById(targetBlockId);
  if (!block) return;

  block.scrollIntoView({ behavior: 'smooth', block: 'center' });

  const toplamaBox = block.querySelector('.toplama-box') || block;
  toplamaBox.classList.remove('pulse-highlight');
  void toplamaBox.offsetWidth; // reflow to trigger CSS animation
  toplamaBox.classList.add('pulse-highlight');

  const titleEl = toplamaBox.querySelector('.col-title');
  const titleText = titleEl ? titleEl.innerText : 'Toplama';
  showToast(`👀 ${titleText} listesi gösteriliyor`);

  setTimeout(() => {
    toplamaBox.classList.remove('pulse-highlight');
  }, 2500);
}

function renderVardiyaBlock(domPrefix, toplamaShiftKey, dagitimShiftKey, toplamaItems, dagitimItems) {
  // 1. Saate Göre Sıralama (Toplama): Saati olanlar kronolojik küçükten büyüğe, saatsizler altta
  const sortedToplama = (toplamaItems || []).slice().sort((a, b) => {
    const tA = a.pickup_time ? a.pickup_time.trim() : null;
    const tB = b.pickup_time ? b.pickup_time.trim() : null;
    if (tA && tB) return tA.localeCompare(tB);
    if (tA && !tB) return -1;
    if (!tA && tB) return 1;
    return Number(a.id) - Number(b.id);
  });

  // 🟢 Toplama Render
  const toplamaContainer = document.getElementById(`list-${domPrefix}-toplama`);
  const toplamaCountEl = document.getElementById(`count-${domPrefix}-toplama`);
  if (toplamaCountEl) toplamaCountEl.innerText = sortedToplama.length;

  if (toplamaContainer) {
    if (sortedToplama.length === 0) {
      toplamaContainer.innerHTML = '<div class="mini-empty">Kimse yok</div>';
    } else {
      toplamaContainer.innerHTML = sortedToplama.map((item, index) => {
        const hasTime = !!item.pickup_time;
        const timeClass = hasTime ? 'has-time' : 'waiting-time';
        const timeLabel = hasTime ? item.pickup_time : '--:--';
        const safeName = escapeHtml(item.name);
        const safeShift = escapeHtml(toplamaShiftKey);
        const safeTime = escapeHtml(item.pickup_time || '');
        const safePhone = escapeHtml(item.phone || '');
        const itemId = item.id;

        return `
          <div class="mini-passenger-card toplama-card">
            <div class="passenger-card-top">
              <div class="passenger-name-wrap">
                <span class="passenger-num">${index + 1}</span>
                <span class="passenger-name-text" title="${safeName}">${safeName}</span>
              </div>
              <button type="button" class="mini-delete-btn" onclick="deleteFromRoster('${itemId}', '${safeName}')" title="Listeden Çıkar">✕</button>
            </div>
            <div class="passenger-card-bottom">
              <button type="button" class="pickup-time-pill ${timeClass}" 
                    onclick="openTimeModal('${itemId}', '${safeName}', '${safeShift}', '${safeTime}')" 
                    title="Şoför saat belirleme için tıkla">
                ⏱️ ${timeLabel}
              </button>
              <button type="button" class="mini-wa-btn-text" onclick="openWaModal('${safeName}', '${safePhone}')" title="WhatsApp ile Yaz">
                💬 Mesaj
              </button>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // 🟡 Dağıtım Render
  const sortedDagitim = dagitimItems || [];
  const dagitimContainer = document.getElementById(`list-${domPrefix}-dagitim`);
  const dagitimCountEl = document.getElementById(`count-${domPrefix}-dagitim`);
  if (dagitimCountEl) dagitimCountEl.innerText = sortedDagitim.length;

  if (dagitimContainer) {
    if (sortedDagitim.length === 0) {
      dagitimContainer.innerHTML = '<div class="mini-empty">Kimse yok</div>';
    } else {
      dagitimContainer.innerHTML = sortedDagitim.map((item, index) => {
        const safeName = escapeHtml(item.name);
        const safePhone = escapeHtml(item.phone || '');
        const safeDagitimTime = escapeHtml(dagitimShiftKey || '');
        const itemId = item.id;
        return `
          <div class="mini-passenger-card dagitim-card">
            <div class="passenger-card-top">
              <div class="passenger-name-wrap">
                <span class="passenger-num">${index + 1}</span>
                <span class="passenger-name-text" title="${safeName}">${safeName}</span>
              </div>
              <button type="button" class="mini-delete-btn" onclick="deleteFromRoster('${itemId}', '${safeName}')" title="Listeden Çıkar">✕</button>
            </div>
            <div class="passenger-card-bottom">
              <span class="dagitim-status-pill">
                🏠 ${safeDagitimTime}
              </span>
              <button type="button" class="mini-wa-btn-text" onclick="openWaModal('${safeName}', '${safePhone}')" title="WhatsApp ile Yaz">
                💬 Mesaj
              </button>
            </div>
          </div>
        `;
      }).join('');
    }
  }
}

// ================= NAME SELECTOR MODAL (FOR PASSENGERS - 1 TAP ADD!) =================

function openNameSelector(dayKey, shift, type) {
  pendingTargetDay = dayKey;
  pendingTargetShift = shift;
  pendingTargetType = type;

  const modal = document.getElementById('name-modal');
  const title = document.getElementById('name-modal-title');
  const subtitle = document.getElementById('name-modal-sub');

  const now = new Date();
  const dayNameTr = dayKey === 'tomorrow'
    ? getDayNameTr(new Date(now.getTime() + 24 * 60 * 60 * 1000))
    : (dayKey === 'yesterday'
        ? getDayNameTr(new Date(now.getTime() - 24 * 60 * 60 * 1000))
        : getDayNameTr(now));

  const typeLabel = type === 'toplama' ? 'Toplama (Evden Alma)' : 'Dağıtım (İşten Eve)';

  title.innerText = `📅 ${dayNameTr} • ${shift} ${typeLabel}`;
  subtitle.innerText = 'Listeye eklenmek için isminize dokunun:';

  renderPersonnelChips();

  modal.style.display = 'flex';
  requestAnimationFrame(() => modal.classList.add('open'));
}

function closeNameSelector(e) {
  if (e && e.target !== e.currentTarget && !e.target.classList.contains('sheet-close-btn')) return;
  const modal = document.getElementById('name-modal');
  modal.classList.remove('open');
  setTimeout(() => {
    modal.style.display = 'none';
  }, 200);
}

// "Beni Hatırla" Entegrasyonlu Personel Listesi
function renderPersonnelChips() {
  const container = document.getElementById('personnel-chips-container');
  if (personnelList.length === 0) {
    container.innerHTML = '<div class="empty-state">Kayıtlı personel bulunamadı. Lütfen "Personeller" bölümünden ekleyin.</div>';
    return;
  }

  // Determine who is already added to this specific day, shift & type
  const dayGroup = rosterData[pendingTargetDay] || {};
  const shiftGroup = dayGroup[pendingTargetShift] || { toplama: [], dagitim: [] };
  const currentList = pendingTargetType === 'toplama' ? shiftGroup.toplama : shiftGroup.dagitim;

  const addedNames = new Set(currentList.map(item => item.name));

  // "Beni Hatırla": son seçilen kişi en başta çıksın
  const savedPerson = localStorage.getItem('servis_saved_person');
  let displayList = personnelList.slice();
  if (savedPerson) {
    displayList.sort((a, b) => {
      if (a.name === savedPerson) return -1;
      if (b.name === savedPerson) return 1;
      return a.name.localeCompare(b.name, 'tr');
    });
  }

  container.innerHTML = displayList.map(person => {
    const isAdded = addedNames.has(person.name);
    const isRemembered = (person.name === savedPerson);
    const chipClass = `person-chip ${isAdded ? 'already-added' : ''} ${isRemembered ? 'remembered' : ''}`;

    return `
      <button type="button" class="${chipClass}" onclick="handlePersonSelect('${escapeHtml(person.name)}')">
        ${isAdded ? '✓ ' : ''}${isRemembered ? '⭐ ' : ''}${escapeHtml(person.name)}${isRemembered ? '<span class="remember-tag">Ben</span>' : ''}
      </button>
    `;
  }).join('');
}

function handlePersonSelect(name) {
  // "Beni Hatırla": tarayıcıya kaydet
  localStorage.setItem('servis_saved_person', name);
  addToRoster(pendingTargetDay, pendingTargetShift, pendingTargetType, name);
}

// ================= DRIVER TIME ASSIGNMENT MODAL =================

function openTimeModal(id, name, shiftKey, currentTime) {
  editingPassenger = { id, name, shiftKey, currentTime };

  const modal = document.getElementById('time-modal');
  document.getElementById('time-modal-passenger-name').innerText = name;

  // Render Preset Buttons according to shift
  const presetsContainer = document.getElementById('time-presets-container');
  const customInput = document.getElementById('custom-time-input');

  let presets = [];
  let defaultTime = '';

  if (shiftKey === '07:00') {
    presets = ['05:45', '06:00', '06:15', '06:30', '06:45'];
    defaultTime = '06:00';
  } else if (shiftKey === '15:00') {
    presets = ['13:45', '14:00', '14:15', '14:30', '14:45'];
    defaultTime = '14:00';
  } else { // 23:00
    presets = ['21:45', '22:00', '22:15', '22:30', '22:45'];
    defaultTime = '22:00';
  }

  customInput.value = currentTime || defaultTime;

  presetsContainer.innerHTML = presets.map(time => `
    <button type="button" class="preset-time-btn" onclick="applyPresetTime('${time}')">${time}</button>
  `).join('');

  modal.style.display = 'flex';
  requestAnimationFrame(() => modal.classList.add('open'));
}

function closeTimeModal(e) {
  if (e && e.target !== e.currentTarget && !e.target.classList.contains('sheet-close-btn')) return;
  const modal = document.getElementById('time-modal');
  modal.classList.remove('open');
  setTimeout(() => {
    modal.style.display = 'none';
    editingPassenger = null;
  }, 200);
}

function applyPresetTime(time) {
  if (!editingPassenger) return;
  updatePickupTime(editingPassenger.id, time);
}

function saveCustomTime() {
  if (!editingPassenger) return;
  const time = document.getElementById('custom-time-input').value;
  updatePickupTime(editingPassenger.id, time);
}

function clearPickupTime() {
  if (!editingPassenger) return;
  updatePickupTime(editingPassenger.id, null);
}

// ================= 👥 PERSONNEL DIRECTORY & MANAGEMENT =================

let personnelSearchQuery = '';

function openPersonnelModal() {
  const modal = document.getElementById('personnel-modal');
  if (!modal) return;
  personnelSearchQuery = '';
  const searchInput = document.getElementById('personnel-search-input');
  if (searchInput) searchInput.value = '';
  const clearBtn = document.getElementById('search-clear-btn');
  if (clearBtn) clearBtn.style.display = 'none';

  renderManagePersonnelList();
  modal.style.display = 'flex';
  requestAnimationFrame(() => modal.classList.add('open'));
}

function closePersonnelModal(e) {
  if (e && e.target !== e.currentTarget && !e.target.classList.contains('sheet-close-btn')) return;
  const modal = document.getElementById('personnel-modal');
  if (!modal) return;
  modal.classList.remove('open');
  setTimeout(() => {
    modal.style.display = 'none';
  }, 200);
}

function filterPersonnelList() {
  const input = document.getElementById('personnel-search-input');
  personnelSearchQuery = input ? input.value : '';
  const clearBtn = document.getElementById('search-clear-btn');
  if (clearBtn) {
    clearBtn.style.display = personnelSearchQuery.trim() ? 'flex' : 'none';
  }
  renderManagePersonnelList();
}

function clearPersonnelSearch() {
  const input = document.getElementById('personnel-search-input');
  if (input) input.value = '';
  personnelSearchQuery = '';
  const clearBtn = document.getElementById('search-clear-btn');
  if (clearBtn) clearBtn.style.display = 'none';
  renderManagePersonnelList();
  if (input) input.focus();
}

function renderManagePersonnelList() {
  const container = document.getElementById('manage-personnel-list');
  if (!container) return;
  const countEl = document.getElementById('personnel-subtitle-count');

  const query = (personnelSearchQuery || '').trim();
  const queryLower = query.toLocaleLowerCase('tr-TR');
  const queryDigits = query.replace(/[^0-9]/g, '');

  const filtered = personnelList.filter(person => {
    if (!query) return true;
    const nameLower = (person.name || '').toLocaleLowerCase('tr-TR');
    const nameMatch = nameLower.includes(queryLower);
    const phoneRaw = (person.phone || '').replace(/[^0-9]/g, '');
    const phoneMatch = queryDigits.length > 0 && phoneRaw.includes(queryDigits);
    return nameMatch || phoneMatch;
  });

  if (countEl) {
    if (query) {
      countEl.innerText = `${filtered.length} / ${personnelList.length} Personel Bulundu`;
    } else {
      countEl.innerText = `${personnelList.length} Personel Kayıtlı • Hızlı Arama & WhatsApp`;
    }
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="personnel-empty-state">
        <span class="empty-icon">🔍</span>
        <p>Eşleşen personel bulunamadı</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(person => {
    const safeName = escapeHtml(person.name);
    const personId = person.id || '';
    const rawPhone = person.phone || '';
    const cleanPhone = rawPhone ? String(rawPhone).replace(/[^0-9]/g, '') : '';
    const hasPhone = !!cleanPhone;
    const phoneDisplay = hasPhone ? formatPhoneDisplay(cleanPhone) : 'Telefon eklenmemiş';
    const initial = safeName.charAt(0).toUpperCase();

    return `
      <div class="person-directory-card">
        <div class="person-dir-header">
          <div class="person-dir-main">
            <div class="person-avatar">${initial}</div>
            <div class="person-dir-info">
              <span class="person-dir-name" title="${safeName}">${safeName}</span>
              <span class="person-dir-phone ${hasPhone ? 'has-phone' : 'no-phone'}">
                ${hasPhone ? '📱 ' + phoneDisplay : '⚠️ ' + phoneDisplay}
              </span>
            </div>
          </div>
          <div class="person-dir-header-tools">
            <button type="button" class="dir-tool-btn btn-edit" onclick="openEditPersonnelModal('${personId}', '${safeName}', '${escapeHtml(rawPhone)}')" title="Düzenle">
              ✏️ Düzenle
            </button>
            <button type="button" class="dir-tool-btn btn-delete" onclick="confirmDeletePersonnel('${personId}', '${safeName}')" title="Sil">
              🗑️
            </button>
          </div>
        </div>

        <div class="person-dir-bottom-actions">
          ${hasPhone ? `
            <a href="tel:${cleanPhone}" class="dir-action-btn btn-call" title="Telefonla Ara">
              📞 <span>Hemen Ara</span>
            </a>
          ` : `
            <button type="button" class="dir-action-btn btn-call disabled" onclick="openEditPersonnelModal('${personId}', '${safeName}', '')" title="Numara Ekle">
              📞 <span>Numara Ekle</span>
            </button>
          `}
          
          <button type="button" class="dir-action-btn btn-wa" onclick="openWaModal('${safeName}', '${escapeHtml(rawPhone)}')" title="WhatsApp ile Mesaj Gönder">
            💬 <span>WhatsApp</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

async function addNewPerson() {
  const nameInput = document.getElementById('new-person-name');
  const phoneInput = document.getElementById('new-person-phone');
  const name = nameInput ? nameInput.value.trim() : '';
  const phone = phoneInput ? phoneInput.value.trim() : '';
  if (!name) {
    showToast('Lütfen personel adını girin');
    if (nameInput) nameInput.focus();
    return;
  }

  try {
    const res = await fetch('/api/personnel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone })
    });
    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || 'Eklenemedi');
      return;
    }
    if (nameInput) nameInput.value = '';
    if (phoneInput) phoneInput.value = '';
    showToast(`✅ ${name} rehbere eklendi`);
    await fetchPersonnel();
    renderManagePersonnelList();
    renderNameChips();
  } catch (err) {
    console.error(err);
    showToast('Hata oluştu');
  }
}

// Edit Personnel Modal Logic
function openEditPersonnelModal(id, name, phone) {
  const modal = document.getElementById('edit-personnel-modal');
  if (!modal) return;
  document.getElementById('edit-person-id').value = id || '';
  document.getElementById('edit-person-original-name').value = name || '';
  const nameInput = document.getElementById('edit-person-name');
  const phoneInput = document.getElementById('edit-person-phone');
  if (nameInput) nameInput.value = name || '';
  if (phoneInput) phoneInput.value = phone || '';

  modal.style.display = 'flex';
  requestAnimationFrame(() => modal.classList.add('open'));
  if (nameInput) nameInput.focus();
}

function closeEditPersonnelModal(e) {
  if (e && e.target !== e.currentTarget && !e.target.classList.contains('sheet-close-btn') && !e.target.classList.contains('edit-btn-cancel')) return;
  const modal = document.getElementById('edit-personnel-modal');
  if (!modal) return;
  modal.classList.remove('open');
  setTimeout(() => {
    modal.style.display = 'none';
  }, 200);
}

async function saveEditedPerson() {
  const id = document.getElementById('edit-person-id').value;
  const originalName = document.getElementById('edit-person-original-name').value;
  const nameInput = document.getElementById('edit-person-name');
  const phoneInput = document.getElementById('edit-person-phone');

  const newName = nameInput ? nameInput.value.trim() : '';
  const newPhone = phoneInput ? phoneInput.value.trim() : '';

  if (!newName) {
    showToast('İsim boş olamaz');
    return;
  }

  const identifier = id || originalName;
  try {
    const res = await fetch(`/api/personnel/${encodeURIComponent(identifier)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, phone: newPhone })
    });
    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || 'Güncellenemedi');
      return;
    }

    closeEditPersonnelModal();
    showToast(`✅ ${newName} güncellendi`);
    await fetchPersonnel();
    renderManagePersonnelList();
    renderNameChips();
    await fetchDayRoster(true); // in case name was changed in roster
  } catch (err) {
    console.error('Personnel update error:', err);
    showToast('Güncelleme sırasında hata oluştu');
  }
}

async function confirmDeletePersonnel(id, name) {
  if (!confirm(`"${name}" personel rehberinden kalıcı olarak silinsin mi?`)) return;
  const identifier = id || name;
  try {
    const res = await fetch(`/api/personnel/${encodeURIComponent(identifier)}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Silinemedi');
    showToast(`✅ ${name} rehberden silindi`);
    await fetchPersonnel();
    renderManagePersonnelList();
    renderNameChips();
  } catch (err) {
    console.error(err);
    showToast('Silinemedi');
  }
}

// ================= 💬 WHATSAPP MODAL & FAST CONTACT =================

let currentWaTarget = { name: '', phone: '' };

function openWaModal(name, phone) {
  if (!phone || phone === 'null' || phone === 'undefined') {
    const p = personnelList.find(x => x.name === name);
    phone = p ? p.phone : '';
  }

  currentWaTarget = { name, phone: phone || '' };

  const modal = document.getElementById('wa-modal');
  const nameEl = document.getElementById('wa-modal-name');
  const phoneEl = document.getElementById('wa-modal-phone');

  nameEl.innerText = name;
  if (phone) {
    phoneEl.innerText = `📱 ${formatPhoneDisplay(phone)}`;
    phoneEl.style.color = '#25d366';
  } else {
    phoneEl.innerText = '⚠️ Telefon numarası girilmemiş';
    phoneEl.style.color = '#ef4444';
  }

  modal.style.display = 'flex';
  requestAnimationFrame(() => modal.classList.add('open'));
}

function closeWaModal(e) {
  if (e && e.target !== e.currentTarget && !e.target.classList.contains('sheet-close-btn')) return;
  const modal = document.getElementById('wa-modal');
  modal.classList.remove('open');
  setTimeout(() => {
    modal.style.display = 'none';
  }, 200);
}

function sendWaPreset(presetMessage) {
  if (!currentWaTarget.phone) {
    promptEditPhone(presetMessage);
    return;
  }

  const cleanPhone = currentWaTarget.phone.replace(/[^0-9]/g, '');
  let fullPhone = cleanPhone;
  if (fullPhone.startsWith('0')) fullPhone = '90' + fullPhone.slice(1);
  if (!fullPhone.startsWith('90')) fullPhone = '90' + fullPhone;

  let url = `https://wa.me/${fullPhone}`;
  if (presetMessage) {
    url += `?text=${encodeURIComponent(presetMessage)}`;
  }

  window.open(url, '_blank');
  closeWaModal();
}

async function promptEditPhone(pendingMessage = null) {
  const current = currentWaTarget.phone || '';
  const input = prompt(`${currentWaTarget.name} için telefon numarası girin (örn: 05xxxxxxxxx):`, current);
  if (input === null) return;

  const clean = input.replace(/[^0-9]/g, '');
  if (!clean || clean.length < 10) {
    showToast('Geçerli bir telefon numarası girin (en az 10 hane)');
    return;
  }

  await savePhoneForPerson(currentWaTarget.name, clean);
  currentWaTarget.phone = clean;
  openWaModal(currentWaTarget.name, clean);

  if (pendingMessage !== null) {
    sendWaPreset(pendingMessage);
  }
}

async function promptEditPhoneForPerson(name, currentPhone) {
  const input = prompt(`${name} için telefon numarası girin (örn: 05xxxxxxxxx):`, currentPhone || '');
  if (input === null) return;
  const clean = input.replace(/[^0-9]/g, '');
  await savePhoneForPerson(name, clean);
  renderManagePersonnelList();
}

async function savePhoneForPerson(name, phone) {
  try {
    const res = await fetch(`/api/personnel/${encodeURIComponent(name)}/phone`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Kaydedilemedi');

    const p = personnelList.find(x => x.name === name);
    if (p) p.phone = phone;

    showToast(`✅ ${name} telefonu kaydedildi`);
    await fetchDayRoster(true);
  } catch (err) {
    console.error(err);
    showToast('Telefon kaydedilemedi');
  }
}

function formatPhoneDisplay(num) {
  if (!num) return '';
  const s = String(num).replace(/[^0-9]/g, '');
  if (s.length === 11 && s.startsWith('0')) {
    return `${s.slice(0, 4)} ${s.slice(4, 7)} ${s.slice(7, 9)} ${s.slice(9, 11)}`;
  }
  if (s.length === 10) {
    return `0${s.slice(0, 3)} ${s.slice(3, 6)} ${s.slice(6, 8)} ${s.slice(8, 10)}`;
  }
  return s;
}

// ================= 📲 PWA INSTALL & OFFLINE LOGIC =================

let deferredPrompt = null;
let pwaPromptResolvers = [];

function initPwa() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.log('SW register fail:', err);
    });
  }

  // Hide banner if already installed or standalone mode
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const isDismissed = localStorage.getItem('servis_pwa_dismissed') === 'true';

  const banner = document.getElementById('pwa-banner');
  if (banner) {
    if (isStandalone || isDismissed) {
      banner.style.display = 'none';
    } else {
      banner.style.display = 'flex';
    }
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('[PWA] beforeinstallprompt captured, ready for direct install.');

    // If user clicked Ekle while beforeinstallprompt was initializing
    while (pwaPromptResolvers.length > 0) {
      const resolver = pwaPromptResolvers.shift();
      resolver(e);
    }

    if (banner && !isStandalone && !isDismissed) {
      banner.style.display = 'flex';
    }
  });

  window.addEventListener('appinstalled', () => {
    console.log('[PWA] Application successfully installed.');
    deferredPrompt = null;
    dismissPwaBanner();
    showToast('✅ Telekom Servis ana ekranınıza eklendi!');
  });
}

async function triggerPwaInstall() {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if (isStandalone) {
    showToast('✅ Telekom Servis zaten telefonunuzda yüklü!');
    dismissPwaBanner();
    return;
  }

  // 1. If native prompt is immediately available (Android Chrome, Edge, Chromium)
  if (deferredPrompt) {
    try {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult && choiceResult.outcome === 'accepted') {
        showToast('✅ Ana ekrana ekleniyor...');
        dismissPwaBanner();
      }
      deferredPrompt = null;
    } catch (err) {
      console.warn('[PWA] Direct prompt error:', err);
      openPwaGuideModal();
    }
    return;
  }

  // 2. Check if user is in an In-App browser (like WhatsApp, Instagram, Facebook)
  const ua = navigator.userAgent || '';
  const isWhatsApp = /WhatsApp/i.test(ua);
  const isInstagram = /Instagram/i.test(ua);
  const isFb = /FB_IAB|FBAV/i.test(ua);
  if (isWhatsApp || isInstagram || isFb) {
    showToast('⚠️ WhatsApp içi tarayıcıdasınız. Sağ üstten (⋮) "Chrome ile aç" yapınız.');
    openPwaGuideModal();
    return;
  }

  // 3. Check if iOS Safari (Apple blocks beforeinstallprompt by design)
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  if (isIOS) {
    openPwaGuideModal();
    return;
  }

  // 4. On Android / Desktop Chrome, if beforeinstallprompt is taking a split second to fire
  showToast('📲 Kurulum penceresi açılıyor...');
  const promptEvent = await new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), 1400);
    pwaPromptResolvers.push((e) => {
      clearTimeout(timer);
      resolve(e);
    });
  });

  if (promptEvent) {
    try {
      promptEvent.prompt();
      const choiceResult = await promptEvent.userChoice;
      if (choiceResult && choiceResult.outcome === 'accepted') {
        showToast('✅ Ana ekrana ekleniyor...');
        dismissPwaBanner();
      }
      deferredPrompt = null;
    } catch (err) {
      console.warn('[PWA] Async prompt error:', err);
      openPwaGuideModal();
    }
  } else {
    // Fallback if browser doesn't support programmatic prompt
    openPwaGuideModal();
  }
}

function dismissPwaBanner() {
  const banner = document.getElementById('pwa-banner');
  if (banner) banner.style.display = 'none';
  localStorage.setItem('servis_pwa_dismissed', 'true');
}

function openPwaGuideModal() {
  const modal = document.getElementById('pwa-guide-modal');
  if (!modal) return;
  modal.style.display = 'flex';
  modal.classList.add('open');
}

function closePwaGuideModal(e) {
  if (e && e.target !== e.currentTarget && !e.target.classList.contains('sheet-close-btn') && !e.target.classList.contains('btn-block')) return;
  const modal = document.getElementById('pwa-guide-modal');
  if (!modal) return;
  modal.classList.remove('open');
  setTimeout(() => {
    modal.style.display = 'none';
  }, 200);
}

// ================= WHATSAPP SHARE / COPY =================

function copyWhatsAppList() {
  const todayLabel = document.getElementById('today-date-label').innerText;
  const tomorrowLabel = document.getElementById('tomorrow-date-label').innerText;

  let text = `🚌 *SERVİS LİSTESİ*\n`;

  function appendShiftBlock(shiftTitle, toplamaTitle, toplamaList, dagitimTitle, dagitimList) {
    text += `\n⏰ *${shiftTitle}*\n`;

    text += `🟢 *${toplamaTitle} (${(toplamaList || []).length} Kişi):*\n`;
    if (!toplamaList || toplamaList.length === 0) {
      text += `  _(Yok)_\n`;
    } else {
      const sortedToplama = toplamaList.slice().sort((a, b) => {
        const tA = a.pickup_time ? a.pickup_time.trim() : null;
        const tB = b.pickup_time ? b.pickup_time.trim() : null;
        if (tA && tB) return tA.localeCompare(tB);
        if (tA && !tB) return -1;
        if (!tA && tB) return 1;
        return Number(a.id) - Number(b.id);
      });

      sortedToplama.forEach((item, i) => {
        const time = item.pickup_time ? ` [${item.pickup_time}]` : ' [--:--]';
        text += `  ${i + 1}. ${item.name}${time}\n`;
      });
    }

    text += `🟡 *${dagitimTitle} (${(dagitimList || []).length} Kişi):*\n`;
    if (!dagitimList || dagitimList.length === 0) {
      text += `  _(Yok)_\n`;
    } else {
      dagitimList.forEach((item, i) => {
        text += `  ${i + 1}. ${item.name}\n`;
      });
    }
  }

  // Yesterday Night Shift (if still ongoing < 08:00 or has passengers or showHistory)
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const todayDay = getDayNameTr(now);
  const tomorrowDay = getDayNameTr(tomorrow);
  const yesterdayDay = getDayNameTr(yesterday);
  const todayDateStr = formatDateWithDashTr(now);
  const tomorrowDateStr = formatDateWithDashTr(tomorrow);
  const yesterdayDateStr = formatDateWithDashTr(yesterday);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const isPastYesterday2300 = currentMinutes >= 480;
  const yestToplama = rosterData.yesterday?.['23:00']?.toplama || [];
  const yestDagitim = rosterData.today?.['07:00']?.dagitim || [];

  if (!isPastYesterday2300 || showHistory || yestToplama.length > 0 || yestDagitim.length > 0) {
    text += `\n📅 *${yesterdayDay.toUpperCase()} (${yesterdayDateStr})*`;
    appendShiftBlock(
      '23:00 Gece Vardiyası',
      `23:00 Toplama (${yesterdayDay})`,
      yestToplama,
      `07:00 Dağıtım (${todayDay})`,
      yestDagitim
    );
    text += `\n━━━━━━━━━━━━━━━━━━━━`;
  }

  // Today Active Shifts
  text += `\n📅 *${todayDay.toUpperCase()} (${todayDateStr})*`;
  appendShiftBlock(
    '07:00 Sabah Vardiyası',
    '07:00 Toplama',
    rosterData.today?.['07:00']?.toplama || [],
    '15:00 Dağıtım',
    rosterData.today?.['15:00']?.dagitim || []
  );
  appendShiftBlock(
    '15:00 Öğlen Vardiyası',
    '15:00 Toplama',
    rosterData.today?.['15:00']?.toplama || [],
    '23:00 Dağıtım',
    rosterData.today?.['23:00']?.dagitim || []
  );
  appendShiftBlock(
    '23:00 Gece Vardiyası',
    `23:00 Toplama (${todayDay})`,
    rosterData.today?.['23:00']?.toplama || [],
    `07:00 Dağıtım (${tomorrowDay})`,
    rosterData.tomorrow?.['07:00']?.dagitim || []
  );

  // Tomorrow Shifts (Only Sabah Vardiyası: 07:00 Toplama - 15:00 Dağıtım)
  text += `\n━━━━━━━━━━━━━━━━━━━━\n📅 *${tomorrowDay.toUpperCase()} (${tomorrowDateStr})*`;
  appendShiftBlock(
    '07:00 Sabah Vardiyası',
    '07:00 Toplama',
    rosterData.tomorrow?.['07:00']?.toplama || [],
    '15:00 Dağıtım',
    rosterData.tomorrow?.['15:00']?.dagitim || []
  );

  // Copy to clipboard
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('📋 Servis listesi WhatsApp formatında kopyalandı!');
    }).catch(() => {
      fallbackCopyText(text);
    });
  } else {
    fallbackCopyText(text);
  }
}

function fallbackCopyText(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  showToast('📋 Servis listesi WhatsApp formatında kopyalandı!');
}

// ================= UTILITIES =================

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.innerText = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}

function setLiveIndicator(isOnline) {
  const el = document.getElementById('live-indicator');
  if (isOnline) {
    el.style.display = 'inline-flex';
  } else {
    el.innerHTML = '<span style="color: #ef4444;">● Çevrimdışı</span>';
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
