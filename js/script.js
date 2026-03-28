document.addEventListener("DOMContentLoaded", function () {
    const btnBuka = document.getElementById('btn-buka-undangan');
    const hero = document.getElementById('hero-section');
    const opening = document.getElementById('opening-section');
    const video = document.getElementById('v-opening');
    const ayatSection = document.getElementById('ayat-section');
    const mempelaiSection = document.getElementById('mempelai-section');
    const mainContent = document.getElementById('main-content');
    
    // Elemen tambahan untuk animasi tombol
    const btnText = document.getElementById('btn-text');

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
            // --- TAMBAHAN: Animasi Loading & Ganti Teks ---
            this.classList.add('loading'); // Memunculkan spinner (dari CSS)
            if (btnText) btnText.innerText = "Membuka Undangan";
            this.style.pointerEvents = "none"; // Mencegah klik ganda

            // Beri delay singkat (misal 1 detik) agar animasi loading terlihat oleh user
            setTimeout(() => {
                
                // Munculkan video container
                if (opening) {
                    opening.classList.remove('d-none');
                }

                // Jalankan Video dengan handling Autoplay
                if (video) {
                    video.muted = false;
                    video.currentTime = 0;
                    const playPromise = video.play();

                    if (playPromise !== undefined) {
                        playPromise.catch(error => {
                            console.log("Autoplay dengan suara diblokir, memutar tanpa suara.");
                            video.muted = true;
                            video.play();
                        });
                    }
                }

                // Animasi Hero menghilang
                if (hero) {
                    hero.classList.add('fade-out');
                    setTimeout(() => { 
                        hero.style.display = 'none'; 
                    }, 1000);
                }
                
            }, 1000); // Delay 1 detik sebelum transisi dimulai
        });
    }

    // 3. Logika Saat Video Selesai
    if (video) {
        video.addEventListener('ended', function () {
            // Munculkan konten utama (Ayat & Mempelai)
            if (mainContent) mainContent.classList.remove('d-none');
            if (ayatSection) ayatSection.classList.remove('d-none');
            if (mempelaiSection) mempelaiSection.classList.remove('d-none');

            // Aktifkan scroll pada body
            document.body.classList.remove('undangan-tertutup');
            document.body.classList.add('undangan-terbuka');

            // Beri efek pudar pada video container
            if (opening) {
                opening.classList.add('hide-video');
                
                // Scroll halus ke arah Ayat
                setTimeout(() => {
                    if (ayatSection) {
                        ayatSection.scrollIntoView({ 
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }, 400);

                // Hapus elemen video sepenuhnya setelah benar-benar pudar
                setTimeout(() => { 
                    opening.style.display = 'none'; 
                }, 1400);
            }
        });
    }
});