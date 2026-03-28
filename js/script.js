document.addEventListener("DOMContentLoaded", function() {
    // Ambil parameter ?to= di URL
    const urlParams = new URLSearchParams(window.location.search);
    const namaTamu = urlParams.get('to');
    const guestElement = document.getElementById('guest-name');

    if (namaTamu) {
        // Tampilkan nama tamu yang sudah dibersihkan dari simbol URL
        guestElement.innerText = decodeURIComponent(namaTamu);
    } else {
        // Teks jika tidak ada nama di link
        guestElement.innerText = "Tamu Undangan";
    }
});