```javascript
// ==================== KONFIGURASI JADWAL ====================
const CONFIG = {
    tahun: 2026,
    bulan: 9, // Bulan 1-12 (9 = September)
    jumlahHari: 30,

    piketPerHari: 1,

    // Jumlah orang yang nginep
    nginapJumat: 2,
    nginapSabtu: 2,
    nginapMinggu: 1,

    daftarNama: [
        "Haydar", "Baihaqi", "Gibran", "Rafly", "Roket",
        "Lutfi", "Kausar", "Hakim", "Iksan", "Fras",
        "Dimas", "Sultan", "Agoy", "Mirja", "Ridho"
    ]
};


// ==================== 8 ORANG KHUSUS NGINEP ====================
const KHUSUS_NGINAP = [
    'Haydar',
    'Baihaqi',
    'Gibran',
    'Rafly',
    'Roket',
    'Lutfi',
    'Kausar',
    'Hakim'
];


// ==================== HELPER ====================
const NAMA_HARI = [
    'Minggu',
    'Senin',
    'Selasa',
    'Rabu',
    'Kamis',
    'Jumat',
    'Sabtu'
];

const NAMA_BULAN = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Agu',
    'Sep',
    'Okt',
    'Nov',
    'Des'
];


let schedule = [];
let members = CONFIG.daftarNama;


// ============================================================
// GENERATE JADWAL
// ============================================================
function generateSchedule() {

    const totalHari = CONFIG.jumlahHari;
    const tahun = CONFIG.tahun;
    const bulan = CONFIG.bulan - 1;

    // Statistik setiap anggota
    let stats = members.map(name => ({
        name,
        piketCount: 0,
        nginapCount: 0,
        total: 0,
        lastDutyDay: -2,

        // Menyimpan sampai hari apa orang ini diblokir
        // dari jadwal Senin-Kamis setelah nginep weekend
        blockedUntil: -1
    }));


    schedule = [];


    // ========================================================
    // LOOP SETIAP HARI
    // ========================================================
    for (let day = 1; day <= totalHari; day++) {

        const currentDate = new Date(tahun, bulan, day);

        const dayOfWeek = currentDate.getDay();

        const namaHari = NAMA_HARI[dayOfWeek];

        const tanggalStr =
            `${currentDate.getDate()} ${NAMA_BULAN[currentDate.getMonth()]} ${currentDate.getFullYear()}`;


        let dayDuty = {
            day,
            namaHari,
            tanggalStr,
            piket: [],
            nginap: []
        };


        // Orang yang sudah mendapatkan tugas hari ini
        let assignedToday = new Set();


        // ========================================================
        // JUMAT = 2 ORANG NGINEP
        // ========================================================
        if (dayOfWeek === 5) {

            assignNginap(
                CONFIG.nginapJumat,
                day,
                stats,
                assignedToday,
                dayDuty
            );
        }


        // ========================================================
        // SABTU = 2 ORANG NGINEP
        // ========================================================
        else if (dayOfWeek === 6) {

            assignNginap(
                CONFIG.nginapSabtu,
                day,
                stats,
                assignedToday,
                dayDuty
            );
        }


        // ========================================================
        // MINGGU = 1 NGINEP + 1 PIKET
        // ========================================================
        else if (dayOfWeek === 0) {

            // ----------------------------
            // 1. Assign 1 orang NGINEP
            // ----------------------------
            assignNginap(
                CONFIG.nginapMinggu,
                day,
                stats,
                assignedToday,
                dayDuty
            );


            // ----------------------------
            // 2. Assign 1 orang PIKET
            // ----------------------------
            assignPiket(
                CONFIG.piketPerHari,
                day,
                stats,
                assignedToday,
                dayDuty
            );
        }


        // ========================================================
        // SENIN - KAMIS = PIKET
        // ========================================================
        else {

            assignPiket(
                CONFIG.piketPerHari,
                day,
                stats,
                assignedToday,
                dayDuty
            );
        }


        schedule.push(dayDuty);
    }


    renderCalendar();
}



// ============================================================
// ASSIGN NGINEP
// ============================================================
function assignNginap(
    jumlah,
    day,
    stats,
    assignedToday,
    dayDuty
) {

    for (let i = 0; i < jumlah; i++) {

        let candidates = stats.filter(m =>
            !assignedToday.has(m.name) &&
            KHUSUS_NGINAP.some(
                kn => kn.toLowerCase() === m.name.toLowerCase()
            )
        );


        // Prioritas:
        // 1. Yang paling sedikit jumlah nginep
        // 2. Yang paling sedikit total tugas
        // 3. Yang terakhir bertugas paling lama
        candidates.sort((a, b) => {

            if (a.nginapCount !== b.nginapCount) {
                return a.nginapCount - b.nginapCount;
            }

            if (a.total !== b.total) {
                return a.total - b.total;
            }

            return a.lastDutyDay - b.lastDutyDay;
        });


        let selected = candidates[0];


        if (selected) {

            dayDuty.nginap.push(selected.name);

            assignedToday.add(selected.name);

            selected.nginapCount++;
            selected.total++;
            selected.lastDutyDay = day;


            // ====================================================
            // PENTING:
            //
            // Jika nginep Jumat/Sabtu/Minggu,
            // maka orang ini diblokir dari Piket Senin-Kamis
            // berikutnya.
            //
            // blockedUntil = hari Minggu + 4 hari
            // sehingga Senin-Kamis tidak bisa dipilih.
            // ====================================================

            selected.blockedUntil = getNextThursday(day);
        }
    }
}



// ============================================================
// ASSIGN PIKET
// ============================================================
function assignPiket(
    jumlah,
    day,
    stats,
    assignedToday,
    dayDuty
) {

    for (let i = 0; i < jumlah; i++) {

        let candidates = stats.filter(m => {

            // Tidak boleh mendapat 2 tugas di hari yang sama
            if (assignedToday.has(m.name)) {
                return false;
            }


            // ====================================================
            // CEK BLOKIR
            //
            // Kalau orang habis nginep weekend,
            // jangan kasih piket Senin-Kamis.
            // ====================================================
            if (m.blockedUntil >= day) {
                return false;
            }


            return true;
        });


        // Prioritas:
        // 1. Yang paling sedikit piket
        // 2. Yang paling sedikit total tugas
        // 3. Yang terakhir bertugas paling lama
        candidates.sort((a, b) => {

            if (a.piketCount !== b.piketCount) {
                return a.piketCount - b.piketCount;
            }

            if (a.total !== b.total) {
                return a.total - b.total;
            }

            return a.lastDutyDay - b.lastDutyDay;
        });


        let selected = candidates[0];


        if (selected) {

            dayDuty.piket.push(selected.name);

            assignedToday.add(selected.name);

            selected.piketCount++;
            selected.total++;
            selected.lastDutyDay = day;
        }
    }
}



// ============================================================
// MENCARI HARI KAMIS SETELAH WEEKEND
// ============================================================
function getNextThursday(day) {

    const currentDate = new Date(
        CONFIG.tahun,
        CONFIG.bulan - 1,
        day
    );

    const dayOfWeek = currentDate.getDay();


    // Jumat (5) -> Kamis berikutnya
    if (dayOfWeek === 5) {
        return day + 6;
    }


    // Sabtu (6) -> Kamis berikutnya
    if (dayOfWeek === 6) {
        return day + 5;
    }


    // Minggu (0) -> Kamis berikutnya
    if (dayOfWeek === 0) {
        return day + 4;
    }


    return -1;
}



// ============================================================
// RENDER KALENDER
// ============================================================
function renderCalendar() {

    const calendarEl = document.getElementById('calendar');

    calendarEl.innerHTML = '';


    schedule.forEach(dayData => {

        const dayCard = document.createElement('div');

        dayCard.className = 'day-card';


        // ====================================================
        // PIKET
        // ====================================================
        let piketSection = '';


        if (dayData.piket.length > 0) {

            let piketList = dayData.piket.map(name =>
                `<div class="duty-tag piket">${name}</div>`
            ).join('');


            piketSection = `
                <div class="slot-group">
                    <div class="slot-title piket">Piket</div>
                    ${piketList}
                </div>
            `;
        }


        // ====================================================
        // NGINEP
        // ====================================================
        let nginapSection = '';


        if (dayData.nginap.length > 0) {

            let nginapList = dayData.nginap.map(name =>
                `<div class="duty-tag nginap">${name}</div>`
            ).join('');


            nginapSection = `
                <div class="slot-group">
                    <div class="slot-title nginap">Nginap</div>
                    ${nginapList}
                </div>
            `;
        }


        // ====================================================
        // KARTU HARI
        // ====================================================
        dayCard.innerHTML = `
            <div class="day-header">
                <div class="day-name">${dayData.namaHari}</div>
                <div class="day-date">${dayData.tanggalStr}</div>
            </div>

            ${piketSection}

            ${nginapSection}
        `;


        calendarEl.appendChild(dayCard);
    });
}



// ============================================================
// JALANKAN SAAT HALAMAN DIMUAT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {

    generateSchedule();

});
```
