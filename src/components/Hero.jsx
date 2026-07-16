import React from 'react';

export default function Hero({ onOpenBooking }) {
    const handleScrollToAbout = (e) => {
        e.preventDefault();
        const target = document.getElementById('about');
        if (target) {
            const offsetPosition = target.offsetTop - 70;
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section id="hero" className="hero-section">
            <div className="container hero-container">
                <div className="hero-content">
                    <h5 className="hero-badge">SELAMAT DATANG DI WATERBOOM CIJOHO</h5>
                    <h1 className="hero-title">
                        SENSASI SERU<br />
                        <span className="highlight-green">TANPA BATAS</span><br />
                        DIMULAI DI SINI!
                    </h1>
                    <p className="hero-desc">
                        Nikmati momen liburan bersama keluarga di kolam renang yang nyaman dan menyenangkan. Wahana seru untuk semua usia, bersantai, dan berpetualang!
                    </p>
                    <div className="hero-cta">
                        <button className="btn btn-accent btn-arrow" onClick={() => onOpenBooking()}>
                            BELI TIKET <span className="btn-icon-circle"><i className="fa-solid fa-arrow-right"></i></span>
                        </button>
                        <a href="#about" onClick={handleScrollToAbout} className="btn btn-outline">TENTANG KAMI</a>
                    </div>
                </div>
            </div>
            <div className="hero-media">
                <img src="assets/dash.jpeg?v=1.1" alt="Waterboom Cijoho Indah Main Attraction" className="hero-img" />
            </div>
        </section>
    );
}
