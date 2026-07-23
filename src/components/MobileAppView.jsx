import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase'; // pastikan path sesuai (komponen ada di components/)

export default function MobileAppView({ onOpenBooking, isCashierMode = false }) {
    const [activeTab, setActiveTab] = useState('beranda');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab && ['beranda', 'tiket', 'riwayat', 'profil'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [location]);

    const [selectedTicket, setSelectedTicket] = useState('reguler');
    const [ticketQty, setTicketQty] = useState(2);
    const [sewaBan, setSewaBan] = useState(1);
    const [sewaSepeda, setSewaSepeda] = useState(0);
    const [sewaGazebo, setSewaGazebo] = useState(1);
    const [showSidebar, setShowSidebar] = useState(false);
    const [showNotif, setShowNotif] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptData, setReceiptData] = useState(null);

    // Direct WhatsApp Checkout Modal states (No account required)
    const [showWACheckoutModal, setShowWACheckoutModal] = useState(false);
    const [buyerName, setBuyerName] = useState('Pengunjung Cijoho');
    const [buyerPhone, setBuyerPhone] = useState('081234567890');
    const [visitDate, setVisitDate] = useState(() => {
        return new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    });

    // Mode Pembelian: 'offline' (Loket Fisik Direct Struk) vs 'online' (WhatsApp PDF Admin)
    const [posMode, setPosMode] = useState(isCashierMode ? 'offline' : 'online');
    const [showOfflinePOSModal, setShowOfflinePOSModal] = useState(false);
    const [showOfflineReceiptModal, setShowOfflineReceiptModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [offlineReceiptData, setOfflineReceiptData] = useState(null);

    const [cashReceived, setCashReceived] = useState('');
    const [cashChange, setCashChange] = useState(0);

    // --- Fungsi bantu untuk menyimpan transaksi ke Supabase ---
    const saveTransactionToSupabase = async (bookingCode, items, paymentMethod, cashierName, customerName, status = 'lunas') => {
        try {
            const rows = items.map(item => ({
                booking_code: bookingCode,
                ticket_type: item.ticket_type,
                quantity: item.quantity,
                total_price: item.total_price,
                customer_name: customerName || 'Pengunjung',
                status: status,
                payment_method: paymentMethod,
                cashier_name: cashierName || 'Petugas Kasir'
            }));

            const { error } = await supabase.from('transactions').insert(rows);
            if (error) {
                console.error('Gagal menyimpan ke Supabase:', error);
                return false;
            }
            return true;
        } catch (err) {
            console.error('Error Supabase:', err);
            return false;
        }
    };

    // --- OFFICE POS: handleConfirmOfflinePOS (MODIFIED) ---
    const handleConfirmOfflinePOS = async (e) => {
        e.preventDefault();
        const receiptCode = 'STR-' + Math.floor(100000 + Math.random() * 900000);
        const typeName = selectedTicket === 'reguler' ? 'Tiket Reguler' : selectedTicket === 'rombongan' ? 'Tiket Rombongan' : 'Kursus Renang';
        const paidAmount = paymentMethod === 'cash' ? (parseInt(cashReceived) || grandTotal) : grandTotal;
        const change = paidAmount - grandTotal;

        // Siapkan items untuk Supabase
        const items = [];
        // Tiket masuk
        items.push({
            ticket_type: selectedTicket, // 'reguler', 'rombongan', 'kursus'
            quantity: ticketQty,
            total_price: subtotal
        });
        // Sewa-sewa
        if (sewaBan > 0) {
            items.push({
                ticket_type: 'ban',
                quantity: sewaBan,
                total_price: sewaBan * PRICES.rentals.ban
            });
        }
        if (sewaSepeda > 0) {
            items.push({
                ticket_type: 'angsa', // mewakili sepeda air
                quantity: sewaSepeda,
                total_price: sewaSepeda * PRICES.rentals.sepeda
            });
        }
        if (sewaGazebo > 0) {
            items.push({
                ticket_type: 'gazebo',
                quantity: sewaGazebo,
                total_price: sewaGazebo * PRICES.rentals.gazebo
            });
        }

        const paymentMethodStr = paymentMethod === 'cash' ? 'tunai' : 'qris';

        // Simpan ke Supabase (async, tidak perlu tunggu untuk lanjut)
        saveTransactionToSupabase(
            receiptCode,
            items,
            paymentMethodStr,
            'Petugas Kasir 1', // bisa diganti sesuai login nanti
            'Pengunjung Offline',
            'lunas'
        );

        // Simpan juga ke localStorage untuk history lokal
        const newReceipt = {
            code: receiptCode,
            date: visitDate,
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            cashierName: 'Petugas Kasir 1',
            type: typeName,
            qty: ticketQty,
            ticketPrice: ticketPrice,
            subtotal: subtotal,
            rentals: { ban: sewaBan, sepeda: sewaSepeda, gazebo: sewaGazebo },
            total: grandTotal,
            paymentMethod: paymentMethodStr === 'tunai' ? 'Tunai (Cash)' : 'QRIS / EDC',
            paidAmount: paidAmount,
            change: change >= 0 ? change : 0,
            status: 'Lunas - Struk Loket Fisik'
        };

        const updatedHistory = [newReceipt, ...historyList];
        setHistoryList(updatedHistory);
        localStorage.setItem('waterboom_sales_history', JSON.stringify(updatedHistory));
        setOfflineReceiptData(newReceipt);

        setShowOfflinePOSModal(false);
        setShowOfflineReceiptModal(true);
    };

    // --- WHATSAPP ONLINE ORDER (MODIFIED) ---
    const handleConfirmWhatsAppOrder = async (e) => {
        e.preventDefault();

        if (!buyerName.trim()) {
            alert('Silakan masukkan Nama Pemesan.');
            return;
        }

        const bookingCode = 'WCI-' + Math.floor(100000 + Math.random() * 900000);
        const typeName = selectedTicket === 'reguler' ? 'Tiket Reguler' : selectedTicket === 'rombongan' ? 'Tiket Rombongan' : 'Kursus Renang';

        // Items untuk Supabase
        const items = [];
        items.push({
            ticket_type: selectedTicket,
            quantity: ticketQty,
            total_price: subtotal
        });
        if (sewaBan > 0) {
            items.push({
                ticket_type: 'ban',
                quantity: sewaBan,
                total_price: sewaBan * PRICES.rentals.ban
            });
        }
        if (sewaSepeda > 0) {
            items.push({
                ticket_type: 'angsa',
                quantity: sewaSepeda,
                total_price: sewaSepeda * PRICES.rentals.sepeda
            });
        }
        if (sewaGazebo > 0) {
            items.push({
                ticket_type: 'gazebo',
                quantity: sewaGazebo,
                total_price: sewaGazebo * PRICES.rentals.gazebo
            });
        }

        // Simpan ke Supabase dengan status 'pending' (menunggu PDF)
        saveTransactionToSupabase(
            bookingCode,
            items,
            'transfer', // metode pembayaran dianggap transfer karena online
            'Admin Online',
            buyerName,
            'pending'
        );

        // WhatsApp message
        let rentalsTextArray = [];
        if (sewaBan > 0) rentalsTextArray.push(`• ${sewaBan}x Sewa Ban (Rp ${(sewaBan * PRICES.rentals.ban).toLocaleString('id-ID')})`);
        if (sewaSepeda > 0) rentalsTextArray.push(`• ${sewaSepeda}x Sewa Sepeda Air (Rp ${(sewaSepeda * PRICES.rentals.sepeda).toLocaleString('id-ID')})`);
        if (sewaGazebo > 0) rentalsTextArray.push(`• ${sewaGazebo}x Sewa Gazebo (Rp ${(sewaGazebo * PRICES.rentals.gazebo).toLocaleString('id-ID')})`);
        const rentalsFormatted = rentalsTextArray.length > 0 ? rentalsTextArray.join('\n') : '• Tidak ada tambahan sewa';

        const waMessage =
            `Halo Admin Waterboom Cijoho Indah! Saya telah membeli tiket secara langsung tanpa akun:

*KODE BOOKING*: ${bookingCode}
*Nama Pemesan*: ${buyerName}
*No. WhatsApp*: ${buyerPhone}
*Tanggal Kunjungan*: ${visitDate}

*RINCIAN TIKET & SEWA*:
• ${ticketQty}x ${typeName} (Rp ${subtotal.toLocaleString('id-ID')})
${rentalsFormatted}

*TOTAL TAGIHAN*: Rp ${grandTotal.toLocaleString('id-ID')}

Mohon diproses konfirmasinya dan dikirimkan *Tiket Resmi PDF* ke nomor WhatsApp ini. Terima kasih!`;

        const newTicketObj = {
            code: bookingCode,
            date: visitDate,
            name: buyerName,
            phone: buyerPhone,
            type: typeName,
            ticketTypeKey: selectedTicket,
            qty: ticketQty,
            ticketPrice: ticketPrice,
            subtotal: subtotal,
            rentals: { ban: sewaBan, sepeda: sewaSepeda, gazebo: sewaGazebo },
            rentalsPrice: { ban: PRICES.rentals.ban, sepeda: PRICES.rentals.sepeda, gazebo: PRICES.rentals.gazebo },
            total: grandTotal
        };

        const updatedHistory = [{
            code: bookingCode,
            date: visitDate,
            name: buyerName,
            phone: buyerPhone,
            type: typeName,
            qty: ticketQty,
            total: grandTotal,
            status: 'Menunggu PDF WA Admin',
            details: newTicketObj
        }, ...historyList];

        setHistoryList(updatedHistory);
        localStorage.setItem('waterboom_sales_history', JSON.stringify(updatedHistory));
        setActiveTicketData(newTicketObj);

        // Open WhatsApp link with pre-filled text
        const adminWaNumber = '6281234567890'; // Official Admin WhatsApp
        const waUrl = `https://wa.me/${adminWaNumber}?text=${encodeURIComponent(waMessage)}`;
        window.open(waUrl, '_blank');

        setShowWACheckoutModal(false);
        setActiveTab('tiket');
    };

    // Purchase history & active tickets (STATE TETAP SEPERTI SEMULA)
    const [activeTicketData, setActiveTicketData] = useState({
        code: 'WCI-823902',
        date: '22 Juli 2026',
        name: 'Pengunjung Cijoho',
        phone: '6281234567890',
        type: 'Tiket Reguler',
        ticketTypeKey: 'reguler',
        qty: 2,
        ticketPrice: 20000,
        subtotal: 40000,
        rentals: { ban: 1, sepeda: 0, gazebo: 1 },
        total: 65000
    });

    const [historyList, setHistoryList] = useState(() => {
        const saved = localStorage.getItem('waterboom_sales_history');
        if (saved) return JSON.parse(saved);
        return [
            {
                code: 'WCI-823902',
                date: '22 Juli 2026',
                name: 'Pengunjung Cijoho',
                phone: '081234567890',
                type: 'Tiket Reguler',
                qty: 2,
                total: 65000,
                status: 'Menunggu PDF WA Admin',
                details: {
                    ticketTypeKey: 'reguler',
                    qty: 2,
                    subtotal: 40000,
                    rentals: { ban: 1, sepeda: 0, gazebo: 1 },
                    total: 65000
                }
            }
        ];
    });

    // Slider state for Hero Card (TIDAK BERUBAH)
    const sliderSlides = [
        {
            img: 'assets/dash.jpeg?v=1.1',
            title: 'Selamat Datang!',
            subtitle: 'Nikmati liburan seru di Waterboom Cijoho Indah'
        },
        {
            img: 'assets/1.png?v=1.1',
            title: 'Wahana Air & Kolam Renang',
            subtitle: 'Seluncuran raksasa & saung gazebo keluarga'
        },
        {
            img: 'assets/bebek.png?v=1.1',
            title: 'Sewa Sepeda Air & Wahana Bebek',
            subtitle: 'Pengalaman seru dan asyik untuk buah hati'
        }
    ];
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % sliderSlides.length);
        }, 3500);
        return () => clearInterval(interval);
    }, [sliderSlides.length]);

    // Price State synchronized with localStorage (TIDAK BERUBAH)
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
    const ticketPrice = PRICES.tickets[selectedTicket] || 20000;
    const subtotal = ticketPrice * ticketQty;
    const rentalsTotal = (sewaBan * PRICES.rentals.ban) + (sewaSepeda * PRICES.rentals.sepeda) + (sewaGazebo * PRICES.rentals.gazebo);
    const grandTotal = subtotal + rentalsTotal;

    // Trigger Payment / Checkout Modal (Offline vs Online)
    const handlePaymentClick = () => {
        if (ticketQty <= 0) {
            alert('Silakan tentukan jumlah tiket terlebih dahulu!');
            return;
        }

        if (posMode === 'offline') {
            setCashReceived(grandTotal.toString());
            setCashChange(0);
            setShowOfflinePOSModal(true);
        } else {
            setShowWACheckoutModal(true);
        }
    };

    // Cashier direct checkout (TIDAK DIPAKAI LAGI, tapi dibiarkan agar tidak error)
    const processCashierPayment = () => {
        const bookingCode = 'WCI-' + Math.floor(100000 + Math.random() * 900000);
        const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

        const newTicket = {
            code: bookingCode,
            date: today,
            name: 'Pengunjung Kasir',
            phone: '-',
            type: selectedTicket === 'reguler' ? 'Tiket Reguler' : selectedTicket === 'rombongan' ? 'Tiket Rombongan' : 'Kursus Renang',
            ticketTypeKey: selectedTicket,
            qty: ticketQty,
            ticketPrice: ticketPrice,
            subtotal: subtotal,
            rentals: { ban: sewaBan, sepeda: sewaSepeda, gazebo: sewaGazebo },
            rentalsPrice: { ban: PRICES.rentals.ban, sepeda: PRICES.rentals.sepeda, gazebo: PRICES.rentals.gazebo },
            total: grandTotal
        };

        const updatedList = [{
            code: bookingCode,
            date: today,
            type: newTicket.type,
            qty: ticketQty,
            total: grandTotal,
            status: 'Lunas',
            details: newTicket
        }, ...historyList];

        setHistoryList(updatedList);
        localStorage.setItem('waterboom_sales_history', JSON.stringify(updatedList));

        setReceiptData(newTicket);
        setCashReceived('');
        setCashChange(0);
        setShowReceipt(true);
    };

    // --- SISA KODE JSX TIDAK BERUBAH SAMA SEKALI ---
    // (Ikuti seluruh kode JSX yang sudah ada, tidak ada pemotongan)
    return (
        <div className="mobile-app-wrapper">
            {/* Top App Header (Hanya Tampil di Mode Kasir, Disembunyikan untuk Pemesanan Tiket Online) */}
            {isCashierMode && (
                <header className="mobile-app-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button className="header-icon-btn menu-toggle" onClick={() => setShowSidebar(!showSidebar)} style={{ fontSize: '1.4rem', border: 'none', background: 'none' }}>
                            <i className="fa-solid fa-bars"></i>
                        </button>
                        <div className="header-logo-container" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img src="assets/logo.png" alt="Waterboom Logo" className="app-logo-img" style={{ height: '42px', width: 'auto', objectFit: 'contain' }} />
                            <div className="app-logo-text" style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.05' }}>
                                <span className="app-title" style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f2942', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                    KASIR - WATERBOOM
                                </span>
                                <span className="app-subtitle" style={{ fontSize: '0.92rem', fontWeight: 800, color: '#2563eb', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                                    CIJOHO INDAH
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button className="header-icon-btn notif-bell" onClick={() => setShowNotif(!showNotif)}>
                            <i className="fa-regular fa-bell"></i>
                            <span className="bell-badge"></span>
                        </button>
                    </div>
                </header>
            )}

            {/* Mobile Drawer Menu */}
            {showSidebar && (
                <div className="mobile-drawer-overlay" onClick={() => setShowSidebar(false)}>
                    <div className="mobile-drawer-pane" onClick={(e) => e.stopPropagation()}>
                        <div className="drawer-head">
                            <div className="header-logo-container" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <img src="assets/logo.png" alt="Logo" style={{ height: '38px', width: 'auto', objectFit: 'contain' }} />
                                <div className="app-logo-text" style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.05' }}>
                                    <span className="app-title" style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f2942', letterSpacing: '0.5px', textTransform: 'uppercase' }}>WATERBOOM</span>
                                    <span className="app-subtitle" style={{ fontSize: '0.85rem', fontWeight: 800, color: '#2563eb', letterSpacing: '1.2px', textTransform: 'uppercase' }}>CIJOHO INDAH</span>
                                </div>
                            </div>
                            <button onClick={() => setShowSidebar(false)} style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>
                        </div>
                        <div className="drawer-menu-list">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowSidebar(false);
                                    if (window.history.length > 1) {
                                        navigate(-1);
                                    } else {
                                        navigate('/');
                                    }
                                }}
                                style={{
                                    color: '#2563eb',
                                    fontWeight: 800,
                                    backgroundColor: '#eff6ff',
                                    border: '1px solid #bfdbfe',
                                    borderRadius: '12px',
                                    marginBottom: '8px'
                                }}
                            >
                                <i className="fa-solid fa-arrow-left" style={{ color: '#2563eb' }}></i> Kembali
                            </button>
                            <button onClick={() => { setActiveTab('beranda'); setShowSidebar(false); }} className={activeTab === 'beranda' ? 'active' : ''}>
                                <i className="fa-solid fa-house"></i> Beranda Utama
                            </button>
                            <button onClick={() => { setActiveTab('tiket'); setShowSidebar(false); }} className={activeTab === 'tiket' ? 'active' : ''}>
                                <i className="fa-solid fa-ticket"></i> Tiket Saya
                            </button>
                            <button onClick={() => { setActiveTab('riwayat'); setShowSidebar(false); }} className={activeTab === 'riwayat' ? 'active' : ''}>
                                <i className="fa-solid fa-clock-rotate-left"></i> Riwayat Transaksi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Core Tab Content Container */}
            <div className={`mobile-app-content ${!isCashierMode ? 'visitor-view-content' : ''}`} style={{ paddingTop: isCashierMode ? '74px' : '0px', paddingLeft: '12px', paddingRight: '12px', marginTop: 0 }}>
                {/* 1. BERANDA / BOOKING TAB */}
                {activeTab === 'beranda' && (
                    <div className="app-tab-pane fade-in" style={{ paddingTop: 0, marginTop: 0 }}>
                        {/* Locked Banner Card (High Contrast White Text) */}
                        <div
                            className="hero-slider-track-container"
                            style={{
                                overflow: 'hidden',
                                borderRadius: '16px',
                                position: 'relative',
                                margin: '0',
                                boxShadow: '0 6px 20px rgba(12, 41, 74, 0.12)',
                                height: '160px',
                                backgroundImage: `linear-gradient(to top, rgba(10, 25, 47, 0.95) 0%, rgba(10, 25, 47, 0.55) 65%, rgba(10, 25, 47, 0.2) 100%), url('${sliderSlides[currentSlide].img}')`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                padding: '14px 16px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-end',
                                color: '#ffffff',
                                boxSizing: 'border-box'
                            }}
                        >
                            <h3 style={{ color: '#ffffff', fontSize: '1.18rem', fontWeight: 900, textShadow: '0 2px 8px rgba(0, 0, 0, 0.9), 0 1px 3px rgba(0, 0, 0, 0.9)', margin: 0, lineHeight: 1.2, letterSpacing: '0.3px' }}>{sliderSlides[currentSlide].title}</h3>
                            <p style={{ color: 'rgba(255, 255, 255, 0.95)', fontSize: '0.8rem', marginTop: '4px', textShadow: '0 1px 4px rgba(0, 0, 0, 0.9)', margin: 0, fontWeight: 600 }}>{sliderSlides[currentSlide].subtitle}</p>

                            <div className="slider-wave-decor" style={{ margin: '6px 0 0 0', opacity: 0.9 }}>
                                <svg width="36" height="5" viewBox="0 0 42 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0 3 C 5 0, 5 6, 10 3 C 15 0, 15 6, 20 3 C 25 0, 25 6, 30 3 C 35 0, 35 6, 40 3" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                                </svg>
                            </div>
                        </div>

                        {/* Mode Switcher: OFFLINE vs ONLINE (Hanya Tampil di Mode Kasir) */}
                        {isCashierMode ? (
                            <div style={{ padding: '0 16px', marginTop: '10px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', backgroundColor: '#e2e8f0', padding: '4px', borderRadius: '12px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setPosMode('offline')}
                                        style={{
                                            backgroundColor: posMode === 'offline' ? '#0c294a' : 'transparent',
                                            color: posMode === 'offline' ? 'white' : '#64748b',
                                            border: 'none',
                                            padding: '10px',
                                            borderRadius: '10px',
                                            fontSize: '0.82rem',
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <i className="fa-solid fa-store"></i> OFFLINE (Loket Fisik)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPosMode('online')}
                                        style={{
                                            backgroundColor: posMode === 'online' ? '#25D366' : 'transparent',
                                            color: posMode === 'online' ? 'white' : '#64748b',
                                            border: 'none',
                                            padding: '10px',
                                            borderRadius: '10px',
                                            fontSize: '0.82rem',
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <i className="fa-brands fa-whatsapp"></i> ONLINE (WA PDF)
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ padding: '0 4px', marginTop: '12px', marginBottom: '18px' }}>
                                <div style={{
                                    backgroundColor: '#f0fdf4',
                                    border: '1.5px solid #86efac',
                                    borderRadius: '14px',
                                    padding: '12px 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    boxShadow: '0 3px 10px rgba(37, 211, 102, 0.08)'
                                }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#25D366', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.15rem', flexShrink: 0, boxShadow: '0 2px 8px rgba(37, 211, 102, 0.25)' }}>
                                        <i className="fa-brands fa-whatsapp"></i>
                                    </div>
                                    <div>
                                        <h5 style={{ margin: 0, color: '#166534', fontSize: '0.88rem', fontWeight: 900, letterSpacing: '0.2px' }}>PEMESANAN TIKET ONLINE WA</h5>
                                        <small style={{ color: '#15803d', fontSize: '0.76rem', fontWeight: 600, display: 'block', marginTop: '1px', lineHeight: 1.2 }}>Tiket PDF resmi langsung dikirim ke WhatsApp Anda via Admin</small>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Ticket Selector Section */}
                        <div className="app-section" style={{ marginTop: '22px' }}>
                            <h4 className="section-title" style={{ marginTop: 0, marginBottom: '14px' }}><i className="fa-solid fa-tag text-blue"></i> PILIH JENIS TIKET</h4>
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

                        {/* Ticket Counter & Subtotal Section */}
                        <div className="app-section">
                            <span className="counter-section-title" style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0c294a', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>
                                JUMLAH {selectedTicket === 'reguler' ? 'TIKET REGULER' : selectedTicket === 'rombongan' ? 'TIKET ROMBONGAN' : 'KURSUS RENANG'}
                            </span>
                            <div className="ticket-counter-row">
                                <div className="counter-box-wrapper">
                                    <button
                                        className="counter-btn-sq minus"
                                        onClick={() => ticketQty > 0 && setTicketQty(ticketQty - 1)}
                                    >
                                        -
                                    </button>
                                    <div className="counter-number-display">
                                        <span className="counter-number-val">{ticketQty}</span>
                                        <span className="counter-number-unit">Orang</span>
                                    </div>
                                    <button
                                        className="counter-btn-sq plus"
                                        onClick={() => setTicketQty(ticketQty + 1)}
                                    >
                                        +
                                    </button>
                                </div>

                                <div className="subtotal-box-wrapper">
                                    <span className="subtotal-box-label">SUBTOTAL</span>
                                    <span className="subtotal-box-val">Rp {subtotal.toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Rentals Grid */}
                        <div className="app-section">
                            <h4 className="section-title"><i className="fa-solid fa-bookmark text-blue"></i> TAMBAH SEWA (OPSIONAL)</h4>
                            <div className="rental-cards-grid">
                                <div className="rental-grid-card">
                                    <div className="rental-card-top">
                                        <img src="assets/ban_illustration.png" alt="Sewa Ban" className="rental-card-img" />
                                        <div className="rental-card-meta">
                                            <span className="rental-card-name">Sewa Ban</span>
                                            <span className="rental-card-price">Rp 5.000</span>
                                        </div>
                                    </div>
                                    <div className="rental-card-counter">
                                        <button onClick={() => sewaBan > 0 && setSewaBan(sewaBan - 1)} className="r-btn">-</button>
                                        <span className="r-val">{sewaBan}</span>
                                        <button onClick={() => setSewaBan(sewaBan + 1)} className="r-btn">+</button>
                                    </div>
                                </div>

                                <div className="rental-grid-card">
                                    <div className="rental-card-top">
                                        <img src="assets/sepeda_air_illustration.png" alt="Sewa Sepeda Air" className="rental-card-img" />
                                        <div className="rental-card-meta">
                                            <span className="rental-card-name">Sewa Sepeda Air</span>
                                            <span className="rental-card-price">Rp 5.000</span>
                                        </div>
                                    </div>
                                    <div className="rental-card-counter">
                                        <button onClick={() => sewaSepeda > 0 && setSewaSepeda(sewaSepeda - 1)} className="r-btn">-</button>
                                        <span className="r-val">{sewaSepeda}</span>
                                        <button onClick={() => setSewaSepeda(sewaSepeda + 1)} className="r-btn">+</button>
                                    </div>
                                </div>

                                <div className="rental-grid-card">
                                    <div className="rental-card-top">
                                        <img src="assets/saung.png.png?v=1.1" alt="Sewa Gazebo" className="rental-card-img" />
                                        <div className="rental-card-meta">
                                            <span className="rental-card-name">Sewa Gazebo</span>
                                            <span className="rental-card-price">Rp 20.000</span>
                                        </div>
                                    </div>
                                    <div className="rental-card-counter">
                                        <button onClick={() => sewaGazebo > 0 && setSewaGazebo(sewaGazebo - 1)} className="r-btn">-</button>
                                        <span className="r-val">{sewaGazebo}</span>
                                        <button onClick={() => setSewaGazebo(sewaGazebo + 1)} className="r-btn">+</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {/* 2. TIKET SAYA TAB */}
                {activeTab === 'tiket' && (
                    <div className="app-tab-pane fade-in" style={{ padding: '20px' }}>
                        <h3 className="tab-title">Tiket Saya (Tanpa Login)</h3>
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
                                            <span>PEMESAN</span>
                                            <p>{activeTicketData.name}</p>
                                        </div>
                                        <div>
                                            <span>JENIS TIKET</span>
                                            <p>{activeTicketData.type}</p>
                                        </div>
                                        <div>
                                            <span>JUMLAH TIKET</span>
                                            <p>{activeTicketData.qty} Orang</p>
                                        </div>
                                        <div>
                                            <span>TANGGAL KUNJUNGAN</span>
                                            <p>{activeTicketData.date}</p>
                                        </div>
                                    </div>
                                    <div style={{ backgroundColor: '#fffbe3', border: '1px solid #fef3c7', padding: '12px 14px', borderRadius: '12px', margin: '14px 0 10px 0', fontSize: '0.8rem', color: '#92400e', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <i className="fa-solid fa-clock-rotate-left" style={{ fontSize: '1.2rem', flexShrink: 0 }}></i>
                                        <span>Klik tombol hijau di bawah untuk konfirmasi via WhatsApp Admin &amp; ambil E-Tiket PDF resmi.</span>
                                    </div>

                                    {/* Direct WhatsApp Confirmation Button in Tiket Saya Card */}
                                    <button
                                        className="btn-wa-ticket-confirm"
                                        onClick={() => {
                                            const adminWaNumber = '6281234567890';
                                            let rentalsText = '';
                                            if (activeTicketData.rentals?.ban > 0) rentalsText += `\n• Sewa Ban: ${activeTicketData.rentals.ban}x`;
                                            if (activeTicketData.rentals?.sepeda > 0) rentalsText += `\n• Sewa Sepeda Air: ${activeTicketData.rentals.sepeda}x`;
                                            if (activeTicketData.rentals?.gazebo > 0) rentalsText += `\n• Sewa Gazebo: ${activeTicketData.rentals.gazebo}x`;

                                            const waMessage = `Halo Admin Waterboom Cijoho Indah! 👋\nSaya ingin konfirmasi pesanan Tiket Online:\n\n📌 *Kode Booking:* ${activeTicketData.code}\n👤 *Nama Pemesan:* ${activeTicketData.name}\n📱 *No. WA:* ${activeTicketData.phone || '-'}\n📅 *Tgl Kunjungan:* ${activeTicketData.date}\n🎟️ *Detail Tiket:* ${activeTicketData.type} (${activeTicketData.qty} Orang)${rentalsText ? `\n🚣 *Tambahan Sewa:*${rentalsText}` : ''}\n💰 *Total Pembayaran:* Rp ${activeTicketData.total.toLocaleString('id-ID')}\n\nMohon diproses konfirmasinya dan dikirimkan *Tiket Resmi PDF* ke nomor WhatsApp ini. Terima kasih!`;

                                            window.open(`https://wa.me/${adminWaNumber}?text=${encodeURIComponent(waMessage)}`, '_blank');
                                        }}
                                        style={{
                                            margin: '6px 0 14px 0',
                                            width: '100%',
                                            backgroundColor: '#25D366',
                                            color: 'white',
                                            border: 'none',
                                            padding: '12px 16px',
                                            borderRadius: '12px',
                                            fontSize: '0.88rem',
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            boxShadow: '0 4px 12px rgba(37, 211, 102, 0.25)',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <i className="fa-brands fa-whatsapp" style={{ fontSize: '1.2rem' }}></i>
                                        Chat WA Admin untuk E-Tiket PDF
                                    </button>

                                    <div className="ticket-barcode-container">
                                        <div className="mock-barcode">
                                            <span></span><span></span><span></span><span></span>
                                            <span></span><span></span><span></span><span></span>
                                            <span></span><span></span><span></span><span></span>
                                        </div>
                                        <small className="barcode-number">{activeTicketData.code}</small>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="empty-state-box">
                                <i className="fa-solid fa-ticket-simple empty-icon"></i>
                                <h4>Belum Ada Tiket Pemesanan</h4>
                            </div>
                        )}
                    </div>
                )}

                {/* 3. RIWAYAT TAB (Murni Informasi Chat Admin tanpa tombol WA berulang) */}
                {activeTab === 'riwayat' && (
                    <div className="app-tab-pane fade-in" style={{ padding: '16px 12px' }}>
                        <h3 className="tab-title" style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f2942', marginBottom: '14px' }}>Riwayat Transaksi Langsung</h3>
                        <div className="history-list-container">
                            {historyList.map((item, idx) => (
                                <div key={idx} className="history-item-card" style={{ marginBottom: '14px', padding: '14px', borderRadius: '16px', border: '1.5px solid #e2e8f0', backgroundColor: 'white', boxShadow: '0 4px 12px rgba(12, 41, 74, 0.04)' }}>
                                    <div className="history-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 900, color: '#0f2942' }}>{item.type}</h4>
                                            <small style={{ color: '#64748b', fontSize: '0.78rem' }}>{item.date} &bull; {item.code}</small>
                                        </div>
                                        <span className="status-badge used" style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>{item.status}</span>
                                    </div>
                                    <div className="history-card-details" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px dashed #e2e8f0' }}>
                                        <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>Pemesanan: {item.name}</span>
                                        <strong style={{ fontSize: '0.95rem', color: '#2563eb', fontWeight: 900 }}>Rp {item.total.toLocaleString('id-ID')}</strong>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. PROFIL TAB */}
                {activeTab === 'profil' && (
                    <div className="app-tab-pane fade-in" style={{ padding: '20px' }}>
                        <h3 className="tab-title">Informasi Pengunjung</h3>
                        <div className="profile-header-card">
                            <div className="profile-avatar-wrapper">
                                <img src="assets/bebek.png?v=1.1" alt="Profile Avatar" className="profile-large-avatar" />
                            </div>
                            <h4>Beli Tiket Tanpa Akun</h4>
                            <p>Pembelian tiket langsung tanpa perlu buat akun / login</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Checkout Payment Bar */}
            {activeTab === 'beranda' && (
                <div className="app-checkout-bar">
                    <div className="checkout-total-col">
                        <span className="total-label">TOTAL TAGIHAN</span>
                        <span className="total-value">Rp {grandTotal.toLocaleString('id-ID')}</span>
                    </div>
                    <button className="checkout-btn" onClick={handlePaymentClick}>
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
            </nav>

            {/* MODAL KONFIRMASI PEMBELIAN LANGSUNG & WA ADMIN (TANPA AKUN) */}
            {showWACheckoutModal && (
                <div className="v-modal-backdrop" onClick={() => setShowWACheckoutModal(false)}>
                    <div className="v-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
                        <div className="v-modal-head" style={{ backgroundColor: '#0c294a', color: 'white' }}>
                            <h4 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className="fa-solid fa-ticket"></i> Form Beli Tiket (Tanpa Akun)
                            </h4>
                            <button onClick={() => setShowWACheckoutModal(false)} style={{ color: 'white' }}>&times;</button>
                        </div>

                        <form onSubmit={handleConfirmWhatsAppOrder} className="v-modal-body" style={{ padding: '20px' }}>
                            <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '16px' }}>
                                Masukkan nama & nomor WhatsApp Anda. Konfirmasi pemesanan akan dikirim ke WhatsApp Admin dan Admin akan mengirimkan Tiket Resmi (PDF) ke nomor Anda.
                            </p>

                            <div className="input-group-field" style={{ marginBottom: '14px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0c294a' }}>Nama Pemesan</label>
                                <input
                                    type="text"
                                    value={buyerName}
                                    onChange={(e) => setBuyerName(e.target.value)}
                                    required
                                    placeholder="Contoh: Budi Santoso"
                                    className="v-input"
                                />
                            </div>

                            <div className="input-group-field" style={{ marginBottom: '14px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0c294a' }}>No. WhatsApp / HP Pemesan</label>
                                <input
                                    type="text"
                                    value={buyerPhone}
                                    onChange={(e) => setBuyerPhone(e.target.value)}
                                    required
                                    placeholder="Contoh: 081234567890"
                                    className="v-input"
                                />
                            </div>

                            {/* Summary Box */}
                            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '8px' }}>RINGKASAN PESANAN:</div>
                                <div style={{ fontSize: '0.85rem', color: '#0c294a', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span>{ticketQty}x {selectedTicket === 'reguler' ? 'Tiket Reguler' : selectedTicket === 'rombongan' ? 'Tiket Rombongan' : 'Kursus Renang'}</span>
                                    <strong>Rp {subtotal.toLocaleString('id-ID')}</strong>
                                </div>
                                {sewaBan > 0 && <div style={{ fontSize: '0.8rem', color: '#64748b' }}>• {sewaBan}x Sewa Ban</div>}
                                {sewaSepeda > 0 && <div style={{ fontSize: '0.8rem', color: '#64748b' }}>• {sewaSepeda}x Sewa Sepeda Air</div>}
                                {sewaGazebo > 0 && <div style={{ fontSize: '0.8rem', color: '#64748b' }}>• {sewaGazebo}x Sewa Gazebo</div>}

                                <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '8px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>TOTAL BAYAR</span>
                                    <strong style={{ fontSize: '1.2rem', color: '#1a73e8', fontWeight: 900 }}>Rp {grandTotal.toLocaleString('id-ID')}</strong>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn w-full btn-pill"
                                style={{ backgroundColor: '#25D366', color: 'white', fontWeight: 800, padding: '14px', fontSize: '0.92rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)' }}
                            >
                                <i className="fa-brands fa-whatsapp" style={{ fontSize: '1.3rem' }}></i> KONFIRMASI KE WA ADMIN (TERIMA PDF)
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL LOKET KASIR OFFLINE */}
            {showOfflinePOSModal && (
                <div className="v-modal-backdrop" onClick={() => setShowOfflinePOSModal(false)}>
                    <div className="v-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', backgroundColor: 'white' }}>
                        <div className="v-modal-head" style={{ backgroundColor: '#0c294a', color: 'white' }}>
                            <h4 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className="fa-solid fa-store"></i> Pembayaran Loket Offline
                            </h4>
                            <button onClick={() => setShowOfflinePOSModal(false)} style={{ color: 'white' }}>&times;</button>
                        </div>

                        <form onSubmit={handleConfirmOfflinePOS} className="v-modal-body" style={{ padding: '20px' }}>
                            <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '14px' }}>
                                Transaksi offline langsung di tempat. Tiket & Struk fisik langsung dicetak di lokasi kasir.
                            </p>

                            {/* Payment Method Selector */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0c294a', display: 'block', marginBottom: '8px' }}>Metode Pembayaran</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('cash')}
                                        style={{
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: paymentMethod === 'cash' ? '2px solid #0c294a' : '1px solid #cbd5e1',
                                            backgroundColor: paymentMethod === 'cash' ? '#eff6ff' : 'white',
                                            color: paymentMethod === 'cash' ? '#0c294a' : '#64748b',
                                            fontWeight: 800,
                                            fontSize: '0.85rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <i className="fa-solid fa-money-bill-wave"></i> Tunai (Cash)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('qris')}
                                        style={{
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: paymentMethod === 'qris' ? '2px solid #0c294a' : '1px solid #cbd5e1',
                                            backgroundColor: paymentMethod === 'qris' ? '#eff6ff' : 'white',
                                            color: paymentMethod === 'qris' ? '#0c294a' : '#64748b',
                                            fontWeight: 800,
                                            fontSize: '0.85rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <i className="fa-solid fa-qrcode"></i> QRIS / EDC
                                    </button>
                                </div>
                            </div>

                            {paymentMethod === 'cash' && (
                                <div className="input-group-field" style={{ marginBottom: '14px' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0c294a' }}>Jumlah Uang Tunai Diterima (Rp)</label>
                                    <input
                                        type="number"
                                        value={cashReceived}
                                        onChange={(e) => setCashReceived(e.target.value)}
                                        placeholder={`Minimal Rp ${grandTotal.toLocaleString('id-ID')}`}
                                        className="v-input"
                                        required
                                    />
                                    {parseInt(cashReceived) >= grandTotal && (
                                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#047857', marginTop: '6px', backgroundColor: '#d1fae5', padding: '6px 10px', borderRadius: '6px' }}>
                                            Kembalian: Rp {(parseInt(cashReceived) - grandTotal).toLocaleString('id-ID')}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Order Summary */}
                            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '6px' }}>RINCIAN TRANSAKSI OFFLINE:</div>
                                <div style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', color: '#0c294a' }}>
                                    <span>{ticketQty}x {selectedTicket === 'reguler' ? 'Tiket Reguler' : selectedTicket === 'rombongan' ? 'Tiket Rombongan' : 'Kursus Renang'}</span>
                                    <strong>Rp {subtotal.toLocaleString('id-ID')}</strong>
                                </div>
                                {sewaBan > 0 && <div style={{ fontSize: '0.8rem', color: '#64748b' }}>• {sewaBan}x Sewa Ban</div>}
                                {sewaSepeda > 0 && <div style={{ fontSize: '0.8rem', color: '#64748b' }}>• {sewaSepeda}x Sewa Sepeda Air</div>}
                                {sewaGazebo > 0 && <div style={{ fontSize: '0.8rem', color: '#64748b' }}>• {sewaGazebo}x Sewa Gazebo</div>}

                                <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '8px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>TOTAL</span>
                                    <strong style={{ fontSize: '1.2rem', color: '#0c294a', fontWeight: 900 }}>Rp {grandTotal.toLocaleString('id-ID')}</strong>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn w-full btn-pill"
                                style={{ backgroundColor: '#0c294a', color: 'white', fontWeight: 800, padding: '14px', fontSize: '0.92rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                <i className="fa-solid fa-print"></i> BAYAR & CETAK STRUK TIKET FISIK
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL TAMPILAN STRUK & TIKET FISIK (OFFLINE) */}
            {showOfflineReceiptModal && offlineReceiptData && (
                <div className="v-modal-backdrop" onClick={() => setShowOfflineReceiptModal(false)}>
                    <div className="v-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', backgroundColor: 'white' }}>
                        <div className="v-modal-head" style={{ backgroundColor: '#0c294a', color: 'white' }}>
                            <h4 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className="fa-solid fa-receipt"></i> Struk & Tiket Fisik (Loket Offline)
                            </h4>
                            <button onClick={() => setShowOfflineReceiptModal(false)} style={{ color: 'white' }}>&times;</button>
                        </div>

                        <div className="v-modal-body" style={{ padding: '20px' }}>
                            <div id="thermal-receipt-printable" style={{ border: '2px solid #0c294a', borderRadius: '14px', padding: '16px', backgroundColor: '#fff', fontFamily: 'monospace' }}>
                                <div style={{ textAlign: 'center', borderBottom: '1px dashed #0c294a', paddingBottom: '10px', marginBottom: '12px' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0c294a', margin: 0 }}>WATERBOOM CIJOHO INDAH</h3>
                                    <small style={{ display: 'block', color: '#64748b', fontWeight: 700 }}>STRUK & TIKET FISIK RESMI LOKET</small>
                                    <small style={{ color: '#047857', fontWeight: 900, fontSize: '0.75rem' }}>[ LUNAS / VALIDATED ]</small>
                                </div>

                                <div style={{ fontSize: '0.8rem', lineHeight: '1.4', marginBottom: '10px' }}>
                                    <div><strong>No. Struk:</strong> {offlineReceiptData.code}</div>
                                    <div><strong>Tanggal:</strong> {offlineReceiptData.date} ({offlineReceiptData.time})</div>
                                    <div><strong>Kasir:</strong> {offlineReceiptData.cashierName}</div>
                                    <div><strong>Metode:</strong> {offlineReceiptData.paymentMethod}</div>
                                </div>

                                <div style={{ borderTop: '1px dashed #cbd5e1', borderBottom: '1px dashed #cbd5e1', padding: '8px 0', margin: '8px 0', fontSize: '0.8rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{offlineReceiptData.qty}x {offlineReceiptData.type}</span>
                                        <strong>Rp {offlineReceiptData.subtotal?.toLocaleString('id-ID')}</strong>
                                    </div>
                                    {offlineReceiptData.rentals?.ban > 0 && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>• {offlineReceiptData.rentals.ban}x Sewa Ban</div>}
                                    {offlineReceiptData.rentals?.sepeda > 0 && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>• {offlineReceiptData.rentals.sepeda}x Sewa Sepeda Air</div>}
                                    {offlineReceiptData.rentals?.gazebo > 0 && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>• {offlineReceiptData.rentals.gazebo}x Sewa Gazebo</div>}
                                </div>

                                <div style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', fontWeight: 900, color: '#0c294a', marginBottom: '4px' }}>
                                    <span>TOTAL:</span>
                                    <span>Rp {offlineReceiptData.total?.toLocaleString('id-ID')}</span>
                                </div>
                                <div style={{ fontSize: '0.78rem', display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                                    <span>DITERIMA:</span>
                                    <span>Rp {offlineReceiptData.paidAmount?.toLocaleString('id-ID')}</span>
                                </div>
                                <div style={{ fontSize: '0.78rem', display: 'flex', justifyContent: 'space-between', color: '#047857', fontWeight: 800 }}>
                                    <span>KEMBALIAN:</span>
                                    <span>Rp {offlineReceiptData.change?.toLocaleString('id-ID')}</span>
                                </div>

                                <div style={{ textAlign: 'center', marginTop: '14px', borderTop: '1px dashed #cbd5e1', paddingTop: '10px' }}>
                                    <div style={{ fontSize: '3rem', color: '#0c294a', lineHeight: 1 }}>
                                        <i className="fa-solid fa-barcode"></i>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 900, letterSpacing: '2px', color: '#0c294a' }}>{offlineReceiptData.code}</div>
                                    <small style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', marginTop: '4px' }}>Tunjukkan struk/tiket fisik ini di wahana air</small>
                                </div>
                            </div>

                            <button
                                onClick={() => window.print()}
                                style={{ width: '100%', backgroundColor: '#1a73e8', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                <i className="fa-solid fa-print"></i> Cetak Struk Tiket Fisik
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}