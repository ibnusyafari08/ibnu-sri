document.addEventListener("DOMContentLoaded", function () {

    // === A. DEFINISI VARIABEL ===
    const body = document.body;
    const btnBuka = document.getElementById('btn-buka-undangan');
    const opening = document.getElementById('opening-section');
    const video = document.getElementById('v-opening');
    const ayatSection = document.getElementById('ayat-section');
    const mainContent = document.getElementById('main-content');
    const btnText = document.getElementById('btn-text');
    const btnSpinner = document.getElementById('btn-spinner');

    // Musik
    const music = document.getElementById('weddingMusic');
    const musicControl = document.getElementById('music-control');
    const musicBtn = document.getElementById('music-btn');

    // RSVP
    const rsvpForm = document.getElementById('rsvpForm');
    const inputNama = document.getElementById('inputNama');
    const wishesContainer = document.getElementById('wishesContainer');

    // Pagination
    let currentPage = 1;
    const itemsPerPage = 3;
    let allWishes = [];

    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyc757PMFaRfjeZcT-9gF5FrGWalu5EbUEoz1UQzDpVkE_ECcYoh1TH9xSujHWyRo3M/exec';

    // === B. LOCK SCROLL AWAL ===
    body.style.overflow = 'hidden';

    // === C. NAMA TAMU ===
    const urlParams = new URLSearchParams(window.location.search);
    const namaTamu = urlParams.get('to') || urlParams.get('u');

    if (namaTamu) {
        const decodedNama = decodeURIComponent(namaTamu);
        const guestElement = document.getElementById('guest-name');

        if (guestElement) guestElement.innerText = decodedNama;
        if (inputNama) inputNama.value = decodedNama;
    }

    // === D. FUNCTION MUSIC (SUPER FIX MOBILE) ===
    function playMusic() {
        if (!music) return;

        try {
            music.muted = false;
            music.volume = 1;

            const playPromise = music.play();

            if (playPromise !== undefined) {
                playPromise.then(() => {
                    if (musicBtn) {
                        musicBtn.classList.remove('paused-state');
                        musicBtn.classList.add('play-state');
                    }
                }).catch(() => {
                    // fallback jika gagal autoplay
                    document.addEventListener('click', playMusic, { once: true });
                });
            }

        } catch (err) {
            console.log("Music error:", err);
        }
    }

    function showMusicControl() {
        if (!musicControl) return;

        musicControl.classList.remove('music-control-hidden');
        musicControl.classList.add('music-control-show');

        musicControl.style.display = "block";
        musicControl.style.opacity = "1";
    }

    // === E. BUKA UNDANGAN ===
    if (btnBuka) {
        btnBuka.addEventListener('click', function (e) {
            e.preventDefault();

            // 🔥 1. PLAY MUSIC PALING AWAL (WAJIB)
            playMusic();

            // 🔥 2. TAMPILKAN CONTROL
            showMusicControl();

            // 🔥 3. VIDEO DELAY (ANTI BENTROK)
            setTimeout(() => {
                if (video) {
                    video.muted = true;
                    video.play().catch(() => {});
                }
            }, 300);

            // UI BUTTON
            if (btnSpinner) btnSpinner.style.display = "inline-block";
            if (btnText) btnText.innerText = "Membuka...";
            this.style.pointerEvents = "none";

            // UNLOCK SCROLL
            body.style.overflow = 'auto';
            body.classList.remove('undangan-tertutup');
            body.classList.add('undangan-terbuka');

            // TAMPILKAN KONTEN
            setTimeout(() => {
                if (opening) opening.classList.remove('d-none');
                if (mainContent) mainContent.classList.remove('d-none');

                if (opening) {
                    opening.scrollIntoView({ behavior: 'smooth' });
                }

                setTimeout(() => {
                    this.style.display = "none";
                }, 800);

            }, 100);
        });
    }

    // === F. VIDEO SELESAI ===
    if (video) {
        video.addEventListener('ended', function () {
            if (opening) {
                opening.classList.add('hide-video');
            }

            setTimeout(() => {
                if (ayatSection) {
                    ayatSection.scrollIntoView({ behavior: 'smooth' });
                }
            }, 300);
        });
    }

    // === G. TOGGLE MUSIC ===
    window.toggleMusic = function () {
        if (!music) return;

        if (music.paused) {
            playMusic();
        } else {
            music.pause();

            if (musicBtn) {
                musicBtn.classList.remove('play-state');
                musicBtn.classList.add('paused-state');
            }
        }
    };

    // === H. COPY CLIPBOARD ===
    window.copyValue = function(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;

        let textToCopy = element.innerText || element.textContent;

        if (elementId.includes('norek') || elementId.includes('noDana')) {
            textToCopy = textToCopy.replace(/[^0-9]/g, '');
        }

        navigator.clipboard.writeText(textToCopy).then(() => {
            alert("Berhasil menyalin: " + textToCopy);
        });
    };

    // === I. RSVP ===
    function loadWishes() {
        if (!wishesContainer) return;

        fetch(`${SCRIPT_URL}?action=read`)
            .then(res => res.json())
            .then(data => {
                allWishes = [...data].reverse();
                displayWishes(currentPage);
            })
            .catch(() => {
                wishesContainer.innerHTML = '<div class="text-center text-white-50 p-4">Belum ada ucapan.</div>';
            });
    }

    function displayWishes(page) {
        wishesContainer.innerHTML = '';

        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedItems = allWishes.slice(startIndex, endIndex);

        if (paginatedItems.length === 0) {
            wishesContainer.innerHTML = '<div class="text-center text-white-50 p-4">Belum ada ucapan.</div>';
            return;
        }

        paginatedItems.forEach((item) => {
            wishesContainer.innerHTML += `
                <div class="wish-item fade-up show">
                    <div class="d-flex justify-content-between">
                        <div class="wish-name">${item.nama}</div>
                        <span class="badge-status">${item.konfirmasi} (${item.jumlah})</span>
                    </div>
                    <div class="wish-date">${item.timestamp}</div>
                    <div class="wish-text">${item.ucapan}</div>
                </div>
            `;
        });

        renderPagination();
    }

    function renderPagination() {
        const totalPages = Math.ceil(allWishes.length / itemsPerPage);
        if (totalPages <= 1) return;

        let html = `<div class="d-flex justify-content-center gap-2 mt-4">`;
        for (let i = 1; i <= totalPages; i++) {
            html += `<button onclick="changePage(${i})" class="btn-page ${i === currentPage ? 'active' : ''}">${i}</button>`;
        }
        html += `</div>`;

        wishesContainer.innerHTML += html;
    }

    window.changePage = function(page) {
        currentPage = page;
        displayWishes(page);
        wishesContainer.scrollIntoView({ behavior: 'smooth' });
    };

    loadWishes();

    if (rsvpForm) {
        rsvpForm.addEventListener('submit', e => {
            e.preventDefault();

            const btn = document.getElementById('btnKirimRsvp');
            const btnTextRsvp = document.getElementById('btnTextRsvp');

            btn.disabled = true;
            btnTextRsvp.innerText = "Mengirim...";

            const formData = new FormData(rsvpForm);
            formData.append('action', 'insert');

            fetch(SCRIPT_URL, { method: 'POST', body: formData })
                .then(() => {
                    rsvpForm.reset();
                    if (namaTamu) inputNama.value = decodeURIComponent(namaTamu);
                    btn.disabled = false;
                    btnTextRsvp.innerText = "Kirim Ucapan";
                    currentPage = 1;
                    loadWishes();
                })
                .catch(() => {
                    alert("Gagal kirim");
                    btn.disabled = false;
                    btnTextRsvp.innerText = "Kirim Ucapan";
                });
        });
    }

    // === LIGHTBOX ===
    window.showLightbox = function(el) {
        const src = el.getAttribute('data-full');
        const img = document.getElementById('lightboxImg');
        const modal = new bootstrap.Modal(document.getElementById('galleryModal'));

        img.src = src;
        modal.show();
    };

    // === GIFTS ===
    window.toggleGifts = function() {
        const container = document.getElementById('giftContainer');
        const btn = document.getElementById('btnGiftTrigger');

        container.classList.toggle('d-none');

        if (container.classList.contains('d-none')) {
            btn.innerHTML = 'Klik Untuk Memberi Hadiah';
        } else {
            btn.innerHTML = 'Tutup Menu Hadiah';
            container.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // === COUNTDOWN ===
    function createCountdown(id, date) {
        const el = document.getElementById(id);
        if (!el) return;

        const target = new Date(date).getTime();

        setInterval(() => {
            const now = new Date().getTime();
            const dist = target - now;

            if (dist < 0) {
                el.innerHTML = "Acara Selesai";
                return;
            }

            const d = Math.floor(dist / (1000*60*60*24));
            const h = Math.floor((dist%(1000*60*60*24))/(1000*60*60));
            const m = Math.floor((dist%(1000*60*60))/(1000*60));
            const s = Math.floor((dist%(1000*60))/1000);

            el.innerHTML = `${d}H ${h}J ${m}M ${s}D`;
        }, 1000);
    }

    createCountdown('countdown-akad', '2026-04-16T09:00:00');
    createCountdown('countdown-resepsi', '2026-04-18T13:00:00');

});