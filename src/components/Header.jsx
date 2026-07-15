import React, { useState, useEffect } from 'react';

export default function Header({ onOpenBooking }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('hero');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);

            // Active section logic
            const sections = ['hero', 'features', 'gallery', 'about', 'tickets', 'contact'];
            let current = 'hero';

            for (const sectionId of sections) {
                const el = document.getElementById(sectionId);
                if (el) {
                    const top = el.offsetTop - 120;
                    const height = el.clientHeight;
                    if (window.scrollY >= top && window.scrollY < top + height) {
                        current = sectionId;
                    }
                }
            }
            setActiveSection(current);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLinkClick = (e, targetId) => {
        e.preventDefault();
        setIsDrawerOpen(false);
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
        <>
            <header className={`navbar-header ${isScrolled ? 'scrolled' : ''}`}>
                <div className="container navbar-container">
                    <div className="logo-wrapper">
                        <img src="/assets/logo.png" alt="Waterboom Cijoho Indah Logo" className="brand-logo" />
                        <div className="brand-text">
                            <span className="brand-title">WATERBOOM</span>
                            <span className="brand-subtitle">CIJOHO INDAH</span>
                        </div>
                    </div>

                    <nav className="nav-menu">
                        <ul>
                            <li>
                                <a
                                    href="#hero"
                                    onClick={(e) => handleLinkClick(e, 'hero')}
                                    className={`nav-link ${activeSection === 'hero' ? 'active' : ''}`}
                                >
                                    Beranda
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#features"
                                    onClick={(e) => handleLinkClick(e, 'features')}
                                    className={`nav-link ${activeSection === 'features' ? 'active' : ''}`}
                                >
                                    Wahana
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#gallery"
                                    onClick={(e) => handleLinkClick(e, 'gallery')}
                                    className={`nav-link ${activeSection === 'gallery' ? 'active' : ''}`}
                                >
                                    Galeri
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#gallery"
                                    onClick={(e) => handleLinkClick(e, 'gallery')}
                                    className="nav-link"
                                >
                                    Berita
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#features"
                                    onClick={(e) => handleLinkClick(e, 'features')}
                                    className="nav-link"
                                >
                                    Fasilitas
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#about"
                                    onClick={(e) => handleLinkClick(e, 'about')}
                                    className={`nav-link ${activeSection === 'about' ? 'active' : ''}`}
                                >
                                    Tentang Kami
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#contact"
                                    onClick={(e) => handleLinkClick(e, 'contact')}
                                    className={`nav-link ${activeSection === 'contact' ? 'active' : ''}`}
                                >
                                    Kontak
                                </a>
                            </li>
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
            <div class={`mobile-drawer ${isDrawerOpen ? 'active' : ''}`}>
                <button className="mobile-drawer-close" onClick={() => setIsDrawerOpen(false)}>
                    <i className="fa-solid fa-xmark"></i>
                </button>
                <ul className="mobile-drawer-links">
                    <li><a href="#hero" onClick={(e) => handleLinkClick(e, 'hero')} className="drawer-link">Beranda</a></li>
                    <li><a href="#features" onClick={(e) => handleLinkClick(e, 'features')} className="drawer-link">Wahana</a></li>
                    <li><a href="#gallery" onClick={(e) => handleLinkClick(e, 'gallery')} className="drawer-link">Galeri</a></li>
                    <li><a href="#gallery" onClick={(e) => handleLinkClick(e, 'gallery')} className="drawer-link">Berita</a></li>
                    <li><a href="#features" onClick={(e) => handleLinkClick(e, 'features')} className="drawer-link">Fasilitas</a></li>
                    <li><a href="#about" onClick={(e) => handleLinkClick(e, 'about')} className="drawer-link">Tentang Kami</a></li>
                    <li><a href="#contact" onClick={(e) => handleLinkClick(e, 'contact')} className="drawer-link">Kontak</a></li>
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
