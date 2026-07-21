import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Header({ onOpenBooking }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [showNotif, setShowNotif] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
    const { pathname } = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 1024);
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const navLinks = [
        { path: '/', label: 'Beranda' },
        { path: '/wahana', label: 'Wahana' },
        { path: '/galeri', label: 'Galeri' },
        { path: '/berita', label: 'Berita' },
        { path: '/fasilitas', label: 'Fasilitas' },
        { path: '/tentang-kami', label: 'Tentang Kami' },
        { path: '/kontak', label: 'Kontak' }
    ];

    if (isMobile) {
        if (pathname === '/') {
            return null; // Handled by MobileAppView directly
        }
        return (
            <>
                <header className="mobile-app-header">
                    <button className="header-icon-btn" onClick={() => setIsDrawerOpen(true)}>
                        <i className="fa-solid fa-bars"></i>
                    </button>
                    <div className="header-logo-container">
                        <img src="assets/logo.png" alt="Waterboom Logo" className="app-logo-img" />
                        <div className="app-logo-text">
                            <span className="app-title">WATERBOOM</span>
                            <span className="app-subtitle">CIJOHO INDAH</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                        <button className="header-icon-btn notif-bell" onClick={() => setShowNotif(!showNotif)}>
                            <i className="fa-regular fa-bell"></i>
                            <span className="bell-badge"></span>
                        </button>
                        <Link to="/?tab=profil" className="header-avatar-btn">
                            <img src="assets/bebek.png?v=1.1" alt="Avatar" className="app-avatar-img" />
                        </Link>
                    </div>
                </header>

                {showNotif && (
                    <div className="notif-dropdown">
                        <div className="notif-header">
                            <h4>Notifikasi</h4>
                            <button onClick={() => setShowNotif(false)}>&times;</button>
                        </div>
                        <div className="notif-list">
                            <div className="notif-item unread">
                                <i className="fa-solid fa-gift text-accent"></i>
                                <div>
                                    <p><strong>Diskon Rombongan 25%</strong></p>
                                    <small>Nikmati potongan harga rombongan sekolah!</small>
                                </div>
                            </div>
                            <div className="notif-item">
                                <i className="fa-solid fa-circle-check text-green"></i>
                                <div>
                                    <p><strong>Wahana Kids Waterplay Dibuka!</strong></p>
                                    <small>Nikmati keseruan ember tumpah terbaru.</small>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mobile Navigation Drawer */}
                <div className={`mobile-drawer ${isDrawerOpen ? 'active' : ''}`}>
                    <button className="mobile-drawer-close" onClick={() => setIsDrawerOpen(false)}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                    <ul className="mobile-drawer-links">
                        {navLinks.map((link) => (
                            <li key={link.path}>
                                <Link 
                                    to={link.path} 
                                    onClick={() => setIsDrawerOpen(false)} 
                                    className={`drawer-link ${pathname === link.path ? 'active' : ''}`}
                                    style={{ color: pathname === link.path ? 'var(--color-primary)' : 'inherit' }}
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                        <li>
                            <button className="btn btn-accent btn-pill w-full" onClick={() => { setIsDrawerOpen(false); onOpenBooking(); }}>
                                <i className="fa-solid fa-ticket"></i> PESAN TIKET
                            </button>
                        </li>
                    </ul>
                </div>
            </>
        );
    }

    return (
        <>
            <header className={`navbar-header ${isScrolled ? 'scrolled' : ''}`}>
                <div className="container navbar-container">
                    <Link to="/" className="logo-wrapper">
                        <img src="assets/logo.png" alt="Waterboom Cijoho Indah Logo" className="brand-logo" />
                        <div className="brand-text">
                            <span className="brand-title">WATERBOOM</span>
                            <span className="brand-subtitle">CIJOHO INDAH</span>
                        </div>
                    </Link>

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

                    <div className="nav-actions">
                        <Link to="/login" className="btn-portal-staf" style={{ marginRight: '10px' }}>
                            <i className="fa-solid fa-user-lock"></i> Portal Staf
                        </Link>
                        <button className="btn btn-accent btn-pill" onClick={() => onOpenBooking()}>
                            <i className="fa-solid fa-ticket"></i> PESAN TIKET
                        </button>
                    </div>

                    <button className="mobile-nav-toggle" aria-label="Toggle navigation" onClick={() => setIsDrawerOpen(true)}>
                        <i className="fa-solid fa-bars"></i>
                    </button>
                </div>
            </header>

            {/* Mobile Navigation Drawer */}
            <div className={`mobile-drawer ${isDrawerOpen ? 'active' : ''}`}>
                <button className="mobile-drawer-close" onClick={() => setIsDrawerOpen(false)}>
                    <i className="fa-solid fa-xmark"></i>
                </button>
                <ul className="mobile-drawer-links">
                    {navLinks.map((link) => (
                        <li key={link.path}>
                            <Link 
                                to={link.path} 
                                onClick={() => setIsDrawerOpen(false)} 
                                className={`drawer-link ${pathname === link.path ? 'active' : ''}`}
                                style={{ color: pathname === link.path ? 'var(--color-primary)' : 'inherit' }}
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                    <li>
                        <button className="btn btn-accent btn-pill w-full" onClick={() => { setIsDrawerOpen(false); onOpenBooking(); }}>
                            <i className="fa-solid fa-ticket"></i> PESAN TIKET
                        </button>
                    </li>
                    <li style={{ marginTop: '10px' }}>
                        <Link to="/login" onClick={() => setIsDrawerOpen(false)} className="btn btn-outline-blue btn-pill w-full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none', fontWeight: 700 }}>
                            <i className="fa-solid fa-user-lock"></i> PORTAL STAF
                        </Link>
                    </li>
                </ul>
            </div>
        </>
    );
}
