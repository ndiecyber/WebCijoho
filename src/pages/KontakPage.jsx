import React, { useState } from 'react';

export default function KontakPage() {
    const [formData, setFormData] = useState({
        nama: '',
        email: '',
        telepon: '',
        pesan: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Contact Message Submitted:', formData);
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setFormData({ nama: '', email: '', telepon: '', pesan: '' });
        }, 3000);
    };

    const faqs = [
        {
            q: 'Apakah diperbolehkan membawa makanan dari luar?',
            a: 'Demi menjaga higienitas dan kebersihan air kolam, pengunjung dilarang membawa makanan berat ke dalam area kolam. Namun, minuman botol dan cemilan kecil untuk bayi diperbolehkan.'
        },
        {
            q: 'Berapa harga tiket masuk dan jam operasionalnya?',
            a: 'Tiket masuk reguler adalah Rp 20.000 per orang. Kami buka setiap hari mulai pukul 08:00 WIB sampai 17:00 WIB.'
        },
        {
            q: 'Apakah ada tarif khusus untuk rombongan sekolah/grup?',
            a: 'Ya, ada! Kami menawarkan diskon khusus rombongan minimal 20 orang. Anda dapat menghubungi layanan pelanggan kami melalui tombol WhatsApp untuk informasi pemesanan.'
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
                    <h1 style={{ fontSize: '2.8rem', fontWeight: 800, marginBottom: '16px', color: 'white' }}>KONTAK & LOKASI</h1>
                    <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
                        Butuh bantuan, ingin memesan paket rombongan, atau menanyakan info promo? Hubungi kami atau kunjungi langsung lokasi kami.
                    </p>
                </div>
            </div>

            <div className="container" style={{ padding: '60px 24px 80px 24px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '40px',
                    marginBottom: '60px'
                }}>
                    {/* Contact Info & Form */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '40px',
                        borderRadius: '24px',
                        boxShadow: 'var(--shadow-soft)',
                        border: '1px solid var(--color-border)'
                    }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '30px' }}>
                            Kirim Pesan Langsung
                        </h2>
                        {submitted ? (
                            <div style={{
                                backgroundColor: 'var(--color-soft-blue)',
                                color: 'var(--color-primary)',
                                padding: '20px',
                                borderRadius: '16px',
                                textAlign: 'center',
                                fontWeight: 700,
                                marginBottom: '20px'
                            }}>
                                💬 Terima kasih! Pesan Anda telah berhasil terkirim.
                            </div>
                        ) : null}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>NAMA LENGKAP</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={formData.nama} 
                                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                    placeholder="Masukkan nama Anda"
                                    style={{ borderRadius: '10px' }}
                                />
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>ALAMAT EMAIL</label>
                                <input 
                                    type="email" 
                                    required 
                                    value={formData.email} 
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="nama@email.com"
                                    style={{ borderRadius: '10px' }}
                                />
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>NOMOR TELEPON / WHATSAPP</label>
                                <input 
                                    type="tel" 
                                    required 
                                    value={formData.telepon} 
                                    onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                                    placeholder="0812xxxxxx"
                                    style={{ borderRadius: '10px' }}
                                />
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>PESAN ANDA</label>
                                <textarea 
                                    required 
                                    rows="4"
                                    value={formData.pesan} 
                                    onChange={(e) => setFormData({ ...formData, pesan: e.target.value })}
                                    placeholder="Tuliskan pertanyaan atau tanggapan Anda di sini..."
                                    style={{ 
                                        width: '100%', 
                                        padding: '12px 16px', 
                                        border: '1px solid var(--color-border)', 
                                        borderRadius: '10px',
                                        outline: 'none',
                                        fontSize: '0.95rem',
                                        fontFamily: 'var(--font-body)'
                                    }}
                                ></textarea>
                            </div>

                            <button type="submit" className="btn btn-accent btn-full" style={{ borderRadius: '12px', fontWeight: 700 }}>
                                KIRIM PESAN <i className="fa-solid fa-paper-plane" style={{ marginLeft: '6px' }}></i>
                            </button>
                        </form>
                    </div>

                    {/* Map & FAQ Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        {/* Maps & Address */}
                        <div style={{
                            backgroundColor: 'white',
                            padding: '30px',
                            borderRadius: '24px',
                            boxShadow: 'var(--shadow-soft)',
                            border: '1px solid var(--color-border)'
                        }}>
                            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '16px' }}>
                                📍 Alamat & Peta Lokasi
                            </h2>
                            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: '20px' }}>
                                Jl. Cijoho, Tasikmalaya, Jawa Barat, Indonesia
                            </p>
                            <div style={{ width: '100%', height: '220px', borderRadius: '16px', overflow: 'hidden' }}>
                                <iframe 
                                    title="Peta Lokasi Waterboom Cijoho Indah"
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15827.607421319762!2d108.204561!3d-7.365412!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwMjEnNTUuNSJTIDEwOMKwMTInMTYuNCJF!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid" 
                                    width="100%" 
                                    height="100%" 
                                    style={{ border: 0 }} 
                                    allowFullScreen="" 
                                    loading="lazy" 
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            </div>
                        </div>

                        {/* FAQs */}
                        <div style={{
                            backgroundColor: 'white',
                            padding: '30px',
                            borderRadius: '24px',
                            boxShadow: 'var(--shadow-soft)',
                            border: '1px solid var(--color-border)'
                        }}>
                            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '20px' }}>
                                ❓ Pertanyaan Populer (FAQ)
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {faqs.map((faq, idx) => (
                                    <div key={idx} style={{ borderBottom: idx !== faqs.length - 1 ? '1px solid #e2eaf4' : 'none', paddingBottom: idx !== faqs.length - 1 ? '14px' : 0 }}>
                                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '6px' }}>
                                            {faq.q}
                                        </h3>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                                            {faq.a}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
