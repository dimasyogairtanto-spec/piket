// ======================================================
// KONFIGURASI
// ======================================================

const CONFIG = {
    tahun: 2026,
    bulan: 9, // September

    // Jumat
    nginapJumat: 2,
    piketJumat: 1,

    // Sabtu
    nginapSabtu: 2,

    // Senin - Kamis
    piketBiasa: 1,

    // KHUSUS AGOY (TEPAT 3 KALI SEBULAN)
    bobotAgoy: 0.6,
    maksimalPiketAgoy: 3,
    minimalPiketAgoy: 3,

    // MANIFEST TUKAR JADWAL NGINAP KHUSUS
    // Menukar jadwal nginap Dimas (Tgl 11) dengan Fras (Tgl 25)
    tukarNginapKhusus: [
        {
            namaA: "Dimas",
            tanggalA: 11,
            namaB: "Fras",
            tanggalB: 25
        }
    ],

    daftarNama: [
        "Haydar", "Baihaqi", "Gibran", "Rafly", "Roket",
        "Lutfi", "Kausar", "Hakim", "Iksan", "Fras",
        "Dimas", "Sultan", "Agoy", "Mirja", "Ridho"
    ]
};

// ======================================================
// SEED-BASED RANDOM GENERATOR (DETERMINISTIK)
// ======================================================

let seedGlobal = CONFIG.tahun * 100 + CONFIG.bulan;

