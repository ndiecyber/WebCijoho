import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Header({ onOpenBooking }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const { pathname } = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
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
                        <button className="btn btn-primary-dark btn-pill" onClick={() => onOpenBooking()}>
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
                        <button className="btn btn-primary-dark btn-pill w-full" onClick={() => { setIsDrawerOpen(false); onOpenBooking(); }}>
                            <i className="fa-solid fa-ticket"></i> PESAN TIKET
                        </button>
                    </li>
                </ul>
            </div>
        </>
    );
}
