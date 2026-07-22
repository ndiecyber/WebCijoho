import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Header({ onOpenBooking }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const navLinks = [
        { path: '/', label: 'Beranda', icon: 'fa-house' },
        { path: '/wahana', label: 'Wahana', icon: 'fa-water' },
        { path: '/galeri', label: 'Galeri', icon: 'fa-images' },
        { path: '/berita', label: 'Berita', icon: 'fa-newspaper' },
        { path: '/fasilitas', label: 'Fasilitas', icon: 'fa-umbrella-beach' },
        { path: '/tentang-kami', label: 'Tentang Kami', icon: 'fa-circle-info' },
        { path: '/kontak', label: 'Kontak', icon: 'fa-phone' }
    ];

    const handlePesanTiketClick = () => {
        setIsDropdownOpen(false);
        if (onOpenBooking) {
            onOpenBooking();
        } else {
            navigate('/pesan-tiket');
        }
    };

    return (
        <>
            <header className={`navbar-header ${isScrolled ? 'scrolled' : ''}`}>
                <div className="container navbar-container" style={{ position: 'relative' }} ref={dropdownRef}>
                    {/* 3-Dots Menu Dropdown Toggle Button (Pojok Kiri Atas di Ponsel/Tablet) */}
                    <button
                        className="three-dots-menu-btn"
                        aria-label="Menu Opsi"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        style={{
                            background: isDropdownOpen ? '#e2e8f0' : 'rgba(241, 245, 249, 0.95)',
                            border: '1px solid #cbd5e1',
                            borderRadius: '12px',
                            width: '40px',
                            height: '40px',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem',
                            color: '#0f2942',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                        }}
                        title="Menu Opsi Navigasi"
                    >
                        <i className={isDropdownOpen ? "fa-solid fa-xmark" : "fa-solid fa-ellipsis-vertical"}></i>
                    </button>

                    {/* Logo & Brand */}
                    <Link to="/" className="logo-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                        <img src="assets/logo.png" alt="Waterboom Cijoho Indah Logo" className="brand-logo" style={{ height: '42px', width: 'auto', objectFit: 'contain' }} />
                        <div className="brand-text" style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.05' }}>
                            <span className="brand-title" style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f2942', letterSpacing: '0.5px', textTransform: 'uppercase' }}>WATERBOOM</span>
                            <span className="brand-subtitle" style={{ fontSize: '0.92rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '1.5px', textTransform: 'uppercase' }}>CIJOHO INDAH</span>
                        </div>
                    </Link>

                    {/* Desktop Menu Navigation Links */}
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

                    {/* Navbar Actions (Right side) */}
                    <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Secret Hidden Portal (100% Transparan di sebelah kiri tombol PESAN TIKET) */}
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
                        />

                        {/* PESAN TIKET Button */}
                        <Link
                            to="/pesan-tiket"
                            className="btn btn-accent btn-pill"
                            onClick={() => setIsDropdownOpen(false)}
                            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                            <i className="fa-solid fa-ticket"></i> PESAN TIKET
                        </Link>
                    </div>

                    {/* Floating Menu Dropdown Panel (Popdown dari tombol titik tiga di Pojok Kiri Atas) */}
                    {isDropdownOpen && (
                        <div
                            className="three-dots-dropdown-panel fade-in"
                            style={{
                                position: 'absolute',
                                top: 'calc(100% + 10px)',
                                left: '14px',
                                width: '260px',
                                backgroundColor: '#ffffff',
                                borderRadius: '16px',
                                boxShadow: '0 20px 45px rgba(12, 41, 74, 0.25)',
                                border: '1px solid #cbd5e1',
                                overflow: 'hidden',
                                zIndex: 1000,
                                padding: '8px 0'
                            }}
                        >
                            <div style={{ padding: '10px 16px 8px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>MENU UTAMA</span>
                                <span style={{ fontSize: '0.7rem', backgroundColor: '#e0f2fe', color: '#0284c7', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>Navigasi</span>
                            </div>
                            <ul style={{ listStyle: 'none', margin: 0, padding: '4px 0' }}>
                                {/* Tombol Kembali ke Halaman Sebelumnya di dalam Titik 3 */}
                                <li style={{ borderBottom: '1px solid #f1f5f9', marginBottom: '4px', paddingBottom: '4px' }}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsDropdownOpen(false);
                                            if (window.history.length > 1 && pathname !== '/') {
                                                navigate(-1);
                                            } else {
                                                navigate('/');
                                            }
                                        }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '10px 18px',
                                            fontSize: '0.88rem',
                                            fontWeight: 800,
                                            color: '#2563eb',
                                            backgroundColor: '#eff6ff',
                                            border: 'none',
                                            width: '100%',
                                            cursor: 'pointer',
                                            textAlign: 'left'
                                        }}
                                    >
                                        <i className="fa-solid fa-arrow-left" style={{ width: '18px', textAlign: 'center', color: '#2563eb' }}></i>
                                        <span>Kembali</span>
                                    </button>
                                </li>
                                {navLinks.map((link) => (
                                    <li key={link.path}>
                                        <Link
                                            to={link.path}
                                            onClick={() => setIsDropdownOpen(false)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                padding: '10px 18px',
                                                fontSize: '0.9rem',
                                                fontWeight: pathname === link.path ? 800 : 600,
                                                color: pathname === link.path ? '#2563eb' : '#1e293b',
                                                backgroundColor: pathname === link.path ? '#eff6ff' : 'transparent',
                                                textDecoration: 'none',
                                                transition: 'all 0.15s ease'
                                            }}
                                        >
                                            <i className={`fa-solid ${link.icon}`} style={{ width: '18px', textAlign: 'center', color: pathname === link.path ? '#2563eb' : '#64748b' }}></i>
                                            <span>{link.label}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            <div style={{ borderTop: '1px solid #f1f5f9', padding: '8px 12px 4px 12px', marginTop: '4px' }}>
                                <Link
                                    to="/pesan-tiket"
                                    className="btn btn-accent btn-pill w-full"
                                    onClick={() => setIsDropdownOpen(false)}
                                    style={{ width: '100%', padding: '10px', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                >
                                    <i className="fa-solid fa-ticket"></i> PESAN TIKET ONLINE
                                </Link>
                            </div>
                            <div style={{ padding: '6px 16px', textAlign: 'center', backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9', marginTop: '6px' }}>
                                <button
                                    type="button"
                                    onClick={() => { setIsDropdownOpen(false); navigate('/login?role=staf'); }}
                                    style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    <i className="fa-solid fa-lock" style={{ marginRight: '4px' }}></i> Portal Akses Staf / Admin
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </header>
        </>
    );
}
