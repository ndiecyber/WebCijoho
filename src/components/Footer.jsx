import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Footer({ onOpenBooking }) {
    const navigate = useNavigate();

    const handlePesanClick = (e) => {
        e.preventDefault();
        if (onOpenBooking) {
            onOpenBooking();
        } else {
            navigate('/pesan-tiket');
        }
    };

    return (
        <footer id="contact" className="site-footer">
            {/* Fresh Tropical Top Wave Divider (White Wave smoothly connecting section above) */}
            <div className="footer-top-wave-container">
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="footer-top-wave-svg">
                    <path d="M0,0 C150,90 350,-40 500,50 C650,140 900,10 1200,40 L1200,120 L0,120 Z" fill="#0284c7"></path>
                </svg>
            </div>

            <div className="container footer-grid">
                {/* Brand Column */}
                <div className="footer-col brand-col">
                    {/* Bright White Card Backdrop for Logo so text pops out 100% crystal clear */}
                    <div 
                        className="footer-brand-card"
                        style={{
                            backgroundColor: '#ffffff',
                            padding: '10px 18px',
                            borderRadius: '20px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '12px',
                            boxShadow: '0 8px 24px rgba(2, 132, 199, 0.25)',
                            border: '2px solid #bae6fd',
                            width: 'fit-content'
                        }}
                    >
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                            <img src="assets/logo.png" alt="Waterboom Cijoho Indah Logo" className="footer-logo" style={{ height: '44px', width: 'auto' }} />
                            <div className="brand-text" style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.05' }}>
                                <span className="brand-title" style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f2942', letterSpacing: '0.5px', textTransform: 'uppercase' }}>WATERBOOM</span>
                                <span className="brand-subtitle" style={{ color: '#0284c7', fontSize: '0.92rem', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase' }}>CIJOHO INDAH</span>
                            </div>
                        </Link>
                    </div>

                    <p className="footer-about-text" style={{ color: '#ffffff', fontSize: '0.95rem', lineHeight: '1.6', fontWeight: 500, marginTop: '8px' }}>
                        Sensasi seru wahana air tropis tanpa batas untuk seluruh keluarga. Rasakan kesegaran air yang jernih, keceriaan, dan momen tak terlupakan! 🌊✨
                    </p>

                    <div className="social-links" style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                        <a href="#" aria-label="Instagram" className="social-btn"><i className="fa-brands fa-instagram"></i></a>
                        <a href="#" aria-label="Facebook" className="social-btn"><i className="fa-brands fa-facebook-f"></i></a>
                        <a href="#" aria-label="TikTok" className="social-btn"><i className="fa-brands fa-tiktok"></i></a>
                        <a href="#" aria-label="YouTube" className="social-btn"><i className="fa-brands fa-youtube"></i></a>
                    </div>
                </div>

                {/* Menu Utama Column */}
                <div className="footer-col">
                    <h3 className="footer-col-title">MENU UTAMA</h3>
                    <ul>
                        <li><Link to="/">Beranda</Link></li>
                        <li><Link to="/wahana">Wahana</Link></li>
                        <li><Link to="/galeri">Galeri</Link></li>
                        <li><Link to="/berita">Berita</Link></li>
                    </ul>
                </div>

                {/* Layanan Column */}
                <div className="footer-col">
                    <h3 className="footer-col-title">LAYANAN</h3>
                    <ul>
                        <li><Link to="/#tickets">Daftar Tiket</Link></li>
                        <li>
                            <Link to="/pesan-tiket" className="highlight-link">
                                <i className="fa-solid fa-ticket" style={{ marginRight: '6px', color: '#facc15' }}></i> Pesan Tiket Online
                            </Link>
                        </li>
                        <li><Link to="/berita">Paket Rombongan</Link></li>
                        <li><Link to="/kontak">Paket Ulang Tahun</Link></li>
                    </ul>
                </div>

                {/* Informasi Column */}
                <div className="footer-col">
                    <h3 className="footer-col-title">INFORMASI</h3>
                    <ul>
                        <li><Link to="/berita">Berita & Promo</Link></li>
                        <li><Link to="/kontak">Kontak & Lokasi</Link></li>
                        <li><Link to="/kontak">Jam Operasional</Link></li>
                    </ul>
                </div>

                {/* Ketentuan Column */}
                <div className="footer-col">
                    <h3 className="footer-col-title">KETENTUAN</h3>
                    <ul>
                        <li><Link to="/tentang-kami">Syarat & Ketentuan</Link></li>
                        <li><Link to="/tentang-kami">Peraturan Pengunjung</Link></li>
                        <li><Link to="/tentang-kami">Kebijakan Privasi</Link></li>
                    </ul>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="footer-bottom">
                <div className="container footer-bottom-container">
                    <div className="footer-location" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontWeight: 600 }}>
                        <i className="fa-solid fa-location-dot" style={{ color: '#facc15', fontSize: '1.1rem' }}></i> <span>Jl. Cijoho, Tasikmalaya, Jawa Barat, Indonesia</span>
                    </div>
                    <div className="footer-copy" style={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 600 }}>
                        &copy; 2026 Waterboom Cijoho Indah. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
}
