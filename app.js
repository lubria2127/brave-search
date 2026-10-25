const BADGES = [
    { days: 365, title: "Absolute Giga Chad", icon: "🗿" },
    { days: 120, title: "Giga Chad", icon: "🗿" },
    { days: 60, title: "Absolute Chad", icon: "🦾" },
    { days: 30, title: "Chad", icon: "🗿" },
    { days: 15, title: "Sigma", icon: "😎" },
    { days: 7, title: "Average", icon: "😐" },
    { days: 3, title: "Novice", icon: "🙂" },
    { days: 1, title: "Noob", icon: "🫠" },
    { days: 0, title: "Clown", icon: "🤡" }
];

const daysCountEl = document.getElementById("daysCount");
const timeDetailEl = document.getElementById("timeDetail");
const badgeTitleEl = document.getElementById("badgeTitle");
const badgeAvatarEl = document.getElementById("badgeAvatar");
const actionBtn = document.getElementById("actionBtn");

const menuBtn = document.getElementById("menuBtn");
const dropdownMenu = document.getElementById("dropdownMenu");
const menuAllBadges = document.getElementById("menuAllBadges");
const menuMyBadges = document.getElementById("menuMyBadges");

const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");

const startModal = document.getElementById("startModal");
const btnNow = document.getElementById("btnNow");
const btnOldDate = document.getElementById("btnOldDate");

const relapseModal = document.getElementById("relapseModal");
const cancelRelapse = document.getElementById("cancelRelapse");
const submitRelapse = document.getElementById("submitRelapse");
const relapseReason = document.getElementById("relapseReason");

let startTime = localStorage.getItem("nofap_start_time");
let isRunning = localStorage.getItem("nofap_is_running") === "true";

// Perbarui Tampilan Tombol & UI Berdasarkan Status
function updateUIState() {
    if (!isRunning || !startTime) {
        // Belum diputar (Foto 1)
        actionBtn.className = "floating-btn play-mode";
        actionBtn.innerHTML = "▶";
        daysCountEl.textContent = "0";
        timeDetailEl.textContent = "00:00:00";
        badgeTitleEl.textContent = "Clown";
        badgeAvatarEl.innerHTML = "🤡";
    } else {
        // Sedang berjalan (Foto 3)
        actionBtn.className = "floating-btn clown-mode";
        actionBtn.innerHTML = "🤡"; // Atau gunakan tag img jika punya aset gambar badut
        updateTimer();
    }
}

// Toggle Menu Kanan Atas
menuBtn.addEventListener("click", () => dropdownMenu.classList.toggle("hidden"));
window.addEventListener("click", (e) => {
    if (!menuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownMenu.classList.add("hidden");
    }
});

// Aksi Tombol Kanan Bawah
actionBtn.addEventListener("click", () => {
    if (!isRunning) {
        // Jika belum jalan, tampilkan pop-up "Start timer from?" (Foto 2)
        startModal.classList.remove("hidden");
    } else {
        // Jika sedang jalan, klik tombol badut membuka pop-up alasan relapse
        relapseReason.value = "";
        relapseModal.classList.remove("hidden");
    }
});

// Pilihan "Now" pada Start Timer
btnNow.addEventListener("click", () => {
    startTime = new Date().getTime();
    isRunning = true;
    localStorage.setItem("nofap_start_time", startTime);
    localStorage.setItem("nofap_is_running", "true");
    startModal.classList.add("hidden");
    updateUIState();
});

// Pilihan "Old date" (Manual input hari)
btnOldDate.addEventListener("click", () => {
    startModal.classList.add("hidden");
    const inputDays = prompt("Masukkan jumlah hari yang sudah dilewati:");
    if (inputDays !== null && !isNaN(inputDays) && inputDays.trim() !== "") {
        const daysInMs = parseFloat(inputDays) * 24 * 60 * 60 * 1000;
        startTime = new Date().getTime() - daysInMs;
        isRunning = true;
        localStorage.setItem("nofap_start_time", startTime);
        localStorage.setItem("nofap_is_running", "true");
        updateUIState();
    }
});

// Batal Relapse
cancelRelapse.addEventListener("click", () => relapseModal.classList.add("hidden"));

// Submit Reset / Relapse
submitRelapse.addEventListener("click", () => {
    const reason = relapseReason.value.trim() || "Tanpa alasan";
    
    // Hitung pencapaian sebelum reset untuk disimpan ke history
    const now = new Date().getTime();
    const diff = now - parseInt(startTime);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    saveHistory(days, reason);

    // Reset status kembali ke awal (Foto 1)
    startTime = null;
    isRunning = false;
    localStorage.removeItem("nofap_start_time");
    localStorage.setItem("nofap_is_running", "false");

    relapseModal.classList.add("hidden");
    updateUIState();
});

// Simpan History (Maksimal 10 terakhir)
function saveHistory(days, reason) {
    let history = JSON.parse(localStorage.getItem("nofap_history")) || [];
    const newRecord = {
        date: new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' }),
        duration: `${days} Hari`,
        reason: reason
    };
    history.unshift(newRecord);
    if (history.length > 10) history.pop();
    localStorage.setItem("nofap_history", JSON.stringify(history));
}

// Fungsi Hitung Waktu Realtime
function updateTimer() {
    if (!isRunning || !startTime) return;

    const now = new Date().getTime();
    const diff = now - parseInt(startTime);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const formatTwoDigits = (num) => String(num).padStart(2, '0');

    daysCountEl.textContent = days;
    timeDetailEl.textContent = `${formatTwoDigits(hours)}:${formatTwoDigits(minutes)}:${formatTwoDigits(seconds)}`;

    const currentBadge = BADGES.find(b => days >= b.days) || BADGES[BADGES.length - 1];
    badgeTitleEl.textContent = currentBadge.title;
    badgeAvatarEl.innerHTML = currentBadge.icon;
}

// Modal Menu: All Badges
menuAllBadges.addEventListener("click", () => {
    dropdownMenu.classList.add("hidden");
    modalTitle.textContent = "All Badges";
    modalBody.innerHTML = BADGES.slice().reverse().map(b => `
        <div class="list-item">
            <span>${b.icon} <strong>${b.title}</strong></span>
            <span style="color: #aaa;">${b.days}+ Hari</span>
        </div>
    `).join('');
    modal.classList.remove("hidden");
});

// Modal Menu: My Badges (History 10 Terakhir)
menuMyBadges.addEventListener("click", () => {
    dropdownMenu.classList.add("hidden");
    modalTitle.textContent = "My Badges (10 History Terakhir)";
    const history = JSON.parse(localStorage.getItem("nofap_history")) || [];
    
    if (history.length === 0) {
        modalBody.innerHTML = `<p style="color: #888; text-align: center; padding: 20px;">Belum ada riwayat tercatat.</p>`;
    } else {
        modalBody.innerHTML = history.map((h, index) => `
            <div class="list-item" style="flex-direction: column; gap: 4px;">
                <div style="display: flex; justify-content: space-between;">
                    <span>#${index + 1} - ${h.date}</span>
                    <strong style="color: #00e676;">${h.duration}</strong>
                </div>
                <small style="color: #bbb;">Catatan: ${h.reason}</small>
            </div>
        `).join('');
    }
    modal.classList.remove("hidden");
});

closeModal.addEventListener("click", () => modal.classList.add("hidden"));
window.addEventListener("click", (e) => { if (e.target === modal) modal.classList.add("hidden"); });

// Jalankan interval
setInterval(updateTimer, 1000);
updateUIState();