function pseudoRandom() {
    let t = seedGlobal += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

// ======================================================
// ATURAN DAN RESTRIKSI
// ======================================================

const BOLEH_NGINAP = [
    "Haydar", "Baihaqi", "Gibran", "Rafly", "Roket",
    "Lutfi", "Kausar", "Hakim", "Fras", "Dimas",
    "Sultan", "Mirja"
];

const TIDAK_BOLEH_NGINAP = ["Agoy", "Iksan", "Ridho"];

const HANYA_NGINAP_JUMAT = ["Fras", "Hakim", "Mirja", "Sultan", "Dimas"];

// DILARANG PIKET/NGINAP KHUSUS TANGGAL 11 & 12
const DILARANG_TGL_11_12 = ["Baihaqi", "Rafly", "Lutfi"];

const TIDAK_BOLEH_PIKET_WEEKEND = ["Iksan", "Ridho"];

const KELOMPOK_TIDAK_BOLEH_BERSAMA = [
    ["Baihaqi", "Haydar", "Sultan"],
    ["Sultan", "Agoy", "Dimas"]
];

const NAMA_HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const NAMA_BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

let schedule = [];

// ======================================================
// HELPER FUNCTIONS
// ======================================================

function namaSama(a, b) {
    return a.toLowerCase() === b.toLowerCase();
}

function getJumlahHari() {
    return new Date(CONFIG.tahun, CONFIG.bulan, 0).getDate();
}

function getMingguKe(day) {
    const firstDay = new Date(CONFIG.tahun, CONFIG.bulan - 1, 1);
    const dayOfWeekFirst = (firstDay.getDay() + 6) % 7; 
    return Math.floor((day + dayOfWeekFirst - 1) / 7);
}

function bolehNginap(name, hari, tanggal) {
    if (TIDAK_BOLEH_NGINAP.some(nama => namaSama(nama, name))) return false;
    if (!BOLEH_NGINAP.some(nama => namaSama(nama, name))) return false;

    if ((tanggal === 11 || tanggal === 12) && DILARANG_TGL_11_12.some(nama => namaSama(nama, name))) {
        return false;
    }

    if (HANYA_NGINAP_JUMAT.some(nama => namaSama(nama, name))) {
        return hari === 5;
    }

    return true;
}

function bolehBersamaNginap(person, selected) {
    for (const kelompok of KELOMPOK_TIDAK_BOLEH_BERSAMA) {
        const personMasuk = kelompok.some(nama => namaSama(nama, person.name));
        if (!personMasuk) continue;

        const sudahAda = selected.some(selectedPerson =>
            kelompok.some(nama => namaSama(nama, selectedPerson.name))
        );

        if (sudahAda) return false;
    }
    return true;
}

function buatStats() {
    return CONFIG.daftarNama.map(name => ({
        name,
        piketCount: 0,
        nginapCount: 0,
        total: 0,
        tanggalPiket: []
    }));
}

function cariTanggalWeekend(mingguKe, jumlahHari) {
    let jumat = null;
    let sabtu = null;

    for (let day = 1; day <= jumlahHari; day++) {
        if (getMingguKe(day) !== mingguKe) continue;

        const tanggal = new Date(CONFIG.tahun, CONFIG.bulan - 1, day);
        const hari = tanggal.getDay();

        if (hari === 5) jumat = day;
        if (hari === 6) sabtu = day;
    }

    return { jumat, sabtu };
}

function getBeban(person) {
    if (namaSama(person.name, "Agoy")) {
        return person.piketCount * CONFIG.bobotAgoy;
    }
    return person.piketCount + (person.nginapCount * 2);
}

function getAgoy(stats) {
    return stats.find(person => namaSama(person.name, "Agoy"));
}

function getJumlahPiketAgoyMinggu(stats, mingguKe) {
    const agoy = getAgoy(stats);
    if (!agoy) return 0;
    return agoy.tanggalPiket.filter(tanggal => getMingguKe(tanggal) === mingguKe).length;
}

function bolehPiketAgoy(stats, tanggal) {
    const agoy = getAgoy(stats);
    if (!agoy) return false;

    if (agoy.piketCount >= CONFIG.maksimalPiketAgoy) return false;

    const minggu = getMingguKe(tanggal);
    if (getJumlahPiketAgoyMinggu(stats, minggu) >= 1) return false;

    const berurutan = agoy.tanggalPiket.some(tLama => Math.abs(tLama - tanggal) < 6);
    if (berurutan) return false;

    return true;
}

function bolehPiketAgoyWeekend(stats, tanggal) {
    return bolehPiketAgoy(stats, tanggal);
}

function getSkorAgoy(stats, tanggal) {
    const agoy = getAgoy(stats);
    if (!agoy) return Infinity;
    if (agoy.piketCount >= CONFIG.maksimalPiketAgoy) return Infinity;

    if (agoy.tanggalPiket.length === 0) return 0;

    const terakhir = Math.max(...agoy.tanggalPiket);
    const jarak = tanggal - terakhir;

    return Math.max(0, 8 - jarak) + (agoy.piketCount * 2);
}

// ======================================================
// LOGIKA ROLLING NGINAP FAIR-DISTRIBUTION
// ======================================================

function cariKombinasiNginap(stats, tanggalJumat, tanggalSabtu) {
    const daftarKandidat = stats.filter(person => 
        BOLEH_NGINAP.some(nama => namaSama(nama, person.name))
    );

    let jumat = [];
    let sabtu = [];

    function pilihPersonil(hari, tanggal, timSaatIni) {
        let kandidatValid = daftarKandidat.filter(person => {
            const validNginep = bolehNginap(person.name, hari, tanggal);
            const validKelompok = bolehBersamaNginap(person, timSaatIni);
            const belumDipilihHariIni = !timSaatIni.some(t => namaSama(t.name, person.name));
            const belumDipilihWeekendIni = !jumat.some(j => namaSama(j.name, person.name)) && 
                                          !sabtu.some(s => namaSama(s.name, person.name));

            return validNginep && validKelompok && belumDipilihHariIni && belumDipilihWeekendIni;
        });

        if (kandidatValid.length === 0) return null;

        kandidatValid.sort((a, b) => {
            if (a.nginapCount !== b.nginapCount) {
                return a.nginapCount - b.nginapCount;
            }
            if (hari === 5) {
                const aKhusus = HANYA_NGINAP_JUMAT.some(n => namaSama(n, a.name));
                const bKhusus = HANYA_NGINAP_JUMAT.some(n => namaSama(n, b.name));
                if (aKhusus && !bKhusus) return -1;
                if (!aKhusus && bKhusus) return 1;
            }
            return pseudoRandom() - 0.5;
        });

        return kandidatValid[0];
    }

    for (let i = 0; i < CONFIG.nginapJumat; i++) {
        const p = pilihPersonil(5, tanggalJumat, jumat);
        if (p) jumat.push(p);
    }

    for (let i = 0; i < CONFIG.nginapSabtu; i++) {
        const p = pilihPersonil(6, tanggalSabtu, sabtu);
        if (p) sabtu.push(p);
    }

    return { jumat, sabtu };
}

function bolehPiket(person, hari, tanggal) {
    if ((tanggal === 11 || tanggal === 12) && DILARANG_TGL_11_12.some(nama => namaSama(nama, person.name))) {
        return false;
    }

    if (hari === 6 || hari === 0) {
        return namaSama(person.name, "Agoy");
    }

    if ((hari === 5 || hari === 6 || hari === 0) &&
        TIDAK_BOLEH_PIKET_WEEKEND.some(nama => namaSama(nama, person.name))) {
        return false;
    }

    return true;
}

function assignPiketWeekendAgoy(stats, dayData, assignedToday, orangNginapHariIni) {
    const tanggal = dayData.day;
    if (!bolehPiketAgoyWeekend(stats, tanggal)) return;

    const agoy = getAgoy(stats);
    if (!agoy || assignedToday.has("Agoy") || orangNginapHariIni.has("Agoy")) return;

    dayData.piket.push("Agoy");
    assignedToday.add("Agoy");
    agoy.piketCount++;
    agoy.total++;
    agoy.tanggalPiket.push(tanggal);
}

function assignPiketBiasa(jumlah, stats, assignedToday, dayData, orangNginapHariIni, hari) {
    for (let i = 0; i < jumlah; i++) {
        const tanggal = dayData.day;

        let candidates = stats.filter(person => {
            if (namaSama(person.name, "Agoy") && person.piketCount >= CONFIG.maksimalPiketAgoy) return false;
            if (assignedToday.has(person.name)) return false;
            if (orangNginapHariIni.has(person.name)) return false; 
            if (!bolehPiket(person, hari, tanggal)) return false;

            if (namaSama(person.name, "Agoy")) {
                if (!bolehPiketAgoy(stats, tanggal)) return false;
            }

            return true;
        });

        candidates.sort((a, b) => {
            const aAgoy = namaSama(a.name, "Agoy");
            const bAgoy = namaSama(b.name, "Agoy");

            if (aAgoy && !bAgoy) {
                if (getSkorAgoy(stats, tanggal) <= 2) return -1;
            }
            if (bAgoy && !aAgoy) {
                if (getSkorAgoy(stats, tanggal) <= 2) return 1;
            }

            const bebanA = getBeban(a);
            const bebanB = getBeban(b);
            if (bebanA !== bebanB) return bebanA - bebanB;
            if (a.piketCount !== b.piketCount) return a.piketCount - b.piketCount;
            if (a.nginapCount !== b.nginapCount) return a.nginapCount - b.nginapCount;

            return pseudoRandom() - 0.5;
        });

        const selected = candidates[0];
        if (!selected) continue;

        dayData.piket.push(selected.name);
        assignedToday.add(selected.name);
        selected.piketCount++;
        selected.total++;

        if (namaSama(selected.name, "Agoy")) {
            selected.tanggalPiket.push(tanggal);
        }
    }
}

// ======================================================
// HELPER EKSTRA: TUKAR JADWAL NGINAP AUTOMATIC
// ======================================================

function eksekusiTukarJadwalNginap(scheduleData) {
    if (!CONFIG.tukarNginapKhusus || CONFIG.tukarNginapKhusus.length === 0) return;

    CONFIG.tukarNginapKhusus.forEach(rule => {
        const itemA = scheduleData.find(d => d.day === rule.tanggalA);
        const itemB = scheduleData.find(d => d.day === rule.tanggalB);

        if (!itemA || !itemB) return;

        const indexA = itemA.nginap.findIndex(nama => namaSama(nama, rule.namaA));
        const indexB = itemB.nginap.findIndex(nama => namaSama(nama, rule.namaB));

        // Melakukan Swap jika kedua entri ditemukan di tanggal masing-masing
        if (indexA !== -1 && indexB !== -1) {
            itemA.nginap[indexA] = rule.namaB;
            itemB.nginap[indexB] = rule.namaA;
        }
    });
}

// ======================================================
// GENERATE & RENDER HTML SCHEDULE
// ======================================================

function generateSchedule() {
    seedGlobal = CONFIG.tahun * 100 + CONFIG.bulan;
    const stats = buatStats();
    schedule = [];

    const jumlahHari = getJumlahHari();
    const semuaMinggu = [
        ...new Set(
            Array.from({ length: jumlahHari }, (_, index) => getMingguKe(index + 1))
        )
    ];

    const nginapPerMinggu = {};

    semuaMinggu.forEach(mingguKe => {
        const weekend = cariTanggalWeekend(mingguKe, jumlahHari);

        if (!weekend.jumat || !weekend.sabtu) {
            nginapPerMinggu[mingguKe] = { jumat: [], sabtu: [] };
            return;
        }

        const hasil = cariKombinasiNginap(stats, weekend.jumat, weekend.sabtu);

        nginapPerMinggu[mingguKe] = {
            jumat: hasil.jumat.map(p => p.name),
            sabtu: hasil.sabtu.map(p => p.name)
        };

        [...hasil.jumat, ...hasil.sabtu].forEach(person => {
            person.nginapCount++;
            person.total++;
        });
    });

    for (let day = 1; day <= jumlahHari; day++) {
        const tanggalObj = new Date(CONFIG.tahun, CONFIG.bulan - 1, day);
        const hari = tanggalObj.getDay();
        const mingguKe = getMingguKe(day);

        const assignedToday = new Set();
        const dayData = {
            day,
            hariStr: NAMA_HARI[hari],
            tanggalStr: `${day} ${NAMA_BULAN[CONFIG.bulan - 1]} ${CONFIG.tahun}`,
            piket: [],
            nginap: []
        };

        let orangNginapHariIni = new Set();

        if (hari === 5) {
            dayData.nginap = nginapPerMinggu[mingguKe]?.jumat || [];
            orangNginapHariIni = new Set(dayData.nginap);
        } else if (hari === 6) {
            dayData.nginap = nginapPerMinggu[mingguKe]?.sabtu || [];
            orangNginapHariIni = new Set(dayData.nginap);
        }

        if (hari === 0 || hari === 6) {
            assignPiketWeekendAgoy(stats, dayData, assignedToday, orangNginapHariIni);
        } else if (hari === 5) {
            assignPiketBiasa(CONFIG.piketJumat, stats, assignedToday, dayData, orangNginapHariIni, hari);
        } else {
            assignPiketBiasa(CONFIG.piketBiasa, stats, assignedToday, dayData, orangNginapHariIni, hari);
        }

        schedule.push(dayData);
    }

    // Eksekusi Swap Khusus (Dimas Tgl 11 <-> Fras Tgl 25)
    eksekusiTukarJadwalNginap(schedule);

    return { schedule, stats };
}

function renderCalendar(scheduleData) {
    const calendarEl = document.getElementById("calendar");
    if (!calendarEl) return;

    calendarEl.innerHTML = "";

    scheduleData.forEach(item => {
        const dayCard = document.createElement("div");
        dayCard.className = "day-card";

        let piketHTML = item.piket.length > 0 
            ? item.piket.map(nama => `<div class="duty-tag piket">${nama}</div>`).join('') 
            : `<span style="font-size:0.8rem; color:#94a3b8;">-</span>`;

        let nginapHTML = item.nginap.length > 0 
            ? item.nginap.map(nama => `<div class="duty-tag nginap">${nama}</div>`).join('') 
            : `<span style="font-size:0.8rem; color:#94a3b8;">-</span>`;

        dayCard.innerHTML = `
            <div class="day-header">
                <div class="day-name">${item.hariStr}</div>
                <div class="day-date">${item.tanggalStr}</div>
            </div>
            <div class="slot-group">
                <div class="slot-title piket">Piket</div>
                ${piketHTML}
            </div>
            <div class="slot-group">
                <div class="slot-title nginap">Nginap</div>
                ${nginapHTML}
            </div>
        `;

        calendarEl.appendChild(dayCard);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const { schedule: hasilJadwal, stats } = generateSchedule();
    renderCalendar(hasilJadwal);
});
