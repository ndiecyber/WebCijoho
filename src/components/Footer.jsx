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
            {/* Organic Fluid Water Wave Mask Top Divider (True Wave Shape at Top Edge) */}
            <div className="footer-top-wave-container">
                <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="footer-top-wave-svg">
                    {/* Layer 1: Translucent Blue Wave Accent */}
                    <path 
                        d="M0,0 L1440,0 L1440,55 C1300,95 1150,100 980,68 C810,36 670,88 500,72 C330,56 180,98 0,48 Z" 
                        fill="rgba(56, 189, 248, 0.45)"
                    ></path>
                    {/* Layer 2: Translucent White Wave Accent */}
                    <path 
                        d="M0,0 L1440,0 L1440,38 C1260,78 1100,85 940,48 C780,12 620,72 450,52 C280,32 140,78 0,32 Z" 
                        fill="rgba(255, 255, 255, 0.6)"
                    ></path>
                    {/* Layer 3: Solid Body Background Cutout (Creates Dramatic Curved Top Border) */}
                    <path 
                        d="M0,0 L1440,0 L1440,25 C1280,65 1120,78 960,42 C800,8 640,58 480,38 C320,18 160,62 0,18 Z" 
                        fill="#f6f9fc"
                    ></path>
                </svg>
            </div>

            <div className="container footer-grid">
                {/* Brand Column */}
                <div className="footer-col brand-col">
                    {/* Bright White Card Backdrop for Logo */}
                    <div className="footer-brand-card">
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                            <img src="assets/logo.png" alt="Waterboom Cijoho Indah Logo" className="footer-logo" />
                            <div className="brand-text" style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.05' }}>
                                <span className="brand-title" style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f2942', letterSpacing: '0.5px', textTransform: 'uppercase' }}>WATERBOOM</span>
                                <span className="brand-subtitle" style={{ color: '#0284c7', fontSize: '0.88rem', fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase' }}>CIJOHO INDAH</span>
                            </div>
                        </Link>
                    </div>

                    <p className="footer-about-text">
                        Sensasi seru wahana air tropis tanpa batas untuk seluruh keluarga. Rasakan kesegaran air yang jernih, keceriaan, dan momen tak terlupakan! 🌊✨
                    </p>

                    <div className="social-links">
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
                                <i className="fa-solid fa-ticket highlight-link-icon"></i>
                                <span>Pesan Tiket Online</span>
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
                    <div className="footer-location">
                        <i className="fa-solid fa-location-dot" style={{ color: '#facc15', fontSize: '1rem', flexShrink: 0 }}></i>
                        <span>Jl. Cijoho, Tasikmalaya, Jawa Barat, Indonesia</span>
                    </div>
                    <div className="footer-copy">
                        &copy; 2026 Waterboom Cijoho Indah. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
}
