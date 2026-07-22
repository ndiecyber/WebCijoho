import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Header({ onOpenBooking }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const { pathname } = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Lock body scroll when mobile nav drawer is open
    useEffect(() => {
        if (isMobileNavOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileNavOpen]);

    // Close drawer when route changes
    useEffect(() => {
        setIsMobileNavOpen(false);
    }, [pathname]);

    const navLinks = [
        { path: '/', label: 'Beranda', icon: 'fa-house' },
        { path: '/wahana', label: 'Wahana', icon: 'fa-water' },
        { path: '/galeri', label: 'Galeri', icon: 'fa-images' },
        { path: '/berita', label: 'Berita', icon: 'fa-newspaper' },
        { path: '/fasilitas', label: 'Fasilitas', icon: 'fa-umbrella-beach' },
        { path: '/tentang-kami', label: 'Tentang Kami', icon: 'fa-circle-info' },
        { path: '/kontak', label: 'Kontak', icon: 'fa-phone' }
    ];

    return (
        <>
            <header className={`navbar-header ${isScrolled ? 'scrolled' : ''}`}>
                <div className="container navbar-container">
                    {/* Hamburger Button (Tampil di Layar Mobile & Tablet <= 992px) */}
                    <button
                        className="mobile-hamburger-btn"
                        aria-label="Buka Menu Navigasi"
                        onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                        title="Menu Navigasi Mobile"
                    >
                        <i className={isMobileNavOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars"}></i>
                    </button>

                    {/* Logo & Brand */}
                    <Link to="/" className="logo-wrapper" style={{ textDecoration: 'none' }}>
                        <img src="assets/logo.png" alt="Waterboom Cijoho Indah Logo" className="brand-logo" />
                        <div className="brand-text">
                            <span className="brand-title">WATERBOOM</span>
                            <span className="brand-subtitle">CIJOHO INDAH</span>
                        </div>
                    </Link>

                    {/* Desktop Menu Navigation Links (> 992px) */}
                    <nav className="nav-menu">
                        <ul>
                            {navLinks.map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className={`nav-link ${pathname === link.path ? 'active' : ''}`}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Navbar Actions (Desktop) */}
                    <div className="nav-actions">
                        {/* Secret Hidden Portal */}
                        <button
                            type="button"
                            onClick={() => navigate('/login?role=staf')}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                width: '24px',
                                height: '24px',
                                cursor: 'default',
                                opacity: 0,
                                outline: 'none'
                            }}
                            title="Akses Staf"
                        />

                        {/* PESAN TIKET Button */}
                        <Link
                            to="/pesan-tiket"
                            className="btn btn-accent btn-pill"
                            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                            <i className="fa-solid fa-ticket"></i> PESAN TIKET
                        </Link>
                    </div>
                </div>
            </header>

            {/* Mobile Drawer Overlay Backdrop */}
            {isMobileNavOpen && (
                <div
                    className="mobile-nav-backdrop"
                    onClick={() => setIsMobileNavOpen(false)}
                />
            )}

            {/* Mobile Off-Canvas Side Drawer Navigation */}
            <aside className={`mobile-nav-drawer ${isMobileNavOpen ? 'open' : ''}`}>
                {/* Drawer Header */}
                <div className="mobile-drawer-header">
                    <div className="drawer-brand">
                        <img src="assets/logo.png" alt="Logo" className="drawer-logo" />
                        <div className="drawer-brand-text">
                            <span className="drawer-title">WATERBOOM</span>
                            <span className="drawer-subtitle">CIJOHO INDAH</span>
                        </div>
                    </div>
                    <button
                        className="drawer-close-btn"
                        onClick={() => setIsMobileNavOpen(false)}
                        aria-label="Tutup Menu"
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                {/* Drawer Menu Items */}
                <div className="mobile-drawer-body">
                    <div className="drawer-section-label">NAVIGASI UTAMA</div>
                    <ul className="drawer-menu-list">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.path;
                            return (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className={`drawer-menu-item ${isActive ? 'active' : ''}`}
                                        onClick={() => setIsMobileNavOpen(false)}
                                    >
                                        <div className="drawer-item-icon">
                                            <i className={`fa-solid ${link.icon}`}></i>
                                        </div>
                                        <span>{link.label}</span>
                                        {isActive && <i className="fa-solid fa-chevron-right drawer-active-arrow"></i>}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    {/* Drawer CTA Action */}
                    <div className="drawer-cta-section">
                        <Link
                            to="/pesan-tiket"
                            className="btn btn-accent btn-pill drawer-booking-btn"
                            onClick={() => setIsMobileNavOpen(false)}
                        >
                            <i className="fa-solid fa-ticket"></i> PESAN TIKET ONLINE
                        </Link>
                    </div>
                </div>

                {/* Drawer Footer */}
                <div className="mobile-drawer-footer">
                    <button
                        type="button"
                        className="drawer-staf-link"
                        onClick={() => {
                            setIsMobileNavOpen(false);
                            navigate('/login?role=staf');
                        }}
                    >
                        <i className="fa-solid fa-lock"></i> Portal Akses Staf / Admin
                    </button>
                </div>
            </aside>
        </>
    );
}
