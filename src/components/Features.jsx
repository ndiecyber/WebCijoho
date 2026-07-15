import React from 'react';

export default function Features() {
    return (
        <section id="features" className="floating-features-section">
            <div className="container">
                <div className="features-bar">
                    {/* Feature 1 */}
                    <div className="feature-item">
                        <div className="feature-icon-wrapper">
                            <img src="assets/pool.png.png" alt="Water Slides Icon" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                        </div>
                        <div className="feature-info">
                            <h3>
                                <img src="assets/pool.png.png" alt="" style={{ width: '20px', height: '20px', marginRight: '8px', verticalAlign: 'middle', objectFit: 'contain' }} />
                                Water Slides
                            </h3>
                            <p>Exciting water slides for all ages.</p>
                        </div>
                    </div>
                    
                    {/* Feature 2 */}
                    <div className="feature-item">
                        <div className="feature-icon-wrapper">
                            <img src="assets/saung.png.png" alt="Gazebo & Rest Area Icon" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                        </div>
                        <div className="feature-info">
                            <h3>
                                <img src="assets/saung.png.png" alt="" style={{ width: '20px', height: '20px', marginRight: '8px', verticalAlign: 'middle', objectFit: 'contain' }} />
                                Gazebo & Rest Area
                            </h3>
                            <p>Relax in our comfortable gazebos while enjoying the tropical atmosphere.</p>
                        </div>
                    </div>
                    
                    {/* Feature 3 */}
                    <div className="feature-item">
                        <div className="feature-icon-wrapper">
                            <img src="assets/kolam.png.png" alt="Swimming Pools Icon" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                        </div>
                        <div className="feature-info">
                            <h3>
                                <img src="assets/kolam.png.png" alt="" style={{ width: '20px', height: '20px', marginRight: '8px', verticalAlign: 'middle', objectFit: 'contain' }} />
                                Swimming Pools
                            </h3>
                            <p>Clean and refreshing pools designed for kids and adults.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
