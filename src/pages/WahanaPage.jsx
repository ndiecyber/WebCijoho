import React from 'react';

export default function WahanaPage() {
    const wahanas = [
        {
            id: 1,
            title: '🛝 Water Slides',
            desc: 'Beragam seluncuran air seru dan aman untuk anak-anak maupun dewasa.',
            icon: 'assets/pool.png.png?v=1.1',
            bgGradient: 'linear-gradient(135deg, #052049 0%, #0d3875 100%)',
            details: [
                'Spiral Slider & Speed Slider yang menantang adrenalin.',
                'Family Racing Slider untuk meluncur bersama keluarga.',
                'Dilengkapi dengan lifeguard profesional di setiap titik seluncur.',
                'Standar keamanan internasional dengan bantalan air yang aman.'
            ],
            level: 'Tinggi s/d Sedang',
            safety: 'Tinggi minimal 110cm, gunakan pakaian renang standar.'
        },
        {
            id: 2,
            title: '🏊 Swimming Pools',
            desc: 'Kolam renang yang bersih, segar, dan nyaman untuk seluruh keluarga.',
            icon: 'assets/kolam.png.png?v=1.1',
            bgGradient: 'linear-gradient(135deg, #008a90 0%, #00747a 100%)',
            details: [
                'Kolam dewasa semi-olympic dengan air jernih dan segar.',
                'Kolam arus santai (lazy river) untuk rileks menikmati suasana.',
                'Penyaringan air modern bersertifikasi menjaga higienitas.',
                'Tersedia sewa ban pelampung single & double.'
            ],
            level: 'Semua Umur',
            safety: 'Anak-anak di bawah 12 tahun wajib dalam pengawasan orang tua.'
        },
        {
            id: 3,
            title: '🧸 Kids Waterplay',
            desc: 'Area bermain air interaktif yang aman dan menyenangkan khusus untuk anak-anak.',
            icon: 'assets/kids.png?v=1.1',
            bgGradient: 'linear-gradient(135deg, #92c83e 0%, #7eb32b 100%)',
            details: [
                'Ember tumpah raksasa yang selalu dinanti-nantikan anak-anak.',
                'Air mancur interaktif dan seluncuran mini yang sangat aman.',
                'Kedalaman kolam yang sangat dangkal (maksimal 40cm).',
                'Lingkungan bermain yang ramah dan penuh warna-warni ceria.'
            ],
            level: 'Anak-anak (Khusus)',
            safety: 'Pendampingan orang tua sangat disarankan.'
        },
        {
            id: 4,
            title: '⛱️ Gazebo & Rest Area',
            desc: 'Area gazebo yang nyaman untuk beristirahat sambil menikmati suasana tropis.',
            icon: 'assets/saung.png.png?v=1.1',
            bgGradient: 'linear-gradient(135deg, #e8f1fc 0%, #d4e5f9 100%)',
            textColor: '#052049',
            details: [
                'Gazebo kayu bernuansa tropis yang sejuk dan rindang.',
                'Ruang istirahat bersih lengkap dengan stop kontak charger.',
                'Loker penyimpanan barang berharga yang aman.',
                'Dekat dengan area foodcourt dan fasilitas toilet utama.'
            ],
            level: 'Semua Umur',
            safety: 'Jaga kebersihan area sekitar, dilarang membuang sampah sembarangan.'
        }
    ];

    return (
        <div style={{ paddingTop: '80px', backgroundColor: '#f4f8fc', minHeight: '100vh' }}>
            {/* Header Banner */}
            <div style={{ 
                background: 'linear-gradient(135deg, #052049 0%, #0d3875 100%)', 
                color: 'white', 
                padding: '60px 0', 
                textAlign: 'center' 
            }}>
                <div className="container">
                    <h1 style={{ fontSize: '2.8rem', fontWeight: 800, marginBottom: '16px', color: 'white' }}>WAHANA & ATRAKSI</h1>
                    <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
                        Jelajahi berbagai pilihan permainan air seru dan area bersantai premium yang kami rancang khusus untuk kebahagiaan Anda sekeluarga.
                    </p>
                </div>
            </div>

            {/* List of Wahanas */}
            <div className="container" style={{ padding: '60px 24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
                    {wahanas.map((wahana, index) => {
                        const isEven = index % 2 === 0;
                        const isLight = wahana.textColor === '#052049';
                        return (
                            <div 
                                key={wahana.id}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                    backgroundColor: 'white',
                                    borderRadius: '24px',
                                    boxShadow: 'var(--shadow-soft)',
                                    overflow: 'hidden',
                                    transition: 'transform 0.3s ease',
                                }}
                            >
                                {/* Graphic Card Column */}
                                <div style={{
                                    background: wahana.bgGradient,
                                    color: isLight ? '#052049' : 'white',
                                    padding: '40px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    order: isEven ? 0 : 1
                                }}>
                                    <div style={{
                                        backgroundColor: 'white',
                                        width: '100px',
                                        height: '100px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                                        marginBottom: '24px'
                                    }}>
                                        <img 
                                            src={wahana.icon} 
                                            alt={wahana.title} 
                                            style={{ width: '70%', height: '70%', objectFit: 'contain' }} 
                                        />
                                    </div>
                                    <h2 style={{ color: isLight ? '#052049' : 'white', fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px' }}>
                                        {wahana.title}
                                    </h2>
                                    <p style={{ opacity: 0.9, fontSize: '0.95rem', lineHeight: 1.5, maxWidth: '280px' }}>
                                        {wahana.desc}
                                    </p>
                                </div>

                                {/* Details Column */}
                                <div style={{ padding: '45px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '20px', color: '#052049' }}>
                                        Keunggulan & Fasilitas:
                                    </h3>
                                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
                                        {wahana.details.map((detail, idx) => (
                                            <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>
                                                <i className="fa-solid fa-circle-check" style={{ color: 'var(--color-accent)', marginTop: '4px', flexShrink: 0 }}></i>
                                                <span>{detail}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '16px', borderTop: '1px solid #e2eaf4', paddingTop: '20px' }}>
                                        <div>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tingkat Wahana</span>
                                            <p style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.95rem', marginTop: '2px' }}>{wahana.level}</p>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Panduan Keamanan</span>
                                            <p style={{ fontWeight: 600, color: '#d93838', fontSize: '0.85rem', marginTop: '2px', lineHeight: 1.3 }}>{wahana.safety}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
