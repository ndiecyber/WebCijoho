import React, { useState, useEffect } from 'react';
import WaveDivider from './WaveDivider';

const folderPath = '/assets/drive-download-20260728T150001Z-1-001/';

const TESTIMONIALS = [
    {
        id: 1,
        quote: "Tempatnya bersih, wahananya seru, karyawan ramah, suasana tropis, dan momen tak terlupakan.",
        author: "- Rina & Keluarga (Pengunjung Bandung)",
        image: `${folderPath}WhatsApp Image 2026-05-26 at 11.13.13 (1).jpeg`
    },
    {
        id: 2,
        quote: "Kolam renang sangat bersih dan aman untuk anak-anak. Saung gazebonya sejuk, pelayanan ramah sekali!",
        author: "- Budi Santoso (Pengunjung Tasikmalaya)",
        image: `${folderPath}WhatsApp Image 2026-05-26 at 11.13.14 (1).jpeg`
    },
    {
        id: 3,
        quote: "Harga tiket sangat bersahabat, tempat parkir luas, dan anak-anak betah main air seharian. Rekomended!",
        author: "- Maya Indriani (Pengunjung Garut)",
        image: `${folderPath}WhatsApp Image 2026-05-26 at 11.13.16 (1).jpeg`
    }
];

export default function Testimonial() {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-slide every 5 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
        }, 5000);

        return () => clearInterval(timer);
    }, []);

    const currentSlide = TESTIMONIALS[currentIndex];

    return (
        <section id="testimonial" className="testimonial-section" style={{ paddingTop: '50px', paddingBottom: '55px', position: 'relative', overflow: 'hidden' }}>
            <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                {/* Section Header */}
                <div className="section-header-center" style={{ marginBottom: '36px', textAlign: 'center' }}>
                    <h5 className="section-badge-green" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span className="badge-line" style={{ opacity: 0.6 }}>—— •</span>
                        <i className="fa-solid fa-comments" style={{ color: 'var(--color-accent, #7cc04b)', fontSize: '0.9rem' }}></i>
                        <span>ULASAN & TESTIMONIAL</span>
                        <span className="badge-line" style={{ opacity: 0.6 }}>• ——</span>
                    </h5>
                    
                    <h2 className="section-title-center" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary, #0c294a)', margin: '4px 0 12px 0', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
                        PENGALAMAN SERU PENGUNJUNG KAMI
                    </h2>
                    
                    <WaveDivider type="accent" />
                </div>

                <div className="testimonial-card" style={{ position: 'relative', overflow: 'hidden' }}>
                    {/* Reusable Splash Wave Background Overlay */}
                    <WaveDivider type="splash" />

                    <div className="testimonial-content">
                        {/* Quote Mark Icon "66" */}
                        <div className="testimonial-quote-icon">
                            <svg width="45" height="32" viewBox="0 0 36 26" fill="var(--color-accent)" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 13.91C0 6.27 5.41 0 13.23 0V5.15C9.72 5.15 7.65 8.03 7.65 11.23C7.65 12.05 7.97 12.57 8.78 12.57C9.81 12.57 11.83 12.05 13.54 13.7C15.34 15.45 15.65 18.33 14.53 20.81C13.27 23.59 10.12 25.13 6.97 25.13C2.88 25.13 0 21.63 0 13.91ZM19.8 13.91C19.8 6.27 25.21 0 33.03 0V5.15C29.52 5.15 27.45 8.03 27.45 11.23C27.45 12.05 27.77 12.57 28.58 12.57C29.61 12.57 31.63 12.05 33.34 13.7C35.14 15.45 35.45 18.33 34.33 20.81C33.07 23.59 29.92 25.13 26.77 25.13C22.68 25.13 19.8 21.63 19.8 13.91Z" />
                            </svg>
                        </div>

                        {/* Animated Quote Text Slider */}
                        <div key={currentSlide.id} className="testimonial-text-slide" style={{ minHeight: '140px', transition: 'all 0.4s ease-in-out' }}>
                            <blockquote className="testimonial-quote-text" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0c294a', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                                "{currentSlide.quote}"
                            </blockquote>

                            <div className="testimonial-line"></div>

                            <cite className="testimonial-quote-author" style={{ color: '#558b2f', fontWeight: 700, fontStyle: 'italic', display: 'block', marginBottom: '20px' }}>
                                {currentSlide.author}
                            </cite>
                        </div>

                        {/* Interactive Pagination Dots */}
                        <div className="testimonial-pagination" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {TESTIMONIALS.map((item, idx) => (
                                <button
                                    key={item.id}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`dot ${idx === currentIndex ? 'active' : ''}`}
                                    aria-label={`Go to slide ${idx + 1}`}
                                    style={{
                                        border: 'none',
                                        cursor: 'pointer',
                                        height: '8px',
                                        width: idx === currentIndex ? '24px' : '8px',
                                        borderRadius: '4px',
                                        backgroundColor: idx === currentIndex ? 'var(--color-accent, #7cc04b)' : '#cbd5e1',
                                        transition: 'all 0.3s ease'
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Reusable Smooth Curve Divider */}
                    <WaveDivider type="curve" />

                    <div className="testimonial-image-area">
                        <div 
                            className="testimonial-image" 
                            style={{ 
                                backgroundImage: `url('${currentSlide.image}')`,
                                transition: 'background-image 0.5s ease-in-out'
                            }}
                        ></div>
                    </div>
                </div>
            </div>
        </section>
    );
}
