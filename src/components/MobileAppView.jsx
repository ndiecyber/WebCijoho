import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function MobileAppView({ onOpenBooking }) {
    const [activeTab, setActiveTab] = useState('beranda');
    const [selectedTicket, setSelectedTicket] = useState('reguler');
    const [ticketQty, setTicketQty] = useState(0);
    const [sewaBan, setSewaBan] = useState(0);
    const [sewaSepeda, setSewaSepeda] = useState(0);
    const [sewaGazebo, setSewaGazebo] = useState(0);
    const [showSidebar, setShowSidebar] = useState(false);
    const [showNotif, setShowNotif] = useState(false);

    // Purchase history & active tickets
    const [activeTicketData, setActiveTicketData] = useState(null);
    const [historyList, setHistoryList] = useState([
        {
            code: 'WCI-823902',
            date: '10 Juli 2026',
            type: 'Tiket Reguler',
            qty: 3,
            total: 60000,
            status: 'Sudah Digunakan'
        }
    ]);

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

    // Price Constants
    const PRICES = {
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

    // Calculate subtotal and grand total
    const ticketPrice = PRICES.tickets[selectedTicket];
    const subtotal = ticketPrice * ticketQty;
    const rentalsTotal = (sewaBan * PRICES.rentals.ban) + (sewaSepeda * PRICES.rentals.sepeda) + (sewaGazebo * PRICES.rentals.gazebo);
    const grandTotal = subtotal + rentalsTotal;

    // Handle Payment simulation
    const handlePayment = () => {
        const bookingCode = 'WCI-' + Math.floor(100000 + Math.random() * 900000);
        const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        
        const newTicket = {
            code: bookingCode,
            date: today,
            type: selectedTicket === 'reguler' ? 'Tiket Reguler' : selectedTicket === 'rombongan' ? 'Tiket Rombongan' : 'Kursus Renang',
            qty: ticketQty,
            rentals: {
                ban: sewaBan,
                sepeda: sewaSepeda,
                gazebo: sewaGazebo
            },
            total: grandTotal
        };

        // Set as active ticket
        setActiveTicketData(newTicket);
        
        // Add to history
        setHistoryList(prev => [
            {
                code: bookingCode,
                date: today,
                type: newTicket.type,
                qty: ticketQty,
                total: grandTotal,
                status: 'Aktif'
            },
            ...prev
        ]);

        // Reset inputs
        setTicketQty(0);
        setSewaBan(0);
        setSewaSepeda(0);
        setSewaGazebo(0);

        // Redirect to "Tiket Saya" tab
        setActiveTab('tiket');
    };

    return (
        <div className="mobile-app-wrapper">
            {/* Top App Header */}
            <header className="mobile-app-header">
                <button className="header-icon-btn" onClick={() => setShowSidebar(true)}>
                    <i className="fa-solid fa-bars-staggered"></i>
                </button>
                <div className="header-logo-container">
                    <img src="assets/logo.png" alt="Waterboom Logo" className="app-logo-img" />
                    <div className="app-logo-text">
                        <span className="app-title">WATERBOOM</span>
                        <span className="app-subtitle">CIJOHO INDAH</span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <button className="header-icon-btn notif-bell" onClick={() => setShowNotif(!showNotif)}>
                        <i className="fa-regular fa-bell"></i>
                        <span className="bell-badge"></span>
                    </button>
                    <button className="header-avatar-btn" onClick={() => setActiveTab('profil')}>
                        <img src="assets/bebek.png?v=1.1" alt="Avatar" className="app-avatar-img" />
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

            {/* Left Sidebar Menu */}
            {showSidebar && (
                <div className="sidebar-backdrop" onClick={() => setShowSidebar(false)}>
                    <div className="sidebar-content" onClick={(e) => e.stopPropagation()}>
                        <div className="sidebar-header">
                            <div className="header-logo-container">
                                <img src="assets/logo.png" alt="Waterboom Logo" className="app-logo-img" />
                                <div className="app-logo-text">
                                    <span className="app-title">WATERBOOM</span>
                                    <span className="app-subtitle">CIJOHO INDAH</span>
                                </div>
                            </div>
                            <button className="sidebar-close" onClick={() => setShowSidebar(false)}>&times;</button>
                        </div>
                        <ul className="sidebar-menu-links">
                            <li><Link to="/" onClick={() => setShowSidebar(false)}><i className="fa-solid fa-house"></i> Beranda Utama</Link></li>
                            <li><Link to="/wahana" onClick={() => setShowSidebar(false)}><i className="fa-solid fa-water"></i> Daftar Wahana</Link></li>
                            <li><Link to="/galeri" onClick={() => setShowSidebar(false)}><i className="fa-solid fa-images"></i> Galeri Foto</Link></li>
                            <li><Link to="/berita" onClick={() => setShowSidebar(false)}><i className="fa-solid fa-newspaper"></i> Berita & Promo</Link></li>
                            <li><Link to="/fasilitas" onClick={() => setShowSidebar(false)}><i className="fa-solid fa-toilet-portable"></i> Fasilitas</Link></li>
                            <li><Link to="/tentang-kami" onClick={() => setShowSidebar(false)}><i className="fa-solid fa-circle-info"></i> Tentang Kami</Link></li>
                            <li><Link to="/kontak" onClick={() => setShowSidebar(false)}><i className="fa-solid fa-envelope"></i> Hubungi Kami</Link></li>
                        </ul>
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
                            <h4 className="section-title"><i className="fa-solid fa-ticket-simple text-blue"></i> PILIH JENIS TIKET</h4>
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
                                    <span className="price-unit">/pertemuan</span>
                                </div>
                            </div>
                        </div>

                        {/* Ticket Counter */}
                        <div className="app-section counter-section">
                            <div className="counter-row">
                                <div>
                                    <span className="counter-label-top">JUMLAH TIKET {selectedTicket.toUpperCase()}</span>
                                    <div className="counter-control">
                                        <button className="counter-btn" onClick={() => ticketQty > 0 && setTicketQty(ticketQty - 1)}>-</button>
                                        <span className="counter-value">{ticketQty}</span>
                                        <button className="counter-btn" onClick={() => setTicketQty(ticketQty + 1)}>+</button>
                                    </div>
                                </div>
                                <div className="subtotal-display">
                                    <span className="subtotal-label">SUBTOTAL</span>
                                    <span className="subtotal-value">Rp {subtotal.toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Rentals Grid */}
                        <div className="app-section">
                            <h4 className="section-title"><i className="fa-solid fa-box-open text-blue"></i> TAMBAH SEWA (OPSIONAL)</h4>
                            <div className="rentals-list">
                                {/* Rent Ban */}
                                <div className="rental-item-card">
                                    <img src="assets/bebek.png?v=1.1" alt="Sewa Ban" className="rental-thumb" />
                                    <div className="rental-info">
                                        <h5>Sewa Ban</h5>
                                        <span className="rental-price">Rp 5.000</span>
                                    </div>
                                    <div className="rental-counter">
                                        <button className="rental-cbtn" onClick={() => sewaBan > 0 && setSewaBan(sewaBan - 1)}>-</button>
                                        <span className="rental-cval">{sewaBan}</span>
                                        <button className="rental-cbtn" onClick={() => setSewaBan(sewaBan + 1)}>+</button>
                                    </div>
                                </div>

                                {/* Rent Sepeda Air */}
                                <div className="rental-item-card">
                                    <img src="assets/kids.png?v=1.1" alt="Sewa Sepeda Air" className="rental-thumb" />
                                    <div className="rental-info">
                                        <h5>Sepeda Air</h5>
                                        <span className="rental-price">Rp 5.000</span>
                                    </div>
                                    <div className="rental-counter">
                                        <button className="rental-cbtn" onClick={() => sewaSepeda > 0 && setSewaSepeda(sewaSepeda - 1)}>-</button>
                                        <span className="rental-cval">{sewaSepeda}</span>
                                        <button className="rental-cbtn" onClick={() => setSewaSepeda(sewaSepeda + 1)}>+</button>
                                    </div>
                                </div>

                                {/* Rent Gazebo */}
                                <div className="rental-item-card">
                                    <img src="assets/saung.png.png?v=1.1" alt="Sewa Gazebo" className="rental-thumb" />
                                    <div className="rental-info">
                                        <h5>Sewa Gazebo</h5>
                                        <span className="rental-price">Rp 20.000</span>
                                    </div>
                                    <div className="rental-counter">
                                        <button className="rental-cbtn" onClick={() => sewaGazebo > 0 && setSewaGazebo(sewaGazebo - 1)}>-</button>
                                        <span className="rental-cval">{sewaGazebo}</span>
                                        <button className="rental-cbtn" onClick={() => setSewaGazebo(sewaGazebo + 1)}>+</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Checkout Payment Bar */}
                        <div className="app-checkout-bar">
                            <div className="checkout-total-col">
                                <span className="total-label">TOTAL TAGIHAN</span>
                                <span className="total-value">Rp {grandTotal.toLocaleString('id-ID')}</span>
                            </div>
                            <button className="checkout-btn" onClick={handlePayment}>
                                BAYAR <i className="fa-solid fa-arrow-right"></i>
                            </button>
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
                                <img src="assets/bebek.png?v=1.1" alt="Profile Avatar" className="profile-large-avatar" />
                            </div>
                            <h4>Pengunjung Setia Cijoho</h4>
                            <p>pengunjung@cijohoindah.com</p>
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
                        </div>

                        {/* App Version Info */}
                        <div className="app-version-box">
                            <small>Waterboom Cijoho Indah Mobile v1.0.0</small>
                        </div>
                    </div>
                )}
            </div>

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
        </div>
    );
}
