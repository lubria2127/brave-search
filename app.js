// Konfigurasi Badge (Properti 'img' berisi tautan foto online sementara)
const BADGES = [
    { days: 365, title: "SUHU!!", img: "assets/Foto9.jpeg" },
    { days: 120, title: "Legenda", img: "assets/Foto8.jpeg" },
    { days: 60, title: "Pejuang Tangguh", img: "assets/Foto7.jpeg" },
    { days: 30, title: "Jagoan Aing!", img: "assets/Foto6.jpeg" },
    { days: 15, title: "Keren Euy", img: "assets/Foto5.jpeg" },
    { days: 7, title: "Lumayan Kokoh", img: "assets/Foto4.jpeg" },
    { days: 3, title: "Lumayan", img: "assets/Foto3.jpeg" },
    { days: 1, title: "Noob", img: "assets/Foto2.jpeg" },
    { days: 0, title: "Badut", img: "assets/Foto1.jpeg"}
];

const daysCountEl = document.getElementById("daysCount");
const timeDetailEl = document.getElementById("timeDetail");
const badgeTitleEl = document.getElementById("badgeTitle");
const badgeAvatarEl = document.getElementById("badgeAvatar");
const actionBtn = document.getElementById("actionBtn");
const progressRingFill = document.getElementById("progressRingFill");
const bgMusic = document.getElementById("bgMusic");

const menuBtn = document.getElementById("menuBtn");
const sideMenu = document.getElementById("sideMenu");
const menuOverlay = document.getElementById("menuOverlay");
const closeSideMenu = document.getElementById("closeSideMenu");
const sideBadgesContainer = document.getElementById("sideBadgesContainer");
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

// Coba putar musik otomatis saat halaman dimuat (Beberapa browser memerlukan interaksi pertama)
window.addEventListener("load", () => {
    bgMusic.play().catch(() => {
        // Jika dicegah browser, musik akan otomatis menyala saat pengguna melakukan klik pertama di layar
        document.body.addEventListener("click", () => {
            bgMusic.play();
        }, { once: true });
    });
});

// Render daftar All Badges di sidebar menggunakan gambar
function renderSideBadges() {
    sideBadgesContainer.innerHTML = BADGES.slice().reverse().map(b => `
        <div class="badge-item-row">
            <img src="${b.img}" class="badge-thumb" alt="Badge">
            <div style="flex: 1; display: flex; justify-content: space-between; align-items: center;">
                <strong style="font-size: 13px;">${b.title}</strong>
                <span style="color: #00e676; font-size: 12px; font-weight: bold;">${b.days}+ Hari</span>
            </div>
        </div>
    `).join('');
}
renderSideBadges();

// Perbarui Tampilan Tombol & UI Berdasarkan Status
function updateUIState() {
    if (!isRunning || !startTime) {
        actionBtn.className = "floating-btn play-mode";
        actionBtn.innerHTML = "▶";
        daysCountEl.textContent = "0";
        timeDetailEl.textContent = "00:00:00";
        badgeTitleEl.textContent = "Mulai";
        badgeAvatarEl.innerHTML = `<img src="${BADGES[BADGES.length - 1].img}" alt="Clown">`;
        progressRingFill.style.strokeDashoffset = 628;
    } else {
        actionBtn.className = "floating-btn clown-mode";
        // Tombol berubah jadi gambar badut saat timer berjalan
        actionBtn.innerHTML = `🤡`;
        updateTimer();
    }
}

// Buka/Tutup Sidebar Menu dari Kanan
function toggleMenu(open) {
    if (open) {
        sideMenu.classList.add("open");
        menuOverlay.classList.remove("hidden");
    } else {
        sideMenu.classList.remove("open");
        menuOverlay.classList.add("hidden");
    }
}

menuBtn.addEventListener("click", () => toggleMenu(true));
closeSideMenu.addEventListener("click", () => toggleMenu(false));
menuOverlay.addEventListener("click", () => toggleMenu(false));

// Aksi Tombol Kanan Bawah
actionBtn.addEventListener("click", () => {
    if (!isRunning) {
        startModal.classList.remove("hidden");
    } else {
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
    
    const now = new Date().getTime();
    const diff = now - parseInt(startTime);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    saveHistory(days, reason);

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

// Fungsi Hitung Waktu Realtime & Progress Lingkaran 1 Hari
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

    // Kalkulasi Progress Lingkaran: 1 Putaran Penuh = 1 Hari (24 Jam)
    const oneDayMs = 24 * 60 * 60 * 1000;
    const currentDayMs = diff % oneDayMs;
    const progressPercent = currentDayMs / oneDayMs;
    
    const circumference = 628;
    const strokeOffset = circumference - (progressPercent * circumference);
    progressRingFill.style.strokeDashoffset = strokeOffset;

    // Update Badge & Foto Berdasarkan Level Hari
    const currentBadge = BADGES.find(b => days >= b.days) || BADGES[BADGES.length - 1];
    badgeTitleEl.textContent = currentBadge.title;
    badgeAvatarEl.innerHTML = `<img src="${currentBadge.img}" alt="${currentBadge.title}">`;
}

// Tombol My Badges di dalam Sidebar
menuMyBadges.addEventListener("click", () => {
    toggleMenu(false);
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