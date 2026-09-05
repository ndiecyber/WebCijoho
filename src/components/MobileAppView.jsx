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
    const [sewaGazebo, setSewaGazebo] = useState(0);
    const [showSidebar, setShowSidebar] = useState(false);
    const [showNotif, setShowNotif] = useState(false);
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: 'Pembayaran QRIS Berhasil 💳',
            desc: 'Transaksi #WCI-823902 senilai Rp 40.000 telah lunas via QRIS.',
            time: '5 menit yang lalu',
            read: false,
            type: 'payment'
        },
        {
            id: 2,
            title: 'Sewa Gazebo Terkonfirmasi 🎪',
            desc: 'Gazebo Santai No. 04 disewa oleh Sdr. Pengunjung.',
            time: '25 menit yang lalu',
            read: false,
            type: 'rental'
        },
        {
            id: 3,
            title: 'Laporan Shift Kasir Diperbarui 📊',
            desc: 'Shift Pagi berhasil divalidasi oleh Petugas Kasir 1.',
            time: '2 jam yang lalu',
            read: true,
            type: 'system'
        }
    ]);
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
    const [copyToast, setCopyToast] = useState('');
    const [showPDFTicketModal, setShowPDFTicketModal] = useState(false);
    const [pdfTicketData, setPdfTicketData] = useState(null);
    const [printFormat, setPrintFormat] = useState('full'); // 'full' | 'invoice' | 'ticket' | 'rental'

    const [isPrinting, setIsPrinting] = useState(false);

    // --- Helper Cetak Terisolasi (Dosen Requirement: Separate PDF Print Mode) ---
    const triggerIsolatedPrint = (formatMode) => {
        if (isPrinting) return;
        setIsPrinting(true);
        setPrintFormat(formatMode);
        const printClass = formatMode === 'card' ? 'print-mode-pdf-card' : `print-mode-${formatMode}`;
        document.body.className = printClass;
        setTimeout(() => {
            window.print();
            setTimeout(() => {
                document.body.className = '';
                setIsPrinting(false);
            }, 1000);
        }, 120);
    };

    // --- State Laporan & Analytic Kasir (Mojo POS Style) ---
    const [reportSubTab, setReportSubTab] = useState('harian'); // 'harian' | 'bulanan' | 'transaksi'
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPayment, setFilterPayment] = useState('all'); // 'all' | 'tunai' | 'qris'
    const [selectedReportDate, setSelectedReportDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [selectedReportMonth, setSelectedReportMonth] = useState(() => new Date().toISOString().slice(0, 7));
    const [showPrintReportModal, setShowPrintReportModal] = useState(false);

    // --- Helper Format & Kirim WA Manual ---
    const formatWAText = (item) => {
        if (!item) return '';
        const name = item.buyerName || item.name || 'Pengunjung';
        const code = item.code || item.bookingCode || '-';
        const date = item.date || new Date().toLocaleDateString('id-ID');
        const type = item.type || 'Tiket';
        const qty = item.qty || item.quantity || 1;
        const total = item.total ? item.total.toLocaleString('id-ID') : '0';
        let rentalsText = '';
        if (item.rentals?.ban > 0) rentalsText += `\n  • ${item.rentals.ban}x Sewa Ban`;
        if (item.rentals?.sepeda > 0) rentalsText += `\n  • ${item.rentals.sepeda}x Sewa Sepeda Air`;
        if (item.rentals?.gazebo > 0) rentalsText += `\n  • ${item.rentals.gazebo}x Sewa Gazebo`;

        return `Halo kak *${name}*! 👋\nBerikut rincian E-Struk & Tiket Resmi *Waterboom Cijoho Indah*:\n\n📌 *Kode Booking/Struk:* ${code}\n📅 *Tgl Kunjungan:* ${date}\n🎟️ *Tiket:* ${type} (${qty} Orang)\n🚣 *Layanan Sewa:* ${rentalsText || '\n  • Tidak ada'}\n💰 *Total Pembayaran:* Rp ${total}\n💳 *Status / Pembayaran:* ${item.status || item.paymentMethod || 'Lunas'}\n\nMohon tunjukkan bukti WhatsApp ini di pintu masuk wahana. Terima kasih dan selamat berlibur! 🏊‍♂️✨`;
    };

    const handleSendWAManual = (item) => {
        if (!item) return;
        let phone = item.buyerPhone || item.phone || '';
        if (!phone || phone === '-' || phone.trim() === '') {
            phone = prompt('Masukkan Nomor WhatsApp Pembeli/Tujuan (contoh: 081234567890):', '');
        }
        if (!phone || phone.trim() === '') return;

        const cleanPhone = phone.replace(/[^0-9]/g, '');
        const formattedPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
        const waText = formatWAText(item);
        window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(waText)}`, '_blank');
    };

    const handleCopyWAText = (item) => {
        const waText = formatWAText(item);
        if (!waText) return;
        navigator.clipboard.writeText(waText);
        setCopyToast('Teks Pesan WA Berhasil Disalin!');
        setTimeout(() => setCopyToast(''), 3000);
    };

    // --- Fungsi bantu untuk menyimpan transaksi ke Supabase ---
    const saveTransactionToSupabase = async (bookingCode, items, paymentMethod, cashierName, customerName, status = 'lunas', channel = 'offline') => {
        try {
            const rows = items.map(item => {
                // Tentukan transaction_type otomatis: ban, angsa, gazebo, sepeda selalu 'sewa'
                const isRental = ['ban', 'angsa', 'gazebo', 'sepeda'].includes((item.ticket_type || '').toLowerCase()) ||
                                 (item.ticket_type && item.ticket_type.toLowerCase().includes('sewa'));
                const type = isRental ? 'sewa' : 'beli';

                return {
                    booking_code: bookingCode,
                    ticket_type: item.ticket_type,
                    transaction_type: type,
                    quantity: item.quantity,
                    total_price: item.total_price,
                    customer_name: customerName || 'Pengunjung',
                    status: status,
                    payment_method: paymentMethod,
                    channel: channel,
                    cashier_name: cashierName || 'Petugas Kasir',
                    created_at: new Date().toISOString()
                };
            });

            const { data, error } = await supabase.from('transactions').insert(rows);
            if (error) {
                console.error('Gagal menyimpan ke Supabase:', error);
                alert(`Gagal Menyimpan Transaksi: ${error.message}`);
                return false;
            }
            return true;
        } catch (err) {
            console.error('Error Supabase:', err);
            alert(`Terjadi Kesalahan: ${err.message}`);
            return false;
        }
    };

    // --- OFFICE POS: handleConfirmOfflinePOS (MODIFIED) ---
    const handleConfirmOfflinePOS = async (e) => {
        e.preventDefault();
        const receiptCode = 'STR-' + Math.floor(100000 + Math.random() * 900000);
        const ticketTypeName = selectedTicket === 'reguler' ? 'Tiket Reguler' : selectedTicket === 'rombongan' ? 'Tiket Rombongan' : 'Kursus Renang';
        const hasTickets = ticketQty > 0;
        const hasRentals = (sewaBan > 0 || sewaSepeda > 0 || sewaGazebo > 0);

        let typeName = '';
        if (hasTickets && hasRentals) {
            typeName = `${ticketTypeName} + Sewa`;
        } else if (hasTickets) {
            typeName = ticketTypeName;
        } else {
            typeName = 'Sewa Layanan / Add-on';
        }

        const paidAmount = paymentMethod === 'cash' ? (parseInt(cashReceived) || grandTotal) : grandTotal;
        const change = paidAmount - grandTotal;

        // Siapkan items untuk Supabase
        const items = [];
        if (hasTickets) {
            items.push({
                ticket_type: selectedTicket,
                quantity: ticketQty,
                total_price: subtotal
            });
        }
        if (sewaBan > 0) {
            items.push({
                ticket_type: 'ban',
                quantity: sewaBan,
                total_price: sewaBan * (PRICES.rentals?.ban || 10000)
            });
        }
        if (sewaSepeda > 0) {
            items.push({
                ticket_type: 'angsa',
                quantity: sewaSepeda,
                total_price: sewaSepeda * (PRICES.rentals?.sepeda || 25000)
            });
        }
        if (sewaGazebo > 0) {
            items.push({
                ticket_type: 'gazebo',
                quantity: sewaGazebo,
                total_price: sewaGazebo * (PRICES.rentals?.gazebo || 30000)
            });
        }

        const paymentMethodStr = paymentMethod === 'cash' ? 'tunai' : 'qris';

        // Simpan ke Supabase
        await saveTransactionToSupabase(
            receiptCode,
            items,
            paymentMethodStr,
            'Petugas Kasir 1',
            'Pengunjung Offline',
            'lunas',
            'offline'
        );

        // Simpan juga ke localStorage untuk history lokal
        const newReceipt = {
            code: receiptCode,
            date: visitDate,
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
            cashierName: 'Petugas Kasir 1',
            category: hasTickets ? 'Beli' : 'Sewa',
            type: typeName,
            qty: hasTickets ? ticketQty : (sewaBan + sewaSepeda + sewaGazebo),
            ticketPrice: ticketPrice,
            subtotal: subtotal,
            rentals: { ban: sewaBan, sepeda: sewaSepeda, gazebo: sewaGazebo },
            total: grandTotal,
            paymentMethod: paymentMethodStr === 'tunai' ? 'Tunai (Cash)' : 'QRIS / EDC',
            method: paymentMethodStr === 'tunai' ? 'Tunai' : 'QRIS',
            channel: 'Offline',
            paidAmount: paidAmount,
            change: change >= 0 ? change : 0,
            status: 'Lunas - Struk Loket Fisik',
            created_at: new Date().toISOString()
        };

        const updatedHistory = [newReceipt, ...historyList];
        setHistoryList(updatedHistory);
        localStorage.setItem('waterboom_sales_history', JSON.stringify(updatedHistory));
        window.dispatchEvent(new Event('storage'));
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

        const hasTickets = ticketQty > 0;
        const hasRentals = (sewaBan > 0 || sewaSepeda > 0 || sewaGazebo > 0);
        if (!hasTickets && !hasRentals) {
            alert('Silakan pilih minimal 1 tiket masuk atau 1 sewa/add-on!');
            return;
        }

        const bookingCode = 'WCI-' + Math.floor(100000 + Math.random() * 900000);
        const ticketTypeName = selectedTicket === 'reguler' ? 'Tiket Reguler' : selectedTicket === 'rombongan' ? 'Tiket Rombongan' : 'Kursus Renang';

        let typeName = '';
        if (hasTickets && hasRentals) {
            typeName = `${ticketTypeName} + Sewa`;
        } else if (hasTickets) {
            typeName = ticketTypeName;
        } else {
            typeName = 'Sewa Layanan / Add-on';
        }

        // Items untuk Supabase
        const items = [];
        if (hasTickets) {
            items.push({
                ticket_type: selectedTicket,
                quantity: ticketQty,
                total_price: subtotal
            });
        }
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

        // Simpan ke Supabase
        await saveTransactionToSupabase(
            bookingCode,
            items,
            'qris',
            isCashierMode ? 'Petugas Kasir 1' : 'Admin Online',
            buyerName,
            isCashierMode ? 'lunas' : 'pending',
            'online'
        );

        const newTicketObj = {
            code: bookingCode,
            date: visitDate,
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
            name: buyerName,
            phone: buyerPhone,
            category: hasTickets ? 'Beli' : 'Sewa',
            type: typeName,
            ticketTypeKey: selectedTicket,
            qty: hasTickets ? ticketQty : (sewaBan + sewaSepeda + sewaGazebo),
            ticketPrice: ticketPrice,
            subtotal: subtotal,
            rentals: { ban: sewaBan, sepeda: sewaSepeda, gazebo: sewaGazebo },
            rentalsPrice: { ban: PRICES.rentals.ban, sepeda: PRICES.rentals.sepeda, gazebo: PRICES.rentals.gazebo },
            total: grandTotal,
            channel: 'Online',
            method: 'QRIS',
            status: isCashierMode ? 'Lunas - E-Tiket PDF' : 'Menunggu PDF WA Admin',
            created_at: new Date().toISOString()
        };

        const updatedHistory = [{
            code: bookingCode,
            date: visitDate,
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
            name: buyerName,
            phone: buyerPhone,
            category: hasTickets ? 'Beli' : 'Sewa',
            type: typeName,
            qty: hasTickets ? ticketQty : (sewaBan + sewaSepeda + sewaGazebo),
            total: grandTotal,
            channel: 'Online',
            method: 'QRIS',
            status: isCashierMode ? 'Lunas - E-Tiket PDF' : 'Menunggu PDF WA Admin',
            created_at: new Date().toISOString(),
            details: newTicketObj
        }, ...historyList];

        setHistoryList(updatedHistory);
        localStorage.setItem('waterboom_sales_history', JSON.stringify(updatedHistory));
        window.dispatchEvent(new Event('storage'));
        setActiveTicketData(newTicketObj);
        setPdfTicketData(newTicketObj);

        setShowWACheckoutModal(false);

        // Jika Kasir Mode: LANGSUNG CETAK / UNDUH TIKET PDF (TANPA KIRIM WA)
        if (isCashierMode) {
            setShowPDFTicketModal(true);
        } else {
            // Flow Pengunjung (Buka WhatsApp ke Admin)
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

            const adminWaNumber = '6281234567890';
            const waUrl = `https://wa.me/${adminWaNumber}?text=${encodeURIComponent(waMessage)}`;
            window.open(waUrl, '_blank');
            setActiveTab('tiket');
        }
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
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return [];
            }
        }
        return [];
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

    // --- Kalkulasi Analytic Penjualan Kasir (Real-Time Mojo POS Style) ---
    const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    // Filter transaksi berdasarkan pencarian dan metode pembayaran
    const filteredHistoryList = historyList.filter(item => {
        const matchesSearch = !searchQuery.trim() ||
            (item.code && item.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.buyerName && item.buyerName.toLowerCase().includes(searchQuery.toLowerCase()));

        const pMethod = (item.paymentMethod || '').toLowerCase();
        const matchesPayment = filterPayment === 'all' ||
            (filterPayment === 'tunai' && (pMethod.includes('tunai') || pMethod.includes('cash'))) ||
            (filterPayment === 'qris' && (pMethod.includes('qris') || pMethod.includes('edc') || pMethod.includes('transfer')));

        return matchesSearch && matchesPayment;
    });

    // Metric Harian (Hari Ini)
    const todayTransactions = historyList.filter(item => item.date === todayStr || !item.date);
    const todayRevenue = todayTransactions.reduce((acc, curr) => acc + (curr.total || 0), 0);
    const todayCashRev = todayTransactions.filter(i => {
        const pm = (i.paymentMethod || '').toLowerCase();
        return pm.includes('tunai') || pm.includes('cash');
    }).reduce((a, c) => a + (c.total || 0), 0);
    const todayQrisRev = Math.max(0, todayRevenue - todayCashRev);

    // Volume Barang Terjual Hari Ini
    let todayTicketsCount = 0;
    let todayBanCount = 0;
    let todaySepedaCount = 0;
    let todayGazeboCount = 0;

    todayTransactions.forEach(item => {
        if (item.qty > 0) todayTicketsCount += item.qty;
        const r = item.details?.rentals || item.rentals;
        if (r?.ban) todayBanCount += r.ban;
        if (r?.sepeda) todaySepedaCount += r.sepeda;
        if (r?.gazebo) todayGazeboCount += r.gazebo;
    });

    // Metric Bulanan (Selected Month: YYYY-MM)
    const monthFilterStr = selectedReportMonth || new Date().toISOString().slice(0, 7);
    const monthTransactions = historyList.filter(item => {
        if (!selectedReportMonth) return true;
        if (item.created_at && item.created_at.startsWith(monthFilterStr)) return true;
        if (item.date) {
            const [yearStr, monthNum] = monthFilterStr.split('-');
            const monthsIndo = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            const monthIdx = parseInt(monthNum || '1', 10) - 1;
            const targetMonthName = monthsIndo[monthIdx] || '';
            if (item.date.includes(targetMonthName) || item.date.includes(monthFilterStr) || item.date.includes(`${yearStr}`)) return true;
        }
        return true;
    });

    const monthRevenue = monthTransactions.reduce((acc, curr) => acc + (curr.total || 0), 0);
    const monthCashRev = monthTransactions.filter(i => {
        const pm = (i.paymentMethod || i.method || '').toLowerCase();
        return pm.includes('tunai') || pm.includes('cash');
    }).reduce((a, c) => a + (c.total || 0), 0);
    const monthQrisRev = Math.max(0, monthRevenue - monthCashRev);

    let monthTicketsCount = 0;
    let monthBanCount = 0;
    let monthSepedaCount = 0;
    let monthGazeboCount = 0;

    monthTransactions.forEach(item => {
        if (item.qty > 0) monthTicketsCount += item.qty;
        const r = item.details?.rentals || item.rentals;
        if (r?.ban) monthBanCount += r.ban;
        if (r?.sepeda) monthSepedaCount += r.sepeda;
        if (r?.gazebo) monthGazeboCount += r.gazebo;
    });

    // Trigger Payment / Checkout Modal (Offline vs Online)
    const handlePaymentClick = () => {
        const hasTickets = ticketQty > 0;
        const hasRentals = (sewaBan > 0 || sewaSepeda > 0 || sewaGazebo > 0);

        if (!hasTickets && !hasRentals) {
            alert('Silakan pilih minimal 1 tiket masuk atau 1 sewa/add-on!');
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
                        <button
                            className="header-icon-btn notif-bell"
                            onClick={() => setShowNotif(!showNotif)}
                            style={{ position: 'relative', cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.25rem' }}
                            title="Pusat Notifikasi"
                        >
                            <i className={`fa-${notifications.filter(n => !n.read).length > 0 ? 'solid' : 'regular'} fa-bell`} style={{ color: notifications.filter(n => !n.read).length > 0 ? '#2563eb' : '#64748b' }}></i>
                            {notifications.filter(n => !n.read).length > 0 && (
                                <span className="bell-badge" style={{
                                    position: 'absolute',
                                    top: '-2px',
                                    right: '-2px',
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    fontSize: '0.62rem',
                                    fontWeight: 900,
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2px solid white'
                                }}>
                                    {notifications.filter(n => !n.read).length}
                                </span>
                            )}
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
                            <button onClick={() => { setActiveTab('riwayat'); setShowSidebar(false); }} className={activeTab === 'riwayat' ? 'active' : ''}>
                                <i className="fa-solid fa-clock-rotate-left"></i> Riwayat Transaksi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Core Tab Content Container */}
            <div className={`mobile-app-content ${!isCashierMode ? 'visitor-view-content' : ''}`} style={{ paddingTop: isCashierMode ? '10px' : '0px', paddingLeft: '12px', paddingRight: '12px', marginTop: 0 }}>
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
                                            backgroundColor: posMode === 'online' ? '#1a73e8' : 'transparent',
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
                                        <i className="fa-solid fa-file-pdf"></i> ONLINE (Cetak Tiket PDF)
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
                            <h4 className="section-title" style={{ marginTop: 0, marginBottom: '14px' }}><i className="fa-solid fa-tag text-blue"></i> 1. TIKET MASUK (OPSIONAL)</h4>
                            <div className="ticket-cards-scroll">
                                <div
                                    className={`app-ticket-card reguler ${selectedTicket === 'reguler' ? 'active' : ''}`}
                                    onClick={() => setSelectedTicket('reguler')}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div className="card-icon-circle blue" style={{ marginBottom: 0 }}>
                                            <i className="fa-solid fa-user-group"></i>
                                        </div>
                                        <div>
                                            <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f2942' }}>Tiket Reguler</h5>
                                            <span className="price-unit" style={{ fontSize: '0.76rem', color: '#64748b' }}>/orang</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span className="price-tag">Rp 20.000</span>
                                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: selectedTicket === 'reguler' ? '6px solid #1a73e8' : '2px solid #cbd5e1', backgroundColor: 'white', boxSizing: 'border-box' }}></div>
                                    </div>
                                </div>

                                <div
                                    className={`app-ticket-card rombongan ${selectedTicket === 'rombongan' ? 'active' : ''}`}
                                    onClick={() => setSelectedTicket('rombongan')}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div className="card-icon-circle orange" style={{ marginBottom: 0 }}>
                                            <i className="fa-solid fa-users"></i>
                                        </div>
                                        <div>
                                            <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f2942' }}>Tiket Rombongan</h5>
                                            <span className="price-unit" style={{ fontSize: '0.76rem', color: '#64748b' }}>/orang</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span className="price-tag orange">Rp 17.000</span>
                                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: selectedTicket === 'rombongan' ? '6px solid #f97316' : '2px solid #cbd5e1', backgroundColor: 'white', boxSizing: 'border-box' }}></div>
                                    </div>
                                </div>

                                <div
                                    className={`app-ticket-card kursus ${selectedTicket === 'kursus' ? 'active' : ''}`}
                                    onClick={() => setSelectedTicket('kursus')}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div className="card-icon-circle green" style={{ marginBottom: 0 }}>
                                            <i className="fa-solid fa-person-swimming"></i>
                                        </div>
                                        <div>
                                            <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f2942' }}>Kursus Renang</h5>
                                            <span className="price-unit" style={{ fontSize: '0.76rem', color: '#64748b' }}>/1x pertemuan</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span className="price-tag green">Rp 15.000</span>
                                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: selectedTicket === 'kursus' ? '6px solid #16a34a' : '2px solid #cbd5e1', backgroundColor: 'white', boxSizing: 'border-box' }}></div>
                                    </div>
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

                        {/* Rentals Grid (Single Select / Mutually Exclusive) */}
                        <div className="app-section">
                            <h4 className="section-title" style={{ display: 'block' }}>
                                <i className="fa-solid fa-bookmark text-blue"></i> 2. SEWA & LAYANAN ADD-ON (PILIH 1 JENIS SEWA PER TRANSAKSI)
                            </h4>
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
                                        <button onClick={() => { setSewaBan(sewaBan + 1); setSewaSepeda(0); setSewaGazebo(0); }} className="r-btn">+</button>
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
                                        <button onClick={() => { setSewaSepeda(sewaSepeda + 1); setSewaBan(0); setSewaGazebo(0); }} className="r-btn">+</button>
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
                                        <button onClick={() => { setSewaGazebo(sewaGazebo + 1); setSewaBan(0); setSewaSepeda(0); }} className="r-btn">+</button>
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

                {/* 3. RIWAYAT & LAPORAN TAB (SISTEM LAPORAN KASIR MODERN STYLE MAJOO / MOJO POS) */}
                {activeTab === 'riwayat' && (
                    <div className="app-tab-pane fade-in" style={{ padding: '16px 12px' }}>
                        {isCashierMode ? (
                            <div>
                                {/* Header Laporan & Button Cetak Shift */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', backgroundColor: '#0c294a', color: 'white', padding: '16px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(12, 41, 74, 0.2)' }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: 'white' }}>Laporan & Rekapitulasi Kasir</h3>
                                        <small style={{ color: '#60a5fa', fontSize: '0.75rem', fontWeight: 700 }}>Sistem Kasir Modern</small>
                                    </div>
                                    <button
                                        onClick={() => setShowPrintReportModal(true)}
                                        style={{ backgroundColor: '#1a73e8', color: 'white', border: 'none', padding: '9px 14px', borderRadius: '10px', fontWeight: 900, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
                                    >
                                        <i className="fa-solid fa-print"></i> Cetak Shift
                                    </button>
                                </div>

                                {/* Grid Metric Analytics Cards */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                                    <div style={{ backgroundColor: '#eff6ff', border: '1.5px solid #bfdbfe', padding: '12px', borderRadius: '14px' }}>
                                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1e40af', display: 'block' }}>OMSET HARI INI</span>
                                        <strong style={{ fontSize: '1.15rem', color: '#1d4ed8', fontWeight: 900, display: 'block', margin: '2px 0' }}>
                                            Rp {todayRevenue.toLocaleString('id-ID')}
                                        </strong>
                                        <small style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: 700 }}>{todayTransactions.length} Transaksi Selesai</small>
                                    </div>

                                    <div style={{ backgroundColor: '#f0fdf4', border: '1.5px solid #bbf7d0', padding: '12px', borderRadius: '14px' }}>
                                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#166534', display: 'block' }}>PENJUALAN TUNAI</span>
                                        <strong style={{ fontSize: '1.15rem', color: '#15803d', fontWeight: 900, display: 'block', margin: '2px 0' }}>
                                            Rp {todayCashRev.toLocaleString('id-ID')}
                                        </strong>
                                        <small style={{ fontSize: '0.7rem', color: '#22c55e', fontWeight: 700 }}>Pembayaran Cash/Tunai</small>
                                    </div>

                                    <div style={{ backgroundColor: '#fdf4ff', border: '1.5px solid #f5d0fe', padding: '12px', borderRadius: '14px' }}>
                                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#86198f', display: 'block' }}>QRIS / NON-TUNAI</span>
                                        <strong style={{ fontSize: '1.15rem', color: '#a21caf', fontWeight: 900, display: 'block', margin: '2px 0' }}>
                                            Rp {todayQrisRev.toLocaleString('id-ID')}
                                        </strong>
                                        <small style={{ fontSize: '0.7rem', color: '#c084fc', fontWeight: 700 }}>Digital Payment / Transfer</small>
                                    </div>

                                    <div style={{ backgroundColor: '#fff7ed', border: '1.5px solid #fed7aa', padding: '12px', borderRadius: '14px' }}>
                                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#9a3412', display: 'block' }}>VOLUME TERJUAL</span>
                                        <div style={{ fontSize: '0.72rem', color: '#ea580c', fontWeight: 800, marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                            <span style={{ backgroundColor: '#ffedd5', padding: '2px 6px', borderRadius: '4px' }}> {todayTicketsCount} Tiket</span>
                                            <span style={{ backgroundColor: '#ffedd5', padding: '2px 6px', borderRadius: '4px' }}> {todayBanCount} Ban</span>
                                            <span style={{ backgroundColor: '#ffedd5', padding: '2px 6px', borderRadius: '4px' }}> {todaySepedaCount} Sepeda</span>
                                            <span style={{ backgroundColor: '#ffedd5', padding: '2px 6px', borderRadius: '4px' }}> {todayGazeboCount} Gazebo</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Sub-Tab Navigation Switcher */}
                                <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '12px', marginBottom: '16px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setReportSubTab('harian')}
                                        style={{ flex: 1, border: 'none', padding: '9px', borderRadius: '8px', fontWeight: 800, fontSize: '0.78rem', backgroundColor: reportSubTab === 'harian' ? '#0c294a' : 'transparent', color: reportSubTab === 'harian' ? 'white' : '#64748b', cursor: 'pointer', transition: 'all 0.2s' }}
                                    >
                                        <i className="fa-solid fa-calendar-day"></i> Laporan Harian
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setReportSubTab('bulanan')}
                                        style={{ flex: 1, border: 'none', padding: '9px', borderRadius: '8px', fontWeight: 800, fontSize: '0.78rem', backgroundColor: reportSubTab === 'bulanan' ? '#0c294a' : 'transparent', color: reportSubTab === 'bulanan' ? 'white' : '#64748b', cursor: 'pointer', transition: 'all 0.2s' }}
                                    >
                                        <i className="fa-solid fa-calendar-days"></i> Laporan Bulanan
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setReportSubTab('transaksi')}
                                        style={{ flex: 1, border: 'none', padding: '9px', borderRadius: '8px', fontWeight: 800, fontSize: '0.78rem', backgroundColor: reportSubTab === 'transaksi' ? '#0c294a' : 'transparent', color: reportSubTab === 'transaksi' ? 'white' : '#64748b', cursor: 'pointer', transition: 'all 0.2s' }}
                                    >
                                        <i className="fa-solid fa-list-check"></i> Transaksi ({filteredHistoryList.length})
                                    </button>
                                </div>

                                {/* Sub-Tab Content 1: Laporan Harian */}
                                {reportSubTab === 'harian' && (
                                    <div style={{ backgroundColor: 'white', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                            <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 900, color: '#0c294a' }}>Rekapitulasi Shift Harian</h4>
                                            <input
                                                type="date"
                                                value={selectedReportDate}
                                                onChange={(e) => setSelectedReportDate(e.target.value)}
                                                style={{ border: '1.5px solid #cbd5e1', borderRadius: '8px', padding: '6px 10px', fontSize: '0.8rem', fontWeight: 800, color: '#0c294a' }}
                                            />
                                        </div>

                                        <div style={{ borderTop: '1px dashed #cbd5e1', borderBottom: '1px dashed #cbd5e1', padding: '12px 0', marginBottom: '14px', fontSize: '0.83rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                <span style={{ color: '#64748b' }}>Status Operasional:</span>
                                                <strong style={{ color: '#166534', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem' }}>AKTIF & VALIDATED</strong>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                <span style={{ color: '#64748b' }}>Total Transaksi Harian:</span>
                                                <strong>{todayTransactions.length} Transaksi</strong>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                <span style={{ color: '#64748b' }}>Pendapatan Tunai (Cash):</span>
                                                <strong style={{ color: '#166534' }}>Rp {todayCashRev.toLocaleString('id-ID')}</strong>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                <span style={{ color: '#64748b' }}>Pendapatan QRIS / EDC:</span>
                                                <strong style={{ color: '#2563eb' }}>Rp {todayQrisRev.toLocaleString('id-ID')}</strong>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px dashed #cbd5e1', fontWeight: 900, color: '#0c294a', fontSize: '0.95rem' }}>
                                                <span>TOTAL OMSET SHIFT:</span>
                                                <strong style={{ color: '#1a73e8' }}>Rp {todayRevenue.toLocaleString('id-ID')}</strong>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setShowPrintReportModal(true)}
                                            style={{ width: '100%', backgroundColor: '#0c294a', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 900, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                        >
                                            <i className="fa-solid fa-print"></i> Cetak Struk Laporan Kasir Tanggal Ini
                                        </button>
                                    </div>
                                )}

                                {/* Sub-Tab Content 2: Laporan Bulanan */}
                                {reportSubTab === 'bulanan' && (
                                    <div style={{ backgroundColor: 'white', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                            <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 900, color: '#0c294a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <i className="fa-solid fa-calendar-days" style={{ color: '#2563eb' }}></i> Rekapitulasi Laporan Bulanan
                                            </h4>
                                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                <select
                                                    value={selectedReportMonth.split('-')[1] || '08'}
                                                    onChange={(e) => {
                                                        const year = selectedReportMonth.split('-')[0] || '2026';
                                                        setSelectedReportMonth(`${year}-${e.target.value}`);
                                                    }}
                                                    style={{
                                                        border: '1.5px solid #2563eb',
                                                        borderRadius: '10px',
                                                        padding: '6px 10px',
                                                        fontSize: '0.82rem',
                                                        fontWeight: 800,
                                                        color: '#0c294a',
                                                        backgroundColor: '#eff6ff',
                                                        cursor: 'pointer',
                                                        outline: 'none'
                                                    }}
                                                >
                                                    <option value="01">Januari</option>
                                                    <option value="02">Februari</option>
                                                    <option value="03">Maret</option>
                                                    <option value="04">April</option>
                                                    <option value="05">Mei</option>
                                                    <option value="06">Juni</option>
                                                    <option value="07">Juli</option>
                                                    <option value="08">Agustus</option>
                                                    <option value="09">September</option>
                                                    <option value="10">Oktober</option>
                                                    <option value="11">November</option>
                                                    <option value="12">Desember</option>
                                                </select>
                                                <select
                                                    value={selectedReportMonth.split('-')[0] || '2026'}
                                                    onChange={(e) => {
                                                        const month = selectedReportMonth.split('-')[1] || '08';
                                                        setSelectedReportMonth(`${e.target.value}-${month}`);
                                                    }}
                                                    style={{
                                                        border: '1.5px solid #2563eb',
                                                        borderRadius: '10px',
                                                        padding: '6px 10px',
                                                        fontSize: '0.82rem',
                                                        fontWeight: 800,
                                                        color: '#0c294a',
                                                        backgroundColor: '#eff6ff',
                                                        cursor: 'pointer',
                                                        outline: 'none'
                                                    }}
                                                >
                                                    <option value="2025">2025</option>
                                                    <option value="2026">2026</option>
                                                    <option value="2027">2027</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* 1. Header Card Omset */}
                                        <div style={{ background: 'linear-gradient(135deg, #0c294a 0%, #1e40af 100%)', borderRadius: '14px', padding: '16px', color: 'white', marginBottom: '14px', boxShadow: '0 4px 14px rgba(12, 41, 74, 0.15)' }}>
                                            <span style={{ fontSize: '0.74rem', color: '#93c5fd', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase' }}>TOTAL OMSET AKUMULASI BULANAN ({selectedReportMonth})</span>
                                            <strong style={{ fontSize: '1.6rem', color: '#ffffff', fontWeight: 900, display: 'block', margin: '6px 0 2px 0' }}>
                                                Rp {monthRevenue.toLocaleString('id-ID')}
                                            </strong>
                                            <small style={{ fontSize: '0.74rem', color: '#cbd5e1', display: 'block' }}>Akumulasi omset resmi dari {monthTransactions.length} transaksi di bulan {selectedReportMonth}.</small>
                                        </div>

                                        {/* 2. Key Metrics Grid (4 Boxes) */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                                            <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '10px 12px' }}>
                                                <small style={{ fontSize: '0.7rem', color: '#1e40af', fontWeight: 800, display: 'block' }}>KAS / TUNAI (CASH)</small>
                                                <strong style={{ fontSize: '0.98rem', color: '#166534', fontWeight: 900 }}>Rp {monthCashRev.toLocaleString('id-ID')}</strong>
                                            </div>
                                            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '10px 12px' }}>
                                                <small style={{ fontSize: '0.7rem', color: '#166534', fontWeight: 800, display: 'block' }}>QRIS / DIGITAL</small>
                                                <strong style={{ fontSize: '0.98rem', color: '#1e40af', fontWeight: 900 }}>Rp {monthQrisRev.toLocaleString('id-ID')}</strong>
                                            </div>
                                            <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a', borderRadius: '12px', padding: '10px 12px' }}>
                                                <small style={{ fontSize: '0.7rem', color: '#92400e', fontWeight: 800, display: 'block' }}>TIKET TERJUAL</small>
                                                <strong style={{ fontSize: '0.98rem', color: '#78350f', fontWeight: 900 }}>{monthTicketsCount} Orang</strong>
                                            </div>
                                            <div style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '12px', padding: '10px 12px' }}>
                                                <small style={{ fontSize: '0.7rem', color: '#6b21a8', fontWeight: 800, display: 'block' }}>UNIT SEWA TERJUAL</small>
                                                <strong style={{ fontSize: '0.98rem', color: '#581c87', fontWeight: 900 }}>{monthBanCount + monthSepedaCount + monthGazeboCount} Unit</strong>
                                            </div>
                                        </div>

                                        {/* 3. Breakdown Volume Barang & Layanan Sewa */}
                                        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '12px', marginBottom: '14px', fontSize: '0.8rem' }}>
                                            <h5 style={{ margin: '0 0 8px 0', fontSize: '0.82rem', fontWeight: 900, color: '#0c294a', textTransform: 'uppercase' }}>RINCIAN VOLUME TERJUAL BULANAN:</h5>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <span style={{ color: '#475569' }}>• Tiket Masuk Wahana</span>
                                                <strong>{monthTicketsCount} Orang</strong>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <span style={{ color: '#475569' }}>• Sewa Ban Renang</span>
                                                <strong>{monthBanCount} Unit</strong>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <span style={{ color: '#475569' }}>• Sewa Sepeda Air</span>
                                                <strong>{monthSepedaCount} Unit</strong>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <span style={{ color: '#475569' }}>• Sewa Gazebo Santai</span>
                                                <strong>{monthGazeboCount} Unit</strong>
                                            </div>
                                        </div>

                                        {/* 4. Action Button Cetak */}
                                        <button
                                            onClick={() => window.print()}
                                            style={{ width: '100%', backgroundColor: '#0c294a', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 900, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                        >
                                            <i className="fa-solid fa-print"></i> Cetak Laporan Bulanan ({selectedReportMonth})
                                        </button>
                                    </div>
                                )}

                                {/* Sub-Tab Content 3: Daftar Transaksi & Search/Filter */}
                                {reportSubTab === 'transaksi' && (
                                    <div>
                                        {/* Search & Filter Bar */}
                                        <div style={{ marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="🔍 Cari Kode Booking / Nama Pemesan..."
                                                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700 }}
                                            />
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button
                                                    onClick={() => setFilterPayment('all')}
                                                    style={{ flex: 1, padding: '7px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.76rem', fontWeight: 800, backgroundColor: filterPayment === 'all' ? '#0c294a' : 'white', color: filterPayment === 'all' ? 'white' : '#475569', cursor: 'pointer' }}
                                                >
                                                    Semua ({historyList.length})
                                                </button>
                                                <button
                                                    onClick={() => setFilterPayment('tunai')}
                                                    style={{ flex: 1, padding: '7px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.76rem', fontWeight: 800, backgroundColor: filterPayment === 'tunai' ? '#166534' : 'white', color: filterPayment === 'tunai' ? 'white' : '#475569', cursor: 'pointer' }}
                                                >
                                                    Tunai (Cash)
                                                </button>
                                                <button
                                                    onClick={() => setFilterPayment('qris')}
                                                    style={{ flex: 1, padding: '7px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.76rem', fontWeight: 800, backgroundColor: filterPayment === 'qris' ? '#2563eb' : 'white', color: filterPayment === 'qris' ? 'white' : '#475569', cursor: 'pointer' }}
                                                >
                                                    QRIS / EDC
                                                </button>
                                            </div>
                                        </div>

                                        {/* List Transaksi */}
                                        <div className="history-list-container">
                                            {filteredHistoryList.length === 0 ? (
                                                <div style={{ textAlign: 'center', padding: '40px 16px', color: '#94a3b8' }}>
                                                    <i className="fa-solid fa-receipt" style={{ fontSize: '2.5rem', marginBottom: '12px', opacity: 0.6 }}></i>
                                                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#64748b' }}>Tidak ada transaksi ditemukan</p>
                                                    <small style={{ fontSize: '0.78rem' }}>Coba ubah kata kunci atau filter metode pembayaran</small>
                                                </div>
                                            ) : (
                                                filteredHistoryList.map((item, idx) => (
                                                    <div key={idx} className="history-item-card" style={{ marginBottom: '12px', padding: '14px', borderRadius: '16px', border: '1.5px solid #e2e8f0', backgroundColor: 'white', boxShadow: '0 4px 12px rgba(12, 41, 74, 0.04)' }}>
                                                        <div className="history-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                            <div>
                                                                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: '#0f2942' }}>{item.type}</h4>
                                                                <small style={{ color: '#64748b', fontSize: '0.76rem' }}>{item.date} &bull; {item.code}</small>
                                                            </div>
                                                            <span className="status-badge used" style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>{item.status}</span>
                                                        </div>
                                                        <div className="history-card-details" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px dashed #e2e8f0' }}>
                                                            <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>Pemesan: {item.name || item.buyerName || 'Pengunjung'}</span>
                                                            <strong style={{ fontSize: '0.95rem', color: '#2563eb', fontWeight: 900 }}>Rp {item.total?.toLocaleString('id-ID')}</strong>
                                                        </div>
                                                        <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setPdfTicketData(item.details || item);
                                                                    setShowPDFTicketModal(true);
                                                                }}
                                                                style={{ width: '100%', backgroundColor: '#0c294a', color: 'white', border: 'none', padding: '9px 12px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(12, 41, 74, 0.15)' }}
                                                            >
                                                                <i className="fa-solid fa-file-pdf" style={{ color: '#60a5fa' }}></i> Cetak Tiket PDF / Struk
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Tampilan Riwayat untuk Pengunjung */
                            <div>
                                <h3 className="tab-title" style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f2942', marginBottom: '14px' }}>Riwayat Transaksi Saya</h3>
                                <div className="history-list-container">
                                    {historyList.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '40px 16px', color: '#94a3b8' }}>
                                            <i className="fa-solid fa-receipt" style={{ fontSize: '2.5rem', marginBottom: '12px', opacity: 0.6 }}></i>
                                            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#64748b' }}>Belum ada riwayat transaksi</p>
                                            <small style={{ fontSize: '0.78rem' }}>Transaksi tiket &amp; sewa akan muncul di sini</small>
                                        </div>
                                    ) : (
                                        historyList.map((item, idx) => (
                                            <div key={idx} className="history-item-card" style={{ marginBottom: '14px', padding: '14px', borderRadius: '16px', border: '1.5px solid #e2e8f0', backgroundColor: 'white', boxShadow: '0 4px 12px rgba(12, 41, 74, 0.04)' }}>
                                                <div className="history-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                    <div>
                                                        <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 900, color: '#0f2942' }}>{item.type}</h4>
                                                        <small style={{ color: '#64748b', fontSize: '0.78rem' }}>{item.date} &bull; {item.code}</small>
                                                    </div>
                                                    <span className="status-badge used" style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>{item.status}</span>
                                                </div>
                                                <div className="history-card-details" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px dashed #e2e8f0' }}>
                                                    <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>Pemesanan: {item.name || item.buyerName || 'Pengunjung'}</span>
                                                    <strong style={{ fontSize: '0.95rem', color: '#2563eb', fontWeight: 900 }}>Rp {item.total?.toLocaleString('id-ID')}</strong>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
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
                        {/* Standby Mobile Footer */}
                        <footer className="app-mobile-footer-standby" style={{ marginTop: '28px', paddingTop: '20px', paddingBottom: '20px', borderTop: '1px solid #e2e8f0', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '16px', paddingLeft: '16px', paddingRight: '16px', boxShadow: '0 2px 10px rgba(12, 41, 74, 0.04)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
                                <img src="assets/logo.png" alt="Waterboom Logo" style={{ height: '26px', width: 'auto', objectFit: 'contain' }} />
                                <span style={{ fontSize: '0.88rem', fontWeight: 900, color: '#0c294a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>WATERBOOM CIJOHO INDAH</span>
                            </div>
                            <p style={{ margin: '0 0 10px 0', fontSize: '0.76rem', color: '#64748b', lineHeight: 1.4 }}>
                                Sensasi seru wahana air tropis tanpa batas untuk seluruh keluarga. Rasakan kesegaran air jernih & wahana terbaik!
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '10px', fontSize: '0.76rem', fontWeight: 700 }}>
                                <span style={{ color: '#0284c7' }}><i className="fa-solid fa-clock"></i> Buka 08.00 - 17.00 WIB</span>
                                <span style={{ color: '#16a34a' }}><i className="fa-solid fa-location-dot"></i> Cijoho - Tasikmalaya</span>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8', borderTop: '1px dashed #e2e8f0', paddingTop: '8px' }}>
                                &copy; {new Date().getFullYear()} Waterboom Cijoho Indah. All rights reserved.
                            </div>
                        </footer>
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
                    <i className="fa-solid fa-store"></i>
                    <span>{isCashierMode ? 'Beranda POS' : 'Beranda'}</span>
                </button>
                {!isCashierMode && (
                    <button
                        className={`bottom-nav-item ${activeTab === 'tiket' ? 'active' : ''}`}
                        onClick={() => setActiveTab('tiket')}
                    >
                        <i className="fa-solid fa-ticket"></i>
                        <span>Tiket Saya</span>
                    </button>
                )}
                <button
                    className={`bottom-nav-item ${activeTab === 'riwayat' ? 'active' : ''}`}
                    onClick={() => setActiveTab('riwayat')}
                >
                    <i className="fa-solid fa-chart-line"></i>
                    <span>{isCashierMode ? 'Riwayat & Laporan' : 'Riwayat'}</span>
                </button>
            </nav>

            {/* MODAL PUSAT NOTIFIKASI */}
            {showNotif && (
                <div
                    className="v-modal-backdrop fade-in"
                    onClick={() => setShowNotif(false)}
                    style={{ zIndex: 9999, backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)' }}
                >
                    <div
                        className="v-modal-card slide-down"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth: '440px',
                            width: '92%',
                            borderRadius: '20px',
                            padding: 0,
                            overflow: 'hidden',
                            boxShadow: '0 20px 40px rgba(12, 41, 74, 0.3)',
                            animation: 'slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                            border: '1.5px solid #cbd5e1'
                        }}
                    >
                        {/* Header Modal */}
                        <div style={{ backgroundColor: '#0c294a', color: 'white', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className="fa-solid fa-bell" style={{ color: '#60a5fa', fontSize: '1.2rem' }}></i>
                                <div>
                                    <h4 style={{ margin: 0, color: 'white', fontSize: '1rem', fontWeight: 900 }}>Pusat Notifikasi</h4>
                                    <small style={{ color: '#93c5fd', fontSize: '0.74rem' }}>{notifications.filter(n => !n.read).length} pesan belum dibaca</small>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowNotif(false)}
                                style={{ background: 'rgba(255, 255, 255, 0.15)', border: 'none', color: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.1rem' }}
                            >
                                &times;
                            </button>
                        </div>

                        {/* Actions Bar */}
                        <div style={{ backgroundColor: '#f8fafc', padding: '10px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem' }}>
                            <span style={{ fontWeight: 800, color: '#64748b' }}>Pemberitahuan Sistem & Transaksi</span>
                            {notifications.filter(n => !n.read).length > 0 && (
                                <button
                                    onClick={() => {
                                        setNotifications(notifications.map(n => ({ ...n, read: true })));
                                    }}
                                    style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 800, cursor: 'pointer', padding: 0 }}
                                >
                                    <i className="fa-solid fa-check-double"></i> Tandai Semua Dibaca
                                </button>
                            )}
                        </div>

                        {/* Notification Items List */}
                        <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '12px 16px' }}>
                            {notifications.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8' }}>
                                    <i className="fa-solid fa-bell-slash" style={{ fontSize: '2rem', marginBottom: '8px', opacity: 0.5 }}></i>
                                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem' }}>Tidak ada notifikasi saat ini</p>
                                </div>
                            ) : (
                                notifications.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => {
                                            setNotifications(notifications.map(n => n.id === item.id ? { ...n, read: true } : n));
                                        }}
                                        style={{
                                            backgroundColor: item.read ? '#ffffff' : '#f0f9ff',
                                            border: item.read ? '1px solid #e2e8f0' : '1.5px solid #bae6fd',
                                            borderRadius: '12px',
                                            padding: '12px 14px',
                                            marginBottom: '8px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            position: 'relative'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                            <strong style={{ fontSize: '0.86rem', color: '#0f2942', fontWeight: 900 }}>{item.title}</strong>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setNotifications(notifications.filter(n => n.id !== item.id));
                                                }}
                                                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.78rem', padding: '2px 4px' }}
                                                title="Hapus Notifikasi"
                                            >
                                                <i className="fa-solid fa-trash-can"></i>
                                            </button>
                                        </div>
                                        <p style={{ margin: '0 0 6px 0', fontSize: '0.78rem', color: '#475569', lineHeight: 1.3 }}>{item.desc}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <small style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>{item.time}</small>
                                            {!item.read && (
                                                <span style={{ backgroundColor: '#2563eb', color: 'white', fontSize: '0.62rem', fontWeight: 800, padding: '2px 6px', borderRadius: '10px' }}>BARU</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer Modal */}
                        <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
                            <button
                                onClick={() => setShowNotif(false)}
                                style={{ width: '100%', backgroundColor: '#0c294a', color: 'white', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer' }}
                            >
                                Tutup Notifikasi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL KONFIRMASI PEMBELIAN LANGSUNG / CETAK PDF (KASIR ONLINE) */}
            {showWACheckoutModal && (
                <div className="v-modal-backdrop" onClick={() => setShowWACheckoutModal(false)}>
                    <div className="v-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
                        <div className="v-modal-head" style={{ backgroundColor: '#0c294a', color: 'white' }}>
                            <h4 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontWeight: 900 }}>
                                {isCashierMode ? (
                                    <>
                                        <i className="fa-solid fa-file-pdf" style={{ color: '#60a5fa' }}></i> Form Transaksi Online (Cetak PDF Tiket)
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-ticket"></i> Form Beli Tiket (Tanpa Akun)
                                    </>
                                )}
                            </h4>
                            <button onClick={() => setShowWACheckoutModal(false)} style={{ color: 'white' }}>&times;</button>
                        </div>

                        <form onSubmit={handleConfirmWhatsAppOrder} className="v-modal-body" style={{ padding: '20px' }}>
                            <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '16px' }}>
                                {isCashierMode
                                    ? 'Masukkan nama & nomor HP pemesan untuk menerbitkan E-Tiket PDF Resmi langsung cetak / unduh tanpa pengiriman WhatsApp.'
                                    : 'Masukkan nama & nomor WhatsApp Anda. Konfirmasi pemesanan akan dikirim ke WhatsApp Admin dan Admin akan mengirimkan Tiket Resmi (PDF) ke nomor Anda.'}
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
                                {ticketQty > 0 && (
                                    <div style={{ fontSize: '0.85rem', color: '#0c294a', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span>{ticketQty}x {selectedTicket === 'reguler' ? 'Tiket Reguler' : selectedTicket === 'rombongan' ? 'Tiket Rombongan' : 'Kursus Renang'}</span>
                                        <strong>Rp {subtotal.toLocaleString('id-ID')}</strong>
                                    </div>
                                )}
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
                                style={{
                                    backgroundColor: isCashierMode ? '#0c294a' : '#25D366',
                                    color: 'white',
                                    fontWeight: 900,
                                    padding: '14px',
                                    fontSize: '0.92rem',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    boxShadow: isCashierMode ? '0 4px 12px rgba(12, 41, 74, 0.3)' : '0 4px 12px rgba(37, 211, 102, 0.3)'
                                }}
                            >
                                {isCashierMode ? (
                                    <>
                                        <i className="fa-solid fa-file-pdf" style={{ fontSize: '1.2rem', color: '#60a5fa' }}></i> CETAK / UNDUH TIKET PDF RESMI
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-brands fa-whatsapp" style={{ fontSize: '1.3rem' }}></i> KONFIRMASI KE WA ADMIN (TERIMA PDF)
                                    </>
                                )}
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
                                Transaksi offline langsung di tempat. Tiket & Struk fisik dapat dicetak dan/atau dikirim via WA ke pembeli.
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                                <div className="input-group-field">
                                    <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0c294a' }}>Nama Pembeli</label>
                                    <input
                                        type="text"
                                        value={buyerName}
                                        onChange={(e) => setBuyerName(e.target.value)}
                                        placeholder="Nama Pelanggan"
                                        className="v-input"
                                        style={{ fontSize: '0.82rem', padding: '8px 10px' }}
                                    />
                                </div>
                                <div className="input-group-field">
                                    <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0c294a' }}>No. WA Pembeli</label>
                                    <input
                                        type="text"
                                        value={buyerPhone}
                                        onChange={(e) => setBuyerPhone(e.target.value)}
                                        placeholder="0812xxx (Opsional)"
                                        className="v-input"
                                        style={{ fontSize: '0.82rem', padding: '8px 10px' }}
                                    />
                                </div>
                            </div>

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
                                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0c294a', display: 'block', marginBottom: '6px' }}>Jumlah Uang Tunai Diterima (Rp)</label>

                                    {/* Quick Nominal Chips (Mojo POS Style) */}
                                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                        <button
                                            type="button"
                                            onClick={() => setCashReceived(grandTotal.toString())}
                                            style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '6px 10px', borderRadius: '8px', fontSize: '0.74rem', fontWeight: 900, cursor: 'pointer', color: '#1d4ed8' }}
                                        >
                                            ⚡ Uang Pas (Rp {grandTotal.toLocaleString('id-ID')})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCashReceived('50000')}
                                            style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '8px', fontSize: '0.74rem', fontWeight: 800, cursor: 'pointer', color: '#0c294a' }}
                                        >
                                            Rp 50.000
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCashReceived('100000')}
                                            style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '8px', fontSize: '0.74rem', fontWeight: 800, cursor: 'pointer', color: '#0c294a' }}
                                        >
                                            Rp 100.000
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCashReceived('200000')}
                                            style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '8px', fontSize: '0.74rem', fontWeight: 800, cursor: 'pointer', color: '#0c294a' }}
                                        >
                                            Rp 200.000
                                        </button>
                                    </div>

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
                    <div className="v-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px', backgroundColor: 'white', borderRadius: '24px' }}>
                        <div className="v-modal-head" style={{ backgroundColor: '#0c294a', color: 'white', borderRadius: '24px 24px 0 0' }}>
                            <h4 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '1rem', fontWeight: 900 }}>
                                <i className="fa-solid fa-receipt"></i> Struk Tiket Official Loket
                            </h4>
                            <button onClick={() => setShowOfflineReceiptModal(false)} style={{ color: 'white', background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>&times;</button>
                        </div>

                        <div className="v-modal-body" style={{ padding: '20px' }}>
                            <div id="thermal-receipt-printable" style={{ border: '2px solid #000', borderRadius: '12px', padding: '16px', backgroundColor: '#fff', fontFamily: "'Courier New', Courier, monospace", color: '#000', fontSize: '0.82rem', lineHeight: '1.4' }}>
                                {/* HEADER BRAND & LOGO */}
                                <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>Cijoho Indah Waterboom</h2>
                                    <small style={{ fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', display: 'block' }}>SERUNYA LIBURAN KELUARGA!</small>
                                </div>

                                <div style={{ borderTop: '2px solid #000', borderBottom: '2px solid #000', padding: '6px 0', margin: '8px 0', textAlign: 'center' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900 }}>💦 STRUK TIKET 💦</h3>
                                    <div style={{ fontSize: '0.78rem', fontWeight: 700, marginTop: '2px' }}>Cijoho Indah Waterboom</div>
                                    <div style={{ fontSize: '0.72rem', color: '#333' }}>Jl. Raya Cijoho No. 88, Cijoho - Tasikmalaya 46134</div>
                                    <div style={{ fontSize: '0.72rem', color: '#333' }}>Telp. 0265-1234567</div>
                                </div>

                                {/* METADATA INFO */}
                                <div style={{ margin: '10px 0', fontSize: '0.8rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '100px 10px 1fr' }}>
                                        <span>No. Transaksi</span><span>:</span><strong>{offlineReceiptData.code}</strong>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '100px 10px 1fr' }}>
                                        <span>Tanggal</span><span>:</span><span>{offlineReceiptData.date}</span>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '100px 10px 1fr' }}>
                                        <span>Waktu</span><span>:</span><span>{offlineReceiptData.time || '10:15:32'}</span>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '100px 10px 1fr' }}>
                                        <span>Kasir</span><span>:</span><span>{offlineReceiptData.cashierName || 'KASIR01'}</span>
                                    </div>
                                </div>

                                {/* DETAIL PEMBELIAN TABLE */}
                                <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '8px 0', margin: '10px 0' }}>
                                    <div style={{ fontWeight: 900, marginBottom: '6px', fontSize: '0.82rem' }}>DETAIL PEMBELIAN</div>
                                    <table style={{ width: '100%', fontSize: '0.76rem', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid #000', textAlign: 'left' }}>
                                                <th style={{ paddingBottom: '4px', width: '25px' }}>No.</th>
                                                <th style={{ paddingBottom: '4px' }}>Jenis Tiket / Service</th>
                                                <th style={{ paddingBottom: '4px', textAlign: 'center', width: '35px' }}>Qty</th>
                                                <th style={{ paddingBottom: '4px', textAlign: 'right' }}>Harga Satuan</th>
                                                <th style={{ paddingBottom: '4px', textAlign: 'right' }}>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {offlineReceiptData.qty > 0 && (
                                                <tr>
                                                    <td style={{ paddingTop: '6px', verticalAlign: 'top' }}>1.</td>
                                                    <td style={{ paddingTop: '6px', verticalAlign: 'top' }}>{offlineReceiptData.type}</td>
                                                    <td style={{ paddingTop: '6px', textAlign: 'center', verticalAlign: 'top' }}>{offlineReceiptData.qty}</td>
                                                    <td style={{ paddingTop: '6px', textAlign: 'right', verticalAlign: 'top' }}>Rp {((offlineReceiptData.subtotal || offlineReceiptData.total) / offlineReceiptData.qty).toLocaleString('id-ID')}</td>
                                                    <td style={{ paddingTop: '6px', textAlign: 'right', verticalAlign: 'top', fontWeight: 800 }}>Rp {offlineReceiptData.subtotal?.toLocaleString('id-ID')}</td>
                                                </tr>
                                            )}
                                            {offlineReceiptData.rentals?.ban > 0 && (
                                                <tr>
                                                    <td style={{ paddingTop: '4px', verticalAlign: 'top' }}>{offlineReceiptData.qty > 0 ? 2 : 1}.</td>
                                                    <td style={{ paddingTop: '4px', verticalAlign: 'top' }}>Sewa Ban Renang</td>
                                                    <td style={{ paddingTop: '4px', textAlign: 'center', verticalAlign: 'top' }}>{offlineReceiptData.rentals.ban}</td>
                                                    <td style={{ paddingTop: '4px', textAlign: 'right', verticalAlign: 'top' }}>Rp {(offlineReceiptData.rentalsPrice?.ban || 5000).toLocaleString('id-ID')}</td>
                                                    <td style={{ paddingTop: '4px', textAlign: 'right', verticalAlign: 'top', fontWeight: 800 }}>Rp {(offlineReceiptData.rentals.ban * (offlineReceiptData.rentalsPrice?.ban || 5000)).toLocaleString('id-ID')}</td>
                                                </tr>
                                            )}
                                            {offlineReceiptData.rentals?.sepeda > 0 && (
                                                <tr>
                                                    <td style={{ paddingTop: '4px', verticalAlign: 'top' }}>{(offlineReceiptData.qty > 0 ? 1 : 0) + (offlineReceiptData.rentals?.ban > 0 ? 1 : 0) + 1}.</td>
                                                    <td style={{ paddingTop: '4px', verticalAlign: 'top' }}>Sewa Sepeda Air</td>
                                                    <td style={{ paddingTop: '4px', textAlign: 'center', verticalAlign: 'top' }}>{offlineReceiptData.rentals.sepeda}</td>
                                                    <td style={{ paddingTop: '4px', textAlign: 'right', verticalAlign: 'top' }}>Rp {(offlineReceiptData.rentalsPrice?.sepeda || 15000).toLocaleString('id-ID')}</td>
                                                    <td style={{ paddingTop: '4px', textAlign: 'right', verticalAlign: 'top', fontWeight: 800 }}>Rp {(offlineReceiptData.rentals.sepeda * (offlineReceiptData.rentalsPrice?.sepeda || 15000)).toLocaleString('id-ID')}</td>
                                                </tr>
                                            )}
                                            {offlineReceiptData.rentals?.gazebo > 0 && (
                                                <tr>
                                                    <td style={{ paddingTop: '4px', verticalAlign: 'top' }}>{(offlineReceiptData.qty > 0 ? 1 : 0) + (offlineReceiptData.rentals?.ban > 0 ? 1 : 0) + (offlineReceiptData.rentals?.sepeda > 0 ? 1 : 0) + 1}.</td>
                                                    <td style={{ paddingTop: '4px', verticalAlign: 'top' }}>Sewa Gazebo Santai</td>
                                                    <td style={{ paddingTop: '4px', textAlign: 'center', verticalAlign: 'top' }}>{offlineReceiptData.rentals.gazebo}</td>
                                                    <td style={{ paddingTop: '4px', textAlign: 'right', verticalAlign: 'top' }}>Rp {(offlineReceiptData.rentalsPrice?.gazebo || 25000).toLocaleString('id-ID')}</td>
                                                    <td style={{ paddingTop: '4px', textAlign: 'right', verticalAlign: 'top', fontWeight: 800 }}>Rp {(offlineReceiptData.rentals.gazebo * (offlineReceiptData.rentalsPrice?.gazebo || 25000)).toLocaleString('id-ID')}</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* TOTALS */}
                                <div style={{ borderBottom: '1px dashed #000', paddingBottom: '8px', marginBottom: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                        <span>Subtotal</span>
                                        <span>: Rp {offlineReceiptData.total?.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                        <span>Biaya Layanan</span>
                                        <span>: Rp 0</span>
                                    </div>
                                    <div style={{ borderTop: '1px solid #000', paddingTop: '4px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '0.92rem' }}>
                                        <span>TOTAL BAYAR</span>
                                        <span>: Rp {offlineReceiptData.total?.toLocaleString('id-ID')}</span>
                                    </div>
                                    {offlineReceiptData.paidAmount > 0 && (
                                        <>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.78rem' }}>
                                                <span>Bayar (Cash / QRIS)</span>
                                                <span>: Rp {offlineReceiptData.paidAmount?.toLocaleString('id-ID')}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                                                <span>Kembalian</span>
                                                <span>: Rp {offlineReceiptData.change?.toLocaleString('id-ID')}</span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* FOOTER & KETENTUAN */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px', fontSize: '0.7rem', alignItems: 'center', marginBottom: '10px' }}>
                                    <div>
                                        <strong style={{ fontSize: '0.78rem', display: 'block', marginBottom: '2px' }}>👥 TERIMA KASIH</strong>
                                        <div>Selamat menikmati wahana Cijoho Indah Waterboom</div>
                                    </div>
                                    <div style={{ border: '1px solid #000', borderRadius: '6px', padding: '6px', fontSize: '0.64rem', lineHeight: '1.2' }}>
                                        <strong style={{ display: 'block', textAlign: 'center', borderBottom: '1px solid #000', paddingBottom: '2px', marginBottom: '4px' }}>KETENTUAN</strong>
                                        <ul style={{ margin: 0, paddingLeft: '12px' }}>
                                            <li>Tiket tidak dapat dikembalikan.</li>
                                            <li>Simpan struk di area kolam.</li>
                                            <li>Berlaku 1x masuk.</li>
                                        </ul>
                                    </div>
                                </div>

                                <div style={{ borderTop: '1px dashed #000', paddingTop: '6px', textAlign: 'center', fontSize: '0.72rem' }}>
                                    <div style={{ marginBottom: '4px' }}>Follow us : <strong>@cijohoindahwaterboom</strong></div>
                                    <strong style={{ fontSize: '0.76rem', textTransform: 'uppercase' }}>🌊 TERIMA KASIH ATAS KUNJUNGAN ANDA 🌊</strong>
                                </div>
                            </div>

                            <div style={{ marginTop: '16px' }}>
                                <button
                                    onClick={() => window.print()}
                                    style={{ width: '100%', backgroundColor: '#0c294a', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(12, 41, 74, 0.2)' }}
                                >
                                    <i className="fa-solid fa-print"></i> Cetak Struk Tiket Fisik
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL CETAK TERPADU: INVOICE, TIKET MASUK, & KUPON SEWA ADD-ON */}
            {showPDFTicketModal && pdfTicketData && (
                <div className="v-modal-backdrop" onClick={() => setShowPDFTicketModal(false)}>
                    <div className="v-modal-card fade-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', backgroundColor: 'white', borderRadius: '24px' }}>
                        <div className="v-modal-head" style={{ backgroundColor: '#0c294a', color: 'white', borderRadius: '24px 24px 0 0' }}>
                            <h4 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '1rem', fontWeight: 900 }}>
                                <i className="fa-solid fa-print" style={{ color: '#60a5fa' }}></i> Cetak Dokumen Transaksi Resmi
                            </h4>
                            <button onClick={() => setShowPDFTicketModal(false)} style={{ color: 'white', background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>&times;</button>
                        </div>

                        <div className="v-modal-body" style={{ padding: '20px' }}>
                            {/* 80mm THERMAL PRINTER BADGE INDICATOR */}
                            <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', padding: '8px 12px', borderRadius: '10px', fontSize: '0.76rem', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span><i className="fa-solid fa-print"></i> UKURAN PRINTER: <strong>THERMAL 80 MM (POS STANDARD)</strong></span>
                                <span style={{ backgroundColor: '#2563eb', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.68rem', fontWeight: 900 }}>80mm POS Roll</span>
                            </div>

                            {/* Format Selector Bar (Responsive 4-Column Grid) */}
                            <div className="format-selector-bar" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '12px', marginBottom: '16px', boxSizing: 'border-box', width: '100%' }}>
                                <button
                                    type="button"
                                    onClick={() => setPrintFormat('full')}
                                    style={{ border: 'none', padding: '8px 2px', borderRadius: '8px', fontSize: '0.68rem', fontWeight: 800, backgroundColor: printFormat === 'full' ? '#0c294a' : 'transparent', color: printFormat === 'full' ? 'white' : '#64748b', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px', textAlign: 'center' }}
                                >
                                    <i className="fa-solid fa-layer-group" style={{ fontSize: '0.8rem' }}></i>
                                    <span>Struk Lengkap</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPrintFormat('invoice')}
                                    style={{ border: 'none', padding: '8px 2px', borderRadius: '8px', fontSize: '0.68rem', fontWeight: 800, backgroundColor: printFormat === 'invoice' ? '#0c294a' : 'transparent', color: printFormat === 'invoice' ? 'white' : '#64748b', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px', textAlign: 'center' }}
                                >
                                    <i className="fa-solid fa-file-invoice-dollar" style={{ fontSize: '0.8rem' }}></i>
                                    <span>Invoice</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPrintFormat('ticket')}
                                    style={{ border: 'none', padding: '8px 2px', borderRadius: '8px', fontSize: '0.68rem', fontWeight: 800, backgroundColor: printFormat === 'ticket' ? '#047857' : 'transparent', color: printFormat === 'ticket' ? 'white' : '#64748b', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px', textAlign: 'center' }}
                                >
                                    <i className="fa-solid fa-ticket" style={{ fontSize: '0.8rem' }}></i>
                                    <span>Tiket Masuk</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPrintFormat('rental')}
                                    style={{ border: 'none', padding: '8px 2px', borderRadius: '8px', fontSize: '0.68rem', fontWeight: 800, backgroundColor: printFormat === 'rental' ? '#b45309' : 'transparent', color: printFormat === 'rental' ? 'white' : '#64748b', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px', textAlign: 'center' }}
                                >
                                    <i className="fa-solid fa-bookmark" style={{ fontSize: '0.8rem' }}></i>
                                    <span>Kupon Sewa</span>
                                </button>
                            </div>
                            {printFormat === 'card' && (
                                <div id="pdf-printable-area" style={{ border: '3px solid #0c294a', borderRadius: '18px', padding: '20px', backgroundColor: '#f8fafc' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0c294a', paddingBottom: '12px', marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <img src="assets/logo.png" alt="Logo" style={{ height: '42px' }} />
                                            <div>
                                                <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#0c294a', margin: 0 }}>WATERBOOM CIJOHO INDAH</h3>
                                                <small style={{ color: '#1a73e8', fontWeight: 700 }}>E-TICKET RESMI PENGUNJUNG</small>
                                            </div>
                                        </div>
                                        <span style={{ backgroundColor: '#d1fae5', color: '#047857', fontSize: '0.72rem', fontWeight: 900, padding: '4px 10px', borderRadius: '50px', border: '1px solid #6ee7b7' }}>
                                            VALIDATED / LUNAS
                                        </span>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem', marginBottom: '16px' }}>
                                        <div>
                                            <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>KODE BOOKING</span>
                                            <strong style={{ fontSize: '1.1rem', color: '#1a73e8' }}>{pdfTicketData.code}</strong>
                                        </div>
                                        <div>
                                            <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>TANGGAL KUNJUNGAN</span>
                                            <strong>{pdfTicketData.date}</strong>
                                        </div>
                                        <div>
                                            <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>NAMA PEMESAN</span>
                                            <strong>{pdfTicketData.name || pdfTicketData.buyerName || 'Pengunjung'}</strong>
                                        </div>
                                        <div>
                                            <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>NO. WHATSAPP</span>
                                            <strong>{pdfTicketData.phone || pdfTicketData.buyerPhone || '-'}</strong>
                                        </div>
                                    </div>
                                    <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '10px', marginBottom: '16px' }}>
                                        <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', marginBottom: '6px' }}>RINCIAN ITEM & TOTAL:</span>
                                        {pdfTicketData.qty > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                                                <span>{pdfTicketData.type} ({pdfTicketData.qty}x)</span>
                                                <strong>Rp {(pdfTicketData.subtotal || (pdfTicketData.total - ((pdfTicketData.rentals?.ban || 0) * 5000 + (pdfTicketData.rentals?.sepeda || 0) * 15000 + (pdfTicketData.rentals?.gazebo || 0) * 25000)))?.toLocaleString('id-ID')}</strong>
                                            </div>
                                        )}
                                        {pdfTicketData.rentals?.ban > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#475569', marginBottom: '2px' }}>
                                                <span>• Sewa Ban Renang ({pdfTicketData.rentals.ban}x)</span>
                                                <span>Rp {(pdfTicketData.rentals.ban * (pdfTicketData.rentalsPrice?.ban || 5000)).toLocaleString('id-ID')}</span>
                                            </div>
                                        )}
                                        {pdfTicketData.rentals?.sepeda > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#475569', marginBottom: '2px' }}>
                                                <span>• Sewa Sepeda Air ({pdfTicketData.rentals.sepeda}x)</span>
                                                <span>Rp {(pdfTicketData.rentals.sepeda * (pdfTicketData.rentalsPrice?.sepeda || 15000)).toLocaleString('id-ID')}</span>
                                            </div>
                                        )}
                                        {pdfTicketData.rentals?.gazebo > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#475569', marginBottom: '2px' }}>
                                                <span>• Sewa Gazebo Santai ({pdfTicketData.rentals.gazebo}x)</span>
                                                <span>Rp {(pdfTicketData.rentals.gazebo * (pdfTicketData.rentalsPrice?.gazebo || 25000)).toLocaleString('id-ID')}</span>
                                            </div>
                                        )}
                                        <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '6px', marginTop: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 900, color: '#0c294a' }}>
                                            <span>TOTAL BAYAR</span>
                                            <span>Rp {pdfTicketData.total?.toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>
                                    <div style={{ backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '4.5rem', color: '#0c294a', lineHeight: 1 }}>
                                            <i className="fa-solid fa-qrcode"></i>
                                        </div>
                                        <div style={{ letterSpacing: '3px', fontWeight: 900, color: '#475569', fontSize: '0.9rem', marginTop: '6px' }}>
                                            {pdfTicketData.code}
                                        </div>
                                        <small style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Tunjukkan barcode/QR code ini ke loket pintu masuk</small>
                                    </div>
                                </div>
                            )}

                            {printFormat !== 'card' && (
                                <div id="printable-full-package" className="thermal-receipt-80mm" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {/* 1. STRUK INVOICE PEMBAYARAN */}
                                    {(printFormat === 'full' || printFormat === 'invoice') && (
                                        <div id="printable-invoice-only" className="thermal-receipt-80mm" style={{ border: '3px solid #000', borderRadius: '16px', padding: '18px', backgroundColor: '#ffffff', fontFamily: "'Courier New', Courier, monospace", color: '#000', fontSize: '0.82rem', lineHeight: '1.4' }}>
                                            {/* HEADER BRAND & LOGO */}
                                            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                                                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>Cijoho Indah Waterboom</h2>
                                                <small style={{ fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', display: 'block' }}>SERUNYA LIBURAN KELUARGA!</small>
                                            </div>

                                            <div style={{ borderTop: '2px solid #000', borderBottom: '2px solid #000', padding: '6px 0', margin: '8px 0', textAlign: 'center' }}>
                                                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900 }}>💦 STRUK TIKET 💦</h3>
                                                <div style={{ fontSize: '0.78rem', fontWeight: 700, marginTop: '2px' }}>Cijoho Indah Waterboom</div>
                                                <div style={{ fontSize: '0.72rem', color: '#333' }}>Jl. Raya Cijoho No. 88, Cijoho - Tasikmalaya 46134</div>
                                                <div style={{ fontSize: '0.72rem', color: '#333' }}>Telp. 0265-1234567</div>
                                            </div>

                                            {/* METADATA INFO */}
                                            <div style={{ margin: '10px 0', fontSize: '0.8rem' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '100px 10px 1fr' }}>
                                                    <span>No. Transaksi</span><span>:</span><strong>{pdfTicketData.code}</strong>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '100px 10px 1fr' }}>
                                                    <span>Tanggal</span><span>:</span><span>{pdfTicketData.date}</span>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '100px 10px 1fr' }}>
                                                    <span>Waktu</span><span>:</span><span>{pdfTicketData.time || '10:15:32'}</span>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '100px 10px 1fr' }}>
                                                    <span>Kasir</span><span>:</span><span>{pdfTicketData.cashierName || 'KASIR01'}</span>
                                                </div>
                                            </div>

                                            {/* DETAIL PEMBELIAN TABLE */}
                                            <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '8px 0', margin: '10px 0' }}>
                                                <div style={{ fontWeight: 900, marginBottom: '6px', fontSize: '0.82rem' }}>DETAIL PEMBELIAN</div>
                                                <table style={{ width: '100%', fontSize: '0.76rem', borderCollapse: 'collapse' }}>
                                                    <thead>
                                                        <tr style={{ borderBottom: '1px solid #000', textAlign: 'left' }}>
                                                            <th style={{ paddingBottom: '4px', width: '25px' }}>No.</th>
                                                            <th style={{ paddingBottom: '4px' }}>Jenis Tiket / Service</th>
                                                            <th style={{ paddingBottom: '4px', textAlign: 'center', width: '35px' }}>Qty</th>
                                                            <th style={{ paddingBottom: '4px', textAlign: 'right' }}>Harga Satuan</th>
                                                            <th style={{ paddingBottom: '4px', textAlign: 'right' }}>Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {pdfTicketData.qty > 0 && (
                                                            <tr>
                                                                <td style={{ paddingTop: '6px', verticalAlign: 'top' }}>1.</td>
                                                                <td style={{ paddingTop: '6px', verticalAlign: 'top' }}>{pdfTicketData.type}</td>
                                                                <td style={{ paddingTop: '6px', textAlign: 'center', verticalAlign: 'top' }}>{pdfTicketData.qty}</td>
                                                                <td style={{ paddingTop: '6px', textAlign: 'right', verticalAlign: 'top' }}>Rp {((pdfTicketData.subtotal || pdfTicketData.total) / pdfTicketData.qty).toLocaleString('id-ID')}</td>
                                                                <td style={{ paddingTop: '6px', textAlign: 'right', verticalAlign: 'top', fontWeight: 800 }}>Rp {pdfTicketData.subtotal?.toLocaleString('id-ID')}</td>
                                                            </tr>
                                                        )}
                                                        {pdfTicketData.rentals?.ban > 0 && (
                                                            <tr>
                                                                <td style={{ paddingTop: '4px', verticalAlign: 'top' }}>{pdfTicketData.qty > 0 ? 2 : 1}.</td>
                                                                <td style={{ paddingTop: '4px', verticalAlign: 'top' }}>Sewa Ban Renang</td>
                                                                <td style={{ paddingTop: '4px', textAlign: 'center', verticalAlign: 'top' }}>{pdfTicketData.rentals.ban}</td>
                                                                <td style={{ paddingTop: '4px', textAlign: 'right', verticalAlign: 'top' }}>Rp {(pdfTicketData.rentalsPrice?.ban || 5000).toLocaleString('id-ID')}</td>
                                                                <td style={{ paddingTop: '4px', textAlign: 'right', verticalAlign: 'top', fontWeight: 800 }}>Rp {(pdfTicketData.rentals.ban * (pdfTicketData.rentalsPrice?.ban || 5000)).toLocaleString('id-ID')}</td>
                                                            </tr>
                                                        )}
                                                        {pdfTicketData.rentals?.sepeda > 0 && (
                                                            <tr>
                                                                <td style={{ paddingTop: '4px', verticalAlign: 'top' }}>{(pdfTicketData.qty > 0 ? 1 : 0) + (pdfTicketData.rentals?.ban > 0 ? 1 : 0) + 1}.</td>
                                                                <td style={{ paddingTop: '4px', verticalAlign: 'top' }}>Sewa Sepeda Air</td>
                                                                <td style={{ paddingTop: '4px', textAlign: 'center', verticalAlign: 'top' }}>{pdfTicketData.rentals.sepeda}</td>
                                                                <td style={{ paddingTop: '4px', textAlign: 'right', verticalAlign: 'top' }}>Rp {(pdfTicketData.rentalsPrice?.sepeda || 15000).toLocaleString('id-ID')}</td>
                                                                <td style={{ paddingTop: '4px', textAlign: 'right', verticalAlign: 'top', fontWeight: 800 }}>Rp {(pdfTicketData.rentals.sepeda * (pdfTicketData.rentalsPrice?.sepeda || 15000)).toLocaleString('id-ID')}</td>
                                                            </tr>
                                                        )}
                                                        {pdfTicketData.rentals?.gazebo > 0 && (
                                                            <tr>
                                                                <td style={{ paddingTop: '4px', verticalAlign: 'top' }}>{(pdfTicketData.qty > 0 ? 1 : 0) + (pdfTicketData.rentals?.ban > 0 ? 1 : 0) + (pdfTicketData.rentals?.sepeda > 0 ? 1 : 0) + 1}.</td>
                                                                <td style={{ paddingTop: '4px', verticalAlign: 'top' }}>Sewa Gazebo Santai</td>
                                                                <td style={{ paddingTop: '4px', textAlign: 'center', verticalAlign: 'top' }}>{pdfTicketData.rentals.gazebo}</td>
                                                                <td style={{ paddingTop: '4px', textAlign: 'right', verticalAlign: 'top' }}>Rp {(pdfTicketData.rentalsPrice?.gazebo || 25000).toLocaleString('id-ID')}</td>
                                                                <td style={{ paddingTop: '4px', textAlign: 'right', verticalAlign: 'top', fontWeight: 800 }}>Rp {(pdfTicketData.rentals.gazebo * (pdfTicketData.rentalsPrice?.gazebo || 25000)).toLocaleString('id-ID')}</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* TOTALS */}
                                            <div style={{ borderBottom: '1px dashed #000', paddingBottom: '8px', marginBottom: '10px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                                    <span>Subtotal</span>
                                                    <span>: Rp {pdfTicketData.total?.toLocaleString('id-ID')}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                                    <span>Biaya Layanan</span>
                                                    <span>: Rp 0</span>
                                                </div>
                                                <div style={{ borderTop: '1px solid #000', paddingTop: '4px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '0.92rem' }}>
                                                    <span>TOTAL BAYAR</span>
                                                    <span>: Rp {pdfTicketData.total?.toLocaleString('id-ID')}</span>
                                                </div>
                                            </div>

                                            {/* FOOTER & KETENTUAN */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px', fontSize: '0.7rem', alignItems: 'center', marginBottom: '10px' }}>
                                                <div>
                                                    <strong style={{ fontSize: '0.78rem', display: 'block', marginBottom: '2px' }}>👥 TERIMA KASIH</strong>
                                                    <div>Selamat menikmati wahana Cijoho Indah Waterboom</div>
                                                </div>
                                                <div style={{ border: '1px solid #000', borderRadius: '6px', padding: '6px', fontSize: '0.64rem', lineHeight: '1.2' }}>
                                                    <strong style={{ display: 'block', textAlign: 'center', borderBottom: '1px solid #000', paddingBottom: '2px', marginBottom: '4px' }}>KETENTUAN</strong>
                                                    <ul style={{ margin: 0, paddingLeft: '12px' }}>
                                                        <li>Tiket tidak dapat dikembalikan.</li>
                                                        <li>Simpan struk di area kolam.</li>
                                                        <li>Berlaku 1x masuk.</li>
                                                    </ul>
                                                </div>
                                            </div>

                                            <div style={{ borderTop: '1px dashed #000', paddingTop: '6px', textAlign: 'center', fontSize: '0.72rem' }}>
                                                <div style={{ marginBottom: '4px' }}>Follow us : <strong>@cijohoindahwaterboom</strong></div>
                                                <strong style={{ fontSize: '0.76rem', textTransform: 'uppercase' }}>🌊 TERIMA KASIH ATAS KUNJUNGAN ANDA 🌊</strong>
                                            </div>
                                        </div>
                                    )}

                                    {printFormat === 'full' && (
                                        <div style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 900, color: '#000', textAlign: 'center', letterSpacing: '1px', padding: '8px 0', borderTop: '2px dashed #000', borderBottom: '2px dashed #000', margin: '10px 0', fontFamily: 'monospace' }}>
                                            ✂ ---------------------- POTONG DI SINI ---------------------- ✂
                                        </div>
                                    )}

                                    {/* 2. TIKET MASUK WAHANA (MONOCHROME BLACK & WHITE) */}
                                    {printFormat === 'ticket' && (
                                        <div id="printable-ticket-only" className="thermal-receipt-80mm" style={{ border: '1px solid #000', borderRadius: '0', padding: '24px 20px', backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif", color: '#000000', fontSize: '0.82rem', lineHeight: '1.4' }}>
                                            {/* HEADER BRAND & LOGO */}
                                            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                                                <img src="assets/logo.png" alt="Logo" style={{ height: '46px', objectFit: 'contain', marginBottom: '2px', filter: 'grayscale(100%) contrast(200%)' }} />
                                                <h2 style={{ fontSize: '1.3rem', fontWeight: 900, margin: '2px 0 0 0', letterSpacing: '-0.5px', color: '#000' }}>Cijoho Indah Waterboom</h2>
                                                <div style={{ display: 'inline-block', backgroundColor: '#000', color: '#fff', padding: '3px 12px', borderRadius: '4px', fontSize: '0.66rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '3px' }}>SERUNYA LIBURAN KELUARGA!</div>
                                            </div>

                                            <div style={{ borderTop: '1px dashed #000', margin: '10px 0' }}></div>

                                            <div style={{ textAlign: 'center', margin: '10px 0' }}>
                                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>✦ TIKET MASUK ✦</h3>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 800, marginTop: '4px' }}>Cijoho Indah Waterboom</div>
                                                <div style={{ fontSize: '0.74rem', color: '#000' }}>Jl. Raya Cijoho No. 88</div>
                                                <div style={{ fontSize: '0.74rem', color: '#000' }}>Cijoho - Tasikmalaya 46134</div>
                                                <div style={{ fontSize: '0.74rem', color: '#000' }}>Telp. 0265-1234567</div>
                                            </div>

                                            <div style={{ borderTop: '1px dashed #000', margin: '10px 0' }}></div>

                                            {/* METADATA INFO */}
                                            <div style={{ fontSize: '0.82rem', lineHeight: '1.65', margin: '10px 0' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '115px 12px 1fr' }}>
                                                    <span>No. Transaksi</span><span>:</span><strong>{pdfTicketData.code}</strong>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '115px 12px 1fr' }}>
                                                    <span>Tanggal</span><span>:</span><span>{pdfTicketData.date}</span>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '115px 12px 1fr' }}>
                                                    <span>Waktu</span><span>:</span><span>{pdfTicketData.time || '10:15:32'}</span>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '115px 12px 1fr' }}>
                                                    <span>Petugas Tiket</span><span>:</span><span>{pdfTicketData.cashierName || 'DEDI SAPUTRA'}</span>
                                                </div>
                                            </div>

                                            <div style={{ borderTop: '1px dashed #000', margin: '10px 0' }}></div>

                                            {pdfTicketData.qty > 0 ? (
                                                <>
                                                    {/* NOTICE BADGE */}
                                                    <div style={{ textAlign: 'center', margin: '10px 0' }}>
                                                        <div style={{ fontWeight: 900, fontSize: '0.88rem' }}>✦ TIKET BERLAKU UNTUK {pdfTicketData.qty > 1 ? `${pdfTicketData.qty} ORANG` : 'SATU ORANG'} ✦</div>
                                                        <div style={{ fontWeight: 900, fontSize: '0.95rem', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '2px' }}>SEKALI PAKAI</div>
                                                    </div>

                                                    <div style={{ borderTop: '1px dashed #000', margin: '10px 0' }}></div>

                                                    {/* FOOTER & BARCODE */}
                                                    <div style={{ textAlign: 'center', paddingTop: '4px' }}>
                                                        <div style={{ fontWeight: 900, fontSize: '0.95rem', marginBottom: '2px' }}>✦ TERIMA KASIH ✦</div>
                                                        <div style={{ fontSize: '0.78rem', color: '#000' }}>Selamat menikmati wahana</div>
                                                        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#000' }}>Cijoho Indah Waterboom</div>
                                                        <div style={{ fontSize: '1.2rem', lineHeight: '0.8', margin: '6px 0', letterSpacing: '2px' }}>~~~~~~~~~~~~~~~</div>
                                                        
                                                        {/* BARCODE VECTOR SVG */}
                                                        <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0 4px 0' }}>
                                                            <svg width="220" height="50" viewBox="0 0 220 50">
                                                                <rect x="5" y="0" width="3" height="45" fill="#000"/>
                                                                <rect x="10" y="0" width="1" height="45" fill="#000"/>
                                                                <rect x="13" y="0" width="4" height="45" fill="#000"/>
                                                                <rect x="19" y="0" width="2" height="45" fill="#000"/>
                                                                <rect x="23" y="0" width="1" height="45" fill="#000"/>
                                                                <rect x="26" y="0" width="5" height="45" fill="#000"/>
                                                                <rect x="33" y="0" width="2" height="45" fill="#000"/>
                                                                <rect x="37" y="0" width="3" height="45" fill="#000"/>
                                                                <rect x="42" y="0" width="1" height="45" fill="#000"/>
                                                                <rect x="45" y="0" width="4" height="45" fill="#000"/>
                                                                <rect x="51" y="0" width="2" height="45" fill="#000"/>
                                                                <rect x="55" y="0" width="3" height="45" fill="#000"/>
                                                                <rect x="60" y="0" width="1" height="45" fill="#000"/>
                                                                <rect x="63" y="0" width="5" height="45" fill="#000"/>
                                                                <rect x="70" y="0" width="2" height="45" fill="#000"/>
                                                                <rect x="74" y="0" width="4" height="45" fill="#000"/>
                                                                <rect x="80" y="0" width="1" height="45" fill="#000"/>
                                                                <rect x="83" y="0" width="3" height="45" fill="#000"/>
                                                                <rect x="88" y="0" width="2" height="45" fill="#000"/>
                                                                <rect x="92" y="0" width="5" height="45" fill="#000"/>
                                                                <rect x="99" y="0" width="1" height="45" fill="#000"/>
                                                                <rect x="102" y="0" width="3" height="45" fill="#000"/>
                                                                <rect x="107" y="0" width="4" height="45" fill="#000"/>
                                                                <rect x="113" y="0" width="2" height="45" fill="#000"/>
                                                                <rect x="117" y="0" width="1" height="45" fill="#000"/>
                                                                <rect x="120" y="0" width="5" height="45" fill="#000"/>
                                                                <rect x="127" y="0" width="3" height="45" fill="#000"/>
                                                                <rect x="132" y="0" width="2" height="45" fill="#000"/>
                                                                <rect x="136" y="0" width="4" height="45" fill="#000"/>
                                                                <rect x="142" y="0" width="1" height="45" fill="#000"/>
                                                                <rect x="145" y="0" width="3" height="45" fill="#000"/>
                                                                <rect x="150" y="0" width="5" height="45" fill="#000"/>
                                                                <rect x="157" y="0" width="2" height="45" fill="#000"/>
                                                                <rect x="161" y="0" width="4" height="45" fill="#000"/>
                                                                <rect x="167" y="0" width="1" height="45" fill="#000"/>
                                                                <rect x="170" y="0" width="3" height="45" fill="#000"/>
                                                                <rect x="175" y="0" width="5" height="45" fill="#000"/>
                                                                <rect x="182" y="0" width="2" height="45" fill="#000"/>
                                                                <rect x="186" y="0" width="4" height="45" fill="#000"/>
                                                                <rect x="192" y="0" width="1" height="45" fill="#000"/>
                                                                <rect x="195" y="0" width="3" height="45" fill="#000"/>
                                                                <rect x="200" y="0" width="5" height="45" fill="#000"/>
                                                                <rect x="207" y="0" width="2" height="45" fill="#000"/>
                                                                <rect x="211" y="0" width="4" height="45" fill="#000"/>
                                                            </svg>
                                                        </div>
                                                        <div style={{ fontSize: '0.9rem', fontWeight: 900, letterSpacing: '2px', color: '#000' }}>{pdfTicketData.code}</div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div style={{ textAlign: 'center', padding: '12px 0', fontWeight: 800, fontSize: '0.82rem' }}>
                                                    <i>(Transaksi Ini Tidak Mencakup Tiket Masuk Wahana)</i>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* 3. KUPON PENUKARAN SEWA ADD-ON (EXACT MATCH SAMPLE THERMAL IMAGE) */}
                                    {printFormat === 'rental' && (() => {
                                        const rentalSources = pdfTicketData.rentals || pdfTicketData.details?.rentals || {};
                                        const banQty = rentalSources.ban || 0;
                                        const sepedaQty = rentalSources.sepeda || 0;
                                        const gazeboQty = rentalSources.gazebo || 0;

                                        const coupons = [];
                                        if (banQty > 0) {
                                            coupons.push({
                                                id: `BAN`,
                                                title: 'KUPON SEWA BAN RENANG',
                                                itemName: 'Sewa Ban Renang',
                                                qty: banQty,
                                                code: `${pdfTicketData.code}-BAN`,
                                                stand: 'STAND BAN RENANG'
                                            });
                                        }
                                        if (sepedaQty > 0) {
                                            coupons.push({
                                                id: `SPD`,
                                                title: 'KUPON SEWA SEPEDA AIR',
                                                itemName: 'Sewa Sepeda Air',
                                                qty: sepedaQty,
                                                code: `${pdfTicketData.code}-SPD`,
                                                stand: 'STAND SEPEDA AIR'
                                            });
                                        }
                                        if (gazeboQty > 0) {
                                            coupons.push({
                                                id: `GZB`,
                                                title: 'KUPON SEWA GAZEBO SANTAI',
                                                itemName: 'Sewa Gazebo Santai',
                                                qty: gazeboQty,
                                                code: `${pdfTicketData.code}-GZB`,
                                                stand: 'STAND GAZEBO SANTAI'
                                            });
                                        }

                                        return (
                                            <div id="printable-addon-only" className="thermal-receipt-80mm" style={{ display: 'block' }}>
                                                 {coupons.length > 0 ? (
                                                     coupons.map((coupon) => (
                                                         <div key={coupon.id} className="thermal-coupon-page" style={{ border: '1px solid #000', borderRadius: '0', padding: '24px 20px', backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif", color: '#000000', fontSize: '0.82rem', lineHeight: '1.4' }}>
                                                             {/* HEADER BRAND & LOGO */}
                                                             <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                                                                 <img src="assets/logo.png" alt="Logo" style={{ height: '46px', objectFit: 'contain', marginBottom: '2px', filter: 'grayscale(100%) contrast(200%)' }} />
                                                                 <h2 style={{ fontSize: '1.3rem', fontWeight: 900, margin: '2px 0 0 0', letterSpacing: '-0.5px', color: '#000' }}>Cijoho Indah Waterboom</h2>
                                                                 <div style={{ display: 'inline-block', backgroundColor: '#000', color: '#fff', padding: '3px 12px', borderRadius: '4px', fontSize: '0.66rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '3px' }}>SERUNYA LIBURAN KELUARGA!</div>
                                                             </div>

                                                             <div style={{ borderTop: '1px dashed #000', margin: '10px 0' }}></div>

                                                             <div style={{ textAlign: 'center', margin: '10px 0' }}>
                                                                 <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>✦ {coupon.title} ✦</h3>
                                                                 <div style={{ fontSize: '0.85rem', fontWeight: 800, marginTop: '4px' }}>Cijoho Indah Waterboom</div>
                                                                 <div style={{ fontSize: '0.74rem', color: '#000' }}>Jl. Raya Cijoho No. 88</div>
                                                                 <div style={{ fontSize: '0.74rem', color: '#000' }}>Cijoho - Tasikmalaya 46134</div>
                                                                 <div style={{ fontSize: '0.74rem', color: '#000' }}>Telp. 0265-1234567</div>
                                                             </div>

                                                             <div style={{ borderTop: '1px dashed #000', margin: '10px 0' }}></div>

                                                             {/* METADATA INFO */}
                                                             <div style={{ fontSize: '0.82rem', lineHeight: '1.65', margin: '10px 0' }}>
                                                                 <div style={{ display: 'grid', gridTemplateColumns: '115px 12px 1fr' }}>
                                                                     <span>No. Transaksi</span><span>:</span><strong>{pdfTicketData.code}</strong>
                                                                 </div>
                                                                 <div style={{ display: 'grid', gridTemplateColumns: '115px 12px 1fr' }}>
                                                                     <span>Kode Kupon</span><span>:</span><strong>{coupon.code}</strong>
                                                                 </div>
                                                                 <div style={{ display: 'grid', gridTemplateColumns: '115px 12px 1fr' }}>
                                                                     <span>Tanggal</span><span>:</span><span>{pdfTicketData.date}</span>
                                                                 </div>
                                                                 <div style={{ display: 'grid', gridTemplateColumns: '115px 12px 1fr' }}>
                                                                     <span>Waktu</span><span>:</span><span>{pdfTicketData.time || '10:15:32'}</span>
                                                                 </div>
                                                                 <div style={{ display: 'grid', gridTemplateColumns: '115px 12px 1fr' }}>
                                                                     <span>Petugas Stand</span><span>:</span><span>{pdfTicketData.cashierName || 'DEDI SAPUTRA'}</span>
                                                                 </div>
                                                             </div>

                                                             <div style={{ borderTop: '1px dashed #000', margin: '10px 0' }}></div>

                                                             {/* ITEM PENUKARAN PER UNIT */}
                                                             <div style={{ textAlign: 'center', margin: '10px 0' }}>
                                                                 <div style={{ fontWeight: 900, fontSize: '0.88rem' }}>✦ ITEM HAK SEWA: {coupon.qty}x {coupon.itemName.toUpperCase()} {coupon.qty > 1 ? `(TOTAL ${coupon.qty} UNIT)` : ''} ✦</div>
                                                                 <div style={{ fontWeight: 900, fontSize: '0.95rem', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '2px' }}>SEKALI TUKAR (DISOBEK)</div>
                                                             </div>

                                                             <div style={{ borderTop: '1px dashed #000', margin: '10px 0' }}></div>

                                                             {/* FOOTER & BARCODE */}
                                                             <div style={{ textAlign: 'center', paddingTop: '4px' }}>
                                                                 <div style={{ fontWeight: 900, fontSize: '0.95rem', marginBottom: '2px' }}>✦ TERIMA KASIH ✦</div>
                                                                 <div style={{ fontSize: '0.78rem', color: '#000' }}>Selamat menikmati wahana</div>
                                                                 <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#000' }}>Cijoho Indah Waterboom</div>
                                                                 <div style={{ fontSize: '1.2rem', lineHeight: '0.8', margin: '6px 0', letterSpacing: '2px' }}>~~~~~~~~~~~~~~~</div>

                                                                    {/* BARCODE VECTOR SVG */}
                                                                    <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0 4px 0' }}>
                                                                        <svg width="220" height="50" viewBox="0 0 220 50">
                                                                            <rect x="5" y="0" width="3" height="45" fill="#000"/>
                                                                            <rect x="10" y="0" width="1" height="45" fill="#000"/>
                                                                            <rect x="13" y="0" width="4" height="45" fill="#000"/>
                                                                            <rect x="19" y="0" width="2" height="45" fill="#000"/>
                                                                            <rect x="23" y="0" width="1" height="45" fill="#000"/>
                                                                            <rect x="26" y="0" width="5" height="45" fill="#000"/>
                                                                            <rect x="33" y="0" width="2" height="45" fill="#000"/>
                                                                            <rect x="37" y="0" width="3" height="45" fill="#000"/>
                                                                            <rect x="42" y="0" width="1" height="45" fill="#000"/>
                                                                            <rect x="45" y="0" width="4" height="45" fill="#000"/>
                                                                            <rect x="51" y="0" width="2" height="45" fill="#000"/>
                                                                            <rect x="55" y="0" width="3" height="45" fill="#000"/>
                                                                            <rect x="60" y="0" width="1" height="45" fill="#000"/>
                                                                            <rect x="63" y="0" width="5" height="45" fill="#000"/>
                                                                            <rect x="70" y="0" width="2" height="45" fill="#000"/>
                                                                            <rect x="74" y="0" width="4" height="45" fill="#000"/>
                                                                            <rect x="80" y="0" width="1" height="45" fill="#000"/>
                                                                            <rect x="83" y="0" width="3" height="45" fill="#000"/>
                                                                            <rect x="88" y="0" width="2" height="45" fill="#000"/>
                                                                            <rect x="92" y="0" width="5" height="45" fill="#000"/>
                                                                            <rect x="99" y="0" width="1" height="45" fill="#000"/>
                                                                            <rect x="102" y="0" width="3" height="45" fill="#000"/>
                                                                            <rect x="107" y="0" width="4" height="45" fill="#000"/>
                                                                            <rect x="113" y="0" width="2" height="45" fill="#000"/>
                                                                            <rect x="117" y="0" width="1" height="45" fill="#000"/>
                                                                            <rect x="120" y="0" width="5" height="45" fill="#000"/>
                                                                            <rect x="127" y="0" width="3" height="45" fill="#000"/>
                                                                            <rect x="132" y="0" width="2" height="45" fill="#000"/>
                                                                            <rect x="136" y="0" width="4" height="45" fill="#000"/>
                                                                            <rect x="142" y="0" width="1" height="45" fill="#000"/>
                                                                            <rect x="145" y="0" width="3" height="45" fill="#000"/>
                                                                            <rect x="150" y="0" width="5" height="45" fill="#000"/>
                                                                            <rect x="157" y="0" width="2" height="45" fill="#000"/>
                                                                            <rect x="161" y="0" width="4" height="45" fill="#000"/>
                                                                            <rect x="167" y="0" width="1" height="45" fill="#000"/>
                                                                            <rect x="170" y="0" width="3" height="45" fill="#000"/>
                                                                            <rect x="175" y="0" width="5" height="45" fill="#000"/>
                                                                            <rect x="182" y="0" width="2" height="45" fill="#000"/>
                                                                            <rect x="186" y="0" width="4" height="45" fill="#000"/>
                                                                            <rect x="192" y="0" width="1" height="45" fill="#000"/>
                                                                            <rect x="195" y="0" width="3" height="45" fill="#000"/>
                                                                            <rect x="200" y="0" width="5" height="45" fill="#000"/>
                                                                            <rect x="207" y="0" width="2" height="45" fill="#000"/>
                                                                            <rect x="211" y="0" width="4" height="45" fill="#000"/>
                                                                        </svg>
                                                                    </div>
                                                                    <div style={{ fontSize: '0.9rem', fontWeight: 900, letterSpacing: '2px', color: '#000' }}>{coupon.code}</div>
                                                                </div>
                                                        </div>
                                                        ))
                                                ) : (
                                                    <div style={{ border: '2px solid #000', borderRadius: '12px', padding: '16px', backgroundColor: '#ffffff', textAlign: 'center', fontWeight: 800, fontSize: '0.82rem', fontFamily: 'monospace' }}>
                                                        <i>(Tidak Ada Item Sewa Add-on Pada Transaksi Ini)</i>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}

                            {/* OPSI CETAK STRUK INTERAKTIF */}
                            <div style={{ backgroundColor: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '16px', padding: '14px', marginBottom: '16px' }}>
                                <label style={{ fontSize: '0.82rem', fontWeight: 900, color: '#0c294a', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                                    <i className="fa-solid fa-print" style={{ color: '#2563eb' }}></i> PILIH FORMAT CETAK DOKUMEN:
                                </label>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    <button
                                        type="button"
                                        onClick={() => triggerIsolatedPrint('full')}
                                        style={{ backgroundColor: printFormat === 'full' ? '#0c294a' : 'white', color: printFormat === 'full' ? 'white' : '#0c294a', border: '1.5px solid #0c294a', padding: '11px 8px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}
                                    >
                                        <i className="fa-solid fa-layer-group" style={{ color: '#2563eb' }}></i> Cetak Struk Lengkap
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => triggerIsolatedPrint('invoice')}
                                        style={{ backgroundColor: printFormat === 'invoice' ? '#0c294a' : 'white', color: printFormat === 'invoice' ? 'white' : '#0c294a', border: '1.5px solid #0c294a', padding: '11px 8px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}
                                    >
                                        <i className="fa-solid fa-file-invoice-dollar" style={{ color: '#eab308' }}></i> Cetak Invoice
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => triggerIsolatedPrint('ticket')}
                                        style={{ backgroundColor: printFormat === 'ticket' ? '#047857' : 'white', color: printFormat === 'ticket' ? 'white' : '#047857', border: '1.5px solid #047857', padding: '11px 8px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}
                                    >
                                        <i className="fa-solid fa-ticket" style={{ color: '#10b981' }}></i> Cetak Tiket Masuk
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => triggerIsolatedPrint('rental')}
                                        style={{ backgroundColor: printFormat === 'rental' ? '#b45309' : 'white', color: printFormat === 'rental' ? 'white' : '#b45309', border: '1.5px solid #b45309', padding: '11px 8px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}
                                    >
                                        <i className="fa-solid fa-bookmark" style={{ color: '#f59e0b' }}></i> Cetak Struk Add-On
                                    </button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                                <button
                                    type="button"
                                    onClick={() => triggerIsolatedPrint(printFormat)}
                                    style={{ flex: 1, backgroundColor: '#0c294a', color: 'white', border: 'none', padding: '13px', borderRadius: '12px', fontWeight: 900, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(12, 41, 74, 0.2)' }}
                                >
                                    <i className="fa-solid fa-print"></i> Cetak PDF ({printFormat.toUpperCase()})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowPDFTicketModal(false)}
                                    style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '13px 18px', borderRadius: '12px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
                                >
                                    Selesai
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL CETAK LAPORAN REKAPITULASI SHIFT KASIR (MAJOO/MOJO POS STYLE) */}
            {showPrintReportModal && (
                <div className="v-modal-backdrop" onClick={() => setShowPrintReportModal(false)}>
                    <div className="v-modal-card fade-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', backgroundColor: 'white', borderRadius: '24px' }}>
                        <div className="v-modal-head" style={{ backgroundColor: '#0c294a', color: 'white', borderRadius: '24px 24px 0 0' }}>
                            <h4 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '1rem', fontWeight: 900 }}>
                                <i className="fa-solid fa-print" style={{ color: '#60a5fa' }}></i> Struk Laporan Kasir Shift
                            </h4>
                            <button onClick={() => setShowPrintReportModal(false)} style={{ color: 'white', background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>&times;</button>
                        </div>

                        <div className="v-modal-body" style={{ padding: '20px' }}>
                            <div id="shift-report-printable" style={{ border: '2px solid #0c294a', borderRadius: '16px', padding: '16px', backgroundColor: '#fff', fontFamily: 'monospace' }}>
                                <div style={{ textAlign: 'center', borderBottom: '1px dashed #0c294a', paddingBottom: '10px', marginBottom: '12px' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0c294a', margin: 0 }}>WATERBOOM CIJOHO INDAH</h3>
                                    <small style={{ display: 'block', color: '#64748b', fontWeight: 700 }}>LAPORAN SETORAN & SHIFT KASIR</small>
                                    <small style={{ color: '#047857', fontWeight: 900, fontSize: '0.75rem' }}>[ SHIFT CLOSING REPORT ]</small>
                                </div>

                                <div style={{ fontSize: '0.8rem', lineHeight: '1.4', marginBottom: '10px' }}>
                                    <div><strong>Tanggal:</strong> {selectedReportDate}</div>
                                    <div><strong>Petugas Kasir:</strong> Petugas Kasir 1</div>
                                    <div><strong>Waktu Cetak:</strong> {new Date().toLocaleTimeString('id-ID')}</div>
                                </div>

                                <div style={{ borderTop: '1px dashed #cbd5e1', borderBottom: '1px dashed #cbd5e1', padding: '8px 0', margin: '8px 0', fontSize: '0.8rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span>Total Transaksi:</span>
                                        <strong>{todayTransactions.length} Transaksi</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span>Total Tiket Terjual:</span>
                                        <strong>{todayTicketsCount} Orang</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span>Total Ban Tersewa:</span>
                                        <strong>{todayBanCount} Unit</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span>Total Sepeda Air Tersewa:</span>
                                        <strong>{todaySepedaCount} Unit</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span>Total Gazebo Tersewa:</span>
                                        <strong>{todayGazeboCount} Unit</strong>
                                    </div>
                                </div>

                                <div style={{ fontSize: '0.82rem', marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#166534', fontWeight: 800 }}>
                                        <span>SETORAN TUNAI (CASH):</span>
                                        <span>Rp {todayCashRev.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2563eb', fontWeight: 800 }}>
                                        <span>TOTAL QRIS / TRANSFER:</span>
                                        <span>Rp {todayQrisRev.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0c294a', fontWeight: 900, fontSize: '0.95rem', marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed #cbd5e1' }}>
                                        <span>TOTAL GROSS OMSET:</span>
                                        <span>Rp {todayRevenue.toLocaleString('id-ID')}</span>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', textAlign: 'center', marginTop: '16px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1', fontSize: '0.72rem' }}>
                                    <div>
                                        <div>Kasir Operasional</div>
                                        <div style={{ height: '40px' }}></div>
                                        <strong>( Petugas Kasir 1 )</strong>
                                    </div>
                                    <div>
                                        <div>Supervisor / Manager</div>
                                        <div style={{ height: '40px' }}></div>
                                        <strong>( Admin Waterboom )</strong>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                    style={{ flex: 1, backgroundColor: '#0c294a', color: 'white', border: 'none', padding: '13px', borderRadius: '12px', fontWeight: 900, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    <i className="fa-solid fa-print"></i> Cetak Laporan Kasir
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowPrintReportModal(false)}
                                    style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '13px 18px', borderRadius: '12px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
                                >
                                    Selesai
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Copy Toast Notification */}
            {copyToast && (
                <div style={{
                    position: 'fixed',
                    bottom: '80px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#0c294a',
                    color: 'white',
                    padding: '10px 22px',
                    borderRadius: '30px',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    zIndex: 10000,
                    boxShadow: '0 4px 15px rgba(0,0,0,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <i className="fa-solid fa-circle-check" style={{ color: '#25D366', fontSize: '1.1rem' }}></i>
                    <span>{copyToast}</span>
                </div>
            )}
        </div>
    );
}