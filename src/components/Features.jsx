import React from 'react';

export default function Features() {
    return (
        <section id="features" className="floating-features-section">
            <div className="container">
                <div className="features-bar">
                    {/* Feature 1: Water Slides */}
                    <div className="feature-item">
                        <div className="feature-icon-wrapper">
                            <img src="assets/pool.png.png" alt="Water Slides Icon" style={{ width: '85%', height: '85%', objectFit: 'contain', display: 'block' }} />
                        </div>
                        <div className="feature-info">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
                                <span style={{ fontSize: '1.2em' }}>🛝</span>
                                Water Slides
                            </h3>
                            <p>Beragam seluncuran air seru dan aman untuk anak-anak maupun dewasa.</p>
                        </div>
                    </div>
                    
                    {/* Feature 2: Swimming Pools */}
                    <div className="feature-item">
                        <div className="feature-icon-wrapper">
                            <img src="assets/kolam.png.png" alt="Swimming Pools Icon" style={{ width: '85%', height: '85%', objectFit: 'contain', display: 'block' }} />
                        </div>
                        <div className="feature-info">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
                                <span style={{ fontSize: '1.2em' }}>🏊</span>
                                Swimming Pools
                            </h3>
                            <p>Kolam renang yang bersih, segar, dan nyaman untuk seluruh keluarga.</p>
                        </div>
                    </div>
                    
                    {/* Feature 3: Kids Waterplay */}
                    <div className="feature-item">
                        <div className="feature-icon-wrapper">
                            <img src="assets/kids.png" alt="Kids Waterplay Icon" style={{ width: '85%', height: '85%', objectFit: 'contain', display: 'block' }} />
                        </div>
                        <div className="feature-info">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
                                <span style={{ fontSize: '1.2em' }}>🧸</span>
                                Kids Waterplay
                            </h3>
                            <p>Area bermain air interaktif yang aman dan menyenangkan khusus untuk anak-anak.</p>
                        </div>
                    </div>

                    {/* Feature 4: Gazebo & Rest Area */}
                    <div className="feature-item">
                        <div className="feature-icon-wrapper">
                            <img src="assets/saung.png.png" alt="Gazebo & Rest Area Icon" style={{ width: '85%', height: '85%', objectFit: 'contain', display: 'block' }} />
                        </div>
                        <div className="feature-info">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
                                <span style={{ fontSize: '1.2em' }}>⛱️</span>
                                Gazebo & Rest Area
                            </h3>
                            <p>Area gazebo yang nyaman untuk beristirahat sambil menikmati suasana tropis.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
