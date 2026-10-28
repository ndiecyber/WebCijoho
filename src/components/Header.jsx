import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Header({ onOpenBooking }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const [showNotif, setShowNotif] = useState(false);
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: 'Promo Tiket Hemat 🏊‍♂️',
            desc: 'Dapatkan diskon Tiket Rombongan hanya Rp 17.000/orang.',
            time: '10 menit lalu',
            read: false
        },
        {
            id: 2,
            title: 'Wahana Sepeda Air Buka 🚣',
            desc: 'Wahana Sepeda Air & Gazebo buka penuh hari ini.',
            time: '1 jam lalu',
            read: false
        },
        {
            id: 3,
            title: 'Jam Operasional Terbaru ⏰',
            desc: 'Waterboom Cijoho Indah buka setiap hari 08.00 - 17.00 WIB.',
            time: '3 jam lalu',
            read: true
        }
    ]);
    const { pathname } = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Trigger check on initial load
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
                    {/* 3-Dots Menu Button (Tampil di Layar Mobile & Tablet <= 992px) */}
                    <button
                        className="three-dots-menu-btn"
                        aria-label="Buka Menu Navigasi"
                        onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                        style={{
                            width: '36px',
                            height: '36px',
                            minWidth: '36px',
                            minHeight: '36px',
                            borderRadius: '10px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: isMobileNavOpen ? '#e2e8f0' : '#f8fafc',
                            color: '#0f2942',
                            fontSize: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            marginRight: '8px',
                            flexShrink: 0,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                            transition: 'all 0.2s ease'
                        }}
                        title="Menu Navigasi Mobile"
                    >
                        <i className={isMobileNavOpen ? "fa-solid fa-xmark" : "fa-solid fa-ellipsis-vertical"}></i>
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

                    {/* Navbar Actions (Desktop & Mobile Notif Bell) */}
                    <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Notification Bell Button */}
                        <button
                            type="button"
                            onClick={() => setShowNotif(!showNotif)}
                            style={{
                                position: 'relative',
                                background: '#f1f5f9',
                                border: '1.5px solid #cbd5e1',
                                borderRadius: '50%',
                                width: '38px',
                                height: '38px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: '1.15rem',
                                color: '#0c294a'
                            }}
                            title="Pusat Notifikasi"
                        >
                            <i className={`fa-${notifications.filter(n => !n.read).length > 0 ? 'solid' : 'regular'} fa-bell`} style={{ color: notifications.filter(n => !n.read).length > 0 ? '#2563eb' : '#64748b' }}></i>
                            {notifications.filter(n => !n.read).length > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-2px',
                                    right: '-2px',
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    fontSize: '0.62rem',
                                    fontWeight: 900,
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2px solid white'
                                }}>
                                    {notifications.filter(n => !n.read).length}
                                </span>
                            )}
                        </button>

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
            {/* Standby Fixed Header Document Spacer */}
            <div className="navbar-fixed-spacer" aria-hidden="true" />

            {/* MODAL NOTIFIKASI PUBLIC WEBSITE */}
            {showNotif && (
                <div
                    className="v-modal-backdrop fade-in"
                    onClick={() => setShowNotif(false)}
                    style={{ zIndex: 99999, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)' }}
                >
                    <div
                        className="v-modal-card slide-down"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth: '440px',
                            width: '92%',
                            borderRadius: '20px',
                            padding: 0,
                            overflow: 'hidden',
                            boxShadow: '0 20px 40px rgba(12, 41, 74, 0.35)',
                            border: '1.5px solid #cbd5e1',
                            margin: 'auto'
                        }}
                    >
                        {/* Header Modal */}
                        <div style={{ backgroundColor: '#0c294a', color: 'white', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className="fa-solid fa-bell" style={{ color: '#60a5fa', fontSize: '1.2rem' }}></i>
                                <div>
                                    <h4 style={{ margin: 0, color: 'white', fontSize: '1rem', fontWeight: 900 }}>Pusat Notifikasi</h4>
                                    <small style={{ color: '#93c5fd', fontSize: '0.74rem' }}>{notifications.filter(n => !n.read).length} pesan belum dibaca</small>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowNotif(false)}
                                style={{ background: 'rgba(255, 255, 255, 0.15)', border: 'none', color: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.1rem' }}
                            >
                                &times;
                            </button>
                        </div>

                        {/* Actions Bar */}
                        <div style={{ backgroundColor: '#f8fafc', padding: '10px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem' }}>
                            <span style={{ fontWeight: 800, color: '#64748b' }}>Pemberitahuan Wahana & Promo</span>
                            {notifications.filter(n => !n.read).length > 0 && (
                                <button
                                    onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                                    style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 800, cursor: 'pointer', padding: 0 }}
                                >
                                    <i className="fa-solid fa-check-double"></i> Tandai Dibaca
                                </button>
                            )}
                        </div>

                        {/* Notification Items List */}
                        <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '12px 16px' }}>
                            {notifications.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8' }}>
                                    <i className="fa-solid fa-bell-slash" style={{ fontSize: '2rem', marginBottom: '8px', opacity: 0.5 }}></i>
                                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem' }}>Tidak ada notifikasi saat ini</p>
                                </div>
                            ) : (
                                notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        onClick={() => setNotifications(notifications.map(item => item.id === n.id ? { ...item, read: true } : item))}
                                        style={{
                                            backgroundColor: n.read ? '#ffffff' : '#f0f9ff',
                                            border: n.read ? '1px solid #e2e8f0' : '1.5px solid #bae6fd',
                                            borderRadius: '12px',
                                            padding: '12px 14px',
                                            marginBottom: '8px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            position: 'relative'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                            <strong style={{ fontSize: '0.86rem', color: '#0f2942', fontWeight: 900 }}>{n.title}</strong>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setNotifications(notifications.filter(item => item.id !== n.id));
                                                }}
                                                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.78rem', padding: '2px 4px' }}
                                                title="Hapus Notifikasi"
                                            >
                                                <i className="fa-solid fa-trash-can"></i>
                                            </button>
                                        </div>
                                        <p style={{ margin: '0 0 6px 0', fontSize: '0.78rem', color: '#475569', lineHeight: 1.3 }}>{n.desc}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <small style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>{n.time}</small>
                                            {!n.read && (
                                                <span style={{ backgroundColor: '#2563eb', color: 'white', fontSize: '0.62rem', fontWeight: 800, padding: '2px 6px', borderRadius: '10px' }}>BARU</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer Modal */}
                        <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
                            <button
                                onClick={() => setShowNotif(false)}
                                style={{ width: '100%', backgroundColor: '#0c294a', color: 'white', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer' }}
                            >
                                Tutup Notifikasi
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                        title="Portal Login Admin & Kasir"
                        aria-label="Portal Login Admin & Kasir"
                    >
                        <i className="fa-solid fa-arrow-right-to-bracket"></i>
                    </button>
                </div>
            </aside>
        </>
    );
}
