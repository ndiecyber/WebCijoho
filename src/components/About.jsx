import React, { useState, useEffect, useRef } from 'react';

export default function About({ onOpenBooking }) {
    const [count, setCount] = useState(0);
    const containerRef = useRef(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            const [entry] = entries;
            if (entry.isIntersecting && !hasAnimated.current) {
                hasAnimated.current = true;
                let start = 0;
                const end = 12;
                const duration = 1500; // 1.5s
                const stepTime = Math.abs(Math.floor(duration / end));
                
                const timer = setInterval(() => {
                    start += 1;
                    setCount(start);
                    if (start >= end) {
                        clearInterval(timer);
                    }
                }, stepTime);
            }
        }, { threshold: 0.3 });

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            if (containerRef.current) {
                observer.unobserve(containerRef.current);
            }
        };
    }, []);

    return (
        <section id="about" className="about-section" ref={containerRef}>
            <div className="container about-container">
                <div className="about-media">
                    <div className="about-img-wrapper">
                        <img src="assets/about.png" alt="Swimming pool in Cijoho Indah" className="about-img" />
                        <div className="experience-badge animate-float">
                            <span className="exp-number">{count}</span>
                            <span className="exp-plus">+</span>
                            <span className="exp-text">TAHUN<br />PENGALAMAN</span>
                        </div>
                    </div>
                </div>
                <div className="about-content">
                    <h5 className="section-badge-green">TENTANG WATERBOOM CIJOHO INDAH</h5>
                    <h2 className="section-title">
                        LEPASKAN PENAT,<br />
                        NIKMATI <span className="highlight-green">HARIMU.</span>
                    </h2>
                    <p className="section-desc">
                        Kami menyediakan pengalaman luar biasa sekaligus petualangan yang aman untuk seluruh keluarga. Aktivitas aktif maupun santai tersedia, dengan staf profesional menjaga setiap wahana.
                    </p>
                    <div className="about-grid">
                        <div className="about-grid-item">
                            <span className="grid-icon"><i className="fa-solid fa-shield-halved"></i></span>
                            <span className="grid-text">Safety terjaga di setiap kolam</span>
                        </div>
                        <div className="about-grid-item">
                            <span className="grid-icon"><i className="fa-solid fa-lock"></i></span>
                            <span className="grid-text">Loker, loker, dan toilet nyaman & bersih</span>
                        </div>
                        <div className="about-grid-item">
                            <span className="grid-icon"><i className="fa-solid fa-life-ring"></i></span>
                            <span className="grid-text">Lifeguard profesional dan ramah</span>
                        </div>
                        <div className="about-grid-item">
                            <span className="grid-icon"><i className="fa-solid fa-users"></i></span>
                            <span className="grid-text">Tiket grup & paket ulang tahun</span>
                        </div>
                    </div>
                    <button className="btn btn-accent btn-arrow" onClick={() => onOpenBooking()}>
                        LAYANAN KAMI <i className="fa-solid fa-arrow-right-long"></i>
                    </button>
                </div>
            </div>
        </section>
    );
}
