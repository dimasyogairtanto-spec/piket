// ==================== KONFIGURASI ====================
const CONFIG = {
    tahun: 2026,
    bulan: 9, // September
    jumlahHari: 30,

    piketPerHari: 1,

    // Jumat = 2 orang nginap
    nginapJumat: 2,

    // Sabtu = 2 orang nginap
    nginapSabtu: 2,

    // Minggu = 1 orang nginap + 1 orang piket
    nginapMinggu: 1,

    daftarNama: [
        "Haydar",
        "Baihaqi",
        "Gibran",
        "Rafly",
        "Roket",
        "Lutfi",
        "Kausar",
        "Hakim",
        "Iksan",
        "Fras",
        "Dimas",
        "Sultan",
        "Agoy",
        "Mirja",
        "Ridho"
    ]
};


// ==================== 8 ORANG KHUSUS NGINEP ====================
const KHUSUS_NGINAP = [
    "Haydar",
    "Baihaqi",
    "Gibran",
    "Rafly",
    "Roket",
    "Lutfi",
    "Kausar",
    "Hakim"
];


// ==================== NAMA HARI ====================
const NAMA_HARI = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu"
];


// ==================== NAMA BULAN ====================
const NAMA_BULAN = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des"
];


let schedule = [];


// ======================================================
// GENERATE JADWAL
// ======================================================
function generateSchedule() {

    const stats = CONFIG.daftarNama.map(name => ({
        name: name,
        piketCount: 0,
        nginapCount: 0,
        total: 0,

        // Jika true, orang tidak boleh piket Senin-Kamis
        liburSetelahNginap: false
    }));


    schedule = [];


    for (let day = 1; day <= CONFIG.jumlahHari; day++) {

        const tanggal = new Date(
            CONFIG.tahun,
            CONFIG.bulan - 1,
            day
        );

        const hari = tanggal.getDay();

        const dayData = {
            day: day,
            namaHari: NAMA_HARI[hari],
            tanggalStr:
                `${day} ${NAMA_BULAN[tanggal.getMonth()]} ${CONFIG.tahun}`,
            piket: [],
            nginap: []
        };


        // Orang yang sudah dapat tugas hari ini
        const assignedToday = new Set();


        // ==================================================
        // JUMAT
        // 2 ORANG NGINEP
        // ==================================================
        if (hari === 5) {

            assignNginap(
                CONFIG.nginapJumat,
                stats,
                assignedToday,
                dayData
            );
        }


        // ==================================================
        // SABTU
        // 2 ORANG NGINEP
        // ==================================================
        else if (hari === 6) {

            assignNginap(
                CONFIG.nginapSabtu,
                stats,
                assignedToday,
                dayData
            );
        }


        // ==================================================
        // MINGGU
        // 1 ORANG NGINEP
        // 1 ORANG PIKET
        // ==================================================
        else if (hari === 0) {

            assignNginap(
                CONFIG.nginapMinggu,
                stats,
                assignedToday,
                dayData
            );

            assignPiket(
                1,
                stats,
                assignedToday,
                dayData,
                false
            );
        }


        // ==================================================
        // SENIN - KAMIS
        // PIKET
        // ==================================================
        else {

            assignPiket(
                CONFIG.piketPerHari,
                stats,
                assignedToday,
                dayData,
                true
            );
        }


        schedule.push(dayData);
    }


    renderCalendar();
}



