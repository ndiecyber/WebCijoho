import React from 'react';

export default function Features() {
    return (
        <div className="floating-features-bar">
            {/* Feature 1: Water Slides */}
            <div className="floating-feature-item">
                <div className="feature-icon-circle">
                    <img src="assets/pool.png.png?v=1.1" alt="Water Slides" className="feature-img-icon" />
                </div>
                <div className="feature-text">
                    <h3 className="feature-title">WATER SLIDES</h3>
                    <div className="feature-title-underline"></div>
                    <p className="feature-desc">Seluncuran air seru dan aman untuk anak dan dewasa.</p>
                </div>
            </div>

            {/* Feature 2: Swimming Pools */}
            <div className="floating-feature-item">
                <div className="feature-icon-circle">
                    <img src="assets/kolam.png.png?v=1.1" alt="Swimming Pools" className="feature-img-icon" />
                </div>
                <div className="feature-text">
                    <h3 className="feature-title">SWIMMING POOLS</h3>
                    <div className="feature-title-underline"></div>
                    <p className="feature-desc">Kolam renang bersih, segar, dan aman bagi keluarga.</p>
                </div>
            </div>

            {/* Feature 3: Kids Waterplay */}
            <div className="floating-feature-item">
                <div className="feature-icon-circle">
                    <img src="assets/kids.png?v=1.1" alt="Kids Waterplay" className="feature-img-icon" />
                </div>
                <div className="feature-text">
                    <h3 className="feature-title">KIDS WATERPLAY</h3>
                    <div className="feature-title-underline"></div>
                    <p className="feature-desc">Wahana bermain air interaktif yang aman bagi anak.</p>
                </div>
            </div>

            {/* Feature 4: Gazebo & Rest Area */}
            <div className="floating-feature-item">
                <div className="feature-icon-circle">
                    <img src="assets/saung.png.png?v=1.1" alt="Gazebo & Rest Area" className="feature-img-icon" />
                </div>
                <div className="feature-text">
                    <h3 className="feature-title">GAZEBO & REST AREA</h3>
                    <div className="feature-title-underline"></div>
                    <p className="feature-desc">Gazebo nyaman untuk santai menikmati suasana alam tropis.</p>
                </div>
            </div>
        </div>
    );
}
