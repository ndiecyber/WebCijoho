import React from 'react';
import { Link } from 'react-router-dom';
import WaveDivider from './WaveDivider';

export default function Gallery() {
    const folderPath = '/assets/drive-download-20260728T150001Z-1-001/';

    const galleryItems = [
        {
            id: 1,
            image: `${folderPath}WhatsApp Image 2026-05-26 at 11.13.13 (1).jpeg`,
            icon: 'fa-solid fa-person-swimming',
            title: 'KOLAM RENANG UTAMA',
            desc: 'Kolam renang luas dengan air yang jernih, sejuk, dan asri.'
        },
        {
            id: 2,
            image: `${folderPath}WhatsApp Image 2026-05-26 at 11.13.12 (1).jpeg`,
            icon: 'fa-solid fa-water',
            title: 'SELUNCURAN WATERBOOM',
            desc: 'Wahana seluncuran air seru untuk anak-anak dan keluarga.'
        },
        {
            id: 3,
            image: `${folderPath}WhatsApp Image 2026-05-26 at 11.13.14 (1).jpeg`,
            icon: 'fa-solid fa-store',
            title: 'SAUNG & GAZEBO',
            desc: 'Tempat bersantai yang nyaman dan teduh bersama keluarga.'
        },
        {
            id: 4,
            image: `${folderPath}WhatsApp Image 2026-05-26 at 11.13.16 (4).jpeg`,
            icon: 'fa-solid fa-faucet-drip',
            title: 'EMBER TUMPAH',
            desc: 'Keseruan bermain air dengan sensasi guyuran ember tumpah.'
        },
        {
            id: 5,
            image: `${folderPath}WhatsApp Image 2026-05-26 at 11.13.20 (2).jpeg`,
            icon: 'fa-solid fa-ship',
            title: 'BEBEK AIR',
            desc: 'Wahana bebek air santai mengelilingi area kolam.'
        }
    ];

    return (
        <section id="gallery" className="gallery-section" style={{ paddingTop: '0px', position: 'relative', overflow: 'hidden' }}>
            {/* Top Cheerful Tropical Cloud Canopy */}
            <WaveDivider type="gallery-cloud" />

            <div className="container">
                
                {/* Header Layout */}
                <div className="gallery-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div className="gallery-header-icon-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '52px', height: '52px', borderRadius: '14px', border: '2px solid var(--color-accent)', color: 'var(--color-accent)', fontSize: '1.4rem' }}>
                            <i className="fa-regular fa-image"></i>
                        </div>
                        <div className="gallery-header-text" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ color: 'var(--color-accent)', fontWeight: 800, fontSize: '0.82rem', letterSpacing: '1px' }}>DOKUMENTASI FOTO</span>
                            <h2 className="gallery-title" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', margin: 0, letterSpacing: '-0.5px' }}>MOMEN SERU DI WATERBOOM CIJOHO INDAH</h2>
                        </div>
                    </div>
                    <Link to="/galeri" className="gallery-all-link" style={{ color: 'var(--color-accent)', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', transition: 'var(--transition-smooth)' }}>
                        LIHAT SEMUA FOTO <i className="fa-solid fa-arrow-right-long"></i>
                    </Link>
                </div>

                {/* 5-Card Grid */}
                <div className="gallery-grid">
                    {galleryItems.map((item) => (
                        <div key={item.id} className="gallery-card" style={{ padding: 0, borderRadius: '16px', overflow: 'hidden' }}>
                            {/* Image with zoom glass */}
                            <div className="gallery-img-wrapper" style={{ width: '100%', height: '100%', aspectRatio: '4/3' }}>
                                <img src={item.image} alt="Waterboom Cijoho Indah" className="gallery-img" />
                                <div className="gallery-zoom-badge">
                                    <i className="fa-solid fa-magnifying-glass"></i>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Water Splash Divider */}
                <div className="gallery-divider-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '20px', marginBottom: '4px' }}>
                    <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ height: '1.5px', backgroundColor: '#1a73e8', flexGrow: 1, opacity: 0.3 }}></div>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#1a73e8', opacity: 0.6 }}></div>
                    </div>
                    <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#1a73e8', opacity: 0.6 }}></div>
                        <div style={{ height: '1.5px', backgroundColor: '#1a73e8', flexGrow: 1, opacity: 0.3 }}></div>
                    </div>
                </div>

            </div>
        </section>
    );
}
