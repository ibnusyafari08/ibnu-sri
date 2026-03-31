document.addEventListener("DOMContentLoaded", function () {
    const btnBuka = document.getElementById('btn-buka-undangan');
    const hero = document.getElementById('hero-section');
    const opening = document.getElementById('opening-section');
    const video = document.getElementById('v-opening');
    const ayatSection = document.getElementById('ayat-section');
    const mainContent = document.getElementById('main-content');
    
    const btnText = document.getElementById('btn-text');
    const btnSpinner = document.getElementById('btn-spinner');

    // 1. Logika Nama Tamu
    const urlParams = new URLSearchParams(window.location.search);
    const namaTamu = urlParams.get('to');
    if (namaTamu) {
        const guestElement = document.getElementById('guest-name');
        if (guestElement) {
            guestElement.innerText = decodeURIComponent(namaTamu);
        }
    }

    // 2. Klik Buka Undangan
    if (btnBuka) {
        btnBuka.addEventListener('click', function () {
            if (btnSpinner) btnSpinner.style.display = "inline-block"; 
            if (btnText) btnText.innerText = "Membuka Undangan...";
            this.style.pointerEvents = "none"; 

            // Aktifkan scroll agar browser bisa pindah section
            document.body.classList.remove('undangan-tertutup');
            document.body.classList.add('undangan-terbuka');

            setTimeout(() => {
                // Munculkan kontainer video & konten utama (siapkan di DOM)
                if (opening) opening.classList.remove('d-none');
                if (mainContent) mainContent.classList.remove('d-none');

                // Jalankan Video
                if (video) {
                    video.muted = false;
                    video.currentTime = 0;
                    video.loop = false; 
                    video.play().catch(() => {
                        video.muted = true;
                        video.play();
                    });
                }

                // Smooth Scroll ke Video (Opening Section)
                if (opening) {
                    opening.scrollIntoView({ behavior: 'smooth' });
                }
                
                // Reset tombol setelah transisi
                setTimeout(() => {
                    if (btnSpinner) btnSpinner.style.display = "none";
                    if (btnText) btnText.innerText = "Buka Undangan";
                    this.style.pointerEvents = "auto";
                }, 1000);

            }, 800); 
        });
    }

    // 3. Logika Saat Video Selesai (Scroll Otomatis ke Quran)
    if (video) {
        video.addEventListener('ended', function () {
            // Pastikan opening tidak fixed agar bisa di-scroll ke atas (ke Hero)
            if (opening) {
                opening.style.position = 'relative';
                opening.style.zIndex = '1';
            }

            // Auto Smooth Scroll ke Quran (Ayat Section)
            setTimeout(() => {
                if (ayatSection) {
                    const targetPosition = ayatSection.getBoundingClientRect().top + window.pageYOffset;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }, 100); 
        });
    }
});