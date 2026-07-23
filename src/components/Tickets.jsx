import React from 'react';
import { Link } from 'react-router-dom';

export default function Tickets({ onOpenBooking }) {
    return (
        <section id="tickets" className="tickets-section">
            <div className="container">
                <div className="section-header-center" style={{ marginBottom: '40px' }}>
                    <h5 className="section-badge-green" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <span className="badge-line" style={{ opacity: 0.6 }}>—— •</span>
                        <span>PEMBELIAN ONLINE</span>
                        <span className="badge-line" style={{ opacity: 0.6 }}>• ——</span>
                    </h5>
                    
                    <h2 className="section-title-center" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '16px', position: 'relative', margin: '8px auto', width: '100%' }}>
                        {/* Left Splash SVG */}
                        <svg width="45" height="35" viewBox="0 0 45 35" fill="#4fa5eb" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(-10deg)', opacity: 0.9 }}>
                            <path d="M 25 15 C 20 12, 12 6, 8 2 C 12 8, 14 16, 19 18 C 21 19, 23 18, 25 15" opacity="0.8"/>
                            <path d="M 35 22 C 28 20, 16 16, 6 14 C 14 19, 20 25, 26 28 C 29 29, 32 28, 35 22" opacity="1"/>
                            <path d="M 28 32 C 24 29, 18 24, 12 20 C 16 24, 18 30, 21 32 C 23 33, 26 33, 28 32" opacity="0.6"/>
                        </svg>
                        
                        <span style={{ fontWeight: 800 }}>DAFTAR TIKET</span>
                        
                        {/* Right Splash SVG */}
                        <svg width="45" height="35" viewBox="0 0 45 35" fill="#4fa5eb" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'scaleX(-1) rotate(-10deg)', opacity: 0.9 }}>
                            <path d="M 25 15 C 20 12, 12 6, 8 2 C 12 8, 14 16, 19 18 C 21 19, 23 18, 25 15" opacity="0.8"/>
                            <path d="M 35 22 C 28 20, 16 16, 6 14 C 14 19, 20 25, 26 28 C 29 29, 32 28, 35 22" opacity="1"/>
                            <path d="M 28 32 C 24 29, 18 24, 12 20 C 16 24, 18 30, 21 32 C 23 33, 26 33, 28 32" opacity="0.6"/>
                        </svg>
                    </h2>
                    
                    <p className="section-subtitle-center" style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', marginTop: '6px' }}>
                        Pilih tiket atau layanan favorit Anda
                    </p>
                </div>

                <div className="tickets-grid">
                    {/* Ticket Card 1 */}
                    <div className="ticket-card" data-ticket="reguler">
                        <div className="ticket-icon-circle bg-light-navy">
                            <i className="fa-solid fa-ticket-simple" style={{ transform: 'rotate(-25deg)' }}></i>
                        </div>
                        <h3 className="ticket-name">TIKET REGULER</h3>
                        <p className="ticket-desc-small">
                            Tiket masuk reguler<br />untuk 1 orang
                        </p>
                        <div className="ticket-divider"></div>
                        <p className="ticket-price text-navy">Rp 20.000</p>
                        <Link to="/pesan-tiket" className="btn btn-primary-dark btn-pill btn-full" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <i className="fa-solid fa-cart-shopping"></i> BELI TIKET
                        </Link>
                        
                        {/* Wave Bg at bottom */}
                        <div className="card-wave-container">
                            <svg viewBox="0 0 120 28" preserveAspectRatio="none" className="card-wave-svg">
                                <path d="M0,15 C30,5 90,25 120,15 L120,28 L0,28 Z" fill="currentColor" />
                            </svg>
                        </div>
                    </div>

                    {/* Ticket Card 2 */}
                    <div className="ticket-card" data-ticket="ban">
                        <div className="ticket-icon-circle bg-light-green">
                            <i className="fa-solid fa-life-ring"></i>
                        </div>
                        <h3 className="ticket-name">SEWA BAN</h3>
                        <p className="ticket-desc-small">
                            Sewa ban pelampung<br />untuk menambah keseruan
                        </p>
                        <div className="ticket-divider"></div>
                        <p className="ticket-price text-green">Rp 5.000</p>
                        <Link to="/pesan-tiket" className="btn btn-accent btn-pill btn-full" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <i className="fa-solid fa-cart-shopping"></i> BELI TIKET
                        </Link>
                        
                        {/* Wave Bg at bottom */}
                        <div className="card-wave-container">
                            <svg viewBox="0 0 120 28" preserveAspectRatio="none" className="card-wave-svg">
                                <path d="M0,15 C30,5 90,25 120,15 L120,28 L0,28 Z" fill="currentColor" />
                            </svg>
                        </div>
                    </div>

                    {/* Ticket Card 3 */}
                    <div className="ticket-card" data-ticket="angsa">
                        <div className="ticket-icon-circle bg-light-teal">
                            {/* Cute swan float SVG */}
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 12c-4.42 0-8 2.24-8 5s3.58 5 8 5 8-2.24 8-5c0-1.8-1.5-3.35-3.9-4.25C15.4 12.35 14.5 12 13.5 12h-1.5zm0 1.5c3.2 0 6 1.3 6 3.5s-2.8 3.5-6 3.5-6-1.3-6-3.5 2.8-3.5 6-3.5z" />
                                <path d="M14 14.5c.3-1.2.5-3 .1-4.3-.5-1.5-1.5-2.5-1-3.7.3-.8 1.2-1.5 2.2-1.5.8 0 1.4.5 1.3 1.2-.1 1-1.1 1.7-1.3 2.8.2.8 1 1.8 1.8 2.3.8.5.9 1.4.3 2.1-.3.4-.8.7-1.4.8l-2 .3z" />
                                <path d="M17.5 6.2l1.8.8-1.8.8-.4-.8.4-.8z" />
                            </svg>
                        </div>
                        <h3 className="ticket-name">SEWA ANGSA</h3>
                        <p className="ticket-desc-small">
                            Sewa angsa air untuk<br />pengalaman tak terlupakan
                        </p>
                        <div className="ticket-divider"></div>
                        <p className="ticket-price text-teal">Rp 5.000</p>
                        <Link to="/pesan-tiket" className="btn btn-teal btn-pill btn-full" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <i className="fa-solid fa-cart-shopping"></i> BELI TIKET
                        </Link>
                        
                        {/* Wave Bg at bottom */}
                        <div className="card-wave-container">
                            <svg viewBox="0 0 120 28" preserveAspectRatio="none" className="card-wave-svg">
                                <path d="M0,15 C30,5 90,25 120,15 L120,28 L0,28 Z" fill="currentColor" />
                            </svg>
                        </div>
                    </div>

                    {/* Ticket Card 4 */}
                    <div className="ticket-card" data-ticket="gazebo">
                        <div className="ticket-icon-circle bg-light-navy">
                            <i className="fa-solid fa-store"></i>
                        </div>
                        <h3 className="ticket-name">SEWA GAZEBO</h3>
                        <p className="ticket-desc-small">
                            Sewa gazebo nyaman untuk<br />bersantai bersama keluarga
                        </p>
                        <div className="ticket-divider"></div>
                        <p className="ticket-price text-navy">Rp 20.000</p>
                        <Link to="/pesan-tiket" className="btn btn-primary-dark btn-pill btn-full" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <i className="fa-solid fa-cart-shopping"></i> BELI TIKET
                        </Link>
                        
                        {/* Wave Bg at bottom */}
                        <div className="card-wave-container">
                            <svg viewBox="0 0 120 28" preserveAspectRatio="none" className="card-wave-svg">
                                <path d="M0,15 C30,5 90,25 120,15 L120,28 L0,28 Z" fill="currentColor" />
                            </svg>
                        </div>
                    </div>

                    {/* Ticket Card 5 (Group) */}
                    <div className="ticket-card group-card">
                        <div className="ticket-icon-circle bg-light-blue" style={{ position: 'relative' }}>
                            <i className="fa-solid fa-users"></i>
                            {/* Sparkle star SVG */}
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#1a73e8" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', top: '6px', right: '2px' }}>
                                <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
                            </svg>
                        </div>
                        <h3 className="ticket-name" style={{ lineHeight: 1.2 }}>INGIN<br />ROMBONGAN?</h3>
                        <p className="ticket-desc-small">
                            Dapatkan harga spesial<br />untuk grup dan paket.
                        </p>
                        <div className="ticket-divider"></div>
                        <a href="https://wa.me/6281234567890?text=Halo%20Waterboom%20Cijoho%20Indah%2C%20saya%20tertarik%20dengan%20paket%20rombongan%20grup.%20Bisa%20berikan%20informasi%20lebih%20lanjut%20mengenai%20diskon%20dan%20ketentuannya%3F" target="_blank" rel="noreferrer" className="btn btn-outline-blue btn-pill btn-full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none', fontWeight: 700 }}>
                            HUBUNGI KAMI <i className="fa-solid fa-arrow-right-long"></i>
                        </a>
                        
                        {/* Wave Bg at bottom */}
                        <div className="card-wave-container">
                            <svg viewBox="0 0 120 28" preserveAspectRatio="none" className="card-wave-svg">
                                <path d="M0,15 C30,5 90,25 120,15 L120,28 L0,28 Z" fill="currentColor" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Bottom Banner */}
                <div className="tickets-banner">
                    <div className="banner-left">
                        <div className="banner-icon-circle">
                            <i className="fa-solid fa-bullhorn"></i>
                        </div>
                        <div className="banner-text">
                            <span className="banner-label">INFO TERBARU</span>
                            <span className="banner-divider">|</span>
                            <span className="banner-info">Nikmati promo spesial! Diskon 10% untuk pembelian tiket online.</span>
                        </div>
                    </div>
                    <Link to="/berita" className="banner-link">
                        Lihat semua berita <i className="fa-solid fa-arrow-right-long"></i>
                    </Link>
                </div>
            </div>
        </section>
    );
}
