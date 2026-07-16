import React from 'react';

export default function BeritaPage() {
    const articles = [
        {
            id: 1,
            title: '🎉 Promo Liburan Sekolah: Diskon Rombongan 25%!',
            category: 'Promo',
            date: '15 Juli 2026',
            image: 'assets/3.png?v=1.1',
            desc: 'Sambut masa liburan sekolah dengan keseruan tanpa batas! Waterboom Cijoho Indah memberikan penawaran diskon spesial 25% khusus untuk rombongan sekolah, instansi, atau komunitas dengan jumlah minimal 20 orang. Dapatkan akses ke seluruh wahana dan gazebo tanpa biaya tambahan tersembunyi.',
            readTime: '3 min read'
        },
        {
            id: 2,
            title: '🧸 Grand Launching Wahana Baru "Kids Waterplay"',
            category: 'Event',
            date: '10 Juli 2026',
            image: 'assets/kids.png?v=1.1',
            desc: 'Kami bangga mengumumkan bahwa wahana terbaru kami, Kids Waterplay, telah resmi dibuka untuk umum! Dirancang khusus dengan standar keamanan tertinggi, wahana ini menghadirkan ember tumpah raksasa, air mancur interaktif, dan seluncuran mini berwarna-warni yang dijamin disukai si kecil.',
            readTime: '2 min read'
        },
        {
            id: 3,
            title: '🏊 Tips Liburan Renang yang Aman & Sehat Bersama Anak',
            category: 'Tips & Edukasi',
            date: '05 Juli 2026',
            image: 'assets/bebek.png?v=1.1',
            desc: 'Liburan bersama keluarga di waterpark tentu sangat menyenangkan, namun keselamatan tetap menjadi prioritas utama. Tim lifeguard profesional kami membagikan 5 tips penting saat mendampingi anak bermain air, termasuk pentingnya pemanasan, penggunaan pelampung yang tepat, serta menjaga hidrasi selama bermain.',
            readTime: '4 min read'
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
                    <h1 style={{ fontSize: '2.8rem', fontWeight: 800, marginBottom: '16px', color: 'white' }}>BERITA & PROMO</h1>
                    <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
                        Dapatkan informasi promo tiket masuk terbaru, event liburan menarik, serta tips keselamatan langsung dari kami.
                    </p>
                </div>
            </div>

            {/* Articles List */}
            <div className="container" style={{ padding: '60px 24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                    {articles.map(article => (
                        <article 
                            key={article.id}
                            style={{
                                backgroundColor: 'white',
                                borderRadius: '20px',
                                overflow: 'hidden',
                                boxShadow: 'var(--shadow-soft)',
                                display: 'flex',
                                flexDirection: 'column',
                                border: '1px solid var(--color-border)'
                            }}
                        >
                            <div style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden' }}>
                                <img 
                                    src={article.image} 
                                    alt={article.title} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <span style={{
                                    position: 'absolute',
                                    top: '16px',
                                    left: '16px',
                                    backgroundColor: 'var(--color-accent)',
                                    color: 'var(--color-primary)',
                                    fontWeight: 800,
                                    fontSize: '0.75rem',
                                    padding: '6px 16px',
                                    borderRadius: '50px',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                }}>
                                    {article.category}
                                </span>
                            </div>
                            
                            <div style={{ padding: '30px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center', 
                                    fontSize: '0.8rem', 
                                    color: 'var(--color-text-muted)',
                                    marginBottom: '12px'
                                }}>
                                    <span><i className="fa-regular fa-calendar-days" style={{ marginRight: '6px' }}></i>{article.date}</span>
                                    <span><i className="fa-regular fa-clock" style={{ marginRight: '6px' }}></i>{article.readTime}</span>
                                </div>

                                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.4, marginBottom: '16px', color: 'var(--color-primary)' }}>
                                    {article.title}
                                </h2>

                                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '24px', flexGrow: 1 }}>
                                    {article.desc}
                                </p>

                                <button 
                                    style={{
                                        alignSelf: 'flex-start',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        color: 'var(--color-primary)',
                                        fontWeight: 700,
                                        fontSize: '0.9rem',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        cursor: 'pointer',
                                        padding: 0
                                    }}
                                    className="btn-arrow"
                                >
                                    Selengkapnya <i className="fa-solid fa-arrow-right"></i>
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
}
