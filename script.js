```js
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

    // Minggu
    // Tidak ada piket orang lain.
    // Hanya Agoy jika memenuhi aturan.

    // Senin - Kamis
    piketBiasa: 1,

    // ==================================================
    // KHUSUS AGoy
    // ==================================================

    bobotAgoy: 0.6,

    // Target 4-5 kali
    maksimalPiketAgoy: 5,

    minimalPiketAgoy: 4,

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


// ======================================================
// NAMA YANG BOLEH NGINAP
// ======================================================

const BOLEH_NGINAP = [
    "Haydar",
    "Baihaqi",
    "Gibran",
    "Rafly",
    "Roket",
    "Lutfi",
    "Kausar",
    "Hakim",
    "Fras",
    "Dimas",
    "Sultan",
    "Mirja"
];


// ======================================================
// TIDAK BOLEH NGINAP
// ======================================================

const TIDAK_BOLEH_NGINAP = [
    "Agoy",
    "Iksan",
    "Ridho"
];


// ======================================================
// HANYA BOLEH NGINAP JUMAT
// ======================================================

const HANYA_NGINAP_JUMAT = [
    "Fras",
    "Hakim",
    "Mirja",
    "Sultan",
    "Dimas"
];


// ======================================================
// TANGGAL TIDAK BOLEH NGINAP
// ======================================================

const TANGGAL_TIDAK_BOLEH_NGINAP = {

    Baihaqi: [11, 12],

    Rafly: [11, 12],

    Lutfi: [11, 12],

    Sultan: [11, 12],

    Dimas: [11, 12]

};


// ======================================================
// TIDAK BOLEH PIKET WEEKEND
// ======================================================

const TIDAK_BOLEH_PIKET_WEEKEND = [
    "Iksan",
    "Ridho"
];


// ======================================================
// KELOMPOK TIDAK BOLEH NGINAP BERSAMA
// ======================================================

const KELOMPOK_TIDAK_BOLEH_BERSAMA = [

    [
        "Baihaqi",
        "Haydar",
        "Sultan"
    ],

    [
        "Sultan",
        "Agoy",
        "Dimas"
    ]

];


// ======================================================
// NAMA HARI
// ======================================================

const NAMA_HARI = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu"
];


// ======================================================
// NAMA BULAN
// ======================================================

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
// HELPER
// ======================================================

function namaSama(a, b) {

    return (
        a.toLowerCase() ===
        b.toLowerCase()
    );

}


// ======================================================
// JUMLAH HARI
// ======================================================

function getJumlahHari() {

    return new Date(
        CONFIG.tahun,
        CONFIG.bulan,
        0
    ).getDate();

}


// ======================================================
// HITUNG MINGGU
// ======================================================

function getMingguKe(day) {

    const tanggal =
        new Date(
            CONFIG.tahun,
            CONFIG.bulan - 1,
            day
        );

    const hari =
        tanggal.getDay();

    // Senin sebagai awal minggu
    const offsetKeSenin =
        hari === 0
            ? -6
            : 1 - hari;

    const senin =
        new Date(tanggal);

    senin.setDate(
        tanggal.getDate() +
        offsetKeSenin
    );

    const awalBulan =
        new Date(
            CONFIG.tahun,
            CONFIG.bulan - 1,
            1
        );

    return Math.floor(
        (
            senin -
            awalBulan
        ) /
        (
            1000 *
            60 *
            60 *
            24 *
            7
        )
    );

}


// ======================================================
// CEK BOLEH NGINAP
// ======================================================

function bolehNginap(
    name,
    hari,
    tanggal
) {

    // Tidak boleh Nginap
    if (
        TIDAK_BOLEH_NGINAP.some(
            nama =>
                namaSama(
                    nama,
                    name
                )
        )
    ) {

        return false;

    }


    // Harus masuk daftar boleh Nginap
    if (
        !BOLEH_NGINAP.some(
            nama =>
                namaSama(
                    nama,
                    name
                )
        )
    ) {

        return false;

    }


    // Cek tanggal terlarang
    const namaAturan =
        Object.keys(
            TANGGAL_TIDAK_BOLEH_NGINAP
        ).find(
            nama =>
                namaSama(
                    nama,
                    name
                )
        );


    if (namaAturan) {

        const tanggalTerlarang =
            TANGGAL_TIDAK_BOLEH_NGINAP[
                namaAturan
            ];

        if (
            tanggalTerlarang.includes(
                tanggal
            )
        ) {

            return false;

        }

    }


    // Hanya Jumat
    if (
        HANYA_NGINAP_JUMAT.some(
            nama =>
                namaSama(
                    nama,
                    name
                )
        )
    ) {

        return hari === 5;

    }


    return true;

}


// ======================================================
// CEK KELOMPOK NGINAP
// ======================================================

function bolehBersamaNginap(
    person,
    selected
) {

    for (
        const kelompok
        of KELOMPOK_TIDAK_BOLEH_BERSAMA
    ) {

        const personMasuk =
            kelompok.some(
                nama =>
                    namaSama(
                        nama,
                        person.name
                    )
            );

        if (!personMasuk) {

            continue;

        }


        const sudahAda =
            selected.some(
                selectedPerson =>
                    kelompok.some(
                        nama =>
                            namaSama(
                                nama,
                                selectedPerson.name
                            )
                    )
            );


        if (sudahAda) {

            return false;

        }

    }


    return true;

}


// ======================================================
// BUAT STATISTIK
// ======================================================

function buatStats() {

    return CONFIG.daftarNama.map(
        name => ({

            name,

            piketCount: 0,

            nginapCount: 0,

            total: 0,

            tanggalPiket: []

        })
    );

}


// ======================================================
// CARI JUMAT & SABTU
// ======================================================

function cariTanggalWeekend(
    mingguKe,
    jumlahHari
) {

    let jumat = null;

    let sabtu = null;


    for (
        let day = 1;
        day <= jumlahHari;
        day++
    ) {

        if (
            getMingguKe(day) !==
            mingguKe
        ) {

            continue;

        }


        const tanggal =
            new Date(
                CONFIG.tahun,
                CONFIG.bulan - 1,
                day
            );

        const hari =
            tanggal.getDay();


        if (hari === 5) {

            jumat = day;

        }


        if (hari === 6) {

            sabtu = day;

        }

    }


    return {
        jumat,
        sabtu
    };

}


// ======================================================
// HITUNG BEBAN
// ======================================================

function getBeban(person) {

    if (
        namaSama(
            person.name,
            "Agoy"
        )
    ) {

        return (
            person.piketCount *
            CONFIG.bobotAgoy
        );

    }


    return (
        person.piketCount +
        (
            person.nginapCount * 2
        )
    );

}


// ======================================================
// CARI AGoy
// ======================================================

function getAgoy(stats) {

    return stats.find(
        person =>
            namaSama(
                person.name,
                "Agoy"
            )
    );

}


// ======================================================
// HITUNG PIKET AGoy DALAM MINGGU
// ======================================================

function getJumlahPiketAgoyMinggu(
    stats,
    mingguKe
) {

    const agoy =
        getAgoy(stats);


    if (!agoy) {

        return 0;

    }


    return agoy.tanggalPiket.filter(
        tanggal =>
            getMingguKe(
                tanggal
            ) === mingguKe
    ).length;

}


// ======================================================
// CEK AGoy BOLEH PIKET
// ======================================================

function bolehPiketAgoy(
    stats,
    tanggal
) {

    const agoy =
        getAgoy(stats);


    if (!agoy) {

        return false;

    }


    // ==================================================
    // MAKSIMAL 5X SEBULAN
    // ==================================================

    if (
        agoy.piketCount >=
        CONFIG.maksimalPiketAgoy
    ) {

        return false;

    }


    const minggu =
        getMingguKe(
            tanggal
        );


    // ==================================================
    // MAKSIMAL 2X SEMINGGU
    // ==================================================

    const jumlahMingguIni =
        getJumlahPiketAgoyMinggu(
            stats,
            minggu
        );


    if (
        jumlahMingguIni >= 2
    ) {

        return false;

    }


    // ==================================================
    // TIDAK BOLEH HARI BERURUTAN
    // ==================================================

    const berurutan =
        agoy.tanggalPiket.some(
            tanggalLama =>
                Math.abs(
                    tanggalLama -
                    tanggal
                ) <= 1
        );


    if (berurutan) {

        return false;

    }


    return true;

}


// ======================================================
// CEK AGoy BOLEH WEEKEND
// ======================================================

function bolehPiketAgoyWeekend(
    stats,
    tanggal
) {

    const agoy =
        getAgoy(stats);


    if (!agoy) {

        return false;

    }


    // Maksimal 5 kali sebulan
    if (
        agoy.piketCount >=
        CONFIG.maksimalPiketAgoy
    ) {

        return false;

    }


    const minggu =
        getMingguKe(
            tanggal
        );


    // Maksimal 2 kali seminggu
    const jumlahMingguIni =
        getJumlahPiketAgoyMinggu(
            stats,
            minggu
        );


    if (
        jumlahMingguIni >= 2
    ) {

        return false;

    }


    // Tidak boleh berurutan
    const berurutan =
        agoy.tanggalPiket.some(
            tanggalLama =>
                Math.abs(
                    tanggalLama -
                    tanggal
                ) <= 1
        );


    if (berurutan) {

        return false;

    }


    return true;

}


// ======================================================
// SKOR AGoy
// ======================================================

function getSkorAgoy(
    stats,
    tanggal
) {

    const agoy =
        getAgoy(stats);


    if (!agoy) {

        return Infinity;

    }


    if (
        agoy.tanggalPiket.length === 0
    ) {

        return 0;

    }


    const terakhir =
        Math.max(
            ...agoy.tanggalPiket
        );

    const jarak =
        tanggal -
        terakhir;


    /*
        Semakin lama tidak Piket,
        semakin tinggi prioritas.
    */

    return Math.max(
        0,
        7 - jarak
    ) + (
        agoy.piketCount *
        0.3
    );

}


// ======================================================
// CARI KOMBINASI NGINAP
// ======================================================

function cariKombinasiNginap(
    stats,
    tanggalJumat,
    tanggalSabtu
) {

    const kandidatJumat =
        stats.filter(
            person =>
                bolehNginap(
                    person.name,
                    5,
                    tanggalJumat
                )
        );


    const kandidatSabtu =
        stats.filter(
            person =>
                bolehNginap(
                    person.name,
                    6,
                    tanggalSabtu
                )
        );


    let terbaik = null;

    let skorTerbaik = Infinity;


    // ==================================================
    // JUMAT
    // ==================================================

    for (
        let i = 0;
        i < kandidatJumat.length;
        i++
    ) {

        for (
            let j = i + 1;
            j < kandidatJumat.length;
            j++
        ) {

            const jumat = [
                kandidatJumat[i],
                kandidatJumat[j]
            ];


            if (
                !bolehBersamaNginap(
                    jumat[0],
                    []
                )
            ) {

                continue;

            }


            if (
                !bolehBersamaNginap(
                    jumat[1],
                    [jumat[0]]
                )
            ) {

                continue;

            }


            // ==================================================
            // SABTU
            // ==================================================

            for (
                let k = 0;
                k < kandidatSabtu.length;
                k++
            ) {

                for (
                    let l = k + 1;
                    l < kandidatSabtu.length;
                    l++
                ) {

                    const sabtu = [
                        kandidatSabtu[k],
                        kandidatSabtu[l]
                    ];


                    // Orang Jumat tidak boleh
                    // Nginap lagi Sabtu
                    const bentrok =
                        jumat.some(
                            orangJumat =>
                                sabtu.some(
                                    orangSabtu =>
                                        namaSama(
                                            orangJumat.name,
                                            orangSabtu.name
                                        )
                                )
                        );


                    if (bentrok) {

                        continue;

                    }


                    if (
                        !bolehBersamaNginap(
                            sabtu[0],
                            []
                        )
                    ) {

                        continue;

                    }


                    if (
                        !bolehBersamaNginap(
                            sabtu[1],
                            [sabtu[0]]
                        )
                    ) {

                        continue;

                    }


                    // ==================================================
                    // HITUNG SKOR
                    // ==================================================

                    let skor = 0;


                    [
                        ...jumat,
                        ...sabtu
                    ].forEach(
                        person => {

                            skor +=
                                getBeban(
                                    person
                                ) * 10;

                        }
                    );


                    skor +=
                        Math.random();


                    if (
                        skor <
                        skorTerbaik
                    ) {

                        skorTerbaik =
                            skor;


                        terbaik = {

                            jumat:
                                [...jumat],

                            sabtu:
                                [...sabtu]

                        };

                    }

                }

            }

        }

    }


    return terbaik;

}


// ======================================================
// CEK PIKET ORANG BIASA
// ======================================================

function bolehPiket(
    person,
    hari
) {

    // ==================================================
    // SABTU & MINGGU
    // HANYA AGoy
    // ==================================================

    if (
        hari === 6 ||
        hari === 0
    ) {

        return namaSama(
            person.name,
            "Agoy"
        );

    }


    // ==================================================
    // IKSAN & RIDHO
    // TIDAK BOLEH WEEKEND
    // ==================================================

    if (
        (
            hari === 5 ||
            hari === 6 ||
            hari === 0
        ) &&
        TIDAK_BOLEH_PIKET_WEEKEND.some(
            nama =>
                namaSama(
                    nama,
                    person.name
                )
        )
    ) {

        return false;

    }


    return true;

}


// ======================================================
// ASSIGN PIKET AGoy WEEKEND
// ======================================================

function assignPiketWeekendAgoy(
    stats,
    dayData,
    assignedToday,
    orangNginapMinggu
) {

    const tanggal =
        dayData.day;


    // Cek apakah Agoy boleh
    if (
        !bolehPiketAgoyWeekend(
            stats,
            tanggal
        )
    ) {

        return;

    }


    const agoy =
        getAgoy(stats);


    if (!agoy) {

        return;

    }


    // Agoy tidak boleh punya tugas lain
    // pada hari yang sama
    if (
        assignedToday.has(
            "Agoy"
        )
    ) {

        return;

    }


    // Agoy tidak boleh nginap
    // pada minggu yang sama
    if (
        orangNginapMinggu.has(
            "Agoy"
        )
    ) {

        return;

    }


    dayData.piket.push(
        "Agoy"
    );


    assignedToday.add(
        "Agoy"
    );


    agoy.piketCount++;

    agoy.total++;

    agoy.tanggalPiket.push(
        tanggal
    );

}


// ======================================================
// ASSIGN PIKET SENIN - JUMAT
// ======================================================

function assignPiketBiasa(
    jumlah,
    stats,
    assignedToday,
    dayData,
    orangNginapMinggu,
    hari
) {

    for (
        let i = 0;
        i < jumlah;
        i++
    ) {

        const tanggal =
            dayData.day;


        let candidates =
            stats.filter(
                person => {

                    // ------------------------------------------
                    // Maksimal Agoy
                    // ------------------------------------------

                    if (
                        namaSama(
                            person.name,
                            "Agoy"
                        ) &&
                        person.piketCount >=
                        CONFIG.maksimalPiketAgoy
                    ) {

                        return false;

                    }


                    // ------------------------------------------
                    // Jangan 2 tugas sehari
                    // ------------------------------------------

                    if (
                        assignedToday.has(
                            person.name
                        )
                    ) {

                        return false;

                    }


                    // ------------------------------------------
                    // Orang yang nginap minggu ini
                    // tidak boleh piket
                    // ------------------------------------------

                    if (
                        orangNginapMinggu.has(
                            person.name
                        )
                    ) {

                        return false;

                    }


                    // ------------------------------------------
                    // Aturan umum
                    // ------------------------------------------

                    if (
                        !bolehPiket(
                            person,
                            hari
                        )
                    ) {

                        return false;

                    }


                    // ------------------------------------------
                    // Aturan Agoy
                    // ------------------------------------------

                    if (
                        namaSama(
                            person.name,
                            "Agoy"
                        )
                    ) {

                        if (
                            !bolehPiketAgoy(
                                stats,
                                tanggal
                            )
                        ) {

                            return false;

                        }

                    }


                    return true;

                }
            );


        // ==================================================
        // URUTKAN
        // ==================================================

        candidates.sort(
            (a, b) => {

                const aAgoy =
                    namaSama(
                        a.name,
                        "Agoy"
                    );

                const bAgoy =
                    namaSama(
                        b.name,
                        "Agoy"
                    );


                // Agoy mendapat prioritas
                // jika sudah cukup lama tidak piket
                if (
                    aAgoy &&
                    !bAgoy
                ) {

                    const skor =
                        getSkorAgoy(
                            stats,
                            tanggal
                        );


                    if (
                        skor <= 1.5
                    ) {

                        return -1;

                    }

                }


                if (
                    bAgoy &&
                    !aAgoy
                ) {

                    const skor =
                        getSkorAgoy(
                            stats,
                            tanggal
                        );


                    if (
                        skor <= 1.5
                    ) {

                        return 1;

                    }

                }


                // Beban paling rendah
                const bebanA =
                    getBeban(a);

                const bebanB =
                    getBeban(b);


                if (
                    bebanA !==
                    bebanB
                ) {

                    return (
                        bebanA -
                        bebanB
                    );

                }


                // Piket paling sedikit
                if (
                    a.piketCount !==
                    b.piketCount
                ) {

                    return (
                        a.piketCount -
                        b.piketCount
                    );

                }


                // Nginap paling sedikit
                if (
                    a.nginapCount !==
                    b.nginapCount
                ) {

                    return (
                        a.nginapCount -
                        b.nginapCount
                    );

                }


                return (
                    Math.random() -
                    0.5
                );

            }
        );


        const selected =
            candidates[0];


        if (!selected) {

            console.warn(
                "Tidak ada kandidat Piket:",
                dayData.tanggalStr
            );

            continue;

        }


        // ==================================================
        // SIMPAN
        // ==================================================

        dayData.piket.push(
            selected.name
        );


        assignedToday.add(
            selected.name
        );


        selected.piketCount++;

        selected.total++;


        if (
            namaSama(
                selected.name,
                "Agoy"
            )
        ) {

            selected.tanggalPiket.push(
                tanggal
            );

        }

    }

}


// ======================================================
// GENERATE SCHEDULE
// ======================================================

function generateSchedule() {

    const stats =
        buatStats();


    schedule = [];


    const jumlahHari =
        getJumlahHari();


    const semuaMinggu = [
        ...new Set(
            Array.from(
                {
                    length:
                        jumlahHari
                },
                (_, index) =>
                    getMingguKe(
                        index + 1
                    )
            )
        )
    ];


    const nginapPerMinggu = {};


    // ==================================================
    // GENERATE NGINAP
    // ==================================================

    semuaMinggu.forEach(
        mingguKe => {

            const weekend =
                cariTanggalWeekend(
                    mingguKe,
                    jumlahHari
                );


            if (
                !weekend.jumat ||
                !weekend.sabtu
            ) {

                nginapPerMinggu[
                    mingguKe
                ] = {
                    jumat: [],
                    sabtu: []
                };

                return;

            }


            const hasil =
                cariKombinasiNginap(
                    stats,
                    weekend.jumat,
                    weekend.sabtu
                );


            if (!hasil) {

                console.warn(
                    "Tidak ditemukan kombinasi Nginap minggu:",
                    mingguKe
                );


                nginapPerMinggu[
                    mingguKe
                ] = {
                    jumat: [],
                    sabtu: []
                };

                return;

            }


            nginapPerMinggu[
                mingguKe
            ] = {

                jumat:
                    hasil.jumat.map(
                        person =>
                            person.name
                    ),

                sabtu:
                    hasil.sabtu.map(
                        person =>
                            person.name
                    )

            };


            [
                ...hasil.jumat,
                ...hasil.sabtu
            ].forEach(
                person => {

                    person.nginapCount++;

                    person.total++;

                }
            );

        }
    );


    // ==================================================
    // GENERATE PIKET HARIAN
    // ==================================================

    for (
        let day = 1;
        day <= jumlahHari;
        day++
    ) {

        const tanggal =
            new Date(
                CONFIG.tahun,
                CONFIG.bulan - 1,
                day
            );


        const hari =
            tanggal.getDay();


        const mingguKe =
            getMingguKe(day);


        const dataMinggu =
            nginapPerMinggu[
                mingguKe
            ] || {
                jumat: [],
                sabtu: []
            };


        const dayData = {

            day,

            namaHari:
                NAMA_HARI[hari],

            tanggalStr:
                `${day} ${NAMA_BULAN[tanggal.getMonth()]} ${CONFIG.tahun}`,

            piket: [],

            nginap: []

        };


        // ==================================================
        // NGINAP
        // ==================================================

        if (hari === 5) {

            dayData.nginap =
                dataMinggu.jumat.slice();

        }


        if (hari === 6) {

            dayData.nginap =
                dataMinggu.sabtu.slice();

        }


        const orangNginapMinggu =
            new Set([
                ...dataMinggu.jumat,
                ...dataMinggu.sabtu
            ]);


        const assignedToday =
            new Set(
                dayData.nginap
            );


        // ==================================================
        // SABTU
        // ==================================================

        if (hari === 6) {

            assignPiketWeekendAgoy(
                stats,
                dayData,
                assignedToday,
                orangNginapMinggu
            );

        }


        // ==================================================
        // MINGGU
        // ==================================================

        else if (hari === 0) {

            assignPiketWeekendAgoy(
                stats,
                dayData,
                assignedToday,
                orangNginapMinggu
            );

        }


        // ==================================================
        // SENIN - JUMAT
        // ==================================================

        else {

            const jumlahPiket =
                hari === 5
                    ? CONFIG.piketJumat
                    : CONFIG.piketBiasa;


            assignPiketBiasa(
                jumlahPiket,
                stats,
                assignedToday,
                dayData,
                orangNginapMinggu,
                hari
            );

        }


        schedule.push(
            dayData
        );

    }


    // ==================================================
    // SIMPAN JADWAL KE LOCALSTORAGE
    // ==================================================

    localStorage.setItem(
        getStorageKey(),
        JSON.stringify(schedule)
    );


    // ==================================================
    // RENDER
    // ==================================================

    renderCalendar();


    // ==================================================
    // STATISTIK
    // ==================================================

    console.log(
        "Jadwal:",
        schedule
    );

}


// ======================================================
// STORAGE
// ======================================================

function getStorageKey() {

    return `jadwal-${CONFIG.tahun}-${CONFIG.bulan}`;

}


function loadSavedSchedule() {

    const saved =
        localStorage.getItem(
            getStorageKey()
        );


    if (!saved) {

        return false;

    }


    try {

        schedule =
            JSON.parse(saved);

        renderCalendar();

        console.log(
            "Jadwal dimuat dari localStorage:",
            schedule
        );

        return true;

    } catch (error) {

        console.error(
            "Gagal membaca jadwal tersimpan:",
            error
        );

        localStorage.removeItem(
            getStorageKey()
        );

        return false;

    }

}


// ======================================================
// HAPUS JADWAL TERSIMPAN
// ======================================================

function resetSchedule() {

    localStorage.removeItem(
        getStorageKey()
    );

    location.reload();

}


// ======================================================
// RENDER CALENDAR
// ======================================================

function renderCalendar() {

    const calendar =
        document.getElementById(
            "calendar"
        );


    if (!calendar) {

        console.error(
            'Element #calendar tidak ditemukan!'
        );

        return;

    }


    calendar.innerHTML = "";


    schedule.forEach(
        dayData => {

            const dayCard =
                document.createElement(
                    "div"
                );


            dayCard.className =
                "day-card";


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

            if (
                dayData.piket.length > 0
            ) {

                html += `

                    <div class="slot-group">

                        <div class="slot-title piket">
                            Piket
                        </div>

                        ${dayData.piket
                            .map(
                                name => `
                                    <div class="duty-tag piket">
                                        ${name}
                                    </div>
                                `
                            )
                            .join("")}

                    </div>

                `;

            }


            // ==================================================
            // NGINAP
            // ==================================================

            if (
                dayData.nginap.length > 0
            ) {

                html += `

                    <div class="slot-group">

                        <div class="slot-title nginap">
                            Nginap
                        </div>

                        ${dayData.nginap
                            .map(
                                name => `
                                    <div class="duty-tag nginap">
                                        ${name}
                                    </div>
                                `
                            )
                            .join("")}

                    </div>

                `;

            }


            // ==================================================
            // KOSONG
            // ==================================================

            if (
                dayData.piket.length === 0 &&
                dayData.nginap.length === 0
            ) {

                html += `

                    <div style="
                        color: #94a3b8;
                        font-size: 0.85rem;
                        padding: 5px 0;
                    ">
                        Tidak ada tugas
                    </div>

                `;

            }


            dayCard.innerHTML =
                html;


            calendar.appendChild(
                dayCard
            );

        }
    );

}


// ======================================================
// START
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Sistem jadwal dimulai..."
        );


        // Jika sudah ada jadwal tersimpan,
        // jangan generate ulang.
        if (
            !loadSavedSchedule()
        ) {

            generateSchedule();

        }

    }
);
```
