import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer({ onOpenBooking }) {
    return (
        <footer id="contact" className="site-footer">
            <div className="container footer-grid">
                {/* Brand Column */}
                <div className="footer-col brand-col">
                    <div className="logo-wrapper">
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img src="assets/logo.png" alt="Waterboom Cijoho Indah Logo" className="footer-logo" />
                            <div className="brand-text">
                                <span className="brand-title text-white">WATERBOOM</span>
                                <span className="brand-subtitle text-green">CIJOHO INDAH</span>
                            </div>
                        </Link>
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
                        <li><Link to="/">Beranda</Link></li>
                        <li><Link to="/wahana">Wahana</Link></li>
                        <li><Link to="/galeri">Galeri</Link></li>
                        <li><Link to="/berita">Berita</Link></li>
                    </ul>
                </div>
                {/* Layanan Column */}
                <div className="footer-col">
                    <h3>LAYANAN</h3>
                    <ul>
                        <li><Link to="/#tickets">Daftar Tiket</Link></li>
                        <li>
                            <a 
                                href="#" 
                                onClick={(e) => { 
                                    e.preventDefault(); 
                                    onOpenBooking(); 
                                }}
                            >
                                Pesan Tiket Online
                            </a>
                        </li>
                        <li><Link to="/berita">Paket Rombongan</Link></li>
                        <li><Link to="/kontak">Paket Ulang Tahun</Link></li>
                    </ul>
                </div>
                {/* Informasi Column */}
                <div className="footer-col">
                    <h3>INFORMASI</h3>
                    <ul>
                        <li><Link to="/berita">Berita & Promo</Link></li>
                        <li><Link to="/kontak">Kontak & Lokasi</Link></li>
                        <li><Link to="/kontak">Jam Operasional</Link></li>
                    </ul>
                </div>
                {/* Ketentuan Column */}
                <div className="footer-col">
                    <h3>KETENTUAN</h3>
                    <ul>
                        <li><Link to="/tentang-kami">Syarat & Ketentuan</Link></li>
                        <li><Link to="/tentang-kami">Peraturan Pengunjung</Link></li>
                        <li><Link to="/tentang-kami">Kebijakan Privasi</Link></li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom">
                <div className="container footer-bottom-container">
                    <div className="footer-location">
                        <i className="fa-solid fa-location-dot text-green"></i> <span>Jl. Cijoho, Tasikmalaya, Jawa Barat, Indonesia</span>
                    </div>
                    <div className="footer-copy">
                        &copy; 2024 Waterboom Cijoho Indah. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
}
