import { Link } from 'react-router-dom';

export default function Gallery() {
    return (
        <section id="gallery" className="gallery-section">
            <div className="container">
                <div className="gallery-header">
                    <h2 className="gallery-title">MOMEN SERU DI WATERBOOM CIJOHO INDAH</h2>
                    <Link to="/galeri" className="gallery-all-link">LIHAT SEMUA <i className="fa-solid fa-arrow-right"></i></Link>
                </div>
                <div className="gallery-grid">
                    <div className="gallery-item card-hover">
                        <img src="assets/1.png?v=1.1" alt="Serunya seluncuran air" />
                    </div>
                    <div className="gallery-item card-hover">
                        <img src="assets/2.png?v=1.1" alt="Gazebo rindang" />
                    </div>
                    <div className="gallery-item card-hover">
                        <img src="assets/3.png?v=1.1" alt="Kolam utama" />
                    </div>
                    <div className="gallery-item card-hover">
                        <img src="assets/4.png?v=1.1" alt="Suasana rindang" />
                    </div>
                    <div className="gallery-item card-hover">
                        <img src="assets/5.png?v=1.1" alt="Waterboom Cijoho" />
                    </div>
                </div>
            </div>
        </section>
    );
}
