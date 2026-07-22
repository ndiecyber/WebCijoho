import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function MobileAppView({ onOpenBooking, isCashierMode = false }) {
    const [activeTab, setActiveTab] = useState('beranda');
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab && ['beranda', 'tiket', 'riwayat', 'profil'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [location]);
    const [selectedTicket, setSelectedTicket] = useState('reguler');
    const [ticketQty, setTicketQty] = useState(0);
    const [sewaBan, setSewaBan] = useState(0);
    const [sewaSepeda, setSewaSepeda] = useState(0);
    const [sewaGazebo, setSewaGazebo] = useState(0);
    const [showSidebar, setShowSidebar] = useState(false);
    const [showNotif, setShowNotif] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptData, setReceiptData] = useState(null);
    const [cashReceived, setCashReceived] = useState('');
    const [cashChange, setCashChange] = useState(0);

    // Purchase history & active tickets
    const [activeTicketData, setActiveTicketData] = useState(null);
    const [historyList, setHistoryList] = useState(() => {
        const saved = localStorage.getItem('waterboom_sales_history');
        if (saved) return JSON.parse(saved);
        return [
            {
                code: 'WCI-823902',
                date: '18 Juli 2026',
                type: 'Tiket Reguler',
                qty: 3,
                total: 65000,
                status: 'Lunas',
                details: {
                    ticketTypeKey: 'reguler',
                    qty: 3,
                    subtotal: 60000,
                    rentals: { ban: 1, sepeda: 0, gazebo: 0 },
                    total: 65000
                }
            }
        ];
    });

    // Slider state for Hero Card
    const sliderImages = [
        'assets/dash.jpeg?v=1.1',
        'assets/1.png?v=1.1',
        'assets/bebek.png?v=1.1'
    ];
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % sliderImages.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    // Price State synchronized with localStorage
    const [PRICES, setPRICES] = useState(() => {
        const saved = localStorage.getItem('waterboom_prices');
        if (saved) return JSON.parse(saved);
        return {
            tickets: {
                reguler: 20000,
                rombongan: 17000,
                kursus: 15000
            },
            rentals: {
                ban: 5000,
                sepeda: 5000,
                gazebo: 20000
            }
        };
    });

    useEffect(() => {
        const handleStorageChange = () => {
            const saved = localStorage.getItem('waterboom_prices');
            if (saved) {
                setPRICES(JSON.parse(saved));
            }
        };
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('focus', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('focus', handleStorageChange);
        };
    }, []);

    // Calculate subtotal and grand total
    const ticketPrice = PRICES.tickets[selectedTicket];
    const subtotal = ticketPrice * ticketQty;
    const rentalsTotal = (sewaBan * PRICES.rentals.ban) + (sewaSepeda * PRICES.rentals.sepeda) + (sewaGazebo * PRICES.rentals.gazebo);
    const grandTotal = subtotal + rentalsTotal;

    // Handle Payment simulation
    const handlePayment = () => {
        if (ticketQty <= 0) {
            alert('Silakan tentukan jumlah tiket terlebih dahulu!');
            return;
        }

        const bookingCode = 'WCI-' + Math.floor(100000 + Math.random() * 900000);
        const today = new Date().toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const newTicket = {
            code: bookingCode,
            date: today,
            type: selectedTicket === 'reguler' ? 'Tiket Reguler' : selectedTicket === 'rombongan' ? 'Tiket Rombongan' : 'Kursus Renang',
            ticketTypeKey: selectedTicket,
            qty: ticketQty,
            ticketPrice: ticketPrice,
            subtotal: subtotal,
            rentals: {
                ban: sewaBan,
                sepeda: sewaSepeda,
                gazebo: sewaGazebo
            },
            rentalsPrice: {
                ban: PRICES.rentals.ban,
                sepeda: PRICES.rentals.sepeda,
                gazebo: PRICES.rentals.gazebo
            },
            total: grandTotal
        };

        // Add to history
        const updatedItem = {
            code: bookingCode,
            date: today.split(',')[0],
            type: newTicket.type,
            qty: ticketQty,
            total: grandTotal,
            status: 'Lunas',
            details: newTicket
        };

        const updatedList = [updatedItem, ...historyList];
        setHistoryList(updatedList);
        localStorage.setItem('waterboom_sales_history', JSON.stringify(updatedList));

        if (isCashierMode) {
            setReceiptData(newTicket);
            setCashReceived('');
            setCashChange(0);
            setShowReceipt(true);
        } else {
            // Set as active ticket for visitor mode
            setActiveTicketData(newTicket);
            
            // Reset inputs
            setTicketQty(0);
            setSewaBan(0);
            setSewaSepeda(0);
            setSewaGazebo(0);

            // Redirect to "Tiket Saya" tab
            setActiveTab('tiket');
        }
    };

    const handleNewTransaction = () => {
        // Reset inputs
        setTicketQty(0);
        setSewaBan(0);
        setSewaSepeda(0);
        setSewaGazebo(0);
        
        // Hide receipt modal
        setShowReceipt(false);
        setReceiptData(null);
        setCashReceived('');
        setCashChange(0);
    };

    const handlePrintReceipt = () => {
        alert("Mencetak Struk Penjualan...\nKode: " + receiptData.code);
    };

    return (
        <div className="mobile-app-wrapper">
            {/* Top App Header */}
            <header className="mobile-app-header">
                <div className="header-logo-container">
                    <img src="assets/logo.png" alt="Waterboom Logo" className="app-logo-img" />
                    <div className="app-logo-text">
                        <span className="app-title">{isCashierMode ? 'KASIR - WATERBOOM' : 'WATERBOOM'}</span>
                        <span className="app-subtitle" style={{ color: '#1a73e8' }}>CIJOHO INDAH</span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <button className="header-icon-btn notif-bell" onClick={() => setShowNotif(!showNotif)}>
                        <i className="fa-regular fa-bell"></i>
                        <span className="bell-badge"></span>
                    </button>
                    <button className="header-avatar-btn" onClick={() => setActiveTab('profil')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #d0deef', background: 'none' }}>
                        <i className="fa-regular fa-user" style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }}></i>
                    </button>
                </div>
            </header>

            {/* Notification Dropdown */}
            {showNotif && (
                <div className="notif-dropdown">
                    <div className="notif-header">
                        <h4>Notifikasi</h4>
                        <button onClick={() => setShowNotif(false)}>&times;</button>
                    </div>
                    <div className="notif-list">
                        <div className="notif-item unread">
                            <i className="fa-solid fa-gift text-accent"></i>
                            <div>
                                <p><strong>Diskon Rombongan 25%</strong></p>
                                <small>Nikmati potongan harga rombongan sekolah!</small>
                            </div>
                        </div>
                        <div className="notif-item">
                            <i className="fa-solid fa-circle-check text-green"></i>
                            <div>
                                <p><strong>Wahana Kids Waterplay Dibuka!</strong></p>
                                <small>Nikmati keseruan ember tumpah terbaru.</small>
                            </div>
                        </div>
                    </div>
                </div>
            )}



            {/* Core Tab Content Container */}
            <div className="mobile-app-content">
                {/* 1. BERANDA / BOOKING TAB */}
                {activeTab === 'beranda' && (
                    <div className="app-tab-pane fade-in">
                        {/* Slide Welcome Banner */}
                        <div className="app-hero-slider" style={{ backgroundImage: `url('${sliderImages[currentSlide]}')` }}>
                            <div className="slider-overlay">
                                <h3>Selamat Datang!</h3>
                                <p>Nikmati liburan seru di Waterboom Cijoho Indah</p>
                                
                                {/* Wavy separator decoration */}
                                <div className="slider-wave-decor" style={{ margin: '8px 0', opacity: 0.8 }}>
                                    <svg width="40" height="6" viewBox="0 0 40 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M0 3 C 5 0, 5 6, 10 3 C 15 0, 15 6, 20 3 C 25 0, 25 6, 30 3 C 35 0, 35 6, 40 3" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
                                    </svg>
                                </div>

                                <div className="slider-dots">
                                    {sliderImages.map((_, idx) => (
                                        <span 
                                            key={idx} 
                                            className={`slider-dot ${currentSlide === idx ? 'active' : ''}`}
                                            onClick={() => setCurrentSlide(idx)}
                                        ></span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Ticket Selector Section */}
                        <div className="app-section">
                            <h4 className="section-title"><i className="fa-solid fa-tag text-blue"></i> PILIH JENIS TIKET</h4>
                            <div className="ticket-cards-scroll">
                                <div 
                                    className={`app-ticket-card reguler ${selectedTicket === 'reguler' ? 'active' : ''}`}
                                    onClick={() => setSelectedTicket('reguler')}
                                >
                                    <div className="card-icon-circle blue">
                                        <i className="fa-solid fa-user-group"></i>
                                    </div>
                                    <h5>Tiket Reguler</h5>
                                    <span className="price-tag">Rp 20.000</span>
                                    <span className="price-unit">/orang</span>
                                </div>

                                <div 
                                    className={`app-ticket-card rombongan ${selectedTicket === 'rombongan' ? 'active' : ''}`}
                                    onClick={() => setSelectedTicket('rombongan')}
                                >
                                    <div className="card-icon-circle orange">
                                        <i className="fa-solid fa-users"></i>
                                    </div>
                                    <h5>Tiket Rombongan</h5>
                                    <span className="price-tag orange">Rp 17.000</span>
                                    <span className="price-unit">/orang</span>
                                </div>

                                <div 
                                    className={`app-ticket-card kursus ${selectedTicket === 'kursus' ? 'active' : ''}`}
                                    onClick={() => setSelectedTicket('kursus')}
                                >
                                    <div className="card-icon-circle green">
                                        <i className="fa-solid fa-person-swimming"></i>
                                    </div>
                                    <h5>Kursus Renang</h5>
                                    <span className="price-tag green">Rp 15.000</span>
                                    <span className="price-unit">/1x pertemuan</span>
                                </div>
                            </div>
                        </div>

                        {/* Ticket Counter Section */}
                        <div className="app-section">
                            <span className="counter-section-title" style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-primary)', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>
                                JUMLAH {selectedTicket === 'reguler' ? 'TIKET REGULER' : selectedTicket === 'rombongan' ? 'TIKET ROMBONGAN' : 'KURSUS RENANG'}
                            </span>
                            <div className="ticket-counter-row">
                                {/* Left Side: Counter Box */}
                                <div className="counter-box-wrapper">
                                    <button 
                                        className={`counter-circle-btn minus ${ticketQty > 0 ? 'active' : ''}`}
                                        onClick={() => ticketQty > 0 && setTicketQty(ticketQty - 1)}
                                    >
                                        -
                                    </button>
                                    <div className="counter-number-display">
                                        <span className="counter-number-val">{ticketQty}</span>
                                        <span className="counter-number-unit">Orang</span>
                                    </div>
                                    <button 
                                        className="counter-circle-btn plus" 
                                        onClick={() => setTicketQty(ticketQty + 1)}
                                    >
                                        +
                                    </button>
                                </div>

                                {/* Right Side: Subtotal Display Box */}
                                <div className="subtotal-box-wrapper">
                                    <span className="subtotal-box-label">SUBTOTAL</span>
                                    <span className="subtotal-box-val">Rp {subtotal.toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Rentals Grid */}
                        <div className="app-section">
                            <h4 className="section-title"><i className="fa-solid fa-bookmark text-blue"></i> TAMBAH SEWA (OPSIONAL)</h4>
                            <div className="rental-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                {/* Rent Ban */}
                                <div className="rental-grid-card" style={{ backgroundColor: 'white', borderRadius: '16px', padding: '10px 8px', boxShadow: 'var(--shadow-soft)', border: '1px solid #eef2f7', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '94px' }}>
                                    <div className="rental-card-top" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <img src="assets/ban_illustration.png" alt="Sewa Ban" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#0c294a', lineHeight: 1.2 }}>Sewa Ban</span>
                                            <span style={{ fontSize: '0.55rem', color: '#7b8e9f', fontWeight: 600 }}>Rp 5.000</span>
                                        </div>
                                    </div>
                                    <div className="rental-card-counter" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f5f8fc', borderRadius: '8px', padding: '4px 6px', marginTop: '8px' }}>
                                        <button onClick={() => sewaBan > 0 && setSewaBan(sewaBan - 1)} style={{ background: 'none', border: 'none', color: '#1a73e8', fontWeight: 800, fontSize: '0.9rem', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>-</button>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0c294a' }}>{sewaBan}</span>
                                        <button onClick={() => setSewaBan(sewaBan + 1)} style={{ background: 'none', border: 'none', color: '#1a73e8', fontWeight: 800, fontSize: '0.9rem', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>+</button>
                                    </div>
                                </div>

                                {/* Rent Sepeda Air */}
                                <div className="rental-grid-card" style={{ backgroundColor: 'white', borderRadius: '16px', padding: '10px 8px', boxShadow: 'var(--shadow-soft)', border: '1px solid #eef2f7', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '94px' }}>
                                    <div className="rental-card-top" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <img src="assets/sepeda_air_illustration.png" alt="Sewa Sepeda Air" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#0c294a', lineHeight: 1.2 }}>Sewa Sepeda Air</span>
                                            <span style={{ fontSize: '0.55rem', color: '#7b8e9f', fontWeight: 600 }}>Rp 5.000</span>
                                        </div>
                                    </div>
                                    <div className="rental-card-counter" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f5f8fc', borderRadius: '8px', padding: '4px 6px', marginTop: '8px' }}>
                                        <button onClick={() => sewaSepeda > 0 && setSewaSepeda(sewaSepeda - 1)} style={{ background: 'none', border: 'none', color: '#1a73e8', fontWeight: 800, fontSize: '0.9rem', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>-</button>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0c294a' }}>{sewaSepeda}</span>
                                        <button onClick={() => setSewaSepeda(sewaSepeda + 1)} style={{ background: 'none', border: 'none', color: '#1a73e8', fontWeight: 800, fontSize: '0.9rem', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>+</button>
                                    </div>
                                </div>

                                {/* Rent Gazebo */}
                                <div className="rental-grid-card" style={{ backgroundColor: 'white', borderRadius: '16px', padding: '10px 8px', boxShadow: 'var(--shadow-soft)', border: '1px solid #eef2f7', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '94px' }}>
                                    <div className="rental-card-top" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <img src="assets/saung.png.png?v=1.1" alt="Sewa Gazebo" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#0c294a', lineHeight: 1.2 }}>Sewa Gazebo</span>
                                            <span style={{ fontSize: '0.55rem', color: '#7b8e9f', fontWeight: 600 }}>Rp 20.000</span>
                                        </div>
                                    </div>
                                    <div className="rental-card-counter" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f5f8fc', borderRadius: '8px', padding: '4px 6px', marginTop: '8px' }}>
                                        <button onClick={() => sewaGazebo > 0 && setSewaGazebo(sewaGazebo - 1)} style={{ background: 'none', border: 'none', color: '#1a73e8', fontWeight: 800, fontSize: '0.9rem', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>-</button>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0c294a' }}>{sewaGazebo}</span>
                                        <button onClick={() => setSewaGazebo(sewaGazebo + 1)} style={{ background: 'none', border: 'none', color: '#1a73e8', fontWeight: 800, fontSize: '0.9rem', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>+</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {/* 2. TIKET SAYA TAB */}
                {activeTab === 'tiket' && (
                    <div className="app-tab-pane fade-in" style={{ padding: '20px' }}>
                        <h3 className="tab-title">Tiket Aktif Saya</h3>
                        {activeTicketData ? (
                            <div className="digital-ticket-card">
                                <div className="ticket-card-header">
                                    <img src="assets/logo.png" alt="Logo" className="ticket-logo" />
                                    <div>
                                        <h4>WATERBOOM CIJOHO INDAH</h4>
                                        <small>{activeTicketData.code}</small>
                                    </div>
                                </div>
                                <div className="ticket-card-body">
                                    <div className="ticket-info-grid">
                                        <div>
                                            <span>JENIS TIKET</span>
                                            <p>{activeTicketData.type}</p>
                                        </div>
                                        <div>
                                            <span>JUMLAH</span>
                                            <p>{activeTicketData.qty} Orang</p>
                                        </div>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <span>TANGGAL KUNJUNGAN</span>
                                            <p>{activeTicketData.date}</p>
                                        </div>
                                        {activeTicketData.rentals.ban > 0 || activeTicketData.rentals.sepeda > 0 || activeTicketData.rentals.gazebo > 0 ? (
                                            <div style={{ gridColumn: 'span 2', borderTop: '1px dashed #ddd', paddingTop: '10px', marginTop: '5px' }}>
                                                <span>TAMBAHAN SEWA</span>
                                                <p style={{ fontSize: '0.8rem', color: '#666' }}>
                                                    {activeTicketData.rentals.ban > 0 && ` Ban (${activeTicketData.rentals.ban}x) `}
                                                    {activeTicketData.rentals.sepeda > 0 && ` Sepeda Air (${activeTicketData.rentals.sepeda}x) `}
                                                    {activeTicketData.rentals.gazebo > 0 && ` Gazebo (${activeTicketData.rentals.gazebo}x) `}
                                                </p>
                                            </div>
                                        ) : null}
                                    </div>
                                    
                                    {/* Mock Barcode Graphic */}
                                    <div className="ticket-barcode-container">
                                        <div className="mock-barcode">
                                            <span></span><span></span><span></span><span></span>
                                            <span></span><span></span><span></span><span></span>
                                            <span></span><span></span><span></span><span></span>
                                            <span></span><span></span><span></span><span></span>
                                            <span></span><span></span><span></span><span></span>
                                        </div>
                                        <small className="barcode-number">{activeTicketData.code}</small>
                                    </div>
                                </div>
                                <div className="ticket-card-footer">
                                    <p>Tunjukkan Barcode ini ke Petugas Tiket Masuk</p>
                                </div>
                            </div>
                        ) : (
                            <div className="empty-state-box">
                                <i className="fa-solid fa-ticket-simple empty-icon"></i>
                                <h4>Belum Ada Tiket Aktif</h4>
                                <p>Silakan lakukan pembelian tiket terlebih dahulu pada tab Beranda.</p>
                                <button className="btn btn-primary btn-pill" onClick={() => setActiveTab('beranda')}>
                                    Pesan Sekarang
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* 3. RIWAYAT TAB */}
                {activeTab === 'riwayat' && (
                    <div className="app-tab-pane fade-in" style={{ padding: '20px' }}>
                        <h3 className="tab-title">Riwayat Transaksi</h3>
                        <div className="history-list-container">
                            {historyList.map((item, idx) => (
                                <div key={idx} className="history-item-card">
                                    <div className="history-card-header">
                                        <div>
                                            <h4>{item.type}</h4>
                                            <small>{item.date} &bull; {item.code}</small>
                                        </div>
                                        <span className={`status-badge ${item.status === 'Aktif' ? 'active' : 'used'}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                    <div className="history-card-details">
                                        <span>Jumlah: {item.qty} tiket</span>
                                        <strong>Rp {item.total.toLocaleString('id-ID')}</strong>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. PROFIL TAB */}
                {activeTab === 'profil' && (
                    <div className="app-tab-pane fade-in" style={{ padding: '20px' }}>
                        <h3 className="tab-title">Profil Pengguna</h3>
                        
                        {/* Profile Card Header */}
                        <div className="profile-header-card">
                            <div className="profile-avatar-wrapper">
                                <img src={isCashierMode ? "assets/logo.png" : "assets/bebek.png?v=1.1"} alt="Profile Avatar" className="profile-large-avatar" style={{ objectFit: 'contain', padding: isCashierMode ? '8px' : '0' }} />
                            </div>
                            <h4>{isCashierMode ? "Petugas Kasir 1" : "Pengunjung Setia Cijoho"}</h4>
                            <p>{isCashierMode ? "kasir1@cijohoindah.com" : "pengunjung@cijohoindah.com"}</p>
                            {isCashierMode && <span className="cashier-shift-badge" style={{ backgroundColor: '#eff6ff', color: '#1a73e8', fontSize: '0.7rem', fontWeight: 800, padding: '4px 12px', borderRadius: '50px', display: 'inline-block', marginTop: '6px', border: '1px solid #dbe8f7' }}>Shift Pagi</span>}
                        </div>

                        {/* Account Menu List */}
                        <div className="profile-options-list">
                            <div className="profile-option-item">
                                <i className="fa-solid fa-user-pen"></i>
                                <span>Edit Akun Profil</span>
                                <i className="fa-solid fa-chevron-right arrow-right"></i>
                            </div>
                            <div className="profile-option-item" onClick={() => window.open('https://wa.me/6281234567890', '_blank')}>
                                <i className="fa-solid fa-headset"></i>
                                <span>Hubungi Layanan Pengunjung (WA)</span>
                                <i className="fa-solid fa-chevron-right arrow-right"></i>
                            </div>
                            <div className="profile-option-item" onClick={() => setActiveTab('beranda')}>
                                <i className="fa-solid fa-circle-question"></i>
                                <span>Pusat Bantuan & FAQ</span>
                                <i className="fa-solid fa-chevron-right arrow-right"></i>
                            </div>
                            {isCashierMode && (
                                <div 
                                    className="profile-option-item" 
                                    onClick={() => {
                                        localStorage.removeItem('staffSession');
                                        window.location.reload();
                                    }}
                                    style={{ color: '#d93838' }}
                                >
                                    <i className="fa-solid fa-arrow-right-from-bracket" style={{ color: '#d93838' }}></i>
                                    <span>Keluar / Log Out</span>
                                    <i className="fa-solid fa-chevron-right arrow-right"></i>
                                </div>
                            )}
                        </div>

                        {/* App Version Info */}
                        <div className="app-version-box">
                            <small>Waterboom Cijoho Indah Mobile v1.0.0</small>
                        </div>
                    </div>
                )}
            </div>

            {/* Checkout Payment Bar (Rendered outside scrollable content for proper fixed positioning in frame) */}
            {activeTab === 'beranda' && (
                <div className="app-checkout-bar">
                    <div className="checkout-total-col">
                        <span className="total-label">TOTAL TAGIHAN</span>
                        <span className="total-value" style={{ color: '#1a73e8', fontWeight: 900 }}>Rp {grandTotal.toLocaleString('id-ID')}</span>
                    </div>
                    <button className="checkout-btn" onClick={handlePayment}>
                        BAYAR <i className="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            )}

            {/* Bottom Tab Navigation Bar */}
            <nav className="mobile-app-bottom-nav">
                <button 
                    className={`bottom-nav-item ${activeTab === 'beranda' ? 'active' : ''}`}
                    onClick={() => setActiveTab('beranda')}
                >
                    <i className="fa-solid fa-house"></i>
                    <span>Beranda</span>
                </button>
                <button 
                    className={`bottom-nav-item ${activeTab === 'tiket' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tiket')}
                >
                    <i className="fa-solid fa-ticket"></i>
                    <span>Tiket Saya</span>
                </button>
                <button 
                    className={`bottom-nav-item ${activeTab === 'riwayat' ? 'active' : ''}`}
                    onClick={() => setActiveTab('riwayat')}
                >
                    <i className="fa-solid fa-clock-rotate-left"></i>
                    <span>Riwayat</span>
                </button>
                <button 
                    className={`bottom-nav-item ${activeTab === 'profil' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profil')}
                >
                    <i className="fa-solid fa-user"></i>
                    <span>Profil</span>
                </button>
            </nav>

            {/* Cashier Receipt Modal / Struk Penjualan */}
            {showReceipt && receiptData && (
                <div className="receipt-modal-backdrop" onClick={handleNewTransaction}>
                    <div className="receipt-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="receipt-success-icon">
                            <i className="fa-solid fa-circle-check"></i>
                        </div>
                        <h3>Pembayaran Berhasil!</h3>
                        <p className="receipt-subtitle">Transaksi telah berhasil diproses.</p>
                        
                        <div className="receipt-divider-dashed"></div>
                        
                        <div className="receipt-details-list">
                            <div className="receipt-detail-row">
                                <span>No. Transaksi</span>
                                <strong>{receiptData.code}</strong>
                            </div>
                            <div className="receipt-detail-row">
                                <span>Waktu</span>
                                <span>{receiptData.date}</span>
                            </div>
                            <div className="receipt-detail-row">
                                <span>Kasir</span>
                                <span>Petugas Kasir 1 (Shift Pagi)</span>
                            </div>
                            
                            <div className="receipt-divider-dashed"></div>
                            
                            <div className="receipt-item-title">Rincian Tiket:</div>
                            <div className="receipt-detail-row">
                                <span>{receiptData.qty}x {receiptData.type}</span>
                                <span>Rp {receiptData.subtotal.toLocaleString('id-ID')}</span>
                            </div>
                            
                            {(receiptData.rentals.ban > 0 || receiptData.rentals.sepeda > 0 || receiptData.rentals.gazebo > 0) && (
                                <>
                                    <div className="receipt-item-title" style={{ marginTop: '8px' }}>Rincian Tambahan:</div>
                                    {receiptData.rentals.ban > 0 && (
                                        <div className="receipt-detail-row">
                                            <span>{receiptData.rentals.ban}x Sewa Ban</span>
                                            <span>Rp {(receiptData.rentals.ban * receiptData.rentalsPrice.ban).toLocaleString('id-ID')}</span>
                                        </div>
                                    )}
                                    {receiptData.rentals.sepeda > 0 && (
                                        <div className="receipt-detail-row">
                                            <span>{receiptData.rentals.sepeda}x Sewa Sepeda Air</span>
                                            <span>Rp {(receiptData.rentals.sepeda * receiptData.rentalsPrice.sepeda).toLocaleString('id-ID')}</span>
                                        </div>
                                    )}
                                    {receiptData.rentals.gazebo > 0 && (
                                        <div className="receipt-detail-row">
                                            <span>{receiptData.rentals.gazebo}x Sewa Gazebo</span>
                                            <span>Rp {(receiptData.rentals.gazebo * receiptData.rentalsPrice.gazebo).toLocaleString('id-ID')}</span>
                                        </div>
                                    )}
                                </>
                            )}
                            
                            <div className="receipt-divider-dashed"></div>
                            
                            <div className="receipt-detail-row total-row">
                                <span>TOTAL TAGIHAN</span>
                                <strong style={{ color: '#1a73e8', fontSize: '1.2rem', fontWeight: 900 }}>Rp {receiptData.total.toLocaleString('id-ID')}</strong>
                            </div>
                            
                            {/* Cash calculator for cashier */}
                            <div className="receipt-cash-calculator">
                                <div className="cash-input-field">
                                    <label>Uang Tunai (Bayar)</label>
                                    <div className="cash-input-wrapper">
                                        <span className="currency-prefix">Rp</span>
                                        <input 
                                            type="number" 
                                            placeholder="0"
                                            value={cashReceived}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setCashReceived(val);
                                                const tunai = parseFloat(val) || 0;
                                                if (tunai >= receiptData.total) {
                                                    setCashChange(tunai - receiptData.total);
                                                } else {
                                                    setCashChange(0);
                                                }
                                            }}
                                            className="cash-input"
                                            style={{ border: 'none', background: 'none', outline: 'none', fontWeight: 800, width: '100%', color: '#0c294a' }}
                                        />
                                    </div>
                                </div>
                                <div className="cash-change-display">
                                    <span>Kembalian</span>
                                    <strong style={{ color: '#2b8a2e', fontSize: '1.15rem' }}>Rp {cashChange.toLocaleString('id-ID')}</strong>
                                </div>
                            </div>
                        </div>
                        
                        <div className="receipt-modal-actions">
                            <button className="receipt-btn btn-print" onClick={handlePrintReceipt}>
                                <i className="fa-solid fa-print"></i> Cetak Struk
                            </button>
                            <button className="receipt-btn btn-new" onClick={handleNewTransaction}>
                                Transaksi Baru <i className="fa-solid fa-plus"></i>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
