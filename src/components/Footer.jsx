import React from 'react';

export default function Footer() {
    const handleScrollToTop = (e, targetId) => {
        e.preventDefault();
        const target = document.getElementById(targetId);
        if (target) {
            const offsetPosition = target.offsetTop - 70;
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <footer id="contact" className="site-footer">
            <div className="container footer-grid">
                {/* Brand Column */}
                <div className="footer-col brand-col">
                    <div className="logo-wrapper">
                        <img src="/assets/logo.png" alt="Waterboom Cijoho Indah Logo" className="footer-logo" />
                        <div className="brand-text">
                            <span className="brand-title text-white">WATERBOOM</span>
                            <span className="brand-subtitle text-green">CIJOHO INDAH</span>
                        </div>
                    </div>
                    <p className="footer-about-text">
                        Sensasi seru tanpa batas untuk seluruh keluarga. Wahana permainan, suasana tropis, dan momen tak terlupakan.
                    </p>
                    <div className="social-links">
                        <a href="#" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></a>
                        <a href="#" aria-label="Facebook"><i className="fa-brands fa-facebook-f"></i></a>
                        <a href="#" aria-label="TikTok"><i className="fa-brands fa-tiktok"></i></a>
                        <a href="#" aria-label="YouTube"><i className="fa-brands fa-youtube"></i></a>
                    </div>
                </div>
                {/* Menu Utama Column */}
                <div className="footer-col">
                    <h3>MENU UTAMA</h3>
                    <ul>
                        <li><a href="#hero" onClick={(e) => handleScrollToTop(e, 'hero')}>Beranda</a></li>
                        <li><a href="#features" onClick={(e) => handleScrollToTop(e, 'features')}>Wahana</a></li>
                        <li><a href="#gallery" onClick={(e) => handleScrollToTop(e, 'gallery')}>Galeri</a></li>
                        <li><a href="#gallery" onClick={(e) => handleScrollToTop(e, 'gallery')}>Berita</a></li>
                    </ul>
                </div>
                {/* Layanan Column */}
                <div className="footer-col">
                    <h3>LAYANAN</h3>
                    <ul>
                        <li><a href="#tickets" onClick={(e) => handleScrollToTop(e, 'tickets')}>Daftar Tiket</a></li>
                        <li><a href="#tickets" onClick={(e) => handleScrollToTop(e, 'tickets')}>Pesan Tiket Online</a></li>
                        <li><a href="#tickets" onClick={(e) => handleScrollToTop(e, 'tickets')}>Paket Rombongan</a></li>
                        <li><a href="#tickets" onClick={(e) => handleScrollToTop(e, 'tickets')}>Paket Ulang Tahun</a></li>
                    </ul>
                </div>
                {/* Informasi Column */}
                <div className="footer-col">
                    <h3>INFORMASI</h3>
                    <ul>
                        <li><a href="#gallery" onClick={(e) => handleScrollToTop(e, 'gallery')}>Berita & Promo</a></li>
                        <li><a href="#contact" onClick={(e) => handleScrollToTop(e, 'contact')}>Kontak & Lokasi</a></li>
                        <li><a href="#features" onClick={(e) => handleScrollToTop(e, 'features')}>Jam Operasional</a></li>
                    </ul>
                </div>
                {/* Ketentuan Column */}
                <div className="footer-col">
                    <h3>KETENTUAN</h3>
                    <ul>
                        <li><a href="#hero" onClick={(e) => handleScrollToTop(e, 'hero')}>Syarat & Ketentuan</a></li>
                        <li><a href="#hero" onClick={(e) => handleScrollToTop(e, 'hero')}>Peraturan Pengunjung</a></li>
                        <li><a href="#hero" onClick={(e) => handleScrollToTop(e, 'hero')}>Kebijakan Privasi</a></li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom">
                <div className="container footer-bottom-container">
                    <div className="footer-location">
                        <i className="fa-solid fa-location-dot text-green"></i> <span>Jl. Cijoho, Tasikmalaya, Jawa Barat, Indonesia</span>
                    </div>
                    <div className="footer-copy">
                        &copy; 2026 Waterboom Cijoho Indah. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
}
