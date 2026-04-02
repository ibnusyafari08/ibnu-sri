document.addEventListener("DOMContentLoaded", function () {
    // === A. DEFINISI VARIABEL ===
    const btnBuka = document.getElementById('btn-buka-undangan');
    const opening = document.getElementById('opening-section');
    const video = document.getElementById('v-opening');
    const ayatSection = document.getElementById('ayat-section');
    const mainContent = document.getElementById('main-content');
    const btnText = document.getElementById('btn-text');
    const btnSpinner = document.getElementById('btn-spinner');

    // Variabel RSVP & Ucapan
    const rsvpForm = document.getElementById('rsvpForm');
    const inputNama = document.getElementById('inputNama');
    const wishesContainer = document.getElementById('wishesContainer');
    
    // URL Web App Google Apps Script
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzhs_x_Rnso67Nen6m5drJHzHbdd1EfFzONAt6xi3geLg_mR6qEx6cuE7QQCE8pdoxU/exec'; 

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
                element.innerHTML = "<div class='text-white fw-bold'>Acara Telah Selesai</div>";
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

    // === H. LOGIKA RSVP & UCAPAN (REAL-TIME) ===

    // 1. Fungsi Load Ucapan dari Google Sheets
    function loadWishes() {
        if (!wishesContainer) return;
        
        fetch(`${SCRIPT_URL}?action=read`)
            .then(res => res.json())
            .then(data => {
                wishesContainer.innerHTML = '';
                // Menampilkan data terbaru di atas
                data.reverse().forEach((item, index) => {
                    // Cek Balasan Admin
                    let replyHtml = item.balasan ? `
                        <div class="reply-item">
                            <div class="wish-name" style="font-size: 0.9rem;">${item.nama_admin}</div>
                            <div class="wish-date">${item.tgl_balas}</div>
                            <div class="wish-text">${item.balasan}</div>
                        </div>
                    ` : `<button class="btn-reply-link" onclick="openReplyModal('${index}', '${item.nama}')">Balas Ucapan</button>`;

                    // Template Kartu Ucapan
                    wishesContainer.innerHTML += `
                        <div class="wish-item fade-up show">
                            <div class="d-flex justify-content-between align-items-start">
                                <div class="wish-name">${item.nama}</div>
                                <span class="wish-status">${item.konfirmasi} (${item.jumlah})</span>
                            </div>
                            <div class="wish-date">${item.timestamp}</div>
                            <div class="wish-text">${item.ucapan}</div>
                            <div id="reply-box-${index}">${replyHtml}</div>
                        </div>
                    `;
                });
            })
            .catch(err => {
                wishesContainer.innerHTML = '<div class="text-center text-white-50 p-4">Belum ada ucapan.</div>';
                console.error("Gagal load ucapan:", err);
            });
    }

    // Jalankan load pertama kali
    loadWishes();

    // 2. Fungsi Kirim RSVP & Ucapan
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
                    // Kembalikan nama tamu otomatis
                    if (namaTamu) inputNama.value = decodeURIComponent(namaTamu);
                    btn.disabled = false;
                    if(btnTextRsvp) btnTextRsvp.innerText = "Kirim Ucapan";
                    
                    // Update daftar ucapan secara real-time
                    loadWishes(); 
                })
                .catch(error => {
                    alert("Gagal mengirim ucapan, silakan coba lagi.");
                    btn.disabled = false;
                    if(btnTextRsvp) btnTextRsvp.innerText = "Kirim Ucapan";
                });
        });
    }

    // 3. Fungsi Buka Modal Balas (Global)
    window.openReplyModal = function(index, name) {
        const replyIndexInput = document.getElementById('replyRowIndex');
        if(replyIndexInput) replyIndexInput.value = index;
        const modal = new bootstrap.Modal(document.getElementById('modalBalas'));
        modal.show();
    };

    // 4. Submit Balasan (Reply)
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
                    loadWishes(); // Refresh data real-time
                })
                .catch(err => {
                    alert("Gagal mengirim balasan.");
                    submitBtn.disabled = false;
                    submitBtn.innerText = "Kirim Balasan";
                });
        });
    }

}); // Penutup DOMContentLoaded