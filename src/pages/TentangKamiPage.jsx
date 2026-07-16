import React from 'react';

export default function TentangKamiPage() {
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
                    <h1 style={{ fontSize: '2.8rem', fontWeight: 800, marginBottom: '16px', color: 'white' }}>TENTANG KAMI</h1>
                    <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
                        Mengenal lebih dekat visi, misi, komitmen keselamatan, dan perjalanan kami mendampingi keceriaan liburan Anda.
                    </p>
                </div>
            </div>

            {/* Core Info Section */}
            <div className="container" style={{ padding: '60px 24px 80px 24px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '40px',
                    alignItems: 'center',
                    marginBottom: '60px'
                }}>
                    <div>
                        <div style={{ 
                            position: 'relative', 
                            borderRadius: '24px', 
                            overflow: 'hidden', 
                            boxShadow: 'var(--shadow-medium)' 
                        }}>
                            <img 
                                src="assets/bebek.png?v=1.1" 
                                alt="Waterboom Cijoho Indah Experience" 
                                style={{ width: '100%', height: 'auto', display: 'block' }}
                            />
                            <div style={{
                                position: 'absolute',
                                bottom: '20px',
                                left: '20px',
                                backgroundColor: 'var(--color-accent)',
                                color: 'var(--color-primary)',
                                padding: '16px 24px',
                                borderRadius: '16px',
                                fontWeight: 800,
                                fontSize: '1.1rem',
                                boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
                            }}>
                                🌟 12+ Tahun Pengalaman
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '20px' }}>
                            SEJARAH SINGKAT KAMI
                        </h2>
                        <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '20px' }}>
                            Didirikan lebih dari 12 tahun yang lalu, Waterboom Cijoho Indah bermula dari impian sederhana untuk menghadirkan destinasi rekreasi air keluarga yang asri, sejuk, aman, dan dapat dijangkau oleh semua kalangan masyarakat Tasikmalaya dan sekitarnya.
                        </p>
                        <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                            Dari tahun ke tahun, kami terus bertransformasi menambah berbagai wahana baru seperti ember tumpah interaktif (Kids Waterplay), meningkatkan standar filtrasi air modern, serta melatih staf penyelamat profesional demi memastikan setiap detik liburan Anda sekeluarga berjalan penuh tawa riang dan aman.
                        </p>
                    </div>
                </div>

                {/* Visi & Misi Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '30px',
                    marginBottom: '60px'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '40px',
                        borderRadius: '24px',
                        boxShadow: 'var(--shadow-soft)',
                        border: '1px solid var(--color-border)'
                    }}>
                        <div style={{
                            backgroundColor: 'var(--color-soft-blue)',
                            color: 'var(--color-primary)',
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            marginBottom: '24px'
                        }}>
                            <i className="fa-solid fa-eye"></i>
                        </div>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '16px' }}>VISI KAMI</h3>
                        <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                            Menjadi tempat wisata dan rekreasi air keluarga nomor satu di Tasikmalaya yang senantiasa dinantikan kehadirannya, terkenal akan kenyamanannya, kebersihannya, keamanannya, serta ramah bagi seluruh anggota keluarga dari anak-anak hingga kakek nenek.
                        </p>
                    </div>

                    <div style={{
                        backgroundColor: 'white',
                        padding: '40px',
                        borderRadius: '24px',
                        boxShadow: 'var(--shadow-soft)',
                        border: '1px solid var(--color-border)'
                    }}>
                        <div style={{
                            backgroundColor: 'var(--color-soft-blue)',
                            color: 'var(--color-primary)',
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            marginBottom: '24px'
                        }}>
                            <i className="fa-solid fa-bullseye"></i>
                        </div>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '16px' }}>MISI KAMI</h3>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: 0, listStyle: 'none' }}>
                            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.95rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                                <i className="fa-solid fa-check" style={{ color: 'var(--color-accent)', marginTop: '4px' }}></i>
                                <span>Menyediakan wahana air modern dengan jaminan standar keselamatan tertinggi.</span>
                            </li>
                            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.95rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                                <i className="fa-solid fa-check" style={{ color: 'var(--color-accent)', marginTop: '4px' }}></i>
                                <span>Menjaga kejernihan dan sterilitas air kolam melalui sistem pengolahan air otomatis harian.</span>
                            </li>
                            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.95rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                                <i className="fa-solid fa-check" style={{ color: 'var(--color-accent)', marginTop: '4px' }}></i>
                                <span>Menyajikan pelayanan ramah, sigap, bersahabat, dan profesional dari seluruh staf.</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Safety Promise Box */}
                <div style={{
                    backgroundColor: '#052049',
                    borderRadius: '24px',
                    padding: '50px 40px',
                    color: 'white',
                    boxShadow: 'var(--shadow-medium)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '40px',
                    alignItems: 'center'
                }}>
                    <div>
                        <h3 style={{ color: 'white', fontSize: '1.6rem', fontWeight: 800, marginBottom: '16px' }}>
                            🛡️ Jaminan Keselamatan di Setiap Detik
                        </h3>
                        <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6 }}>
                            Di Waterboom Cijoho Indah, keselamatan pengunjung adalah segalanya. Seluruh lifeguard kami telah melewati sertifikasi pertolongan pertama dan pelatihan tanggap darurat rutin.
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                            <div style={{ fontSize: '2rem', color: 'var(--color-accent)' }}><i className="fa-solid fa-shield-heart"></i></div>
                            <div>
                                <h4 style={{ color: 'white', fontSize: '1.05rem', fontWeight: 700, marginBottom: '4px' }}>Lifeguard Bersertifikasi</h4>
                                <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)' }}>Berjaga penuh di setiap wahana untuk mengawasi pengunjung anak dan dewasa.</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                            <div style={{ fontSize: '2rem', color: 'var(--color-accent)' }}><i className="fa-solid fa-droplet"></i></div>
                            <div>
                                <h4 style={{ color: 'white', fontSize: '1.05rem', fontWeight: 700, marginBottom: '4px' }}>Sanitasi Air Teruji</h4>
                                <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)' }}>Pemeriksaan pH dan tingkat klorin air kolam dilakukan berkala setiap pagi hari.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
