import React from 'react';

export default function FasilitasPage() {
    const facilities = [
        {
            id: 1,
            title: '🔐 Loker Penyimpanan Aman',
            desc: 'Simpan barang berharga Anda dengan tenang di loker penyimpanan khusus yang terjaga keamanannya menggunakan kunci fisik personal.',
            icon: 'fa-solid fa-key'
        },
        {
            id: 2,
            title: '🚿 Ruang Bilas & Toilet Bersih',
            desc: 'Fasilitas shower mandi hangat/dingin, toilet higienis, dan ruang ganti pakaian yang dirawat secara berkala demi kenyamanan maksimal.',
            icon: 'fa-solid fa-shower'
        },
        {
            id: 3,
            title: '🍩 Sewa Ban Pelampung & Angsa',
            desc: 'Penyewaan ban pelampung karet (single/double) dan angsa kayuh untuk menemani keseruan Anda menyusuri kolam arus dan kolam utama.',
            icon: 'fa-solid fa-life-ring'
        },
        {
            id: 4,
            title: '🍔 Kantin & Foodcourt Tropis',
            desc: 'Menyediakan beragam hidangan kuliner lezat khas Jawa Barat, cemilan, kelapa muda segar, dan minuman dingin dengan harga terjangkau.',
            icon: 'fa-solid fa-utensils'
        },
        {
            id: 5,
            title: '🏥 Pos Medis & P3K',
            desc: 'Pos pertolongan pertama yang dilengkapi peralatan medis lengkap dan staf penyelamat terlatih yang selalu siaga mengawasi keadaan.',
            icon: 'fa-solid fa-briefcase-medical'
        },
        {
            id: 6,
            title: '🚗 Area Parkir Luas & Aman',
            desc: 'Lahan parkir kendaraan roda dua, roda empat, hingga bus pariwisata besar yang dilengkapi sistem keamanan karcis dan penjagaan juru parkir.',
            icon: 'fa-solid fa-square-parking'
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
                    <h1 style={{ fontSize: '2.8rem', fontWeight: 800, marginBottom: '16px', color: 'white' }}>FASILITAS KAMI</h1>
                    <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
                        Kami berkomitmen untuk memberikan kenyamanan, keamanan, dan kebersihan terbaik lewat fasilitas pendukung yang lengkap.
                    </p>
                </div>
            </div>

            {/* Facilities Grid */}
            <div className="container" style={{ padding: '60px 24px 80px 24px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '30px'
                }}>
                    {facilities.map(facility => (
                        <div 
                            key={facility.id}
                            style={{
                                backgroundColor: 'white',
                                padding: '40px 30px',
                                borderRadius: '20px',
                                boxShadow: 'var(--shadow-soft)',
                                border: '1px solid var(--color-border)',
                                display: 'flex',
                                gap: '20px',
                                alignItems: 'flex-start',
                                transition: 'all 0.3s ease'
                            }}
                            className="card-hover"
                        >
                            <div style={{
                                backgroundColor: 'var(--color-soft-blue)',
                                color: 'var(--color-primary)',
                                width: '56px',
                                height: '56px',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.4rem',
                                flexShrink: 0
                            }}>
                                <i className={facility.icon}></i>
                            </div>
                            
                            <div>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '10px' }}>
                                    {facility.title}
                                </h2>
                                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                                    {facility.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Additional Info Box */}
                <div style={{
                    marginTop: '60px',
                    backgroundColor: 'var(--color-primary)',
                    borderRadius: '24px',
                    padding: '40px',
                    color: 'white',
                    boxShadow: 'var(--shadow-medium)',
                    textAlign: 'center'
                }}>
                    <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px' }}>
                        💡 Semua Fasilitas Dibersihkan Secara Berkala
                    </h3>
                    <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.8)', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
                        Kebersihan air kolam dan kebersihan ruang bilas dirawat oleh tim sanitasi khusus kami setiap hari demi menjaga standar higienitas tertinggi bagi Anda dan keluarga tercinta.
                    </p>
                </div>
            </div>
        </div>
    );
}
