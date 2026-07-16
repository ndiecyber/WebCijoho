import React, { useState } from 'react';

export default function GaleriPage() {
    const categories = ['Semua', 'Seluncuran', 'Kolam', 'Fasilitas & Gazebo'];
    const [selectedCategory, setSelectedCategory] = useState('Semua');

    const galleryItems = [
        { id: 1, src: 'assets/1.png?v=1.1', category: 'Seluncuran', title: 'Sensasi Meluncur Cepat' },
        { id: 2, src: 'assets/2.png?v=1.1', category: 'Fasilitas & Gazebo', title: 'Gazebo Teduh Rileks' },
        { id: 3, src: 'assets/3.png?v=1.1', category: 'Kolam', title: 'Kolam Air Arus Seru' },
        { id: 4, src: 'assets/4.png?v=1.1', category: 'Seluncuran', title: 'Seluncuran Air Spiral' },
        { id: 5, src: 'assets/5.png?v=1.1', category: 'Fasilitas & Gazebo', title: 'Pondokan Suasana Tropis' },
        { id: 6, src: 'assets/bebek.png?v=1.1', category: 'Kolam', title: 'Kolam Bebek Raksasa' },
        { id: 7, src: 'assets/dash.jpeg?v=1.1', category: 'Kolam', title: 'Wahana Utama Air Cijoho' },
        { id: 8, src: 'assets/gallery_1.png?v=1.1', category: 'Seluncuran', title: 'Meluncur Bersama Teman' },
        { id: 9, src: 'assets/gallery_2.png?v=1.1', category: 'Fasilitas & Gazebo', title: 'Gazebo Pinggir Kolam' },
        { id: 10, src: 'assets/gallery_3.png?v=1.1', category: 'Kolam', title: 'Area Kolam Rombongan' },
        { id: 11, src: 'assets/gallery_4.png?v=1.1', category: 'Fasilitas & Gazebo', title: 'Rest Area Sejuk' }
    ];

    const filteredItems = selectedCategory === 'Semua' 
        ? galleryItems 
        : galleryItems.filter(item => item.category === selectedCategory);

    return (
        <div style={{ paddingTop: '80px', backgroundColor: '#f4f8fc', minHeight: '100vh' }}>
            {/* Title Section */}
            <div style={{ 
                background: 'linear-gradient(135deg, #052049 0%, #0d3875 100%)', 
                color: 'white', 
                padding: '60px 0', 
                textAlign: 'center' 
            }}>
                <div className="container">
                    <h1 style={{ fontSize: '2.8rem', fontWeight: 800, marginBottom: '16px', color: 'white' }}>GALERI FOTO</h1>
                    <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
                        Abadikan momen-momen seru, tawa ceria keluarga, dan suasana menyegarkan di destinasi wisata air terbaik Tasikmalaya.
                    </p>
                </div>
            </div>

            <div className="container" style={{ padding: '40px 24px 80px 24px' }}>
                {/* Filter Categories */}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    flexWrap: 'wrap', 
                    gap: '12px', 
                    marginBottom: '40px' 
                }}>
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            style={{
                                padding: '10px 24px',
                                borderRadius: '50px',
                                border: '2px solid',
                                borderColor: selectedCategory === category ? 'var(--color-accent)' : 'var(--color-border)',
                                backgroundColor: selectedCategory === category ? 'var(--color-accent)' : 'white',
                                color: selectedCategory === category ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: selectedCategory === category ? '0 4px 15px rgba(146, 200, 62, 0.3)' : 'none',
                                outline: 'none'
                            }}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Gallery Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '24px'
                }}>
                    {filteredItems.map(item => (
                        <div 
                            key={item.id}
                            style={{
                                borderRadius: '16px',
                                overflow: 'hidden',
                                boxShadow: 'var(--shadow-soft)',
                                backgroundColor: 'white',
                                position: 'relative',
                                aspectRatio: '4/3',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                border: '1px solid var(--color-border)'
                            }}
                            className="card-hover"
                        >
                            <img 
                                src={item.src} 
                                alt={item.title} 
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    transition: 'transform 0.4s ease'
                                }}
                            />
                            
                            {/* Overlay on Hover */}
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                width: '100%',
                                background: 'linear-gradient(to top, rgba(5, 32, 73, 0.95) 0%, rgba(5, 32, 73, 0) 100%)',
                                padding: '24px 20px 20px 20px',
                                color: 'white',
                                opacity: 1,
                                transition: 'opacity 0.3s ease'
                            }}>
                                <span style={{ 
                                    fontSize: '0.75rem', 
                                    fontWeight: 700, 
                                    color: 'var(--color-accent)', 
                                    textTransform: 'uppercase', 
                                    letterSpacing: '1px' 
                                }}>
                                    {item.category}
                                </span>
                                <h3 style={{ color: 'white', fontSize: '1.05rem', fontWeight: 700, marginTop: '4px' }}>
                                    {item.title}
                                </h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
