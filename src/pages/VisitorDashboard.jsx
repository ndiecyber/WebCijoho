import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileAppView from '../components/MobileAppView';

export default function VisitorDashboard() {
    const navigate = useNavigate();

    // State for Desktop Form
    const [selectedTicket, setSelectedTicket] = useState('reguler');
    const [ticketQty, setTicketQty] = useState(1);
    const todayStr = new Date().toISOString().split('T')[0];
    const [visitDate, setVisitDate] = useState(todayStr);
    
    const [sewaBan, setSewaBan] = useState(0);
    const [sewaSepeda, setSewaSepeda] = useState(0);
    const [sewaGazebo, setSewaGazebo] = useState(0);

    const [visitorName, setVisitorName] = useState('');
    const [visitorPhone, setVisitorPhone] = useState('');

    // Prices
    const TICKET_PRICES = {
        reguler: 20000,
        rombongan: 17000,
        kursus: 15000
    };

    const RENTAL_PRICES = {
        ban: 5000,
        sepeda: 20000,
        gazebo: 20000
    };

    const ticketUnitPrice = TICKET_PRICES[selectedTicket] || 20000;
    const subtotalTickets = ticketUnitPrice * ticketQty;
    const subtotalRentals = (sewaBan * RENTAL_PRICES.ban) + (sewaSepeda * RENTAL_PRICES.sepeda) + (sewaGazebo * RENTAL_PRICES.gazebo);
    const grandTotal = subtotalTickets + subtotalRentals;

    const handleSendWhatsAppOrder = (e) => {
        e.preventDefault();
        if (!visitorName.trim()) {
            alert('Silakan isi Nama Pemesan terlebih dahulu!');
            return;
        }
        if (!visitorPhone.trim()) {
            alert('Silakan isi Nomor WhatsApp terlebih dahulu!');
            return;
        }

        const ticketName = selectedTicket === 'reguler' ? 'Tiket Reguler' : selectedTicket === 'rombongan' ? 'Tiket Rombongan' : 'Kursus Renang';
        const formattedDate = new Date(visitDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

        let rentalsText = '';
        if (sewaBan > 0) rentalsText += `\n• Sewa Ban: ${sewaBan}x (Rp ${(sewaBan * RENTAL_PRICES.ban).toLocaleString('id-ID')})`;
        if (sewaSepeda > 0) rentalsText += `\n• Sewa Sepeda Air: ${sewaSepeda}x (Rp ${(sewaSepeda * RENTAL_PRICES.sepeda).toLocaleString('id-ID')})`;
        if (sewaGazebo > 0) rentalsText += `\n• Sewa Gazebo: ${sewaGazebo}x (Rp ${(sewaGazebo * RENTAL_PRICES.gazebo).toLocaleString('id-ID')})`;

        const message = `Halo Admin Waterboom Cijoho Indah! 👋\nSaya ingin memesan Tiket Online resmi:\n\n👤 *Nama Pemesan:* ${visitorName}\n📱 *No. WA:* ${visitorPhone}\n📅 *Tgl Kunjungan:* ${formattedDate}\n\n🎟️ *Detail Tiket:*\n• ${ticketName} (${ticketQty} Orang) = Rp ${subtotalTickets.toLocaleString('id-ID')}${rentalsText ? `\n\n🚣 *Tambahan Sewa:*${rentalsText}` : ''}\n\n💰 *Total Pembayaran:* Rp ${grandTotal.toLocaleString('id-ID')}\n\nMohon informasi metode pembayaran dan pengiriman Tiket PDF resmi. Terima kasih! 🌊✨`;

        const encodedMsg = encodeURIComponent(message);
        window.open(`https://wa.me/628123456789?text=${encodedMsg}`, '_blank');
    };

    return (
        <div className="visitor-booking-page-root">
            {/* 1. MOBILE RESPONSIVE VIEW (Hanya Tampil di HP & Tablet <= 768px) */}
            <div className="mobile-only-booking-view">
                <MobileAppView isCashierMode={false} />
            </div>

            {/* 2. DESKTOP FULL PAGE VIEW (Hanya Tampil di Layar Komputer / Desktop > 768px) */}
            <div className="desktop-only-booking-view">
                <div className="container" style={{ maxWidth: '1140px', padding: '40px 20px 80px 20px' }}>
                    {/* Header Banner */}
                    <div 
                        style={{ 
                            background: 'linear-gradient(135deg, #0c294a 0%, #1e40af 100%)',
                            borderRadius: '24px',
                            padding: '30px 40px',
                            color: 'white',
                            display: 'flex',
                            justify: 'space-between',
                            alignItems: 'center',
                            marginBottom: '32px',
                            boxShadow: '0 15px 35px rgba(12, 41, 74, 0.15)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <img src="assets/logo.png" alt="Logo" style={{ height: '56px', width: 'auto' }} />
                            <div>
                                <h1 style={{ color: 'white', margin: 0, fontSize: '1.6rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    PEMESANAN TIKET ONLINE
                                </h1>
                                <p style={{ color: '#93c5fd', margin: '6px 0 0 0', fontSize: '0.95rem', fontWeight: 600 }}>
                                    Waterboom Cijoho Indah • Dapatkan Tiket PDF Resmi via WhatsApp Admin
                                </p>
                            </div>
                        </div>
                        <div style={{ backgroundColor: '#25D366', color: 'white', padding: '10px 20px', borderRadius: '30px', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)' }}>
                            <i className="fa-brands fa-whatsapp" style={{ fontSize: '1.2rem' }}></i> FAST RESPONSE ADMIN WA
                        </div>
                    </div>

                    {/* Main 2-Column Form Layout */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '32px' }}>
                        {/* LEFT COLUMN: Ticket Selection & Rentals */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* Card 1: Pilih Jenis Tiket */}
                            <div style={{ backgroundColor: 'white', padding: '28px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                                <h3 style={{ margin: '0 0 18px 0', color: '#0f2942', fontSize: '1.15rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <i className="fa-solid fa-ticket" style={{ color: '#2563eb' }}></i> 1. PILIH JENIS TIKET
                                </h3>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                                    {/* Option Reguler */}
                                    <div 
                                        onClick={() => setSelectedTicket('reguler')}
                                        style={{
                                            border: selectedTicket === 'reguler' ? '2.5px solid #2563eb' : '1px solid #cbd5e1',
                                            backgroundColor: selectedTicket === 'reguler' ? '#eff6ff' : '#f8fafc',
                                            borderRadius: '16px',
                                            padding: '20px 14px',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: selectedTicket === 'reguler' ? '#2563eb' : '#e2e8f0', color: selectedTicket === 'reguler' ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px auto', fontSize: '1.1rem' }}>
                                            <i className="fa-solid fa-user"></i>
                                        </div>
                                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f2942' }}>Tiket Reguler</h4>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '1.05rem', fontWeight: 900, color: '#2563eb' }}>Rp 20.000</p>
                                    </div>

                                    {/* Option Rombongan */}
                                    <div 
                                        onClick={() => setSelectedTicket('rombongan')}
                                        style={{
                                            border: selectedTicket === 'rombongan' ? '2.5px solid #2563eb' : '1px solid #cbd5e1',
                                            backgroundColor: selectedTicket === 'rombongan' ? '#eff6ff' : '#f8fafc',
                                            borderRadius: '16px',
                                            padding: '20px 14px',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: selectedTicket === 'rombongan' ? '#2563eb' : '#e2e8f0', color: selectedTicket === 'rombongan' ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px auto', fontSize: '1.1rem' }}>
                                            <i className="fa-solid fa-users"></i>
                                        </div>
                                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f2942' }}>Rombongan</h4>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '1.05rem', fontWeight: 900, color: '#2563eb' }}>Rp 17.000</p>
                                    </div>

                                    {/* Option Kursus Renang */}
                                    <div 
                                        onClick={() => setSelectedTicket('kursus')}
                                        style={{
                                            border: selectedTicket === 'kursus' ? '2.5px solid #2563eb' : '1px solid #cbd5e1',
                                            backgroundColor: selectedTicket === 'kursus' ? '#eff6ff' : '#f8fafc',
                                            borderRadius: '16px',
                                            padding: '20px 14px',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: selectedTicket === 'kursus' ? '#2563eb' : '#e2e8f0', color: selectedTicket === 'kursus' ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px auto', fontSize: '1.1rem' }}>
                                            <i className="fa-solid fa-person-swimming"></i>
                                        </div>
                                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f2942' }}>Kursus Renang</h4>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '1.05rem', fontWeight: 900, color: '#2563eb' }}>Rp 15.000</p>
                                    </div>
                                </div>

                                {/* Qty & Date Row */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '24px', paddingTop: '20px', borderTop: '1px dashed #e2e8f0' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 800, color: '#475569', marginBottom: '8px' }}>
                                            JUMLAH TIKET:
                                        </label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <button 
                                                type="button" 
                                                onClick={() => setTicketQty(Math.max(1, ticketQty - 1))}
                                                style={{ width: '40px', height: '40px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', fontSize: '1.2rem', fontWeight: 900, cursor: 'pointer' }}
                                            >-</button>
                                            <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f2942', minWidth: '40px', textAlign: 'center' }}>{ticketQty}</span>
                                            <button 
                                                type="button" 
                                                onClick={() => setTicketQty(ticketQty + 1)}
                                                style={{ width: '40px', height: '40px', borderRadius: '10px', border: 'none', backgroundColor: '#2563eb', color: 'white', fontSize: '1.2rem', fontWeight: 900, cursor: 'pointer' }}
                                            >+</button>
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 800, color: '#475569', marginBottom: '8px' }}>
                                            TANGGAL KUNJUNGAN:
                                        </label>
                                        <input 
                                            type="date" 
                                            value={visitDate}
                                            onChange={(e) => setVisitDate(e.target.value)}
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontWeight: 700, color: '#0f2942' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Tambahan Sewa Wahana (Opsional) */}
                            <div style={{ backgroundColor: 'white', padding: '28px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                                <h3 style={{ margin: '0 0 18px 0', color: '#0f2942', fontSize: '1.15rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <i className="fa-solid fa-umbrella-beach" style={{ color: '#059669' }}></i> 2. TAMBAHAN SEWA WAHANA (OPSIONAL)
                                </h3>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                                    {/* Sewa Ban */}
                                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', backgroundColor: '#f8fafc' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                            <i className="fa-solid fa-life-ring" style={{ color: '#059669', fontSize: '1.2rem' }}></i>
                                            <div>
                                                <h5 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#0f2942' }}>Sewa Ban</h5>
                                                <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 800 }}>Rp 5.000</span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                                            <button type="button" onClick={() => setSewaBan(Math.max(0, sewaBan - 1))} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', fontWeight: 800, cursor: 'pointer' }}>-</button>
                                            <span style={{ fontWeight: 900, fontSize: '1rem', color: '#0f2942' }}>{sewaBan}</span>
                                            <button type="button" onClick={() => setSewaBan(sewaBan + 1)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: '#059669', color: 'white', fontWeight: 800, cursor: 'pointer' }}>+</button>
                                        </div>
                                    </div>

                                    {/* Sewa Sepeda Air */}
                                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', backgroundColor: '#f8fafc' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                            <i className="fa-solid fa-water" style={{ color: '#0284c7', fontSize: '1.2rem' }}></i>
                                            <div>
                                                <h5 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#0f2942' }}>Sepeda Air</h5>
                                                <span style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 800 }}>Rp 20.000</span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                                            <button type="button" onClick={() => setSewaSepeda(Math.max(0, sewaSepeda - 1))} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', fontWeight: 800, cursor: 'pointer' }}>-</button>
                                            <span style={{ fontWeight: 900, fontSize: '1rem', color: '#0f2942' }}>{sewaSepeda}</span>
                                            <button type="button" onClick={() => setSewaSepeda(sewaSepeda + 1)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: '#0284c7', color: 'white', fontWeight: 800, cursor: 'pointer' }}>+</button>
                                        </div>
                                    </div>

                                    {/* Sewa Gazebo */}
                                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', backgroundColor: '#f8fafc' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                            <i className="fa-solid fa-store" style={{ color: '#7c3aed', fontSize: '1.2rem' }}></i>
                                            <div>
                                                <h5 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#0f2942' }}>Gazebo</h5>
                                                <span style={{ fontSize: '0.8rem', color: '#7c3aed', fontWeight: 800 }}>Rp 20.000</span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                                            <button type="button" onClick={() => setSewaGazebo(Math.max(0, sewaGazebo - 1))} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', fontWeight: 800, cursor: 'pointer' }}>-</button>
                                            <span style={{ fontWeight: 900, fontSize: '1rem', color: '#0f2942' }}>{sewaGazebo}</span>
                                            <button type="button" onClick={() => setSewaGazebo(sewaGazebo + 1)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: '#7c3aed', color: 'white', fontWeight: 800, cursor: 'pointer' }}>+</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Order Summary & Checkout */}
                        <div>
                            <div style={{ backgroundColor: 'white', padding: '28px', borderRadius: '20px', boxShadow: '0 8px 30px rgba(12, 41, 74, 0.08)', border: '1.5px solid #cbd5e1', sticky: 'top', top: '100px' }}>
                                <h3 style={{ margin: '0 0 20px 0', color: '#0f2942', fontSize: '1.2rem', fontWeight: 900, paddingBottom: '14px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <i className="fa-solid fa-receipt" style={{ color: '#2563eb' }}></i> RINGKASAN PESANAN
                                </h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.92rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748b', fontWeight: 600 }}>Tgl Kunjungan:</span>
                                        <span style={{ color: '#0f2942', fontWeight: 800 }}>{new Date(visitDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748b', fontWeight: 600 }}>Jenis Tiket:</span>
                                        <span style={{ color: '#0f2942', fontWeight: 800 }}>{selectedTicket === 'reguler' ? 'Tiket Reguler' : selectedTicket === 'rombongan' ? 'Tiket Rombongan' : 'Kursus Renang'}</span>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748b', fontWeight: 600 }}>Subtotal Tiket ({ticketQty}x):</span>
                                        <span style={{ color: '#0f2942', fontWeight: 800 }}>Rp {subtotalTickets.toLocaleString('id-ID')}</span>
                                    </div>

                                    {subtotalRentals > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#64748b', fontWeight: 600 }}>Subtotal Sewa Wahana:</span>
                                            <span style={{ color: '#059669', fontWeight: 800 }}>+ Rp {subtotalRentals.toLocaleString('id-ID')}</span>
                                        </div>
                                    )}

                                    <div style={{ borderTop: '2px dashed #e2e8f0', margin: '8px 0', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: '#0f2942', fontWeight: 900, fontSize: '1.05rem' }}>TOTAL BAYAR:</span>
                                        <span style={{ color: '#2563eb', fontWeight: 900, fontSize: '1.35rem' }}>Rp {grandTotal.toLocaleString('id-ID')}</span>
                                    </div>
                                </div>

                                {/* Visitor Contact Form */}
                                <form onSubmit={handleSendWhatsAppOrder} style={{ marginTop: '20px', paddingTop: '18px', borderTop: '1px solid #e2e8f0' }}>
                                    <div style={{ marginBottom: '14px' }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                                            NAMA PEMESAN:
                                        </label>
                                        <input 
                                            type="text" 
                                            placeholder="Contoh: Budi Santoso"
                                            value={visitorName}
                                            onChange={(e) => setVisitorName(e.target.value)}
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 600, boxSizing: 'border-box' }}
                                            required
                                        />
                                    </div>

                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                                            NOMOR WHATSAPP:
                                        </label>
                                        <input 
                                            type="tel" 
                                            placeholder="Contoh: 081234567890"
                                            value={visitorPhone}
                                            onChange={(e) => setVisitorPhone(e.target.value)}
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 600, boxSizing: 'border-box' }}
                                            required
                                        />
                                    </div>

                                    <button 
                                        type="submit"
                                        style={{
                                            width: '100%',
                                            backgroundColor: '#25D366',
                                            color: 'white',
                                            border: 'none',
                                            padding: '14px',
                                            borderRadius: '12px',
                                            fontSize: '0.95rem',
                                            fontWeight: 900,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '10px',
                                            boxShadow: '0 6px 20px rgba(37, 211, 102, 0.35)',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <i className="fa-brands fa-whatsapp" style={{ fontSize: '1.25rem' }}></i> KIRIM PESANAN VIA WA (TIKET PDF)
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
