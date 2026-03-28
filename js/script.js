document.addEventListener("DOMContentLoaded", function () {
    const btnBuka = document.getElementById('btn-buka-undangan');
    const hero = document.getElementById('hero-section');
    const opening = document.getElementById('opening-section');
    const video = document.getElementById('v-opening');
    const ayatSection = document.getElementById('ayat-section');

    // Ambil Nama Tamu dari URL
    const urlParams = new URLSearchParams(window.location.search);
    const namaTamu = urlParams.get('to');
    if (namaTamu) {
        document.getElementById('guest-name').innerText = decodeURIComponent(namaTamu);
    }

    if (btnBuka) {
        btnBuka.addEventListener('click', function () {
            // 1. Hilangkan Hero & Buka Akses Scroll
            hero.classList.add('fade-out');
            document.body.classList.remove('undangan-tertutup');
            document.body.classList.add('undangan-terbuka');

            // 2. Siapkan Video & Ayat
            opening.classList.remove('d-none');
            ayatSection.classList.remove('d-none');

            // 3. Putar Video
            if (video) {
                video.currentTime = 0;
                video.play();
            }

            // Hapus hero setelah 1 detik agar tidak berat
            setTimeout(() => { hero.style.display = 'none'; }, 1000);
        });
    }

    if (video) {
        video.addEventListener('ended', function () {
            // 1. Memudarkan Video fixed
            opening.classList.add('hide-video');

            // 2. Scroll ke Ayat Quran
            setTimeout(() => {
                const targetPos = ayatSection.offsetTop;
                window.scrollTo({
                    top: targetPos,
                    behavior: 'smooth'
                });
            }, 100);

            // 3. Matikan elemen video sepenuhnya setelah pudar
            setTimeout(() => { opening.style.display = 'none'; }, 1100);
        });
    }
});