document.addEventListener("DOMContentLoaded", function () {
    // === A. DEFINISI VARIABEL ===
    const btnBuka = document.getElementById('btn-buka-undangan');
    const opening = document.getElementById('opening-section');
    const video = document.getElementById('v-opening');
    const ayatSection = document.getElementById('ayat-section');
    const mainContent = document.getElementById('main-content');
    const btnText = document.getElementById('btn-text');
    const btnSpinner = document.getElementById('btn-spinner');

    // Variabel Musik (Updated untuk desain baru)
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

    // URL Web App Google Apps Script
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyc757PMFaRfjeZcT-9gF5FrGWalu5EbUEoz1UQzDpVkE_ECcYoh1TH9xSujHWyRo3M/exec'; 

    // === B. LOGIKA NAMA TAMU (URL PARAMETER) ===
    const urlParams = new URLSearchParams(window.location.search);
    const namaTamu = urlParams.get('to');
    if (namaTamu) {
        const decodedNama = decodeURIComponent(namaTamu);
        const guestElement = document.getElementById('guest-name');
        if (guestElement) guestElement.innerText = decodedNama;
        if (inputNama) inputNama.value = decodedNama;
    }

    // === C. LOGIKA BUKA UNDANGAN ===
    if (btnBuka) {
        btnBuka.addEventListener('click', function () {
            if (btnSpinner) btnSpinner.style.display = "inline-block"; 
            if (btnText) btnText.innerText = "Membuka Undangan...";
            this.style.pointerEvents = "none"; 

            document.body.classList.remove('undangan-tertutup');
            document.body.classList.add('undangan-terbuka');

            setTimeout(() => {
                if (opening) opening.classList.remove('d-none');
                if (mainContent) mainContent.classList.remove('d-none');

                // --- LOGIKA MUSIK REVISI ---
                if (music) {
                    music.play().then(() => {
                        // Jika sukses play, tambahkan class animasi play
                        if (musicBtn) {
                            musicBtn.classList.remove('paused-state');
                            musicBtn.classList.add('play-state');
                        }
                    }).catch(err => {
                        console.log("Autoplay dicegah browser.");
                        // Jika gagal play otomatis, set ke state pause
                        if (musicBtn) {
                            musicBtn.classList.add('paused-state');
                            musicBtn.classList.remove('play-state');
                        }
                    });

                    if (musicControl) {
                        musicControl.classList.remove('music-control-hidden');
                        musicControl.classList.add('music-control-show');
                    }
                }
                // ---------------------------

                if (video) {
                    video.muted = false;
                    video.currentTime = 0;
                    video.play().catch(() => {
                        video.muted = true;
                        video.play();
                    });
                }

                if (opening) {
                    opening.scrollIntoView({ behavior: 'smooth' });
                }
                
                setTimeout(() => {
                    if (btnSpinner) btnSpinner.style.display = "none";
                    if (btnText) btnText.innerText = "Buka Undangan";
                    this.style.pointerEvents = "auto";
                }, 1000);
            }, 800); 
        });
    }

    // === D. LOGIKA VIDEO SELESAI ===
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

    // === E. LOGIKA LIGHTBOX GALERI (GLOBAL) ===
    window.showLightbox = function(el) {
        const src = el.getAttribute('data-full');
        const img = document.getElementById('lightboxImg');
        const modalEl = document.getElementById('galleryModal');

        if (img && src && modalEl) {
            img.src = src;
            const myModal = new bootstrap.Modal(modalEl);
            myModal.show();
        }
    };

    // === F. ANIMASI FADE UP (INTERSECTION OBSERVER) ===
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

    // === G. COUNTDOWN TIMER ===
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
    createCountdown('countdown-akad', '2026-04-16T09:00:00');
    createCountdown('countdown-resepsi', '2026-04-26T13:00:00');

    // === H. LOGIKA RSVP & UCAPAN (PAGINATION & FIXED INDEX) ===

    function loadWishes() {
        if (!wishesContainer) return;
        
        fetch(`${SCRIPT_URL}?action=read`)
            .then(res => res.json())
            .then(data => {
                allWishes = [...data].reverse();
                displayWishes(currentPage);
            })
            .catch(err => {
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
                <div class="wish-item fade-up show">
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
            paginationHtml += `
                <button onclick="changePage(${i})" class="btn-page ${i === currentPage ? 'active' : ''}">
                    ${i}
                </button>`;
        }
        paginationHtml += `</div>`;
        wishesContainer.innerHTML += paginationHtml;
    }

    window.changePage = function(page) {
        currentPage = page;
        displayWishes(page);
        wishesContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    loadWishes();

    if (rsvpForm) {
        rsvpForm.addEventListener('submit', e => {
            e.preventDefault();
            const btn = document.getElementById('btnKirimRsvp');
            const btnTextRsvp = document.getElementById('btnTextRsvp');
            
            btn.disabled = true;
            if(btnTextRsvp) btnTextRsvp.innerText = "Mengirim...";

            const formData = new FormData(rsvpForm);
            formData.append('action', 'insert');

            fetch(SCRIPT_URL, { method: 'POST', body: formData })
                .then(res => {
                    rsvpForm.reset();
                    if (namaTamu) inputNama.value = decodeURIComponent(namaTamu);
                    btn.disabled = false;
                    if(btnTextRsvp) btnTextRsvp.innerText = "Kirim Ucapan";
                    currentPage = 1; 
                    loadWishes(); 
                })
                .catch(error => {
                    alert("Gagal mengirim ucapan, silakan coba lagi.");
                    btn.disabled = false;
                    if(btnTextRsvp) btnTextRsvp.innerText = "Kirim Ucapan";
                });
        });
    }

    window.openReplyModal = function(index, name) {
        const replyIndexInput = document.getElementById('replyRowIndex');
        if(replyIndexInput) replyIndexInput.value = index;
        const modal = new bootstrap.Modal(document.getElementById('modalBalas'));
        modal.show();
    };

    const replyForm = document.getElementById('replyForm');
    if (replyForm) {
        replyForm.addEventListener('submit', e => {
            e.preventDefault();
            const adminName = document.querySelector('input[name="adminName"]:checked').value;
            const replyText = document.getElementById('replyText').value;
            const rowIndex = document.getElementById('replyRowIndex').value;

            const submitBtn = replyForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerText = "Mengirim...";

            const replyData = new FormData();
            replyData.append('action', 'reply');
            replyData.append('index', rowIndex);
            replyData.append('nama_admin', adminName);
            replyData.append('balasan', replyText);

            fetch(SCRIPT_URL, { method: 'POST', body: replyData })
                .then(res => {
                    replyForm.reset();
                    submitBtn.disabled = false;
                    submitBtn.innerText = "Kirim Balasan";
                    const modalInstance = bootstrap.Modal.getInstance(document.getElementById('modalBalas'));
                    if (modalInstance) modalInstance.hide();
                    loadWishes(); 
                })
                .catch(err => {
                    alert("Gagal mengirim balasan.");
                    submitBtn.disabled = false;
                    submitBtn.innerText = "Kirim Balasan";
                });
        });
    }

    // === I. LOGIKA SECTION GIFTS ===
    window.toggleGifts = function() {
        const container = document.getElementById('giftContainer');
        const triggerBtn = document.getElementById('btnGiftTrigger');
        
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
            
            document.getElementById('gifts').scrollIntoView({ behavior: 'smooth' });
        }
    };

    window.copyValue = function(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        let textToCopy = element.innerText || element.textContent;
        
        if (elementId.includes('norek') || elementId.includes('noDana')) {
            textToCopy = textToCopy.replace(/[^0-9]/g, '');
        }

        navigator.clipboard.writeText(textToCopy).then(() => {
            alert("Berhasil menyalin: " + textToCopy);
        }).catch(err => {
            console.error('Gagal menyalin!', err);
        });
    };

    // === J. LOGIKA DOWNLOAD QRIS (Mencegah Refresh) ===
    window.downloadQR = function(url, filename) {
        fetch(url)
            .then(response => response.blob())
            .then(blob => {
                const blobUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = blobUrl;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(blobUrl);
                document.body.removeChild(a);
            })
            .catch(() => {
                window.open(url, '_blank');
            });
    };

    // === K. LOGIKA MUSIC TOGGLE (REVISI LUXURY) ===
    window.toggleMusic = function() {
        if (!music || !musicBtn) return;

        if (music.paused) {
            music.play();
            // Gunakan class state untuk visualizer
            musicBtn.classList.remove('paused-state');
            musicBtn.classList.add('play-state');
        } else {
            music.pause();
            // Gunakan class state untuk visualizer
            musicBtn.classList.remove('play-state');
            musicBtn.classList.add('paused-state');
        }
    };
});