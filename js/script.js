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

    // Variabel Musik
    const music = document.getElementById('weddingMusic');
    const musicControl = document.getElementById('music-control');
    const musicBtn = document.getElementById('music-btn');

    // Variabel RSVP & Ucapan
    const rsvpForm = document.getElementById('rsvpForm');
    const inputNama = document.getElementById('inputNama');
    const wishesContainer = document.getElementById('wishesContainer');
    
    // State Paginasi
    let currentPage = 1;
    const itemsPerPage = 3;
    let allWishes = []; 

    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyc757PMFaRfjeZcT-9gF5FrGWalu5EbUEoz1UQzDpVkE_ECcYoh1TH9xSujHWyRo3M/exec'; 

    // === B. LOCK SCROLL AWAL (HP & LAPTOP) ===
    body.style.overflow = 'hidden';

    // === C. LOGIKA NAMA TAMU (URL PARAMETER) ===
    const urlParams = new URLSearchParams(window.location.search);
    const namaTamu = urlParams.get('to');
    if (namaTamu) {
        const decodedNama = decodeURIComponent(namaTamu);
        const guestElement = document.getElementById('guest-name');
        if (guestElement) guestElement.innerText = decodedNama;
        if (inputNama) inputNama.value = decodedNama;
    }

    // === D. LOGIKA BUKA UNDANGAN (FIX AUTO-PLAY MUSIC & VIDEO) ===
    if (btnBuka) {
        btnBuka.addEventListener('click', function (e) {
            e.preventDefault();

            // 1. EKSEKUSI MUSIK (WAJIB DI ATAS AGAR TIDAK DIBLOKIR HP)
            if (music) {
                music.muted = false;
                music.play().then(() => {
                    if (musicBtn) {
                        musicBtn.classList.remove('paused-state');
                        musicBtn.classList.add('play-state');
                    }
                    if (musicControl) {
                        musicControl.classList.remove('music-control-hidden');
                        musicControl.classList.add('music-control-show');
                    }
                }).catch(err => console.log("Music play blocked:", err));
            }

            // 2. EKSEKUSI VIDEO OPENING
            if (video) {
                video.muted = false;
                video.play().catch(() => {
                    video.muted = true; // Fallback jika browser memaksa mute
                    video.play();
                });
            }

            // 3. UI FEEDBACK
            if (btnSpinner) btnSpinner.style.display = "inline-block"; 
            if (btnText) btnText.innerText = "Membuka...";
            this.style.pointerEvents = "none"; 

            // 4. TRANSISI & UNLOCK SCROLL
            setTimeout(() => {
                body.style.overflow = 'auto'; // Aktifkan scroll kembali
                body.classList.remove('undangan-tertutup');
                body.classList.add('undangan-terbuka');

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

    // === E. LOGIKA VIDEO SELESAI ===
    if (video) {
        video.addEventListener('ended', function () {
            if (opening) {
                opening.style.position = 'relative';
                opening.style.zIndex = '1';
            }
            setTimeout(() => {
                if (ayatSection) {
                    ayatSection.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100); 
        });
    }

    // === F. LOGIKA HITUNG MUNDUR (COUNTDOWN) - TETAP DIJAGA ===
    function createCountdown(elementId, targetDateString) {
        const element = document.getElementById(elementId);
        if (!element) return;
        const targetDate = new Date(targetDateString).getTime();

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                clearInterval(timer);
                element.innerHTML = "<div class='text-white fw-bold text-center w-100'>Acara Telah Selesai</div>";
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            element.innerHTML = `
                <div class="time-box"><span class="time-val">${days}</span><span class="time-label">Hari</span></div>
                <div class="time-box"><span class="time-val">${hours}</span><span class="time-label">Jam</span></div>
                <div class="time-box"><span class="time-val">${minutes}</span><span class="time-label">Menit</span></div>
                <div class="time-box"><span class="time-val">${seconds}</span><span class="time-label">Detik</span></div>
            `;
        }, 1000);
    }
    // Inisialisasi Countdown
    createCountdown('countdown-akad', '2026-04-16T09:00:00');
    createCountdown('countdown-resepsi', '2026-04-18T13:00:00');

    // === G. LOGIKA TOMBOL GIFT (HADIAH) - TETAP LENGKAP ===
    window.toggleGifts = function() {
        const container = document.getElementById('giftContainer');
        const triggerBtn = document.getElementById('btnGiftTrigger');
        if (!container || !triggerBtn) return;

        if (container.classList.contains('d-none')) {
            container.classList.remove('d-none');
            container.classList.add('animate__fadeInUp');
            triggerBtn.innerHTML = '<i class="fas fa-times me-2"></i> Tutup Menu Hadiah';
            triggerBtn.classList.replace('btn-gold', 'btn-outline-light');
            setTimeout(() => {
                container.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        } else {
            container.classList.add('d-none');
            triggerBtn.innerHTML = '<i class="fas fa-gift me-2"></i> Klik Untuk Memberi Hadiah';
            triggerBtn.classList.replace('btn-outline-light', 'btn-gold');
            const giftSection = document.getElementById('gifts');
            if(giftSection) giftSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Fungsi Copy (Salin No Rekening) - Diperbaiki untuk Mobile
    window.copyValue = function(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;
        let textToCopy = element.innerText || element.textContent;
        if (elementId.includes('norek') || elementId.includes('noDana')) {
            textToCopy = textToCopy.replace(/[^0-9]/g, '');
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                alert("Berhasil menyalin: " + textToCopy);
            }).catch(() => fallbackCopy(textToCopy));
        } else {
            fallbackCopy(textToCopy);
        }
    };

    function fallbackCopy(text) {
        const dummy = document.createElement("textarea");
        document.body.appendChild(dummy);
        dummy.value = text;
        dummy.select();
        document.execCommand("copy");
        document.body.removeChild(dummy);
        alert("Berhasil menyalin: " + text);
    }

    // === H. LOGIKA RSVP & UCAPAN (TETAP SAMA) ===
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

        paginatedItems.forEach((item, displayIdx) => {
            const globalIdx = startIndex + displayIdx;
            const originalIdx = (allWishes.length - 1) - globalIdx;
            let replyHtml = item.balasan ? `
                <div class="reply-item shadow-sm">
                    <div class="wish-name" style="font-size: 0.85rem; color: #d4af37;">${item.nama_admin}</div>
                    <div class="wish-date" style="font-size: 0.7rem;">${item.tgl_balas}</div>
                    <div class="wish-text" style="font-size: 0.9rem;">${item.balasan}</div>
                </div>
            ` : `<button class="btn-reply-link" onclick="openReplyModal('${originalIdx}', '${item.nama}')">Balas Ucapan</button>`;

            wishesContainer.innerHTML += `
                <div class="wish-item">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="wish-name">${item.nama}</div>
                        <span class="badge-status">${item.konfirmasi} (${item.jumlah})</span>
                    </div>
                    <div class="wish-date">${item.timestamp}</div>
                    <div class="wish-text">${item.ucapan}</div>
                    <div id="reply-box-${originalIdx}">${replyHtml}</div>
                </div>
            `;
        });
        renderPagination();
    }

    function renderPagination() {
        const totalPages = Math.ceil(allWishes.length / itemsPerPage);
        if (totalPages <= 1) return;
        let paginationHtml = `<div class="pagination-wrapper d-flex justify-content-center gap-2 mt-4">`;
        for (let i = 1; i <= totalPages; i++) {
            paginationHtml += `<button onclick="changePage(${i})" class="btn-page ${i === currentPage ? 'active' : ''}">${i}</button>`;
        }
        paginationHtml += `</div>`;
        wishesContainer.innerHTML += paginationHtml;
    }

    window.changePage = function(page) {
        currentPage = page;
        displayWishes(page);
    };

    loadWishes();

    if (rsvpForm) {
        rsvpForm.addEventListener('submit', e => {
            e.preventDefault();
            const btn = document.getElementById('btnKirimRsvp');
            btn.disabled = true;
            const formData = new FormData(rsvpForm);
            formData.append('action', 'insert');
            fetch(SCRIPT_URL, { method: 'POST', body: formData })
                .then(() => {
                    rsvpForm.reset();
                    btn.disabled = false;
                    loadWishes(); 
                })
                .catch(() => {
                    alert("Gagal mengirim ucapan.");
                    btn.disabled = false;
                });
        });
    }

    // === I. LOGIKA LIGHTBOX GALERI ===
    window.showLightbox = function(el) {
        const src = el.getAttribute('data-full');
        const img = document.getElementById('lightboxImg');
        const modalEl = document.getElementById('galleryModal');
        if (img && src && modalEl) {
            img.src = src;
            new bootstrap.Modal(modalEl).show();
        }
    };

    // === J. MUSIC CONTROL TOGGLE ===
    window.toggleMusic = function() {
        if (!music || !musicBtn) return;
        if (music.paused) {
            music.play();
            musicBtn.classList.replace('paused-state', 'play-state');
        } else {
            music.pause();
            musicBtn.classList.replace('play-state', 'paused-state');
        }
    };
});