// ======================================================
// ASSIGN NGINEP
// ======================================================
function assignNginap(
    jumlah,
    stats,
    assignedToday,
    dayData
) {

    for (let i = 0; i < jumlah; i++) {

        let candidates = stats.filter(person => {

            // Harus termasuk 8 orang khusus
            const khusus = KHUSUS_NGINAP.some(
                nama =>
                    nama.toLowerCase() ===
                    person.name.toLowerCase()
            );

            if (!khusus) {
                return false;
            }


            // Tidak boleh dapat 2 tugas di hari yang sama
            if (assignedToday.has(person.name)) {
                return false;
            }


            return true;
        });


        // Prioritaskan yang jumlah nginep-nya paling sedikit
        candidates.sort((a, b) => {

            if (a.nginapCount !== b.nginapCount) {
                return a.nginapCount - b.nginapCount;
            }

            return a.total - b.total;
        });


        const selected = candidates[0];


        if (!selected) {
            console.warn(
                "Tidak ada kandidat nginap untuk hari:",
                dayData.namaHari,
                dayData.tanggalStr
            );

            continue;
        }


        // Masukkan ke jadwal nginap
        dayData.nginap.push(selected.name);

        assignedToday.add(selected.name);

        selected.nginapCount++;
        selected.total++;


        // ==================================================
        // PENTING
        //
        // Orang yang nginep Jumat/Sabtu/Minggu
        // otomatis tidak boleh piket Senin-Kamis.
        // ==================================================
        selected.liburSetelahNginap = true;
    }
}



// ======================================================
// ASSIGN PIKET
// ======================================================
function assignPiket(
    jumlah,
    stats,
    assignedToday,
    dayData,
    cekLiburWeekend
) {

    for (let i = 0; i < jumlah; i++) {

        let candidates = stats.filter(person => {

            // Jangan kasih 2 tugas di hari yang sama
            if (assignedToday.has(person.name)) {
                return false;
            }


            // ==================================================
            // SENIN-KAMIS
            //
            // Orang yang sudah nginep weekend tidak boleh piket.
            // ==================================================
            if (
                cekLiburWeekend &&
                person.liburSetelahNginap
            ) {
                return false;
            }


            return true;
        });


        // Prioritas yang jumlah piket paling sedikit
        candidates.sort((a, b) => {

            if (a.piketCount !== b.piketCount) {
                return a.piketCount - b.piketCount;
            }

            return a.total - b.total;
        });


        const selected = candidates[0];


        if (!selected) {

            console.warn(
                "Tidak ada kandidat piket untuk:",
                dayData.namaHari,
                dayData.tanggalStr
            );

            continue;
        }


        dayData.piket.push(selected.name);

        assignedToday.add(selected.name);

        selected.piketCount++;
        selected.total++;
    }
}



// ======================================================
// RENDER CALENDAR
// ======================================================
function renderCalendar() {

    const calendar = document.getElementById("calendar");


    if (!calendar) {
        console.error(
            'Element dengan id="calendar" tidak ditemukan!'
        );

        return;
    }


    calendar.innerHTML = "";


    schedule.forEach(dayData => {

        const dayCard = document.createElement("div");

        dayCard.className = "day-card";


        // ==================================================
        // HEADER HARI
        // ==================================================
        let html = `
            <div class="day-header">
                <div class="day-name">
                    ${dayData.namaHari}
                </div>

                <div class="day-date">
                    ${dayData.tanggalStr}
                </div>
            </div>
        `;


        // ==================================================
        // PIKET
        // ==================================================
        if (dayData.piket.length > 0) {

            html += `
                <div class="slot-group">

                    <div class="slot-title piket">
                        Piket
                    </div>

                    ${dayData.piket.map(name => `
                        <div class="duty-tag piket">
                            ${name}
                        </div>
                    `).join("")}

                </div>
            `;
        }


        // ==================================================
        // NGINEP
        // ==================================================
        if (dayData.nginap.length > 0) {

            html += `
                <div class="slot-group">

                    <div class="slot-title nginap">
                        Nginap
                    </div>

                    ${dayData.nginap.map(name => `
                        <div class="duty-tag nginap">
                            ${name}
                        </div>
                    `).join("")}

                </div>
            `;
        }


        dayCard.innerHTML = html;

        calendar.appendChild(dayCard);
    });
}



// ======================================================
// JALANKAN SAAT HALAMAN SELESAI LOAD
// ======================================================
document.addEventListener("DOMContentLoaded", function () {

    console.log("Sistem jadwal dimulai...");

    generateSchedule();

});
