import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase'; // Pastikan path ini sesuai dengan struktur folder Anda

// Helper date range parser & comparator for Indonesian & ISO formats
const parseDateToTimestamp = (str) => {
    if (!str) return null;
    if (typeof str === 'number') return str;
    const strClean = String(str).trim();
    // Check ISO string first (e.g. 2026-09-05...)
    if (/^\d{4}-\d{2}-\d{2}/.test(strClean)) {
        const d = new Date(strClean);
        if (!isNaN(d.getTime())) return d.getTime();
    }
    // Check DD/MM/YYYY or D/M/YYYY (e.g. 5/9/2026 or 05/09/2026)
    if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(strClean)) {
        const parts = strClean.split('/');
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
            return new Date(year, month, day).getTime();
        }
    }
    // Check Indonesian month names (e.g. "5 September 2026")
    const monthsIndo = {
        januari: 0, februari: 1, maret: 2, april: 3, mei: 4, juni: 5,
        juli: 6, agustus: 7, september: 8, oktober: 9, november: 10, desember: 11,
        jan: 0, feb: 1, mar: 2, apr: 3, mei: 4, jun: 5, jul: 6, agt: 7, ags: 7, sep: 8, okt: 9, nov: 10, des: 11
    };
    const words = strClean.toLowerCase().split(/\s+/);
    if (words.length >= 3) {
        const day = parseInt(words[0], 10);
        const month = monthsIndo[words[1]];
        const year = parseInt(words[2], 10);
        if (!isNaN(day) && month !== undefined && !isNaN(year)) {
            return new Date(year, month, day).getTime();
        }
    }
    const fallback = new Date(strClean);
    if (!isNaN(fallback.getTime())) return fallback.getTime();
    return null;
};

const isDateInRange = (itemDateStr, startISO, endISO) => {
    if (!startISO || !endISO) return true;
    const itemTimestamp = parseDateToTimestamp(itemDateStr);
    if (!itemTimestamp) return true;

    const startTimestamp = new Date(startISO + 'T00:00:00').getTime();
    const endTimestamp = new Date(endISO + 'T23:59:59').getTime();

    return itemTimestamp >= startTimestamp && itemTimestamp <= endTimestamp;
};

export default function AdminDashboard() {
    const [history, setHistory] = useState([]);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching transactions:', error);
          setLoading(false);
          return;
        }

        // Mapping ke format yang digunakan di dashboard dengan Jam Booking & Kategori (Beli vs Sewa)
        const historyData = data.map(tx => {
          const createdAt = new Date(tx.created_at || Date.now());
          const isRental = (tx.transaction_type === 'sewa') ||
            ['ban', 'angsa', 'gazebo', 'sepeda'].includes((tx.ticket_type || '').toLowerCase()) ||
            (tx.ticket_type && tx.ticket_type.toLowerCase().includes('sewa'));
          const isBeli = !isRental;
          const categoryType = isRental ? 'Sewa' : 'Beli';

          return {
            code: tx.booking_code,
            date: createdAt.toLocaleDateString('id-ID'),
            time: createdAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
            dateTime: `${createdAt.toLocaleDateString('id-ID')} ${createdAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`,
            created_at: tx.created_at,
            category: categoryType,
            type: tx.ticket_type === 'regular' || tx.ticket_type === 'reguler' ? 'Beli Tiket Masuk' :
                  tx.ticket_type === 'rombongan' ? 'Beli Tiket Rombongan' :
                  tx.ticket_type === 'kursus' ? 'Beli Tiket Kursus Renang' :
                  (isRental ? `Sewa ${tx.ticket_type === 'ban' ? 'Ban' : tx.ticket_type === 'gazebo' ? 'Gazebo' : tx.ticket_type === 'angsa' ? 'Sepeda Air' : 'Layanan'}` : 'Beli Tiket'),
            product: tx.ticket_type === 'ban' ? 'Sewa Ban' :
                     tx.ticket_type === 'gazebo' ? 'Sewa Gazebo' :
                     tx.ticket_type === 'angsa' ? 'Sewa Sepeda Air / Angsa' :
                     tx.ticket_type === 'reguler' || tx.ticket_type === 'regular' ? 'Tiket Reguler' :
                     tx.ticket_type === 'rombongan' ? 'Tiket Rombongan' :
                     tx.ticket_type === 'kursus' ? 'Kursus Renang' : tx.ticket_type,
            qty: tx.quantity,
            total: tx.total_price,
            channel: tx.channel === 'online' ? 'Online' : 'Offline',
            method: tx.payment_method === 'tunai' ? 'Tunai' :
                    tx.payment_method === 'qris' ? 'QRIS' : 'Transfer',
            customer: tx.customer_name,
            status: tx.status
          };
        });

        // Gabungkan transaksi Supabase dengan cache lokal (agar tidak ada transaksi lokal sebelumnya yang hilang)
        const saved = localStorage.getItem('waterboom_sales_history');
        let combined = [...historyData];
        if (saved) {
          try {
            const localItems = JSON.parse(saved);
            const existingCodes = new Set(historyData.map(h => h.code));
            localItems.forEach(item => {
              if (item && item.code && !existingCodes.has(item.code)) {
                combined.push(item);
              }
            });
          } catch (e) {
            console.warn('Error merging local history:', e);
          }
        }

        setHistory(combined);
        localStorage.setItem('waterboom_sales_history', JSON.stringify(combined));
      } catch (err) {
        console.error('Error:', err);
        // Fallback ke localStorage
        const saved = localStorage.getItem('waterboom_sales_history');
        if (saved) setHistory(JSON.parse(saved));
      } finally {
        setLoading(false);
      }
    };

    // Active Tab state
    const [activeTab, setActiveTab] = useState('dashboard');

    // Sidebar Collapsible Sub-menus
    const [menuOpen, setMenuOpen] = useState({
        tiketMasuk: false,
        sewaLayanan: false
    });

    // Sidebar Collapsible Section Headers (Buka/Tutup Tab Seksi)
    const [sectionsOpen, setSectionsOpen] = useState({
        penjualan: true,
        keuangan: true,
        laporan: true,
        masterData: true,
        pengaturan: true
    });

    const toggleSection = (secKey) => {
        setSectionsOpen(prev => ({
            ...prev,
            [secKey]: !prev[secKey]
        }));
    };

    // --- Interactive Date Range Filter State ---
    const getISOString = (d) => d.toISOString().split('T')[0];
    const formatShortIndoDate = (dateObj) => {
        if (!dateObj || isNaN(dateObj.getTime())) return '';
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
        return `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
    };

    const [datePreset, setDatePreset] = useState('all');
    const [customStartDate, setCustomStartDate] = useState(null);
    const [customEndDate, setCustomEndDate] = useState(null);
    const [dateRangeLabel, setDateRangeLabel] = useState('Semua Waktu (All Time)');
    const [dateRange, setDateRange] = useState('Semua Waktu (All Time)');
    const [showDateRangeDropdown, setShowDateRangeDropdown] = useState(false);

    const applyDatePreset = (presetKey, customStart = null, customEnd = null) => {
        const today = new Date();
        let start = new Date();
        let end = new Date();
        let label = '';

        if (presetKey === 'today') {
            start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            label = `Hari Ini (${formatShortIndoDate(start)})`;
        } else if (presetKey === '7days') {
            start = new Date();
            start.setDate(today.getDate() - 6);
            end = today;
            label = `${formatShortIndoDate(start)} - ${formatShortIndoDate(end)}`;
        } else if (presetKey === '30days') {
            start = new Date();
            start.setDate(today.getDate() - 29);
            end = today;
            label = `${formatShortIndoDate(start)} - ${formatShortIndoDate(end)}`;
        } else if (presetKey === 'month') {
            start = new Date(today.getFullYear(), today.getMonth(), 1);
            end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            label = `Bulan Ini (${formatShortIndoDate(start)} - ${formatShortIndoDate(end)})`;
        } else if (presetKey === 'last_month') {
            start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            end = new Date(today.getFullYear(), today.getMonth(), 0);
            label = `Bulan Lalu (${formatShortIndoDate(start)} - ${formatShortIndoDate(end)})`;
        } else if (presetKey === 'year') {
            start = new Date(today.getFullYear(), 0, 1);
            end = new Date(today.getFullYear(), 11, 31);
            label = `Tahun ${today.getFullYear()}`;
        } else if (presetKey === 'all') {
            start = null;
            end = null;
            label = 'Semua Waktu (All Time)';
        } else if (presetKey === 'custom') {
            const s = customStart ? new Date(customStart) : new Date(customStartDate);
            const e = customEnd ? new Date(customEnd) : new Date(customEndDate);
            start = s;
            end = e;
            label = `${formatShortIndoDate(s)} - ${formatShortIndoDate(e)}`;
        }

        setDatePreset(presetKey);
        setDateRangeLabel(label);
        setDateRange(label);
        if (start && end) {
            setCustomStartDate(getISOString(start));
            setCustomEndDate(getISOString(end));
        }
        setShowDateRangeDropdown(false);
    };

    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [showNotifDropdown, setShowNotifDropdown] = useState(false);
    const [selectedPDFTicket, setSelectedPDFTicket] = useState(null);
    const [isPrinting, setIsPrinting] = useState(false);

    // Notifications state
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: 'Sistem Laporan Siap',
            message: 'Sistem dasbor admin siap digunakan & beroperasi dari angka 0.',
            time: 'Baru saja',
            type: 'system',
            icon: 'fa-circle-check',
            color: '#10b981',
            read: false
        },
        {
            id: 2,
            title: 'Kasir & Reservasi Online',
            message: 'Mesin POS kasir & booking mobile app tersambung secara real-time.',
            time: '15 menit lalu',
            type: 'info',
            icon: 'fa-cash-register',
            color: '#3b82f6',
            read: false
        },
        {
            id: 3,
            title: 'Pengaturan Jam Operasional',
            message: 'Jam operasional waterboom diset 08:00 - 17:00 WIB.',
            time: '1 jam lalu',
            type: 'warning',
            icon: 'fa-clock',
            color: '#f59e0b',
            read: false
        }
    ]);

    // Account Switcher State (Instagram Style)
    const [accounts, setAccounts] = useState([
        { id: 1, name: 'Admin Utama', role: 'Super Admin', email: 'admin@cijoho.id', avatarIcon: 'fa-user-shield', badgeColor: '#3b82f6', isOnline: true },
        { id: 2, name: 'Budi Santoso', role: 'Petugas Kasir 1', email: 'kasir1@cijoho.id', avatarIcon: 'fa-cash-register', badgeColor: '#10b981', isOnline: true },
        { id: 3, name: 'Siti Rahma', role: 'Kasir Loket 2', email: 'kasir2@cijoho.id', avatarIcon: 'fa-calculator', badgeColor: '#f59e0b', isOnline: false },
        { id: 4, name: 'Dedi Kurniawan', role: 'Manajer Keuangan', email: 'finance@cijoho.id', avatarIcon: 'fa-chart-line', badgeColor: '#8b5cf6', isOnline: true }
    ]);

    const [currentAccount, setCurrentAccount] = useState({
        id: 1,
        name: 'Admin Utama',
        role: 'Super Admin',
        email: 'admin@cijoho.id',
        avatarIcon: 'fa-user-shield',
        badgeColor: '#3b82f6'
    });

    const [switchToast, setSwitchToast] = useState('');

    const handleSwitchAccount = (acc) => {
        setCurrentAccount(acc);
        setShowProfileDropdown(false);

        const isKasir = acc.role.toLowerCase().includes('kasir');
        const sessionRole = isKasir ? 'kasir' : 'admin';

        localStorage.setItem('staffSession', JSON.stringify({
            role: sessionRole,
            name: acc.name,
            email: acc.email,
            account: acc
        }));

        setSwitchToast(`Berhasil beralih ke akun ${acc.name} (${acc.role}). ${isKasir ? 'Mengarahkan ke POS Kasir...' : ''}`);

        if (isKasir) {
            setTimeout(() => {
                navigate('/kasir');
            }, 800);
        } else {
            setTimeout(() => {
                setSwitchToast('');
            }, 3500);
        }
    };

    // Dynamic state databases loaded from localStorage
    const [prices, setPrices] = useState({
        tickets: { reguler: 20000, rombongan: 17000, kursus: 15000 },
        rentals: { ban: 5000, sepeda: 5000, gazebo: 20000 }
    });

    const [expenditures, setExpenditures] = useState([]);
    const [staffUsers, setStaffUsers] = useState([]);

    // Dynamic Filtered Datasets based on Date Range Selector
    const dateFilteredHistory = useMemo(() => {
        if (datePreset === 'all' || !customStartDate || !customEndDate) return history;
        return history.filter(item => isDateInRange(item.created_at || item.rawDate || item.date, customStartDate, customEndDate));
    }, [history, datePreset, customStartDate, customEndDate]);

    const dateFilteredExpenditures = useMemo(() => {
        if (datePreset === 'all' || !customStartDate || !customEndDate) return expenditures;
        return expenditures.filter(item => isDateInRange(item.created_at || item.date, customStartDate, customEndDate));
    }, [expenditures, datePreset, customStartDate, customEndDate]);
    const [systemSettings, setSystemSettings] = useState({
        businessName: 'Waterboom Cijoho Indah',
        whatsapp: '628123456789',
        openHours: '08:00 - 17:00',
        capacity: 1000
    });

    // KPI values (Starts from 0)
    const [kpis, setKpis] = useState({
        sales: 0,
        inflow: 0,
        outflow: 0,
        visitors: 0,
        transactions: 0
    });

    // Forms temp states
    const [newExpense, setNewExpense] = useState({ date: '', category: 'Operasional', desc: '', amount: '' });
    const [newUser, setNewUser] = useState({ name: '', email: '', role: 'kasir', password: '' });
    const [priceEdit, setPriceEdit] = useState({ tickets: {}, rentals: {} });
    const [settingsEdit, setSettingsEdit] = useState({});

    // Booking Jam Tiket Modal State
    const [showAddBookingModal, setShowAddBookingModal] = useState(false);
    const [newBooking, setNewBooking] = useState({
        name: '',
        phone: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:30 WIB',
        category: 'Beli', // Beli | Sewa
        type: 'Tiket Reguler',
        qty: 1,
        channel: 'Online',
        method: 'QRIS'
    });

    const navigate = useNavigate();

    // Load initial data and localStorage configurations
    useEffect(() => {
        const loadAllData = () => {
            // 1. Load Sales History (Defaults to 0 / empty array)
            const savedHistory = localStorage.getItem('waterboom_sales_history');
            let historyData = [];
            if (savedHistory) {
                try {
                    historyData = JSON.parse(savedHistory);
                    historyData = historyData.filter(item => item.code && !item.code.startsWith('TRX-250521-'));
                    localStorage.setItem('waterboom_sales_history', JSON.stringify(historyData));
                } catch(e) {
                    historyData = [];
                }
            } else {
                localStorage.setItem('waterboom_sales_history', JSON.stringify([]));
            }
            setHistory(historyData);

            // 2. Load Prices
            const savedPrices = localStorage.getItem('waterboom_prices');
            let pricingData = {
                tickets: { reguler: 20000, rombongan: 17000, kursus: 15000 },
                rentals: { ban: 5000, sepeda: 5000, gazebo: 20000 }
            };
            if (savedPrices) {
                pricingData = JSON.parse(savedPrices);
            } else {
                localStorage.setItem('waterboom_prices', JSON.stringify(pricingData));
            }
            setPrices(pricingData);
            setPriceEdit(pricingData);

            // 3. Load Expenditures (Defaults to 0 / empty array)
            const savedExpenses = localStorage.getItem('waterboom_expenditures');
            let expensesData = [];
            if (savedExpenses) {
                try {
                    expensesData = JSON.parse(savedExpenses);
                    expensesData = expensesData.filter(e => e.id !== '1' && e.id !== '2' && e.id !== '3');
                    localStorage.setItem('waterboom_expenditures', JSON.stringify(expensesData));
                } catch(e) {
                    expensesData = [];
                }
            } else {
                localStorage.setItem('waterboom_expenditures', JSON.stringify([]));
            }
            setExpenditures(expensesData);

            // 4. Load Staff Users
            const savedUsers = localStorage.getItem('waterboom_staff_users');
            let usersData = [
                { id: '1', name: 'Admin Utama', email: 'admin@cijoho.com', role: 'admin' },
                { id: '2', name: 'Petugas Kasir 1', email: 'kasir@cijoho.com', role: 'kasir' }
            ];
            if (savedUsers) {
                usersData = JSON.parse(savedUsers);
            } else {
                localStorage.setItem('waterboom_staff_users', JSON.stringify(usersData));
            }
            setStaffUsers(usersData);

            // 5. Load Settings
            const savedSettings = localStorage.getItem('waterboom_settings');
            let settingsData = {
                businessName: 'Waterboom Cijoho Indah',
                whatsapp: '628123456789',
                openHours: '08:00 - 17:00',
                capacity: 1000
            };
            if (savedSettings) {
                settingsData = JSON.parse(savedSettings);
            } else {
                localStorage.setItem('waterboom_settings', JSON.stringify(settingsData));
            }
            setSystemSettings(settingsData);
            setSettingsEdit(settingsData);

            // Compute Statistics & KPIs from 0
            let totalSales = 0;
            let totalVisitors = 0;

            historyData.forEach(item => {
                totalSales += Number(item.total) || 0;
                totalVisitors += Number(item.qty) || 1;
            });

            let totalExpenses = 0;
            expensesData.forEach(e => {
                totalExpenses += Number(e.amount) || 0;
            });

            setKpis({
                sales: totalSales,
                inflow: totalSales,
                outflow: totalExpenses,
                visitors: totalVisitors,
                transactions: historyData.length
            });
        };
        
        loadAllData();
        fetchTransactions();
        // Refresh data setiap 30 detik
        const interval = setInterval(fetchTransactions, 30000);
        window.addEventListener('storage', loadAllData);
        return () => {
            window.removeEventListener('storage', loadAllData);
            clearInterval(interval);
        };
    }, []);

    // --- Hitung KPI setiap kali dateFilteredHistory atau dateFilteredExpenditures berubah ---
    useEffect(() => {
        let totalSales = 0;
        let totalTransactions = 0;
        dateFilteredHistory.forEach(item => {
            totalSales += Number(item.total) || 0;
            totalTransactions += 1;
        });
        
        let totalOutflow = 0;
        dateFilteredExpenditures.forEach(e => totalOutflow += Number(e.amount) || 0);

        const ticketRows = dateFilteredHistory.filter(i => i.type && i.type.startsWith('Beli'));
        const visitors = ticketRows.reduce((sum, r) => sum + (Number(r.qty) || 0), 0);

        setKpis({
            sales: totalSales,
            inflow: totalSales,
            outflow: totalOutflow,
            visitors: visitors,
            transactions: totalTransactions
        });
    }, [dateFilteredHistory, dateFilteredExpenditures]);

    const toggleSubmenu = (menu) => {
        setMenuOpen(prev => ({
            ...prev,
            [menu]: !prev[menu]
        }));
    };

    const handleLogout = () => {
        localStorage.removeItem('staffSession');
        navigate('/login');
    };

    // Calculate aggregated rental items sold based on date range
    const getRentalTotals = () => {
        let banQty = 0;
        let gazeboQty = 0;
        let angsaQty = 0;

        dateFilteredHistory.forEach(item => {
            const qty = Number(item.qty) || 1;
            const prod = (item.product || item.type || '').toLowerCase();

            if (item.details && item.details.rentals) {
                const r = item.details.rentals;
                banQty += r.ban || 0;
                angsaQty += r.sepeda || 0;
                gazeboQty += r.gazebo || 0;
            } else if (item.rentals) {
                const r = item.rentals;
                banQty += r.ban || 0;
                angsaQty += r.sepeda || 0;
                gazeboQty += r.gazebo || 0;
            } else if (prod.includes('ban')) {
                banQty += qty;
            } else if (prod.includes('gazebo')) {
                gazeboQty += qty;
            } else if (prod.includes('angsa') || prod.includes('sepeda')) {
                angsaQty += qty;
            }
        });

        const banRev = banQty * (prices.rentals?.ban || 5000);
        const gazeboRev = gazeboQty * (prices.rentals?.gazebo || 20000);
        const angsaRev = angsaQty * (prices.rentals?.sepeda || 5000);

        return {
            ban: { qty: banQty, rev: banRev },
            gazebo: { qty: gazeboQty, rev: gazeboRev },
            angsa: { qty: angsaQty, rev: angsaRev },
            totalQty: banQty + gazeboQty + angsaQty,
            totalRev: banRev + gazeboRev + angsaRev
        };
    };

    const rentals = getRentalTotals();

    // Compute dynamic metrics for Laporan and Rekap Keuangan based on date range
    const getReportMetrics = () => {
        let sales = 0;
        let offlineSales = 0;
        let onlineSales = 0;
        let offlineTickets = 0;
        let onlineTickets = 0;

        let regulerSales = 0;
        let regulerTickets = 0;
        let rombonganSales = 0;
        let rombonganTickets = 0;

        let cashSales = 0;
        let qrisSales = 0;
        let transferSales = 0;

        dateFilteredHistory.forEach(item => {
            const itemTotal = Number(item.total) || 0;
            const qty = Number(item.qty) || 0;
            const isBeli = (item.category === 'Beli') || (item.type && item.type.startsWith('Beli'));
            const isOnline = item.channel === 'Online' || (item.code && item.code.startsWith('WCI-'));

            sales += itemTotal;

            // Hanya tiket masuk (beli) yang dihitung untuk tiket
            if (isBeli) {
                if (isOnline) {
                    onlineSales += itemTotal;
                    onlineTickets += qty;
                } else {
                    offlineSales += itemTotal;
                    offlineTickets += qty;
                }

                const prod = (item.product || item.type || '').toLowerCase();
                if (prod.includes('rombongan')) {
                    rombonganSales += itemTotal;
                    rombonganTickets += qty;
                } else if (prod.includes('reguler') || prod.includes('tiket') || prod.includes('masuk')) {
                    regulerSales += itemTotal;
                    regulerTickets += qty;
                }
            }

            // Metode pembayaran dihitung untuk semua transaksi (beli + sewa)
            const method = (item.method || item.paymentMethod || '').toLowerCase();
            if (method.includes('qris')) {
                qrisSales += itemTotal;
            } else if (method.includes('transfer')) {
                transferSales += itemTotal;
            } else {
                cashSales += itemTotal;
            }
        });

        const totalTickets = offlineTickets + onlineTickets;

        return {
            sales,
            offlineSales,
            onlineSales,
            offlineTickets,
            onlineTickets,
            totalTickets,
            regulerSales,
            regulerTickets,
            rombonganSales,
            rombonganTickets,
            cashSales,
            qrisSales,
            transferSales,
            rentals
        };
    };

    const reportMetrics = getReportMetrics();



    // Edit price submit
    const handleSavePrices = (e) => {
        e.preventDefault();
        localStorage.setItem('waterboom_prices', JSON.stringify(priceEdit));
        setPrices(priceEdit);
        alert('Harga tiket dan sewa berhasil disimpan dan disinkronkan dengan Kasir!');
    };

    // Edit settings submit
    const handleSaveSettings = (e) => {
        e.preventDefault();
        localStorage.setItem('waterboom_settings', JSON.stringify(settingsEdit));
        setSystemSettings(settingsEdit);
        alert('Konfigurasi sistem berhasil diperbarui!');
    };

    // Add expenditure submit
    const handleAddExpense = (e) => {
        e.preventDefault();
        if (!newExpense.date || !newExpense.desc || !newExpense.amount) {
            alert('Silakan lengkapi semua bidang pengeluaran!');
            return;
        }

        const expObj = {
            id: 'EXP-' + Math.floor(100000 + Math.random() * 900000),
            date: newExpense.date,
            category: newExpense.category,
            desc: newExpense.desc,
            amount: parseFloat(newExpense.amount)
        };

        const updated = [expObj, ...expenditures];
        setExpenditures(updated);
        localStorage.setItem('waterboom_expenditures', JSON.stringify(updated));

        setNewExpense({ date: '', category: 'Operasional', desc: '', amount: '' });

        let total = 0;
        updated.forEach(item => total += item.amount);
        setKpis(prev => ({
            ...prev,
            outflow: total
        }));
        alert('Pengeluaran berhasil ditambahkan!');
    };

    // Delete expenditure
    const handleDeleteExpense = (id) => {
        if (window.confirm('Hapus log pengeluaran ini?')) {
            const updated = expenditures.filter(item => item.id !== id);
            setExpenditures(updated);
            localStorage.setItem('waterboom_expenditures', JSON.stringify(updated));
            let total = 0;
            updated.forEach(item => total += item.amount);
            setKpis(prev => ({ ...prev, outflow: total }));
        }
    };

    // Add user submit
    const handleAddUser = (e) => {
        e.preventDefault();
        if (!newUser.name || !newUser.email || !newUser.password) {
            alert('Lengkapi seluruh bidang data pengguna!');
            return;
        }

        const userObj = {
            id: 'USR-' + Math.floor(100 + Math.random() * 900),
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
        };

        const updated = [...staffUsers, userObj];
        setStaffUsers(updated);
        localStorage.setItem('waterboom_staff_users', JSON.stringify(updated));

        setNewUser({ name: '', email: '', role: 'kasir', password: '' });
        alert('Akun Staf baru berhasil didaftarkan!');
    };

    // Delete user
    const handleDeleteUser = (id) => {
        if (id === '1') {
            alert('Admin Utama tidak dapat dihapus!');
            return;
        }
        if (window.confirm('Hapus akun staf ini?')) {
            const updated = staffUsers.filter(item => item.id !== id);
            setStaffUsers(updated);
            localStorage.setItem('waterboom_staff_users', JSON.stringify(updated));
        }
    };

    // Delete sales history transaction (Refund) – hapus dari Supabase berdasarkan booking_code
    const handleDeleteTransaction = async (code) => {
        if (window.confirm(`Apakah Anda yakin ingin melakukan refund/hapus transaksi ${code}?`)) {
            const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('booking_code', code);

            if (error) {
                alert('Gagal menghapus transaksi: ' + error.message);
                return;
            }

            // Update local state immediately for responsiveness
            const updated = history.filter(item => item.code !== code);
            setHistory(updated);
            localStorage.setItem('waterboom_sales_history', JSON.stringify(updated));

            // Recalculate stats from 0
            let addedSales = 0;
            let addedVisitors = 0;
            updated.forEach(item => {
                addedSales += Number(item.total) || 0;
                addedVisitors += Number(item.qty) || 1;
            });
            setKpis(prev => ({
                ...prev,
                sales: addedSales,
                inflow: addedSales,
                visitors: addedVisitors,
                transactions: updated.length
            }));
            alert(`Transaksi ${code} berhasil direfund dan dihapus dari database.`);
        }
    };

    // Add New Booking Ticket Handler (Admin)
    const handleAddBooking = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        const bookingCode = 'WCI-' + Math.floor(100000 + Math.random() * 900000);
        const unitPrices = {
            'Tiket Reguler': prices.tickets.reguler || 20000,
            'Tiket Rombongan': prices.tickets.rombongan || 17000,
            'Kursus Renang': prices.tickets.kursus || 15000,
            'Sewa Ban': prices.rentals.ban || 5000,
            'Sewa Sepeda Air': prices.rentals.sepeda || 20000,
            'Sewa Gazebo': prices.rentals.gazebo || 20000
        };
        const unitPrice = unitPrices[newBooking.type] || 20000;
        const totalPrice = unitPrice * parseInt(newBooking.qty || 1);
        
        const formattedDate = new Date(newBooking.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        const isRental = newBooking.category === 'Sewa' || newBooking.type.includes('Sewa');

        const createdTx = {
            code: bookingCode,
            date: formattedDate,
            time: newBooking.time || '09:30 WIB',
            category: isRental ? 'Sewa' : 'Beli',
            type: newBooking.type,
            product: newBooking.type,
            qty: parseInt(newBooking.qty || 1),
            total: totalPrice,
            channel: newBooking.channel,
            method: newBooking.method,
            customer: newBooking.name || 'Pengunjung',
            phone: newBooking.phone || '-',
            name: newBooking.name || 'Pengunjung',
            status: 'Lunas - E-Tiket PDF',
            rentals: {
                ban: newBooking.type === 'Sewa Ban' ? parseInt(newBooking.qty || 1) : 0,
                sepeda: newBooking.type === 'Sewa Sepeda Air' ? parseInt(newBooking.qty || 1) : 0,
                gazebo: newBooking.type === 'Sewa Gazebo' ? parseInt(newBooking.qty || 1) : 0
            }
        };

        const updated = [createdTx, ...history];
        setHistory(updated);
        localStorage.setItem('waterboom_sales_history', JSON.stringify(updated));

        let addedSales = 0;
        let addedVisitors = 0;
        updated.forEach(item => {
            addedSales += Number(item.total) || 0;
            addedVisitors += Number(item.qty) || 1;
        });
        setKpis(prev => ({
            ...prev,
            sales: addedSales,
            inflow: addedSales,
            visitors: addedVisitors,
            transactions: updated.length
        }));

        setShowAddBookingModal(false);
        setSelectedPDFTicket(createdTx);
    };

    // Filter log list (combining Date Range Filter + Search Query & Offline/Online & Category Beli/Sewa Filter)
    const filteredHistory = dateFilteredHistory.filter(item => {
        const matchesSearch = (item.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.product || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.customer || '').toLowerCase().includes(searchQuery.toLowerCase());

        if (selectedFilter === 'all') return matchesSearch;
        if (selectedFilter === 'offline') return matchesSearch && (item.channel === 'Offline' || !item.code.startsWith('WCI-'));
        if (selectedFilter === 'online') return matchesSearch && (item.channel === 'Online' || item.code.startsWith('WCI-'));
        if (selectedFilter === 'category_beli') return matchesSearch && (item.category === 'Beli' || (!item.category && item.type && item.type.includes('Tiket')));
        if (selectedFilter === 'category_sewa') return matchesSearch && (item.category === 'Sewa' || (!item.category && item.type && item.type.includes('Sewa')));
        return matchesSearch;
    });

    return (
        <div className="superadmin-dashboard-container">
            {/* Mobile Sidebar Backdrop Overlay */}
            {isMobileSidebarOpen && (
                <div 
                    className="mobile-sidebar-backdrop" 
                    onClick={() => setIsMobileSidebarOpen(false)} 
                />
            )}

            {/* Mobile Top Navigation Header */}
            <div className="mobile-admin-topbar">
                <button 
                    type="button" 
                    className="mobile-admin-hamburger-btn"
                    onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                    aria-label="Buka Navigasi Mobile"
                >
                    <i className="fa-solid fa-bars"></i>
                </button>
                <div className="mobile-admin-brand">
                    <img src="assets/logo.png" alt="Logo" style={{ height: '26px' }} />
                    <span>{systemSettings.businessName}</span>
                </div>
                <div className="mobile-admin-notif-wrapper" style={{ position: 'relative' }}>
                    <button
                        type="button"
                        className="mobile-notif-bell-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowNotifDropdown(!showNotifDropdown);
                            setShowDateRangeDropdown(false);
                            setShowProfileDropdown(false);
                        }}
                        aria-label="Notifikasi Sistem"
                        style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            border: 'none',
                            color: '#ffffff',
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.1rem',
                            cursor: 'pointer',
                            position: 'relative'
                        }}
                    >
                        <i className="fa-solid fa-bell"></i>
                        {notifications.filter(n => !n.read).length > 0 && (
                            <span className="notif-count-badge" style={{
                                position: 'absolute',
                                top: '-2px',
                                right: '-2px',
                                backgroundColor: '#ef4444',
                                color: '#ffffff',
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid #0c294a'
                            }}>
                                {notifications.filter(n => !n.read).length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* 1. LEFT SIDEBAR */}
            <aside className={`superadmin-sidebar ${isMobileSidebarOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-brand-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="brand-title-wrap" style={{ marginLeft: 0 }}>
                        <span className="brand-name">{systemSettings.businessName}</span>
                        <span className="brand-loc">PORTAL UTAMA</span>
                    </div>
                    <button 
                        type="button"
                        className="mobile-sidebar-close-btn"
                        onClick={() => setIsMobileSidebarOpen(false)}
                        style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer', padding: '4px' }}
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div 
                    className="sidebar-profile-card"
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '16px',
                        margin: '12px 16px 16px 16px',
                        transition: 'all 0.2s ease'
                    }}
                    title="Klik untuk Beralih Akun (Account Switcher)"
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="profile-avatar-circle" style={{ backgroundColor: currentAccount.badgeColor, flexShrink: 0 }}>
                            <i className={`fa-solid ${currentAccount.avatarIcon}`}></i>
                        </div>
                        <div className="profile-meta" style={{ display: 'flex', flexDirection: 'column' }}>
                            <strong style={{ fontSize: '0.88rem', color: '#ffffff', lineHeight: '1.2' }}>{currentAccount.name}</strong>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{currentAccount.role}</span>
                        </div>
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', padding: '2px' }}>
                        <i className={`fa-solid fa-chevron-${showProfileDropdown ? 'up' : 'down'}`}></i>
                    </div>
                </div>

                {/* SIDEBAR ACCOUNT SWITCHER DROPDOWN */}
                {showProfileDropdown && (
                    <div className="sidebar-account-switcher fade-in" style={{
                        margin: '-8px 16px 16px 16px',
                        padding: '12px',
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        border: '1.5px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.3)'
                    }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.5px', marginBottom: '2px', textTransform: 'uppercase' }}>
                            Beralih Akun (Account Switcher)
                        </div>
                        {accounts.map(acc => (
                            <div
                                key={acc.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSwitchAccount(acc);
                                    setShowProfileDropdown(false);
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '8px 10px',
                                    borderRadius: '10px',
                                    backgroundColor: acc.id === currentAccount.id ? 'rgba(37, 99, 235, 0.3)' : 'rgba(255,255,255,0.04)',
                                    border: acc.id === currentAccount.id ? '1px solid #3b82f6' : '1px solid transparent',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: acc.badgeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.78rem', flexShrink: 0 }}>
                                        <i className={`fa-solid ${acc.avatarIcon}`}></i>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>{acc.name}</div>
                                        <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{acc.role}</div>
                                    </div>
                                </div>
                                {acc.id === currentAccount.id && <i className="fa-solid fa-circle-check" style={{ color: '#60a5fa', fontSize: '0.85rem' }}></i>}
                            </div>
                        ))}

                        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '8px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowProfileDropdown(false);
                                    setActiveTab('pengguna');
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#60a5fa',
                                    fontSize: '0.76rem',
                                    fontWeight: 700,
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '4px 6px'
                                }}
                            >
                                <i className="fa-solid fa-user-plus"></i> Tambah Akun Staf Baru
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleLogout();
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#f87171',
                                    fontSize: '0.76rem',
                                    fontWeight: 700,
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '4px 6px'
                                }}
                            >
                                <i className="fa-solid fa-right-from-bracket"></i> Keluar (Logout)
                            </button>
                        </div>
                    </div>
                )}
                <nav className="sidebar-navigation">
                    <div className={`nav-menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}>
                        <a href="#/admin" onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}><i className="fa-solid fa-chart-pie"></i> Dashboard</a>
                    </div>
                    {/* PENJUALAN */}
                    <div className="sidebar-section-header clickable-header" onClick={() => toggleSection('penjualan')}>
                        <span>PENJUALAN</span>
                        <i className={`fa-solid fa-chevron-${sectionsOpen.penjualan ? 'down' : 'right'} section-caret`}></i>
                    </div>
                    {sectionsOpen.penjualan && (
                        <div className="section-menu-group">
                            <div className={`nav-menu-dropdown-wrapper ${menuOpen.tiketMasuk || (activeTab === 'transaksi' && (selectedFilter === 'offline' || selectedFilter === 'online') && searchQuery === '') ? 'open' : ''}`}>
                                <div className={`nav-menu-item dropdown-toggle ${activeTab === 'transaksi' && (selectedFilter === 'offline' || selectedFilter === 'online') && searchQuery === '' ? 'active-parent' : ''}`} onClick={() => toggleSubmenu('tiketMasuk')}>
                                    <span><i className="fa-solid fa-ticket"></i> Tiket Masuk</span>
                                    <i className="fa-solid fa-chevron-down caret-icon"></i>
                                </div>
                                <ul className="dropdown-submenu-list">
                                    <li>
                                        <a
                                            href="#/admin"
                                            className={activeTab === 'transaksi' && selectedFilter === 'offline' && searchQuery === '' ? 'active' : ''}
                                            onClick={(e) => { e.preventDefault(); setActiveTab('transaksi'); setSelectedFilter('offline'); setSearchQuery(''); }}
                                        >
                                            Penjualan Offline
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#/admin"
                                            className={activeTab === 'transaksi' && selectedFilter === 'online' && searchQuery === '' ? 'active' : ''}
                                            onClick={(e) => { e.preventDefault(); setActiveTab('transaksi'); setSelectedFilter('online'); setSearchQuery(''); }}
                                        >
                                            Penjualan Online
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div className={`nav-menu-dropdown-wrapper ${menuOpen.sewaLayanan || (activeTab === 'transaksi' && searchQuery !== '') ? 'open' : ''}`}>
                                <div className={`nav-menu-item dropdown-toggle ${activeTab === 'transaksi' && searchQuery !== '' ? 'active-parent' : ''}`} onClick={() => toggleSubmenu('sewaLayanan')}>
                                    <span><i className="fa-solid fa-parachute-box"></i> Sewa & Layanan</span>
                                    <i className="fa-solid fa-chevron-down caret-icon"></i>
                                </div>
                                <ul className="dropdown-submenu-list">
                                    <li>
                                        <a
                                            href="#/admin"
                                            className={activeTab === 'transaksi' && searchQuery === 'Ban' ? 'active' : ''}
                                            onClick={(e) => { e.preventDefault(); setActiveTab('transaksi'); setSelectedFilter('all'); setSearchQuery('Ban'); }}
                                        >
                                            Sewa Ban
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#/admin"
                                            className={activeTab === 'transaksi' && searchQuery === 'Gazebo' ? 'active' : ''}
                                            onClick={(e) => { e.preventDefault(); setActiveTab('transaksi'); setSelectedFilter('all'); setSearchQuery('Gazebo'); }}
                                        >
                                            Sewa Gazebo
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#/admin"
                                            className={activeTab === 'transaksi' && searchQuery === 'Angsa' ? 'active' : ''}
                                            onClick={(e) => { e.preventDefault(); setActiveTab('transaksi'); setSelectedFilter('all'); setSearchQuery('Angsa'); }}
                                        >
                                            Sewa Angsa
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div className={`nav-menu-item ${activeTab === 'transaksi' && selectedFilter === 'all' && searchQuery === '' ? 'active' : ''}`}>
                                <a href="#/admin" onClick={(e) => { e.preventDefault(); setActiveTab('transaksi'); setSelectedFilter('all'); setSearchQuery(''); }}><i className="fa-solid fa-receipt"></i> Transaksi</a>
                            </div>
                        </div>
                    )}
                    {/* KEUANGAN */}
                    <div className="sidebar-section-header clickable-header" onClick={() => toggleSection('keuangan')}>
                        <span>KEUANGAN</span>
                        <i className={`fa-solid fa-chevron-${sectionsOpen.keuangan ? 'down' : 'right'} section-caret`}></i>
                    </div>
                    {sectionsOpen.keuangan && (
                        <div className="section-menu-group">
                            <div className={`nav-menu-item ${activeTab === 'pemasukan' ? 'active' : ''}`}>
                                <a href="#/admin" onClick={(e) => { e.preventDefault(); setActiveTab('pemasukan'); }}><i className="fa-solid fa-vault"></i> Pemasukan</a>
                            </div>
                            <div className={`nav-menu-item ${activeTab === 'pengeluaran' ? 'active' : ''}`}>
                                <a href="#/admin" onClick={(e) => { e.preventDefault(); setActiveTab('pengeluaran'); }}><i className="fa-solid fa-circle-minus"></i> Pengeluaran</a>
                            </div>
                        </div>
                    )}
                    {/* LAPORAN */}
                    <div className="sidebar-section-header clickable-header" onClick={() => toggleSection('laporan')}>
                        <span>LAPORAN</span>
                        <i className={`fa-solid fa-chevron-${sectionsOpen.laporan ? 'down' : 'right'} section-caret`}></i>
                    </div>
                    {sectionsOpen.laporan && (
                        <div className="section-menu-group">
                            <div className={`nav-menu-item ${activeTab === 'rekap_keuangan' ? 'active' : ''}`}>
                                <a href="#/admin" onClick={(e) => { e.preventDefault(); setActiveTab('rekap_keuangan'); }}><i className="fa-solid fa-vault"></i> Rekap Keuangan</a>
                            </div>
                            <div className={`nav-menu-item ${activeTab === 'laporan_penjualan' ? 'active' : ''}`}>
                                <a href="#/admin" onClick={(e) => { e.preventDefault(); setActiveTab('laporan_penjualan'); }}><i className="fa-solid fa-file-lines"></i> Laporan Penjualan</a>
                            </div>
                            <div className={`nav-menu-item ${activeTab === 'laporan_layanan' ? 'active' : ''}`}>
                                <a href="#/admin" onClick={(e) => { e.preventDefault(); setActiveTab('laporan_layanan'); }}><i className="fa-solid fa-receipt"></i> Laporan Layanan</a>
                            </div>
                        </div>
                    )}
                    {/* MASTER DATA */}
                    <div className="sidebar-section-header clickable-header" onClick={() => toggleSection('masterData')}>
                        <span>MASTER DATA</span>
                        <i className={`fa-solid fa-chevron-${sectionsOpen.masterData ? 'down' : 'right'} section-caret`}></i>
                    </div>
                    {sectionsOpen.masterData && (
                        <div className="section-menu-group">
                            <div className={`nav-menu-item ${activeTab === 'produk_harga' ? 'active' : ''}`}>
                                <a href="#/admin" onClick={(e) => { e.preventDefault(); setActiveTab('produk_harga'); }}><i className="fa-solid fa-store"></i> Produk & Harga</a>
                            </div>
                            <div className={`nav-menu-item ${activeTab === 'paket_promo' ? 'active' : ''}`}>
                                <a href="#/admin" onClick={(e) => { e.preventDefault(); setActiveTab('paket_promo'); }}><i className="fa-solid fa-tags"></i> Paket & Promo</a>
                            </div>
                            <div className={`nav-menu-item ${activeTab === 'kategori' ? 'active' : ''}`}>
                                <a href="#/admin" onClick={(e) => { e.preventDefault(); setActiveTab('kategori'); }}><i className="fa-solid fa-folder"></i> Kategori</a>
                            </div>
                            <div className={`nav-menu-item ${activeTab === 'pengunjung' ? 'active' : ''}`}>
                                <a href="#/admin" onClick={(e) => { e.preventDefault(); setActiveTab('pengunjung'); }}><i className="fa-solid fa-users"></i> Pengunjung</a>
                            </div>
                        </div>
                    )}
                    {/* PENGATURAN */}
                    <div className="sidebar-section-header clickable-header" onClick={() => toggleSection('pengaturan')}>
                        <span>PENGATURAN</span>
                        <i className={`fa-solid fa-chevron-${sectionsOpen.pengaturan ? 'down' : 'right'} section-caret`}></i>
                    </div>
                    {sectionsOpen.pengaturan && (
                        <div className="section-menu-group">
                            <div className={`nav-menu-item ${activeTab === 'pengaturan_sistem' ? 'active' : ''}`}>
                                <a href="#/admin" onClick={(e) => { e.preventDefault(); setActiveTab('pengaturan_sistem'); }}><i className="fa-solid fa-gear"></i> Pengaturan Sistem</a>
                            </div>
                            <div className={`nav-menu-item ${activeTab === 'pengguna' ? 'active' : ''}`}>
                                <a href="#/admin" onClick={(e) => { e.preventDefault(); setActiveTab('pengguna'); }}><i className="fa-solid fa-user-gear"></i> Pengguna</a>
                            </div>
                        </div>
                    )}
                </nav>
                <div className="sidebar-logout-footer">
                    <button onClick={handleLogout} className="btn-sidebar-logout">
                        <i className="fa-solid fa-arrow-right-from-bracket"></i> Keluar
                    </button>
                </div>
            </aside>

            {/* 2. MAIN CONTENT AREA */}
            <main className="superadmin-main">
                {/* Topbar/Header info - Fixed top navbar */}
                <header className="superadmin-header">
                    <div className="header-title-column">
                        <h1>
                            {activeTab === 'dashboard' && 'Dashboard'}
                            {activeTab === 'transaksi' && 'Daftar Transaksi'}
                            {activeTab === 'pemasukan' && 'Analisis Pemasukan'}
                            {activeTab === 'pengeluaran' && 'Manajemen Pengeluaran'}
                            {activeTab === 'rekap_keuangan' && 'Rekap Pemasukan vs Pengeluaran'}
                            {activeTab === 'laporan_penjualan' && 'Laporan Penjualan Tiket'}
                            {activeTab === 'laporan_layanan' && 'Laporan Layanan & Sewa'}
                            {activeTab === 'produk_harga' && 'Manajemen Produk & Harga'}
                            {activeTab === 'paket_promo' && 'Paket & Promo'}
                            {activeTab === 'kategori' && 'Daftar Kategori'}
                            {activeTab === 'pengunjung' && 'Database Pengunjung'}
                            {activeTab === 'pengaturan_sistem' && 'Konfigurasi Sistem'}
                            {activeTab === 'pengguna' && 'Manajemen Pengguna Staf'}
                        </h1>
                        <p>
                            {activeTab === 'dashboard' && 'Ringkasan aktivitas penjualan dan keuangan'}
                            {activeTab === 'transaksi' && 'Daftar lengkap log transaksi tiket masuk dan sewa'}
                            {activeTab === 'produk_harga' && 'Sesuaikan harga jual tiket dan sewa barang secara langsung'}
                            {activeTab === 'pengguna' && 'Atur hak akses akun administrator dan petugas kasir'}
                            {activeTab === 'pengeluaran' && 'Kelola arus kas keluar operasional waterboom'}
                            {activeTab === 'rekap_keuangan' && `Periode Laporan: ${dateRangeLabel || dateRange}`}
                            {activeTab !== 'dashboard' && activeTab !== 'transaksi' && activeTab !== 'produk_harga' && activeTab !== 'pengguna' && activeTab !== 'pengeluaran' && activeTab !== 'rekap_keuangan' && 'Manajemen master data dan laporan operasional'}
                        </p>
                    </div>
                    <div className="header-controls-column" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Notification Bell Icon */}
                        <div className="notif-wrapper" style={{ position: 'relative' }}>
                            <button
                                type="button"
                                className="notif-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowNotifDropdown(!showNotifDropdown);
                                    setShowDateRangeDropdown(false);
                                    setShowProfileDropdown(false);
                                }}
                                aria-label="Notifikasi Sistem"
                                style={{
                                    position: 'relative',
                                    backgroundColor: '#ffffff',
                                    border: '1.5px solid #cbd5e1',
                                    borderRadius: '50%',
                                    width: '40px',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.15rem',
                                    color: '#0c294a',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                    transition: 'all 0.2s ease'
                                }}
                                title="Pusat Notifikasi Admin"
                            >
                                <i className={`fa-${notifications.filter(n => !n.read).length > 0 ? 'solid' : 'regular'} fa-bell`} style={{ color: notifications.filter(n => !n.read).length > 0 ? '#2563eb' : '#64748b' }}></i>
                                {notifications.filter(n => !n.read).length > 0 && (
                                    <span className="notif-count-badge" style={{
                                        position: 'absolute',
                                        top: '-2px',
                                        right: '-2px',
                                        backgroundColor: '#ef4444',
                                        color: '#ffffff',
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

                        <div className="date-range-selector-wrapper" style={{ position: 'relative' }}>
                            <button
                                type="button"
                                className="date-range-selector"
                                onClick={() => {
                                    setShowDateRangeDropdown(!showDateRangeDropdown);
                                    setShowNotifDropdown(false);
                                    setShowProfileDropdown(false);
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    backgroundColor: '#ffffff',
                                    border: '1.5px solid #cbd5e1',
                                    borderRadius: '50px',
                                    padding: '8px 16px',
                                    color: '#0c294a',
                                    fontSize: '0.85rem',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <i className="fa-regular fa-calendar-days" style={{ color: '#2563eb', fontSize: '0.95rem' }}></i>
                                <span>{dateRangeLabel || dateRange}</span>
                                <i className={`fa-solid fa-chevron-${showDateRangeDropdown ? 'up' : 'down'} caret`} style={{ fontSize: '0.75rem', color: '#64748b' }}></i>
                            </button>

                            {showDateRangeDropdown && (
                                <div className="date-range-dropdown-menu fade-in" style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 8px)',
                                    right: 0,
                                    width: '360px',
                                    backgroundColor: '#ffffff',
                                    borderRadius: '20px',
                                    boxShadow: '0 16px 36px rgba(15, 23, 42, 0.2)',
                                    border: '1px solid #e2e8f0',
                                    zIndex: 1000,
                                    padding: '16px',
                                    fontFamily: "'Inter', sans-serif"
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', marginBottom: '12px' }}>
                                        <strong style={{ fontSize: '0.88rem', color: '#0c294a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <i className="fa-solid fa-filter" style={{ color: '#2563eb' }}></i> Filter Periode Laporan
                                        </strong>
                                        <button onClick={() => setShowDateRangeDropdown(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.1rem', cursor: 'pointer' }}>&times;</button>
                                    </div>

                                    {/* PRESETS GRID */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '14px' }}>
                                        {[
                                            { key: 'today', label: 'Hari Ini', icon: 'fa-sun' },
                                            { key: '7days', label: '7 Hari Terakhir', icon: 'fa-calendar-week' },
                                            { key: '30days', label: '30 Hari Terakhir', icon: 'fa-calendar-days' },
                                            { key: 'month', label: 'Bulan Ini', icon: 'fa-calendar' },
                                            { key: 'last_month', label: 'Bulan Lalu', icon: 'fa-history' },
                                            { key: 'year', label: 'Tahun Ini', icon: 'fa-chart-line' },
                                            { key: 'all', label: 'Semua Waktu', icon: 'fa-database' }
                                        ].map(preset => (
                                            <button
                                                key={preset.key}
                                                type="button"
                                                onClick={() => applyDatePreset(preset.key)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '8px 10px',
                                                    borderRadius: '10px',
                                                    border: datePreset === preset.key ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                                                    backgroundColor: datePreset === preset.key ? '#eff6ff' : '#f8fafc',
                                                    color: datePreset === preset.key ? '#1d4ed8' : '#334155',
                                                    fontSize: '0.76rem',
                                                    fontWeight: datePreset === preset.key ? 900 : 700,
                                                    cursor: 'pointer',
                                                    textAlign: 'left'
                                                }}
                                            >
                                                <i className={`fa-solid ${preset.icon}`} style={{ color: datePreset === preset.key ? '#2563eb' : '#94a3b8', fontSize: '0.75rem' }}></i>
                                                {preset.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* CUSTOM DATE RANGE PICKER FORM */}
                                    <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '12px' }}>
                                        <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '8px' }}>
                                            ⚙️ RENTANG TANGGAL KUSTOM:
                                        </label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                                            <div>
                                                <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '2px' }}>Dari Tanggal:</span>
                                                <input
                                                    type="date"
                                                    value={customStartDate}
                                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                                    style={{ width: '100%', padding: '6px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.75rem', fontWeight: 700 }}
                                                />
                                            </div>
                                            <div>
                                                <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '2px' }}>Sampai Tanggal:</span>
                                                <input
                                                    type="date"
                                                    value={customEndDate}
                                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                                    style={{ width: '100%', padding: '6px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.75rem', fontWeight: 700 }}
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => applyDatePreset('custom')}
                                            style={{
                                                width: '100%',
                                                backgroundColor: '#0c294a',
                                                color: 'white',
                                                border: 'none',
                                                padding: '9px',
                                                borderRadius: '10px',
                                                fontSize: '0.78rem',
                                                fontWeight: 900,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <i className="fa-solid fa-check"></i> Terapkan Rentang Tanggal
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Scrollable content area below navbar */}
                <div className="superadmin-content-wrapper">
                    {/* KPI stats bar displayed globally across main pages */}
                    {(activeTab === 'dashboard' || activeTab === 'transaksi' || activeTab === 'pemasukan' || activeTab === 'pengeluaran') && (
                        
                        <div className="superadmin-kpi-grid">
                            <div className="kpi-card-card blue">
                                <div className="kpi-icon-square"><i className="fa-solid fa-ticket"></i></div>
                                <div className="kpi-meta-box">
                                    <span className="label">Total Penjualan</span>
                                    <h3>Rp {kpis.sales.toLocaleString('id-ID')}</h3>
                                    <span className="trend positive"><i className="fa-solid fa-caret-up"></i> 12.5% <small>dari periode lalu</small></span>
                                </div>
                            </div>
                            <div className="kpi-card-card green">
                                <div className="kpi-icon-square"><i className="fa-solid fa-circle-arrow-down"></i></div>
                                <div className="kpi-meta-box">
                                    <span className="label">Total Pemasukan</span>
                                    <h3>Rp {kpis.inflow.toLocaleString('id-ID')}</h3>
                                    <span className="trend positive"><i className="fa-solid fa-caret-up"></i> 15.3% <small>dari periode lalu</small></span>
                                </div>
                            </div>
                            <div className="kpi-card-card red">
                                <div className="kpi-icon-square"><i className="fa-solid fa-circle-arrow-up"></i></div>
                                <div className="kpi-meta-box">
                                    <span className="label">Total Pengeluaran</span>
                                    <h3>Rp {kpis.outflow.toLocaleString('id-ID')}</h3>
                                    <span className="trend positive negative"><i className="fa-solid fa-caret-up"></i> 5.1% <small>dari periode lalu</small></span>
                                </div>
                            </div>
                            <div className="kpi-card-card orange">
                                <div className="kpi-icon-square"><i className="fa-solid fa-users"></i></div>
                                <div className="kpi-meta-box">
                                    <span className="label">Total Pengunjung</span>
                                    <h3>{kpis.visitors.toLocaleString('id-ID')}</h3>
                                    <span className="trend positive"><i className="fa-solid fa-caret-up"></i> 13.8% <small>dari periode lalu</small></span>
                                </div>
                            </div>
                            <div className="kpi-card-card purple">
                                <div className="kpi-icon-square"><i className="fa-solid fa-receipt"></i></div>
                                <div className="kpi-meta-box">
                                    <span className="label">Total Transaksi</span>
                                    <h3>{kpis.transactions.toLocaleString('id-ID')}</h3>
                                    <span className="trend positive"><i className="fa-solid fa-caret-up"></i> 10.7% <small>dari periode lalu</small></span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3. SWITCH RENDER TAB CONTENT */}
                    {/* TAB: DASHBOARD (MOCKUP COPIED) */}
                    {activeTab === 'dashboard' && (
                        <>
                            <div className="dashboard-charts-row-1">
                                {/* Line Chart */}
                                <div className="chart-card-box line-chart-card">
                                    <h3>Rekap Pemasukan vs Pengeluaran</h3>
                                    <div className="line-chart-legend">
                                        <span className="legend-item"><span className="dot green"></span> Pemasukan</span>
                                        <span className="legend-item"><span className="dot red"></span> Pengeluaran</span>
                                    </div>
                                    <div className="svg-chart-container" style={{ overflow: 'visible', paddingBottom: '10px' }}>
                                        <svg viewBox="0 0 500 175" className="svg-line-chart" style={{ overflow: 'visible' }}>
                                            <defs>
                                                <linearGradient id="pemasukanGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                                                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                                                </linearGradient>
                                                <linearGradient id="pengeluaranGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.1" />
                                                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                                                </linearGradient>
                                            </defs>
                                            <line x1="0" y1="35" x2="500" y2="35" stroke="#f1f5f9" strokeWidth="1" />
                                            <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                                            <line x1="0" y1="125" x2="500" y2="125" stroke="#f1f5f9" strokeWidth="1" />
                                            <text x="15" y="38" fill="#94a3b8" fontSize="8" fontWeight="700">20 JT</text>
                                            <text x="15" y="83" fill="#94a3b8" fontSize="8" fontWeight="700">15 JT</text>
                                            <text x="15" y="128" fill="#94a3b8" fontSize="8" fontWeight="700">10 JT</text>
                                            <text x="15" y="168" fill="#94a3b8" fontSize="8" fontWeight="700">0</text>
                                            {reportMetrics.sales > 0 ? (
                                                <>
                                                    <path d="M 50 125 Q 120 95 190 50 T 330 65 T 470 105 L 470 168 L 50 168 Z" fill="url(#pemasukanGrad)" />
                                                    <path d="M 50 125 Q 120 95 190 50 T 330 65 T 470 105" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                                                </>
                                            ) : (
                                                <line x1="50" y1="168" x2="470" y2="168" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" />
                                            )}
                                            {kpis.outflow > 0 ? (
                                                <>
                                                    <path d="M 50 135 Q 120 142 190 130 T 330 128 T 470 133 L 470 168 L 50 168 Z" fill="url(#pengeluaranGrad)" />
                                                    <path d="M 50 135 Q 120 142 190 130 T 330 128 T 470 133" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 3" />
                                                </>
                                            ) : (
                                                <line x1="50" y1="168" x2="470" y2="168" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2 2" />
                                            )}
                                        </svg>
                                    </div>
                                    <div className="chart-x-labels">
                                        <span>Senin</span><span>Selasa</span><span>Rabu</span><span>Kamis</span><span>Jumat</span><span>Sabtu</span><span>Minggu</span>
                                    </div>
                                </div>

                                 {/* Donut Chart: Pemasukan Berdasarkan Sumber */}
                                <div className="chart-card-box donut-chart-card">
                                    <h3>Pemasukan Berdasarkan Sumber</h3>
                                    <div className="donut-chart-flex">
                                        <div className="svg-donut-wrapper">
                                            <svg viewBox="0 0 100 100" width="120" height="120">
                                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#eff6ff" strokeWidth="15" />
                                                {reportMetrics.sales > 0 && (
                                                    <>
                                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1a73e8" strokeWidth="15" strokeDasharray={`${(reportMetrics.offlineSales / reportMetrics.sales) * 251.2} 251.2`} strokeDashoffset="0" transform="rotate(-90 50 50)" />
                                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="15" strokeDasharray={`${(reportMetrics.onlineSales / reportMetrics.sales) * 251.2} 251.2`} strokeDashoffset={`-${(reportMetrics.offlineSales / reportMetrics.sales) * 251.2}`} transform="rotate(-90 50 50)" />
                                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="15" strokeDasharray={`${(rentals.ban.rev / reportMetrics.sales) * 251.2} 251.2`} strokeDashoffset={`-${((reportMetrics.offlineSales + reportMetrics.onlineSales) / reportMetrics.sales) * 251.2}`} transform="rotate(-90 50 50)" />
                                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#6366f1" strokeWidth="15" strokeDasharray={`${(rentals.gazebo.rev / reportMetrics.sales) * 251.2} 251.2`} strokeDashoffset={`-${((reportMetrics.offlineSales + reportMetrics.onlineSales + rentals.ban.rev) / reportMetrics.sales) * 251.2}`} transform="rotate(-90 50 50)" />
                                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ec4899" strokeWidth="15" strokeDasharray={`${(rentals.angsa.rev / reportMetrics.sales) * 251.2} 251.2`} strokeDashoffset={`-${((reportMetrics.offlineSales + reportMetrics.onlineSales + rentals.ban.rev + rentals.gazebo.rev) / reportMetrics.sales) * 251.2}`} transform="rotate(-90 50 50)" />
                                                    </>
                                                )}
                                            </svg>
                                        </div>
                                        <div className="donut-legend-list">
                                            <div className="legend-row"><span className="bullet blue"></span><div className="info"><span>Tiket Masuk Offline</span><strong>Rp {reportMetrics.offlineSales.toLocaleString('id-ID')} <small>({reportMetrics.sales > 0 ? ((reportMetrics.offlineSales / reportMetrics.sales) * 100).toFixed(1) : '0.0'}%)</small></strong></div></div>
                                            <div className="legend-row"><span className="bullet green"></span><div className="info"><span>Tiket Masuk Online</span><strong>Rp {reportMetrics.onlineSales.toLocaleString('id-ID')} <small>({reportMetrics.sales > 0 ? ((reportMetrics.onlineSales / reportMetrics.sales) * 100).toFixed(1) : '0.0'}%)</small></strong></div></div>
                                            <div className="legend-row"><span className="bullet orange"></span><div className="info"><span>Sewa Ban</span><strong>Rp {rentals.ban.rev.toLocaleString('id-ID')} <small>({reportMetrics.sales > 0 ? ((rentals.ban.rev / reportMetrics.sales) * 100).toFixed(1) : '0.0'}%)</small></strong></div></div>
                                            <div className="legend-row"><span className="bullet indigo"></span><div className="info"><span>Sewa Gazebo</span><strong>Rp {rentals.gazebo.rev.toLocaleString('id-ID')} <small>({reportMetrics.sales > 0 ? ((rentals.gazebo.rev / reportMetrics.sales) * 100).toFixed(1) : '0.0'}%)</small></strong></div></div>
                                            <div className="legend-row"><span className="bullet pink"></span><div className="info"><span>Sewa Angsa</span><strong>Rp {rentals.angsa.rev.toLocaleString('id-ID')} <small>({reportMetrics.sales > 0 ? ((rentals.angsa.rev / reportMetrics.sales) * 100).toFixed(1) : '0.0'}%)</small></strong></div></div>
                                        </div>
                                    </div>
                                </div>
                                {/* Progress channel card */}
                                <div className="chart-card-box channel-sales-card">
                                    <h3>Penjualan Tiket Masuk</h3>
                                    <div className="channel-boxes-container">
                                        <div className="channel-box">
                                            <div className="channel-info-row">
                                                <div className="channel-title">
                                                    <div className="channel-icon-square blue"><i className="fa-solid fa-store"></i></div>
                                                    <div>
                                                        <span className="channel-label">Offline</span>
                                                        <div className="channel-value">Rp {reportMetrics.offlineSales.toLocaleString('id-ID')}</div>
                                                        <span className="channel-sub">{reportMetrics.offlineTickets} Tiket</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bar-wrapper">
                                                <div className="bar-track">
                                                    <div className="bar-fill blue" style={{ width: `${reportMetrics.totalTickets > 0 ? Math.round((reportMetrics.offlineTickets / reportMetrics.totalTickets) * 100) : 0}%` }}></div>
                                                </div>
                                                <span className="pct-label">{reportMetrics.totalTickets > 0 ? Math.round((reportMetrics.offlineTickets / reportMetrics.totalTickets) * 100) : 0}%</span>
                                            </div>
                                        </div>
                                        <div className="channel-box">
                                            <div className="channel-info-row">
                                                <div className="channel-title">
                                                    <div className="channel-icon-square green"><i className="fa-solid fa-globe"></i></div>
                                                    <div>
                                                        <span className="channel-label">Online</span>
                                                        <div className="channel-value">Rp {reportMetrics.onlineSales.toLocaleString('id-ID')}</div>
                                                        <span className="channel-sub">{reportMetrics.onlineTickets} Tiket</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bar-wrapper">
                                                <div className="bar-track">
                                                    <div className="bar-fill green" style={{ width: `${reportMetrics.totalTickets > 0 ? Math.round((reportMetrics.onlineTickets / reportMetrics.totalTickets) * 100) : 0}%` }}></div>
                                                </div>
                                                <span className="pct-label">{reportMetrics.totalTickets > 0 ? Math.round((reportMetrics.onlineTickets / reportMetrics.totalTickets) * 100) : 0}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="dashboard-charts-row-2">
                                {/* Latest Sales Log */}
                                <div className="data-table-card latest-sales">
                                    <div className="table-header-block">
                                        <h3>Penjualan Terbaru</h3>
                                        <a href="#/admin" onClick={(e) => { e.preventDefault(); setActiveTab('transaksi'); }} className="view-all-link">Lihat Semua</a>
                                    </div>
                                    <div className="superadmin-table-wrapper">
                                        <table className="superadmin-table">
                                            <thead>
                                                <tr>
                                                    <th>Tanggal & Jam</th><th>No. Transaksi</th><th>Kategori</th><th>Jenis</th><th>Channel</th><th>Produk</th><th>Jumlah</th><th>Total</th><th>Metode</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredHistory.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="9" style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Belum ada data penjualan.</td>
                                                    </tr>
                                                ) : (
                                                    filteredHistory.slice(0, 10).map((item, idx) => (
                                                        <tr key={idx}>
                                                            <td className="text-secondary">
                                                                <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.date}</div>
                                                                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>⏰ {item.time || '08:30 WIB'}</div>
                                                            </td>
                                                            <td className="font-bold">{item.code}</td>
                                                            <td>
                                                                <span style={{
                                                                    padding: '3px 8px',
                                                                    borderRadius: '6px',
                                                                    fontSize: '0.72rem',
                                                                    fontWeight: 800,
                                                                    backgroundColor: item.category === 'Sewa' ? '#fef3c7' : '#dbeafe',
                                                                    color: item.category === 'Sewa' ? '#92400e' : '#1e40af',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px'
                                                                }}>
                                                                    <i className={`fa-solid ${item.category === 'Sewa' ? 'fa-key' : 'fa-cart-shopping'}`}></i>
                                                                    {item.category || 'Beli'}
                                                                </span>
                                                            </td>
                                                            <td><span className={`type-badge ${item.type.includes('Tiket') ? 'ticket' : 'rental'}`}><i className={`fa-solid ${item.type.includes('Tiket') ? 'fa-ticket' : 'fa-parachute-box'}`}></i> {item.type}</span></td>
                                                            <td><span className={`channel-badge ${item.channel === 'Offline' ? 'offline' : 'online'}`}>{item.channel}</span></td>
                                                            <td>{item.product}</td>
                                                            <td>{item.qty}</td>
                                                            <td className="font-bold">Rp {item.total.toLocaleString('id-ID')}</td>
                                                            <td><span className="method-text">{item.method}</span></td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                {/* Rentals Totals */}
                                <div className="data-table-card rental-summary">
                                    <div className="table-header-block">
                                        <h3>Ringkasan Layanan (Sewa)</h3>
                                        <a href="#/admin" onClick={(e) => { e.preventDefault(); setActiveTab('transaksi'); }} className="view-all-link">Lihat Semua</a>
                                    </div>
                                    <div className="superadmin-table-wrapper">
                                        <table className="superadmin-table">
                                            <thead>
                                                <tr><th>Layanan</th><th>Terjual</th><th>Pemasukan</th></tr>
                                            </thead>
                                            <tbody>
                                                <tr><td><div className="service-name-row"><span className="service-square-icon green"><i className="fa-solid fa-[#10b981] fa-circle-dot"></i></span> Sewa Ban</div></td><td>{rentals.ban.qty}</td><td className="font-bold">Rp {rentals.ban.rev.toLocaleString('id-ID')}</td></tr>
                                                <tr><td><div className="service-name-row"><span className="service-square-icon orange"><i className="fa-solid fa-[#f59e0b] fa-house"></i></span> Sewa Gazebo</div></td><td>{rentals.gazebo.qty}</td><td className="font-bold">Rp {rentals.gazebo.rev.toLocaleString('id-ID')}</td></tr>
                                                <tr><td><div className="service-name-row"><span className="service-square-icon purple"><i className="fa-solid fa-[#8b5cf6] fa-feather"></i></span> Sewa Angsa</div></td><td>{rentals.angsa.qty}</td><td className="font-bold">Rp {rentals.angsa.rev.toLocaleString('id-ID')}</td></tr>
                                                <tr className="total-row-highlight"><td><strong>Total</strong></td><td><strong>{rentals.totalQty}</strong></td><td className="font-bold text-blue"><strong>Rp {rentals.totalRev.toLocaleString('id-ID')}</strong></td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            {/* Third Row: method, chart & expenditure */}
                            <div className="dashboard-charts-row-3">
                                <div className="chart-card-box payment-methods-card">
                                    <h3>Metode Pembayaran</h3>
                                    <div className="payment-chart-wrap">
                                        <div className="svg-donut-wrapper">
                                            <svg viewBox="0 0 100 100" width="120" height="120">
                                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#eff6ff" strokeWidth="15" />
                                                {reportMetrics.sales > 0 && (
                                                    <>
                                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1a73e8" strokeWidth="15" strokeDasharray={`${(reportMetrics.cashSales / reportMetrics.sales) * 251.2} 251.2`} strokeDashoffset="0" transform="rotate(-90 50 50)" />
                                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="15" strokeDasharray={`${(reportMetrics.qrisSales / reportMetrics.sales) * 251.2} 251.2`} strokeDashoffset={`-${(reportMetrics.cashSales / reportMetrics.sales) * 251.2}`} transform="rotate(-90 50 50)" />
                                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="15" strokeDasharray={`${(reportMetrics.transferSales / reportMetrics.sales) * 251.2} 251.2`} strokeDashoffset={`-${((reportMetrics.cashSales + reportMetrics.qrisSales) / reportMetrics.sales) * 251.2}`} transform="rotate(-90 50 50)" />
                                                    </>
                                                )}
                                            </svg>
                                        </div>
                                        <div className="donut-legend-list">
                                            <div className="legend-row"><span className="bullet blue"></span><div className="info"><span>Tunai</span><strong>Rp {reportMetrics.cashSales.toLocaleString('id-ID')} <small>({reportMetrics.sales > 0 ? ((reportMetrics.cashSales / reportMetrics.sales) * 100).toFixed(1) : '0.0'}%)</small></strong></div></div>
                                            <div className="legend-row"><span className="bullet green"></span><div className="info"><span>QRIS</span><strong>Rp {reportMetrics.qrisSales.toLocaleString('id-ID')} <small>({reportMetrics.sales > 0 ? ((reportMetrics.qrisSales / reportMetrics.sales) * 100).toFixed(1) : '0.0'}%)</small></strong></div></div>
                                            <div className="legend-row"><span className="bullet orange"></span><div className="info"><span>Transfer</span><strong>Rp {reportMetrics.transferSales.toLocaleString('id-ID')} <small>({reportMetrics.sales > 0 ? ((reportMetrics.transferSales / reportMetrics.sales) * 100).toFixed(1) : '0.0'}%)</small></strong></div></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="chart-card-box daily-visitors-card">
                                    <h3>Pengunjung Harian</h3>
                                    <div className="visitors-chart-container">
                                        <div className="y-axis-labels"><span>800</span><span>600</span><span>400</span><span>200</span><span>0</span></div>
                                        <div className="bar-chart-bars">
                                            {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((day, idx) => (
                                                <div key={idx} className="chart-col">
                                                    <div className="bar-fill" style={{ height: reportMetrics.totalTickets > 0 ? '20%' : '0%' }}></div>
                                                    <span className="label">{day}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="data-table-card recent-expenditures">
                                    <div className="table-header-block">
                                        <h3>Pengeluaran Terbaru</h3>
                                        <a href="#/admin" onClick={(e) => { e.preventDefault(); setActiveTab('pengeluaran'); }} className="view-all-link">Lihat Semua</a>
                                    </div>
                                    <div className="superadmin-table-wrapper">
                                        <table className="superadmin-table">
                                            <thead>
                                                <tr><th>Tanggal</th><th>Kategori</th><th>Deskripsi</th><th>Jumlah</th></tr>
                                            </thead>
                                            <tbody>
                                                {expenditures.slice(0, 3).map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td className="text-secondary">{item.date}</td>
                                                        <td><span className="category-badge-simple">{item.category}</span></td>
                                                        <td>{item.desc}</td>
                                                        <td className="font-bold text-red">Rp {item.amount.toLocaleString('id-ID')}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* TAB: TRANSAKSI */}
                    {activeTab === 'transaksi' && (
                        <div className="data-table-card transaksi-table-card">
                            <div className="table-card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <div className="table-filters-row">
                                    <div className="search-wrapper">
                                        <i className="fa-solid fa-magnifying-glass"></i>
                                        <input
                                            type="text"
                                            placeholder="Cari kode/produk/jenis..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <select
                                        value={selectedFilter}
                                        onChange={(e) => setSelectedFilter(e.target.value)}
                                        className="table-select-filter"
                                    >
                                        <option value="all">Semua Channel & Kategori</option>
                                        <option value="offline">Offline (Kasir)</option>
                                        <option value="online">Online (Pengunjung)</option>
                                        <option value="category_beli">🛒 Kategori Beli</option>
                                        <option value="category_sewa">🔑 Kategori Sewa</option>
                                    </select>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowAddBookingModal(true)}
                                    className="btn btn-accent"
                                    style={{
                                        backgroundColor: '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        padding: '10px 16px',
                                        borderRadius: '10px',
                                        fontWeight: 800,
                                        fontSize: '0.82rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                                    }}
                                >
                                    <i className="fa-solid fa-calendar-plus"></i> Tambah Jam Booking Tiket
                                </button>
                            </div>
                            <div className="superadmin-table-wrapper">
                                <table className="superadmin-table">
                                    <thead>
                                        <tr>
                                            <th>Tanggal & Jam</th>
                                            <th>Kode Transaksi</th>
                                            <th>Kategori</th>
                                            <th>Jenis</th>
                                            <th>Channel</th>
                                            <th>Produk</th>
                                            <th>Jumlah</th>
                                            <th>Total Bayar</th>
                                            <th>Metode</th>
                                            <th>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredHistory.length > 0 ? (
                                            filteredHistory.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="text-secondary">
                                                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.date}</div>
                                                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>⏰ {item.time || '08:30 WIB'}</div>
                                                    </td>
                                                    <td className="font-bold">{item.code}</td>
                                                    <td>
                                                        <span style={{
                                                            padding: '3px 8px',
                                                            borderRadius: '6px',
                                                            fontSize: '0.72rem',
                                                            fontWeight: 800,
                                                            backgroundColor: item.category === 'Sewa' ? '#fef3c7' : '#dbeafe',
                                                            color: item.category === 'Sewa' ? '#92400e' : '#1e40af',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '4px'
                                                        }}>
                                                            <i className={`fa-solid ${item.category === 'Sewa' ? 'fa-key' : 'fa-cart-shopping'}`}></i>
                                                            {item.category || 'Beli'}
                                                        </span>
                                                    </td>
                                                    <td><span className={`type-badge ${item.category === 'Beli' ? 'ticket' : 'rental'}`}><i className={`fa-solid ${item.category === 'Beli' ? 'fa-ticket' : 'fa-parachute-box'}`}></i> {item.type}</span></td>
                                                    <td><span className={`channel-badge ${item.channel === 'Offline' ? 'offline' : 'online'}`}>{item.channel}</span></td>
                                                    <td>{item.product || item.type}</td>
                                                    <td>{item.qty} Pcs</td>
                                                    <td className="font-bold text-blue">Rp {item.total.toLocaleString('id-ID')}</td>
                                                    <td><span className={`method-badge ${item.method === 'QRIS' ? 'qris' : 'cash'}`}>{item.method}</span></td>
                                                    <td>
                                                        <button
                                                            className="btn-refund-action"
                                                            onClick={() => handleDeleteTransaction(item.code)}
                                                        >
                                                            <i className="fa-solid fa-trash-can"></i> Refund
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="10" className="table-empty-row">Tidak ada data transaksi yang cocok.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB: PEMASUKAN */}
                    {activeTab === 'pemasukan' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div className="chart-card-box">
                                <h3>Rincian & Analisis Pemasukan</h3>
                                <div className="donut-chart-flex" style={{ margin: '24px 0', alignItems: 'center' }}>
                                    <div className="svg-donut-wrapper">
                                        <svg viewBox="0 0 100 100" width="180" height="180">
                                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#eff6ff" strokeWidth="15" />
                                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1a73e8" strokeWidth="15" strokeDasharray="120 251.2" strokeDashoffset="0" transform="rotate(-90 50 50)" />
                                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="15" strokeDasharray="67 251.2" strokeDashoffset="-120" transform="rotate(-90 50 50)" />
                                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="15" strokeDasharray="24 251.2" strokeDashoffset="-187" transform="rotate(-90 50 50)" />
                                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#6366f1" strokeWidth="15" strokeDasharray="29 251.2" strokeDashoffset="-211" transform="rotate(-90 50 50)" />
                                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ec4899" strokeWidth="15" strokeDasharray="11 251.2" strokeDashoffset="-240" transform="rotate(-90 50 50)" />
                                        </svg>
                                    </div>
                                    <div className="donut-legend-list" style={{ flexGrow: 1 }}>
                                        <h3 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '6px' }}>Total Pemasukan: <span className="text-green">Rp {kpis.inflow.toLocaleString('id-ID')}</span></h3>
                                        <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '16px' }}>Arus kas masuk bersumber dari Tiket Masuk (Offline & Online) serta Sewa Wahana & Peralatan.</p>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                                            <div className="legend-row"><span className="bullet blue"></span><div className="info"><span>Tiket Masuk Offline</span><strong>Rp {reportMetrics.offlineSales.toLocaleString('id-ID')} <small>({reportMetrics.sales > 0 ? ((reportMetrics.offlineSales / reportMetrics.sales) * 100).toFixed(1) : '0.0'}%)</small></strong></div></div>
                                            <div className="legend-row"><span className="bullet green"></span><div className="info"><span>Tiket Masuk Online</span><strong>Rp {reportMetrics.onlineSales.toLocaleString('id-ID')} <small>({reportMetrics.sales > 0 ? ((reportMetrics.onlineSales / reportMetrics.sales) * 100).toFixed(1) : '0.0'}%)</small></strong></div></div>
                                            <div className="legend-row"><span className="bullet orange"></span><div className="info"><span>Sewa Ban Renang</span><strong>Rp {rentals.ban.rev.toLocaleString('id-ID')} <small>({reportMetrics.sales > 0 ? ((rentals.ban.rev / reportMetrics.sales) * 100).toFixed(1) : '0.0'}%)</small></strong></div></div>
                                            <div className="legend-row"><span className="bullet indigo"></span><div className="info"><span>Sewa Gazebo</span><strong>Rp {rentals.gazebo.rev.toLocaleString('id-ID')} <small>({reportMetrics.sales > 0 ? ((rentals.gazebo.rev / reportMetrics.sales) * 100).toFixed(1) : '0.0'}%)</small></strong></div></div>
                                            <div className="legend-row"><span className="bullet pink"></span><div className="info"><span>Sewa Bebek / Angsa</span><strong>Rp {rentals.angsa.rev.toLocaleString('id-ID')} <small>({reportMetrics.sales > 0 ? ((rentals.angsa.rev / reportMetrics.sales) * 100).toFixed(1) : '0.0'}%)</small></strong></div></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="data-table-card">
                                <div className="table-header-block">
                                    <h3>Daftar Log Transaksi Pemasukan Masuk</h3>
                                </div>
                                <div className="superadmin-table-wrapper" style={{ marginTop: '16px' }}>
                                    <table className="superadmin-table">
                                        <thead>
                                            <tr>
                                                <th>Tanggal & Jam</th><th>No. Transaksi</th><th>Kategori</th><th>Jenis Pemasukan</th><th>Channel</th><th>Item / Produk</th><th>Qty</th><th>Total Nominal</th><th>Metode</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredHistory.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="text-secondary">
                                                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.date}</div>
                                                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>⏰ {item.time || '08:30 WIB'}</div>
                                                    </td>
                                                    <td className="font-bold">{item.code}</td>
                                                    <td>
                                                        <span style={{
                                                            padding: '3px 8px',
                                                            borderRadius: '6px',
                                                            fontSize: '0.72rem',
                                                            fontWeight: 800,
                                                            backgroundColor: item.category === 'Sewa' ? '#fef3c7' : '#dbeafe',
                                                            color: item.category === 'Sewa' ? '#92400e' : '#1e40af',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '4px'
                                                        }}>
                                                            <i className={`fa-solid ${item.category === 'Sewa' ? 'fa-key' : 'fa-cart-shopping'}`}></i>
                                                            {item.category || 'Beli'}
                                                        </span>
                                                    </td>
                                                    <td><span className={`type-badge ${item.category === 'Beli' ? 'ticket' : 'rental'}`}><i className={`fa-solid ${item.category === 'Beli' ? 'fa-ticket' : 'fa-parachute-box'}`}></i> {item.type}</span></td>
                                                    <td><span className={`channel-badge ${item.channel === 'Offline' ? 'offline' : 'online'}`}>{item.channel}</span></td>
                                                    <td>{item.product}</td>
                                                    <td>{item.qty}</td>
                                                    <td className="font-bold text-green">Rp {item.total.toLocaleString('id-ID')}</td>
                                                    <td><span className={`method-badge ${item.method === 'QRIS' ? 'qris' : 'cash'}`}>{item.method}</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: PENGELUARAN */}
                    {activeTab === 'pengeluaran' && (
                        <div className="tab-content-grid-120" style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: '24px' }}>
                            {/* Form tambah pengeluaran */}
                            <div className="chart-card-box">
                                <h3>Catat Pengeluaran Baru</h3>
                                <form onSubmit={handleAddExpense} className="login-form" style={{ marginTop: '16px' }}>
                                    <div className="input-group-field">
                                        <label>Tanggal</label>
                                        <input
                                            type="date"
                                            value={newExpense.date}
                                            onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                                            className="table-select-filter"
                                            style={{ height: '42px', padding: '10px' }}
                                        />
                                    </div>
                                    <div className="input-group-field">
                                        <label>Kategori</label>
                                        <select
                                            value={newExpense.category}
                                            onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                                            className="table-select-filter"
                                            style={{ height: '42px' }}
                                        >
                                            <option value="Operasional">Operasional</option>
                                            <option value="Listrik & Air">Listrik & Air</option>
                                            <option value="Perawatan">Perawatan</option>
                                            <option value="Gaji Karyawan">Gaji Karyawan</option>
                                        </select>
                                    </div>
                                    <div className="input-group-field">
                                        <label>Deskripsi Pengeluaran</label>
                                        <input
                                            type="text"
                                            placeholder="Contoh: Pembelian Sapu"
                                            value={newExpense.desc}
                                            onChange={(e) => setNewExpense({ ...newExpense, desc: e.target.value })}
                                            className="table-select-filter"
                                            style={{ height: '42px', padding: '10px' }}
                                        />
                                    </div>
                                    <div className="input-group-field">
                                        <label>Jumlah Nominal (Rp)</label>
                                        <input
                                            type="number"
                                            placeholder="Nominal rupiah"
                                            value={newExpense.amount}
                                            onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                            className="table-select-filter"
                                            style={{ height: '42px', padding: '10px' }}
                                        />
                                    </div>
                                    <button type="submit" className="btn-login-submit" style={{ height: '44px', borderRadius: '10px' }}>
                                        <i className="fa-solid fa-plus"></i> Tambah Log
                                    </button>
                                </form>
                            </div>
                            {/* List tabel pengeluaran */}
                            <div className="data-table-card">
                                <h3>Arus Kas Keluar</h3>
                                <div className="superadmin-table-wrapper" style={{ marginTop: '16px' }}>
                                    <table className="superadmin-table">
                                        <thead>
                                            <tr>
                                                <th>Tanggal</th>
                                                <th>Kategori</th>
                                                <th>Deskripsi</th>
                                                <th>Nominal</th>
                                                <th>Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredExpenditures.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td>{item.date}</td>
                                                    <td><span className="category-badge-simple">{item.category}</span></td>
                                                    <td>{item.desc}</td>
                                                    <td className="font-bold text-red">Rp {item.amount.toLocaleString('id-ID')}</td>
                                                    <td>
                                                        <button
                                                            className="btn-refund-action"
                                                            onClick={() => handleDeleteExpense(item.id)}
                                                        >
                                                            <i className="fa-solid fa-trash-can"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: LAPORAN PENJUALAN & LAYANAN (simple table) */}
                    {(activeTab === 'laporan_penjualan' || activeTab === 'laporan_layanan') && (
                        <div className="data-table-card print-report-container">
                            <div className="table-header-block" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <h3>
                                    {activeTab === 'laporan_penjualan' && 'Laporan Penjualan Tiket Masuk'}
                                    {activeTab === 'laporan_layanan' && 'Laporan Layanan Tambahan (Sewa)'}
                                </h3>
                                <button onClick={() => window.print()} className="btn btn-accent btn-pill">
                                    <i className="fa-solid fa-print"></i> Cetak Laporan (PDF)
                                </button>
                            </div>
                            <div className="superadmin-table-wrapper" style={{ marginTop: '20px' }}>
                                <table className="superadmin-table">
                                    <thead>
                                        <tr>
                                            <th>Keterangan Deskripsi</th>
                                            <th>Volume Unit</th>
                                            <th>Total Nominal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activeTab === 'laporan_penjualan' && (
                                            <>
                                                <tr><td>Penjualan Tiket Masuk Offline (Kasir)</td><td>{reportMetrics.offlineTickets.toLocaleString('id-ID')} Orang</td><td className="font-bold">Rp {reportMetrics.offlineSales.toLocaleString('id-ID')}</td></tr>
                                                <tr><td>Penjualan Tiket Masuk Online (Mobile App)</td><td>{reportMetrics.onlineTickets.toLocaleString('id-ID')} Orang</td><td className="font-bold">Rp {reportMetrics.onlineSales.toLocaleString('id-ID')}</td></tr>
                                                <tr className="total-row-highlight"><td><strong>Total Tiket Terjual</strong></td><td><strong>{reportMetrics.totalTickets.toLocaleString('id-ID')} Orang</strong></td><td className="font-bold text-blue"><strong>Rp {reportMetrics.sales.toLocaleString('id-ID')}</strong></td></tr>
                                            </>
                                        )}
                                        {activeTab === 'laporan_layanan' && (
                                            <>
                                                <tr><td>Sewa Ban Pelampung Renang</td><td>{rentals.ban.qty} unit</td><td className="font-bold">Rp {rentals.ban.rev.toLocaleString('id-ID')}</td></tr>
                                                <tr><td>Sewa Sepeda Air Angsa</td><td>{rentals.angsa.qty} unit</td><td className="font-bold">Rp {rentals.angsa.rev.toLocaleString('id-ID')}</td></tr>
                                                <tr><td>Sewa Gazebo Saung Istirahat</td><td>{rentals.gazebo.qty} unit</td><td className="font-bold">Rp {rentals.gazebo.rev.toLocaleString('id-ID')}</td></tr>
                                                <tr className="total-row-highlight"><td><strong>Total Layanan Tambahan</strong></td><td><strong>{rentals.totalQty} unit</strong></td><td className="font-bold text-blue"><strong>Rp {rentals.totalRev.toLocaleString('id-ID')}</strong></td></tr>
                                            </>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB: REKAP KEUANGAN — Full Financial Dashboard */}
                    {activeTab === 'rekap_keuangan' && (
                        <div className="rkeu-dashboard" style={{ fontFamily: "'Roboto', sans-serif" }}>
                            {/* === TOP ROW: 70/30 === */}
                            <div className="rkeu-top-row">
                                {/* LEFT COLUMN (70%) */}
                                <div className="rkeu-left-col">
                                    {/* Bar Chart: Pemasukan vs Pengeluaran */}
                                    <div className="rkeu-card">
                                        <div className="rkeu-card-title">
                                            <span>Rekap Pemasukan vs Pengeluaran</span>
                                        </div>
                                        <div className="rkeu-bar-legend">
                                            <span className="rkeu-dot" style={{ background: '#10b981' }}></span> Pemasukan
                                            <span className="rkeu-dot" style={{ background: '#ef4444', marginLeft: '16px' }}></span> Pengeluaran
                                        </div>
                                        <div className="rkeu-bar-chart-wrap">
                                            <div className="rkeu-bar-y-axis">
                                                <span>20 JT</span>
                                                <span>15 JT</span>
                                                <span>10 JT</span>
                                                <span>5 JT</span>
                                                <span>0</span>
                                            </div>
                                            <div className="rkeu-bar-area">
                                                {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((d, i) => (
                                                    <div key={i} className="rkeu-bar-group">
                                                        <div className="rkeu-bars">
                                                            <div className="rkeu-bar pemasukan" style={{ height: reportMetrics.sales > 0 ? '20%' : '0%' }}></div>
                                                            <div className="rkeu-bar pengeluaran" style={{ height: kpis.outflow > 0 ? '15%' : '0%' }}></div>
                                                        </div>
                                                        <span className="rkeu-bar-label">{d}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Two Donut Charts side by side */}
                                    <div className="rkeu-donut-row">
                                        {/* Donut 1: Pemasukan Berdasarkan Sumber */}
                                        <div className="rkeu-card rkeu-donut-card">
                                            <div className="rkeu-card-title">Pemasukan Berdasarkan Sumber</div>
                                            <div className="rkeu-donut-wrap">
                                                <div className="rkeu-donut-svg">
                                                    <svg viewBox="0 0 100 100" width="110" height="110">
                                                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#eff6ff" strokeWidth="18" />
                                                        {reportMetrics.sales > 0 && (
                                                            <>
                                                                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#1a73e8" strokeWidth="18" strokeDasharray={`${(reportMetrics.offlineSales / reportMetrics.sales) * 239} 239`} strokeDashoffset="0" transform="rotate(-90 50 50)" />
                                                                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#10b981" strokeWidth="18" strokeDasharray={`${(reportMetrics.onlineSales / reportMetrics.sales) * 239} 239`} strokeDashoffset={`-${(reportMetrics.offlineSales / reportMetrics.sales) * 239}`} transform="rotate(-90 50 50)" />
                                                                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f59e0b" strokeWidth="18" strokeDasharray={`${(rentals.ban.rev / reportMetrics.sales) * 239} 239`} strokeDashoffset={`-${((reportMetrics.offlineSales + reportMetrics.onlineSales) / reportMetrics.sales) * 239}`} transform="rotate(-90 50 50)" />
                                                                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#6366f1" strokeWidth="18" strokeDasharray={`${(rentals.gazebo.rev / reportMetrics.sales) * 239} 239`} strokeDashoffset={`-${((reportMetrics.offlineSales + reportMetrics.onlineSales + rentals.ban.rev) / reportMetrics.sales) * 239}`} transform="rotate(-90 50 50)" />
                                                                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#ec4899" strokeWidth="18" strokeDasharray={`${(rentals.angsa.rev / reportMetrics.sales) * 239} 239`} strokeDashoffset={`-${((reportMetrics.offlineSales + reportMetrics.onlineSales + rentals.ban.rev + rentals.gazebo.rev) / reportMetrics.sales) * 239}`} transform="rotate(-90 50 50)" />
                                                            </>
                                                        )}
                                                        <circle cx="50" cy="50" r="25" fill="white" />
                                                    </svg>
                                                </div>
                                                <div className="rkeu-donut-legend">
                                                    <div className="rkeu-legend-row"><span style={{ background: '#1a73e8' }}></span><div><div className="rkeu-leg-label">Tiket Masuk Offline</div><div className="rkeu-leg-val">Rp {reportMetrics.offlineSales.toLocaleString('id-ID')} <span>({reportMetrics.sales > 0 ? ((reportMetrics.offlineSales / reportMetrics.sales) * 100).toFixed(1) : '0.0'}%)</span></div></div></div>
                                                    <div className="rkeu-legend-row"><span style={{ background: '#10b981' }}></span><div><div className="rkeu-leg-label">Tiket Masuk Online</div><div className="rkeu-leg-val">Rp {reportMetrics.onlineSales.toLocaleString('id-ID')} <span>({reportMetrics.sales > 0 ? ((reportMetrics.onlineSales / reportMetrics.sales) * 100).toFixed(1) : '0.0'}%)</span></div></div></div>
                                                    <div className="rkeu-legend-row"><span style={{ background: '#f59e0b' }}></span><div><div className="rkeu-leg-label">Sewa Ban</div><div className="rkeu-leg-val">Rp {rentals.ban.rev.toLocaleString('id-ID')} <span>({reportMetrics.sales > 0 ? ((rentals.ban.rev / reportMetrics.sales) * 100).toFixed(1) : '0.0'}%)</span></div></div></div>
                                                    <div className="rkeu-legend-row"><span style={{ background: '#6366f1' }}></span><div><div className="rkeu-leg-label">Sewa Gazebo</div><div className="rkeu-leg-val">Rp {rentals.gazebo.rev.toLocaleString('id-ID')} <span>({reportMetrics.sales > 0 ? ((rentals.gazebo.rev / reportMetrics.sales) * 100).toFixed(1) : '0.0'}%)</span></div></div></div>
                                                    <div className="rkeu-legend-row"><span style={{ background: '#ec4899' }}></span><div><div className="rkeu-leg-label">Sewa Angsa</div><div className="rkeu-leg-val">Rp {rentals.angsa.rev.toLocaleString('id-ID')} <span>({reportMetrics.sales > 0 ? ((rentals.angsa.rev / reportMetrics.sales) * 100).toFixed(1) : '0.0'}%)</span></div></div></div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Donut 2: Metode Pembayaran */}
                                        <div className="rkeu-card rkeu-donut-card">
                                            <div className="rkeu-card-title">Metode Pembayaran</div>
                                            <div className="rkeu-donut-wrap">
                                                <div className="rkeu-donut-svg">
                                                    <svg viewBox="0 0 100 100" width="110" height="110">
                                                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#eff6ff" strokeWidth="18" />
                                                        {reportMetrics.sales > 0 && (
                                                            <>
                                                                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#1a73e8" strokeWidth="18" strokeDasharray={`${(reportMetrics.cashSales / reportMetrics.sales) * 239} 239`} strokeDashoffset="0" transform="rotate(-90 50 50)" />
                                                                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#10b981" strokeWidth="18" strokeDasharray={`${(reportMetrics.qrisSales / reportMetrics.sales) * 239} 239`} strokeDashoffset={`-${(reportMetrics.cashSales / reportMetrics.sales) * 239}`} transform="rotate(-90 50 50)" />
                                                                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f59e0b" strokeWidth="18" strokeDasharray={`${(reportMetrics.transferSales / reportMetrics.sales) * 239} 239`} strokeDashoffset={`-${((reportMetrics.cashSales + reportMetrics.qrisSales) / reportMetrics.sales) * 239}`} transform="rotate(-90 50 50)" />
                                                            </>
                                                        )}
                                                        <circle cx="50" cy="50" r="25" fill="white" />
                                                    </svg>
                                                </div>
                                                <div className="rkeu-donut-legend">
                                                    <div className="rkeu-legend-row"><span style={{ background: '#1a73e8' }}></span><div><div className="rkeu-leg-label">Tunai</div><div className="rkeu-leg-val">Rp {reportMetrics.cashSales.toLocaleString('id-ID')} <span>({reportMetrics.sales > 0 ? ((reportMetrics.cashSales / reportMetrics.sales) * 100).toFixed(1) : '0.0'}%)</span></div></div></div>
                                                    <div className="rkeu-legend-row"><span style={{ background: '#10b981' }}></span><div><div className="rkeu-leg-label">QRIS</div><div className="rkeu-leg-val">Rp {reportMetrics.qrisSales.toLocaleString('id-ID')} <span>({reportMetrics.sales > 0 ? ((reportMetrics.qrisSales / reportMetrics.sales) * 100).toFixed(1) : '0.0'}%)</span></div></div></div>
                                                    <div className="rkeu-legend-row"><span style={{ background: '#f59e0b' }}></span><div><div className="rkeu-leg-label">Transfer</div><div className="rkeu-leg-val">Rp {reportMetrics.transferSales.toLocaleString('id-ID')} <span>({reportMetrics.sales > 0 ? ((reportMetrics.transferSales / reportMetrics.sales) * 100).toFixed(1) : '0.0'}%)</span></div></div></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* 2x2 Ticket Sales Grid */}
                                    <div className="rkeu-ticket-grid">
                                        <div className="rkeu-card rkeu-ticket-card">
                                            <div className="rkeu-ticket-icon blue"><i className="fa-solid fa-ticket"></i></div>
                                            <div className="rkeu-ticket-meta">
                                                <div className="rkeu-ticket-channel">Offline</div>
                                                <div className="rkeu-ticket-amount">Rp {reportMetrics.offlineSales.toLocaleString('id-ID')}</div>
                                                <div className="rkeu-ticket-sub">{reportMetrics.offlineTickets} Tiket</div>
                                                <div className="rkeu-ticket-bar"><div style={{ width: `${reportMetrics.totalTickets > 0 ? Math.round((reportMetrics.offlineTickets / reportMetrics.totalTickets) * 100) : 0}%`, background: '#1a73e8' }}></div></div>
                                                <div className="rkeu-ticket-pct">{reportMetrics.totalTickets > 0 ? Math.round((reportMetrics.offlineTickets / reportMetrics.totalTickets) * 100) : 0}%</div>
                                            </div>
                                        </div>
                                        <div className="rkeu-card rkeu-ticket-card">
                                            <div className="rkeu-ticket-icon green"><i className="fa-solid fa-ticket"></i></div>
                                            <div className="rkeu-ticket-meta">
                                                <div className="rkeu-ticket-channel">Online</div>
                                                <div className="rkeu-ticket-amount">Rp {reportMetrics.onlineSales.toLocaleString('id-ID')}</div>
                                                <div className="rkeu-ticket-sub">{reportMetrics.onlineTickets} Tiket</div>
                                                <div className="rkeu-ticket-bar"><div style={{ width: `${reportMetrics.totalTickets > 0 ? Math.round((reportMetrics.onlineTickets / reportMetrics.totalTickets) * 100) : 0}%`, background: '#10b981' }}></div></div>
                                                <div className="rkeu-ticket-pct">{reportMetrics.totalTickets > 0 ? Math.round((reportMetrics.onlineTickets / reportMetrics.totalTickets) * 100) : 0}%</div>
                                            </div>
                                        </div>
                                        <div className="rkeu-card rkeu-ticket-card">
                                            <div className="rkeu-ticket-icon orange"><i className="fa-solid fa-ticket"></i></div>
                                            <div className="rkeu-ticket-meta">
                                                <div className="rkeu-ticket-channel">Reguler</div>
                                                <div className="rkeu-ticket-amount">Rp {reportMetrics.regulerSales.toLocaleString('id-ID')}</div>
                                                <div className="rkeu-ticket-sub">{reportMetrics.regulerTickets} Tiket</div>
                                                <div className="rkeu-ticket-bar"><div style={{ width: `${reportMetrics.totalTickets > 0 ? Math.round((reportMetrics.regulerTickets / reportMetrics.totalTickets) * 100) : 0}%`, background: '#f59e0b' }}></div></div>
                                                <div className="rkeu-ticket-pct">{reportMetrics.totalTickets > 0 ? Math.round((reportMetrics.regulerTickets / reportMetrics.totalTickets) * 100) : 0}%</div>
                                            </div>
                                        </div>
                                        <div className="rkeu-card rkeu-ticket-card">
                                            <div className="rkeu-ticket-icon purple"><i className="fa-solid fa-ticket"></i></div>
                                            <div className="rkeu-ticket-meta">
                                                <div className="rkeu-ticket-channel">Rombongan</div>
                                                <div className="rkeu-ticket-amount">Rp {reportMetrics.rombonganSales.toLocaleString('id-ID')}</div>
                                                <div className="rkeu-ticket-sub">{reportMetrics.rombonganTickets} Tiket</div>
                                                <div className="rkeu-ticket-bar"><div style={{ width: `${reportMetrics.totalTickets > 0 ? Math.round((reportMetrics.rombonganTickets / reportMetrics.totalTickets) * 100) : 0}%`, background: '#8b5cf6' }}></div></div>
                                                <div className="rkeu-ticket-pct">{reportMetrics.totalTickets > 0 ? Math.round((reportMetrics.rombonganTickets / reportMetrics.totalTickets) * 100) : 0}%</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* RIGHT COLUMN (30%) */}
                                <div className="rkeu-right-col">
                                    {/* Tabel Transaksi Terbaru */}
                                    <div className="rkeu-card rkeu-right-panel">
                                        <div className="rkeu-panel-title">
                                            <span>Penjualan Terbaru</span>
                                            <a href="#/admin" onClick={(e) => { e.preventDefault(); setActiveTab('transaksi'); }} className="rkeu-lihat">Lihat Semua</a>
                                        </div>
                                        <table className="rkeu-table">
                                            <thead><tr><th>Tanggal & Jam</th><th>No. TRX</th><th>Jenis</th><th>Total</th><th>Metode</th></tr></thead>
                                            <tbody>
                                                {history.length === 0 ? (
                                                    <tr><td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8', padding: '16px' }}>Belum ada data penjualan</td></tr>
                                                ) : (
                                                    history.slice(0, 5).map((item, idx) => (
                                                        <tr key={idx}>
                                                            <td>{item.dateTime || item.date}</td>
                                                            <td>{item.code}</td>
                                                            <td><span className={`rkeu-badge ${item.category === 'Beli' ? 'blue' : 'green'}`}>{item.type}</span></td>
                                                            <td>Rp {(item.total || 0).toLocaleString('id-ID')}</td>
                                                            <td>{item.method || 'Tunai'}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    {/* Tabel Ringkasan Layanan Sewa */}
                                    <div className="rkeu-card rkeu-right-panel">
                                        <div className="rkeu-panel-title">
                                            <span>Ringkasan Layanan (Sewa)</span>
                                            <a href="#/admin" onClick={(e) => { e.preventDefault(); setActiveTab('transaksi'); }} className="rkeu-lihat">Lihat Semua</a>
                                        </div>
                                        <table className="rkeu-table">
                                            <thead><tr><th>Layanan</th><th>Terjual</th><th>Pemasukan</th></tr></thead>
                                            <tbody>
                                                <tr>
                                                    <td><div className="rkeu-service-name"><span className="rkeu-sq green"></span> Sewa Ban</div></td>
                                                    <td>{rentals.ban.qty}</td>
                                                    <td>Rp {rentals.ban.rev.toLocaleString('id-ID')}</td>
                                                </tr>
                                                <tr>
                                                    <td><div className="rkeu-service-name"><span className="rkeu-sq orange"></span> Sewa Gazebo</div></td>
                                                    <td>{rentals.gazebo.qty}</td>
                                                    <td>Rp {rentals.gazebo.rev.toLocaleString('id-ID')}</td>
                                                </tr>
                                                <tr>
                                                    <td><div className="rkeu-service-name"><span className="rkeu-sq purple"></span> Sewa Angsa</div></td>
                                                    <td>{rentals.angsa.qty}</td>
                                                    <td>Rp {rentals.angsa.rev.toLocaleString('id-ID')}</td>
                                                </tr>
                                                <tr className="rkeu-total-row">
                                                    <td><strong>Total</strong></td>
                                                    <td><strong>{rentals.totalQty}</strong></td>
                                                    <td><strong>Rp {rentals.totalRev.toLocaleString('id-ID')}</strong></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    {/* Tabel Pengeluaran Terbaru */}
                                    <div className="rkeu-card rkeu-right-panel">
                                        <div className="rkeu-panel-title">
                                            <span>Pengeluaran Terbaru</span>
                                            <a href="#/admin" onClick={(e) => { e.preventDefault(); setActiveTab('pengeluaran'); }} className="rkeu-lihat">Lihat Semua</a>
                                        </div>
                                        <table className="rkeu-table">
                                            <thead><tr><th>Tanggal</th><th>Kategori</th><th>Deskripsi</th><th>Jumlah</th></tr></thead>
                                            <tbody>
                                                {expenditures.length === 0 ? (
                                                    <tr><td colSpan="4" style={{ textAlign: 'center', color: '#94a3b8', padding: '16px' }}>Belum ada data pengeluaran</td></tr>
                                                ) : (
                                                    expenditures.slice(0, 5).map((exp, idx) => (
                                                        <tr key={idx}>
                                                            <td>{exp.date}</td>
                                                            <td><span className="rkeu-cat-badge">{exp.category}</span></td>
                                                            <td>{exp.desc}</td>
                                                            <td className="rkeu-red">Rp {(exp.amount || 0).toLocaleString('id-ID')}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            {/* === BOTTOM: Full-width Stacked Bar Chart === */}
                            <div className="rkeu-card rkeu-stacked-card">
                                <div className="rkeu-card-title">Pengunjung Harian</div>
                                <div className="rkeu-stacked-legend">
                                    <span><span className="rkeu-dot" style={{ background: '#1a73e8' }}></span> Tunai</span>
                                    <span><span className="rkeu-dot" style={{ background: '#10b981' }}></span> QRIS</span>
                                    <span><span className="rkeu-dot" style={{ background: '#f59e0b' }}></span> Transfer</span>
                                </div>
                                <div className="rkeu-stacked-chart-wrap">
                                    <div className="rkeu-stacked-y">
                                        <span>800</span><span>600</span><span>400</span><span>200</span><span>0</span>
                                    </div>
                                    <div className="rkeu-stacked-bars">
                                        {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((day, i) => (
                                            <div key={i} className="rkeu-stacked-group">
                                                <div className="rkeu-stacked-col">
                                                    <div className="rkeu-seg" style={{ height: reportMetrics.sales > 0 ? '10%' : '0%', background: '#1a73e8' }}></div>
                                                    <div className="rkeu-seg" style={{ height: reportMetrics.sales > 0 ? '10%' : '0%', background: '#10b981' }}></div>
                                                    <div className="rkeu-seg" style={{ height: reportMetrics.sales > 0 ? '5%' : '0%', background: '#f59e0b' }}></div>
                                                </div>
                                                <span className="rkeu-stacked-label">{day}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: PRODUK & HARGA */}
                    {activeTab === 'produk_harga' && (
                        <form onSubmit={handleSavePrices} className="chart-card-box" style={{ maxWidth: '600px' }}>
                            <h3>Manajemen Tarif & Harga Tiket</h3>
                            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '24px' }}>
                                Perubahan harga di bawah ini akan langsung merubah tarif pada portal Kasir (POS) petugas di lapangan.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <h4 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>Harga Tiket Masuk (Rp)</h4>
                                <div className="input-group-field">
                                    <label>Tiket Reguler</label>
                                    <input
                                        type="number"
                                        value={priceEdit.tickets.reguler}
                                        onChange={(e) => setPriceEdit({
                                            ...priceEdit,
                                            tickets: { ...priceEdit.tickets, reguler: parseInt(e.target.value) }
                                        })}
                                        className="table-select-filter"
                                        style={{ height: '42px', padding: '10px' }}
                                    />
                                </div>
                                <div className="input-group-field">
                                    <label>Tiket Rombongan (Grup Sekolah)</label>
                                    <input
                                        type="number"
                                        value={priceEdit.tickets.rombongan}
                                        onChange={(e) => setPriceEdit({
                                            ...priceEdit,
                                            tickets: { ...priceEdit.tickets, rombongan: parseInt(e.target.value) }
                                        })}
                                        className="table-select-filter"
                                        style={{ height: '42px', padding: '10px' }}
                                    />
                                </div>
                                <div className="input-group-field">
                                    <label>Kursus Renang (Per Pertemuan)</label>
                                    <input
                                        type="number"
                                        value={priceEdit.tickets.kursus}
                                        onChange={(e) => setPriceEdit({
                                            ...priceEdit,
                                            tickets: { ...priceEdit.tickets, kursus: parseInt(e.target.value) }
                                        })}
                                        className="table-select-filter"
                                        style={{ height: '42px', padding: '10px' }}
                                    />
                                </div>
                                <h4 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginTop: '10px' }}>Harga Layanan Sewa (Rp)</h4>
                                <div className="input-group-field">
                                    <label>Sewa Ban Pelampung</label>
                                    <input
                                        type="number"
                                        value={priceEdit.rentals.ban}
                                        onChange={(e) => setPriceEdit({
                                            ...priceEdit,
                                            rentals: { ...priceEdit.rentals, ban: parseInt(e.target.value) }
                                        })}
                                        className="table-select-filter"
                                        style={{ height: '42px', padding: '10px' }}
                                    />
                                </div>
                                <div className="input-group-field">
                                    <label>Sewa Sepeda Air (Angsa)</label>
                                    <input
                                        type="number"
                                        value={priceEdit.rentals.sepeda}
                                        onChange={(e) => setPriceEdit({
                                            ...priceEdit,
                                            rentals: { ...priceEdit.rentals, sepeda: parseInt(e.target.value) }
                                        })}
                                        className="table-select-filter"
                                        style={{ height: '42px', padding: '10px' }}
                                    />
                                </div>
                                <div className="input-group-field">
                                    <label>Sewa Gazebo Saung</label>
                                    <input
                                        type="number"
                                        value={priceEdit.rentals.gazebo}
                                        onChange={(e) => setPriceEdit({
                                            ...priceEdit,
                                            rentals: { ...priceEdit.rentals, gazebo: parseInt(e.target.value) }
                                        })}
                                        className="table-select-filter"
                                        style={{ height: '42px', padding: '10px' }}
                                    />
                                </div>
                                <button type="submit" className="btn-login-submit" style={{ height: '48px', borderRadius: '12px', marginTop: '10px' }}>
                                    <i className="fa-solid fa-circle-check"></i> Simpan Perubahan Tarif
                                </button>
                            </div>
                        </form>
                    )}

                    {/* TAB: PAKET PROMO */}
                    {activeTab === 'paket_promo' && (
                        <div className="chart-card-box" style={{ maxWidth: '600px' }}>
                            <h3>Manajemen Paket & Promo</h3>
                            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Konfigurasi kupon diskon dan potongan harga grup rombongan sekolah.</p>
                            <div style={{ marginTop: '20px', padding: '20px', border: '1px dashed #cbd5e1', borderRadius: '12px', textAlign: 'center', color: '#94a3b8' }}>
                                <i className="fa-solid fa-gift" style={{ fontSize: '2.5rem', marginBottom: '10px' }}></i>
                                <p>Fitur pengelolaan kupon promo aktif siap dikonfigurasi.</p>
                            </div>
                        </div>
                    )}

                    {/* TAB: KATEGORI */}
                    {activeTab === 'kategori' && (
                        <div className="chart-card-box" style={{ maxWidth: '750px' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className="fa-solid fa-tags" style={{ color: '#2563eb' }}></i> Master Kategori Produk & Layanan
                            </h3>
                            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '20px' }}>
                                Klasifikasi resmi master data antara item <strong>BELI (Tiket Masuk)</strong> dan <strong>SEWA (Fasilitas & Wahana)</strong>.
                            </p>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                {/* Kategori Beli */}
                                <div style={{ backgroundColor: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '16px', padding: '18px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                        <span style={{ backgroundColor: '#2563eb', color: 'white', padding: '8px 12px', borderRadius: '10px', fontSize: '1rem', fontWeight: 900 }}>🛒 BELI</span>
                                        <div>
                                            <h4 style={{ margin: 0, color: '#1e40af', fontSize: '0.95rem', fontWeight: 900 }}>Tiket Masuk & Edukasi</h4>
                                            <small style={{ color: '#3b82f6', fontSize: '0.72rem', fontWeight: 700 }}>Pembelian Tiket Pengunjung</small>
                                        </div>
                                    </div>
                                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.83rem', color: '#1e3a8a', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <li>🎟️ <strong>Tiket Masuk Reguler</strong> (Rp 20.000)</li>
                                        <li>🏫 <strong>Tiket Rombongan Sekolah</strong> (Rp 17.000)</li>
                                        <li>🏊‍♂️ <strong>Kursus Renang Edukatif</strong> (Rp 15.000)</li>
                                    </ul>
                                </div>

                                {/* Kategori Sewa */}
                                <div style={{ backgroundColor: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '16px', padding: '18px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                        <span style={{ backgroundColor: '#16a34a', color: 'white', padding: '8px 12px', borderRadius: '10px', fontSize: '1rem', fontWeight: 900 }}>🔑 SEWA</span>
                                        <div>
                                            <h4 style={{ margin: 0, color: '#166534', fontSize: '0.95rem', fontWeight: 900 }}>Layanan Perlengkapan & Wahana</h4>
                                            <small style={{ color: '#22c55e', fontSize: '0.72rem', fontWeight: 700 }}>Penyewaan Berdurasi</small>
                                        </div>
                                    </div>
                                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.83rem', color: '#14532d', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <li>🛖 <strong>Sewa Gazebo Saung</strong> (Rp 20.000 / Saung)</li>
                                        <li>🛞 <strong>Sewa Ban Pelampung</strong> (Rp 5.000 / Unit)</li>
                                        <li>🚴‍♂️ <strong>Sewa Sepeda Air (Bebek)</strong> (Rp 20.000 / Unit)</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: PENGUNJUNG / TRANSAKSI LANGSUNG */}
                    {activeTab === 'pengunjung' && (
                        <div className="data-table-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0c294a' }}>Pesanan & Tiket Pengunjung (Tanpa Akun)</h3>
                                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Daftar pesanan tiket pengunjung langsung. Admin dapat mencetak Tiket PDF & mengirimkan via WhatsApp.</p>
                                </div>
                            </div>
                            <div className="superadmin-table-wrapper" style={{ marginTop: '15px' }}>
                                <table className="superadmin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f8fafc', textTransform: 'uppercase', fontSize: '0.75rem', color: '#64748b' }}>
                                            <th style={{ padding: '12px' }}>No. Booking</th>
                                            <th style={{ padding: '12px' }}>Tanggal</th>
                                            <th style={{ padding: '12px' }}>Pemesan</th>
                                            <th style={{ padding: '12px' }}>No. WA</th>
                                            <th style={{ padding: '12px' }}>Item Tiket & Sewa</th>
                                            <th style={{ padding: '12px' }}>Total Tagihan</th>
                                            <th style={{ padding: '12px' }}>Status PDF</th>
                                            <th style={{ padding: '12px' }}>Aksi Admin</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(JSON.parse(localStorage.getItem('waterboom_sales_history')) || [
                                            { code: 'WCI-823902', date: '22 Juli 2026', name: 'Budi Santoso', phone: '081234567890', type: 'Tiket Reguler', qty: 2, total: 65000, status: 'Menunggu PDF' }
                                        ]).map((t, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td className="font-bold" style={{ color: '#1a73e8' }}>{t.code}</td>
                                                <td>{t.date}</td>
                                                <td><strong>{t.name || 'Pengunjung'}</strong></td>
                                                <td>{t.phone || '-'}</td>
                                                <td>{t.type} ({t.qty}x)</td>
                                                <td><strong>Rp {t.total?.toLocaleString('id-ID')}</strong></td>
                                                <td>
                                                    <span style={{ backgroundColor: '#eff6ff', color: '#1a73e8', padding: '4px 10px', borderRadius: '50px', fontSize: '0.72rem', fontWeight: 800 }}>
                                                        {t.status || 'Aktif'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '6px' }}>
                                                        <button
                                                            onClick={() => setSelectedPDFTicket(t)}
                                                            style={{ backgroundColor: '#0c294a', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                        >
                                                            <i className="fa-solid fa-file-pdf"></i> Cetak PDF
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                let targetPhone = t.phone || t.buyerPhone || '';
                                                                if (!targetPhone || targetPhone === '-' || targetPhone.trim() === '') {
                                                                    targetPhone = prompt('Masukkan Nomor WhatsApp Pembeli (contoh: 081234567890):', '');
                                                                }
                                                                if (!targetPhone || targetPhone.trim() === '') return;

                                                                const cleanPhone = targetPhone.replace(/[^0-9]/g, '');
                                                                const formattedPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
                                                                const waText = `Halo kak *${t.name || 'Pengunjung'}*! 👋\nBerikut Tiket Resmi PDF Waterboom Cijoho Indah:\n\n📌 *Kode Booking:* ${t.code}\n📅 *Tanggal:* ${t.date}\n🎟️ *Detail:* ${t.type} (${t.qty || 1}x)\n💰 *Total:* Rp ${t.total?.toLocaleString('id-ID')}\n\nE-Tiket PDF siap digunakan di pintu masuk. Terima kasih!`;
                                                                window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(waText)}`, '_blank');
                                                            }}
                                                            style={{ backgroundColor: '#25D366', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                        >
                                                            <i className="fa-brands fa-whatsapp"></i> WA PDF
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB: PENGGUNA (MANAGEMENT) */}
                    {activeTab === 'pengguna' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '20px' }}>
                            {/* Form tambah akun */}
                            <div className="chart-card-box">
                                <h3>Daftarkan Staf Baru</h3>
                                <form onSubmit={handleAddUser} className="login-form" style={{ marginTop: '16px' }}>
                                    <div className="input-group-field">
                                        <label>Nama Lengkap</label>
                                        <input
                                            type="text"
                                            placeholder="Contoh: Petugas Kasir 2"
                                            value={newUser.name}
                                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                            className="table-select-filter"
                                            style={{ height: '42px', padding: '10px' }}
                                            required
                                        />
                                    </div>
                                    <div className="input-group-field">
                                        <label>Email Akses</label>
                                        <input
                                            type="email"
                                            placeholder="nama@cijoho.com"
                                            value={newUser.email}
                                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                            className="table-select-filter"
                                            style={{ height: '42px', padding: '10px' }}
                                            required
                                        />
                                    </div>
                                    <div className="input-group-field">
                                        <label>Hak Akses / Peran</label>
                                        <select
                                            value={newUser.role}
                                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                            className="table-select-filter"
                                            style={{ height: '42px' }}
                                        >
                                            <option value="kasir">Petugas Kasir (POS)</option>
                                            <option value="admin">Super Admin</option>
                                        </select>
                                    </div>
                                    <div className="input-group-field">
                                        <label>Kata Sandi Awal</label>
                                        <input
                                            type="password"
                                            placeholder="Minimal 6 karakter"
                                            value={newUser.password}
                                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                            className="table-select-filter"
                                            style={{ height: '42px', padding: '10px' }}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn-login-submit" style={{ height: '44px', borderRadius: '10px' }}>
                                        <i className="fa-solid fa-user-plus"></i> Daftarkan Akun
                                    </button>
                                </form>
                            </div>
                            {/* List tabel pengguna */}
                            <div className="data-table-card">
                                <h3>Daftar Staf Aktif</h3>
                                <div className="superadmin-table-wrapper" style={{ marginTop: '16px' }}>
                                    <table className="superadmin-table">
                                        <thead>
                                            <tr>
                                                <th>ID Pengguna</th>
                                                <th>Nama Staf</th>
                                                <th>Email</th>
                                                <th>Hak Akses</th>
                                                <th>Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {staffUsers.map((user, idx) => (
                                                <tr key={idx}>
                                                    <td className="font-bold">{user.id}</td>
                                                    <td>{user.name}</td>
                                                    <td>{user.email}</td>
                                                    <td>
                                                        <span className={`channel-badge ${user.role === 'admin' ? 'online' : 'offline'}`} style={{ textTransform: 'capitalize' }}>
                                                            {user.role === 'admin' ? 'Super Admin' : 'Kasir'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn-refund-action"
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            disabled={user.id === '1'}
                                                            style={{ opacity: user.id === '1' ? 0.4 : 1 }}
                                                        >
                                                            <i className="fa-solid fa-user-minus"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: PENGATURAN SISTEM */}
                    {activeTab === 'pengaturan_sistem' && (
                        <form onSubmit={handleSaveSettings} className="chart-card-box" style={{ maxWidth: '600px' }}>
                            <h3>Konfigurasi Profil & Jam Operasional</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
                                <div className="input-group-field">
                                    <label>Nama Tempat Wisata</label>
                                    <input
                                        type="text"
                                        value={settingsEdit.businessName}
                                        onChange={(e) => setSettingsEdit({ ...settingsEdit, businessName: e.target.value })}
                                        className="table-select-filter"
                                        style={{ height: '42px', padding: '10px' }}
                                    />
                                </div>
                                <div className="input-group-field">
                                    <label>Nomor WhatsApp Pengelola</label>
                                    <input
                                        type="text"
                                        value={settingsEdit.whatsapp}
                                        onChange={(e) => setSettingsEdit({ ...settingsEdit, whatsapp: e.target.value })}
                                        className="table-select-filter"
                                        style={{ height: '42px', padding: '10px' }}
                                    />
                                </div>
                                <div className="input-group-field">
                                    <label>Jam Operasional</label>
                                    <input
                                        type="text"
                                        value={settingsEdit.openHours}
                                        onChange={(e) => setSettingsEdit({ ...settingsEdit, openHours: e.target.value })}
                                        className="table-select-filter"
                                        style={{ height: '42px', padding: '10px' }}
                                    />
                                </div>
                                <div className="input-group-field">
                                    <label>Kapasitas Pengunjung Maksimum (Orang)</label>
                                    <input
                                        type="number"
                                        value={settingsEdit.capacity}
                                        onChange={(e) => setSettingsEdit({ ...settingsEdit, capacity: parseInt(e.target.value) })}
                                        className="table-select-filter"
                                        style={{ height: '42px', padding: '10px' }}
                                    />
                                </div>
                                <button type="submit" className="btn-login-submit" style={{ height: '48px', borderRadius: '12px' }}>
                                    <i className="fa-solid fa-floppy-disk"></i> Simpan Pengaturan
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </main>

            {/* MODAL CETAK TIKET PDF RESMI FOR ADMIN */}
            {selectedPDFTicket && (
                <div className="v-modal-backdrop" onClick={() => setSelectedPDFTicket(null)}>
                    <div className="v-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px', backgroundColor: 'white' }}>
                        <div className="v-modal-head" style={{ backgroundColor: '#0c294a', color: 'white' }}>
                            <h4 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className="fa-solid fa-file-pdf"></i> E-Tiket Resmi Waterboom (PDF)
                            </h4>
                            <button onClick={() => setSelectedPDFTicket(null)} style={{ color: 'white' }}>&times;</button>
                        </div>
                        <div className="v-modal-body" style={{ padding: '24px', backgroundColor: '#fff' }}>
                            <div id="pdf-printable-area" style={{ border: '3px solid #0c294a', borderRadius: '18px', padding: '24px', backgroundColor: '#f8fafc' }}>
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
                                        <strong style={{ fontSize: '1.1rem', color: '#1a73e8' }}>{selectedPDFTicket.code}</strong>
                                    </div>
                                    <div>
                                        <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>TANGGAL & JAM BOOKING</span>
                                        <strong>{selectedPDFTicket.date} • ⏰ {selectedPDFTicket.time || '09:00 WIB'}</strong>
                                    </div>
                                    <div>
                                        <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>NAMA PEMESAN</span>
                                        <strong>{selectedPDFTicket.name || 'Pengunjung'}</strong>
                                    </div>
                                    <div>
                                        <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>NO. WHATSAPP</span>
                                        <strong>{selectedPDFTicket.phone || '-'}</strong>
                                    </div>
                                </div>
                                <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '10px', marginBottom: '16px' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', marginBottom: '6px' }}>RINCIAN ITEM & TOTAL:</span>
                                    {selectedPDFTicket.qty > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                                            <span>{selectedPDFTicket.type} ({selectedPDFTicket.qty || 1}x)</span>
                                            <strong>Rp {(selectedPDFTicket.subtotal || (selectedPDFTicket.ticketPrice ? selectedPDFTicket.ticketPrice * selectedPDFTicket.qty : selectedPDFTicket.total))?.toLocaleString('id-ID')}</strong>
                                        </div>
                                    )}
                                    {(selectedPDFTicket.rentals?.ban > 0 || selectedPDFTicket.details?.rentals?.ban > 0) && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#475569', marginBottom: '2px' }}>
                                            <span>• Sewa Ban Renang ({(selectedPDFTicket.rentals?.ban || selectedPDFTicket.details?.rentals?.ban)}x)</span>
                                            <span>Rp {((selectedPDFTicket.rentals?.ban || selectedPDFTicket.details?.rentals?.ban) * 5000).toLocaleString('id-ID')}</span>
                                        </div>
                                    )}
                                    {(selectedPDFTicket.rentals?.sepeda > 0 || selectedPDFTicket.details?.rentals?.sepeda > 0) && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#475569', marginBottom: '2px' }}>
                                            <span>• Sewa Sepeda Air ({(selectedPDFTicket.rentals?.sepeda || selectedPDFTicket.details?.rentals?.sepeda)}x)</span>
                                            <span>Rp {((selectedPDFTicket.rentals?.sepeda || selectedPDFTicket.details?.rentals?.sepeda) * 20000).toLocaleString('id-ID')}</span>
                                        </div>
                                    )}
                                    {(selectedPDFTicket.rentals?.gazebo > 0 || selectedPDFTicket.details?.rentals?.gazebo > 0) && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#475569', marginBottom: '2px' }}>
                                            <span>• Sewa Gazebo Santai ({(selectedPDFTicket.rentals?.gazebo || selectedPDFTicket.details?.rentals?.gazebo)}x)</span>
                                            <span>Rp {((selectedPDFTicket.rentals?.gazebo || selectedPDFTicket.details?.rentals?.gazebo) * 20000).toLocaleString('id-ID')}</span>
                                        </div>
                                    )}
                                    <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '6px', marginTop: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 900, color: '#0c294a' }}>
                                        <span>TOTAL BAYAR</span>
                                        <span>Rp {selectedPDFTicket.total?.toLocaleString('id-ID')}</span>
                                    </div>
                                </div>
                                <div style={{ backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '4.5rem', color: '#0c294a', lineHeight: 1 }}>
                                        <i className="fa-solid fa-qrcode"></i>
                                    </div>
                                    <div style={{ letterSpacing: '3px', fontWeight: 900, color: '#475569', fontSize: '0.9rem', marginTop: '6px' }}>
                                        {selectedPDFTicket.code}
                                    </div>
                                    <small style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Tunjukkan barcode/QR code ini ke loket pintu masuk</small>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button
                                    disabled={isPrinting}
                                    onClick={() => {
                                        if (isPrinting) return;
                                        setIsPrinting(true);
                                        document.body.className = 'print-mode-pdf-card';
                                        setTimeout(() => {
                                            window.print();
                                            setTimeout(() => {
                                                document.body.className = '';
                                                setIsPrinting(false);
                                            }, 1000);
                                        }, 120);
                                    }}
                                    style={{ flex: 1, backgroundColor: isPrinting ? '#94a3b8' : '#1a73e8', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 800, cursor: isPrinting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    <i className="fa-solid fa-print"></i> {isPrinting ? 'Mencetak...' : 'Cetak / Simpan Ke PDF'}
                                </button>
                                <button
                                    onClick={() => {
                                        let targetPhone = selectedPDFTicket.phone || selectedPDFTicket.buyerPhone || '';
                                        if (!targetPhone || targetPhone === '-' || targetPhone.trim() === '') {
                                            targetPhone = prompt('Masukkan Nomor WhatsApp Pembeli (contoh: 081234567890):', '');
                                        }
                                        if (!targetPhone || targetPhone.trim() === '') return;

                                        const cleanPhone = targetPhone.replace(/[^0-9]/g, '');
                                        const formattedPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
                                        const waText = `Halo kak *${selectedPDFTicket.name || 'Pengunjung'}*! 👋\nBerikut Tiket Resmi PDF Waterboom Cijoho Indah:\n\n📌 *Kode Booking:* ${selectedPDFTicket.code}\n📅 *Tanggal:* ${selectedPDFTicket.date}\n⏰ *Jam Booking:* ${selectedPDFTicket.time || '09:00 WIB'}\n🎟️ *Detail:* ${selectedPDFTicket.type} (${selectedPDFTicket.qty || 1}x)\n💰 *Total:* Rp ${selectedPDFTicket.total?.toLocaleString('id-ID')}\n\nE-Tiket PDF siap digunakan di pintu masuk. Terima kasih!`;
                                        window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(waText)}`, '_blank');
                                    }}
                                    style={{ flex: 1, backgroundColor: '#25D366', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    <i className="fa-brands fa-whatsapp"></i> Kirim WA Ke Pemesan
                                </button>
                                <button
                                    onClick={() => {
                                        const waText = `Halo kak *${selectedPDFTicket.name || 'Pengunjung'}*! 👋\nBerikut Tiket Resmi PDF Waterboom Cijoho Indah:\n\n📌 *Kode Booking:* ${selectedPDFTicket.code}\n📅 *Tanggal:* ${selectedPDFTicket.date}\n⏰ *Jam Booking:* ${selectedPDFTicket.time || '09:00 WIB'}\n🎟️ *Detail:* ${selectedPDFTicket.type} (${selectedPDFTicket.qty || 1}x)\n💰 *Total:* Rp ${selectedPDFTicket.total?.toLocaleString('id-ID')}\n\nE-Tiket PDF siap digunakan di pintu masuk. Terima kasih!`;
                                        navigator.clipboard.writeText(waText);
                                        setSwitchToast('Teks WA Berhasil Disalin!');
                                        setTimeout(() => setSwitchToast(''), 3000);
                                    }}
                                    style={{ flex: 1, backgroundColor: '#0c294a', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    <i className="fa-solid fa-copy"></i> Salin Teks WA
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL NOTIFIKASI ADMIN (CENTERED OVERLAY FOR MOBILE & DESKTOP) */}
            {showNotifDropdown && (
                <div
                    className="v-modal-backdrop fade-in"
                    onClick={() => setShowNotifDropdown(false)}
                    style={{ zIndex: 99999, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)' }}
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
                            boxShadow: '0 20px 40px rgba(12, 41, 74, 0.35)',
                            border: '1.5px solid #cbd5e1',
                            margin: 'auto'
                        }}
                    >
                        {/* Header Modal */}
                        <div style={{ backgroundColor: '#0c294a', color: 'white', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className="fa-solid fa-bell" style={{ color: '#60a5fa', fontSize: '1.2rem' }}></i>
                                <div>
                                    <h4 style={{ margin: 0, color: 'white', fontSize: '1rem', fontWeight: 900 }}>Notifikasi Admin</h4>
                                    <small style={{ color: '#93c5fd', fontSize: '0.74rem' }}>{notifications.filter(n => !n.read).length} pesan belum dibaca</small>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowNotifDropdown(false)}
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
                                    onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
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
                                notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        onClick={() => setNotifications(notifications.map(item => item.id === n.id ? { ...item, read: true } : item))}
                                        style={{
                                            backgroundColor: n.read ? '#ffffff' : '#f0f9ff',
                                            border: n.read ? '1px solid #e2e8f0' : '1.5px solid #bae6fd',
                                            borderRadius: '12px',
                                            padding: '12px 14px',
                                            marginBottom: '8px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            position: 'relative'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                            <strong style={{ fontSize: '0.86rem', color: '#0f2942', fontWeight: 900 }}>{n.title}</strong>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setNotifications(notifications.filter(item => item.id !== n.id));
                                                }}
                                                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.78rem', padding: '2px 4px' }}
                                                title="Hapus Notifikasi"
                                            >
                                                <i className="fa-solid fa-trash-can"></i>
                                            </button>
                                        </div>
                                        <p style={{ margin: '0 0 6px 0', fontSize: '0.78rem', color: '#475569', lineHeight: 1.3 }}>{n.desc}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <small style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>{n.time}</small>
                                            {!n.read && (
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
                                onClick={() => setShowNotifDropdown(false)}
                                style={{ width: '100%', backgroundColor: '#0c294a', color: 'white', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer' }}
                            >
                                Tutup Notifikasi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL TAMBAH BOOKING TIKET & JAM KUNJUNGAN (ADMIN) */}
            {showAddBookingModal && (
                <div className="v-modal-backdrop" onClick={() => setShowAddBookingModal(false)}>
                    <div className="v-modal-card fade-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', backgroundColor: 'white', borderRadius: '20px' }}>
                        <div className="v-modal-head" style={{ backgroundColor: '#0c294a', color: 'white', borderRadius: '20px 20px 0 0' }}>
                            <h4 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '1rem', fontWeight: 900 }}>
                                <i className="fa-solid fa-calendar-plus" style={{ color: '#60a5fa' }}></i> Tambah Booking Tiket & Jam Kunjungan
                            </h4>
                            <button onClick={() => setShowAddBookingModal(false)} style={{ color: 'white', background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>&times;</button>
                        </div>
                        <form onSubmit={handleAddBooking} className="v-modal-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div className="input-group-field">
                                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0c294a' }}>Nama Pemesan / Pengunjung</label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Budi Santoso"
                                    value={newBooking.name}
                                    onChange={(e) => setNewBooking({ ...newBooking, name: e.target.value })}
                                    required
                                    className="v-input"
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div className="input-group-field">
                                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0c294a' }}>No. WhatsApp</label>
                                    <input
                                        type="text"
                                        placeholder="081234567890"
                                        value={newBooking.phone}
                                        onChange={(e) => setNewBooking({ ...newBooking, phone: e.target.value })}
                                        className="v-input"
                                    />
                                </div>
                                <div className="input-group-field">
                                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0c294a' }}>⏰ Jam Booking Tiket</label>
                                    <select
                                        value={newBooking.time}
                                        onChange={(e) => setNewBooking({ ...newBooking, time: e.target.value })}
                                        className="v-input"
                                        style={{ fontWeight: 700 }}
                                    >
                                        <option value="08:00 WIB">08:00 WIB (Pagi)</option>
                                        <option value="09:30 WIB">09:30 WIB (Pagi)</option>
                                        <option value="11:00 WIB">11:00 WIB (Siang)</option>
                                        <option value="13:00 WIB">13:00 WIB (Siang)</option>
                                        <option value="14:30 WIB">14:30 WIB (Sore)</option>
                                        <option value="16:00 WIB">16:00 WIB (Sore)</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div className="input-group-field">
                                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0c294a' }}>Tanggal Kunjungan</label>
                                    <input
                                        type="date"
                                        value={newBooking.date}
                                        onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
                                        required
                                        className="v-input"
                                    />
                                </div>
                                <div className="input-group-field">
                                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0c294a' }}>Kategori Item</label>
                                    <select
                                        value={newBooking.category}
                                        onChange={(e) => {
                                            const cat = e.target.value;
                                            const defaultType = cat === 'Beli' ? 'Tiket Reguler' : 'Sewa Ban';
                                            setNewBooking({ ...newBooking, category: cat, type: defaultType });
                                        }}
                                        className="v-input"
                                        style={{ fontWeight: 800 }}
                                    >
                                        <option value="Beli">🛒 Beli (Tiket Masuk / Kursus)</option>
                                        <option value="Sewa">🔑 Sewa (Ban, Sepeda, Gazebo)</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '10px' }}>
                                <div className="input-group-field">
                                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0c294a' }}>Jenis Tiket / Layanan</label>
                                    <select
                                        value={newBooking.type}
                                        onChange={(e) => setNewBooking({ ...newBooking, type: e.target.value })}
                                        className="v-input"
                                    >
                                        {newBooking.category === 'Beli' ? (
                                            <>
                                                <option value="Tiket Reguler">Tiket Reguler (Rp 20.000)</option>
                                                <option value="Tiket Rombongan">Tiket Rombongan (Rp 17.000)</option>
                                                <option value="Kursus Renang">Kursus Renang (Rp 15.000)</option>
                                            </>
                                        ) : (
                                            <>
                                                <option value="Sewa Ban">Sewa Ban Renang (Rp 5.000)</option>
                                                <option value="Sewa Sepeda Air">Sewa Sepeda Air (Rp 20.000)</option>
                                                <option value="Sewa Gazebo">Sewa Gazebo Santai (Rp 20.000)</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                                <div className="input-group-field">
                                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0c294a' }}>Jumlah (Qty)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={newBooking.qty}
                                        onChange={(e) => setNewBooking({ ...newBooking, qty: e.target.value })}
                                        required
                                        className="v-input"
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div className="input-group-field">
                                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0c294a' }}>Channel Penjualan</label>
                                    <select
                                        value={newBooking.channel}
                                        onChange={(e) => setNewBooking({ ...newBooking, channel: e.target.value })}
                                        className="v-input"
                                    >
                                        <option value="Online">Online (Aplikasi WA)</option>
                                        <option value="Offline">Offline (Loket Fisik)</option>
                                    </select>
                                </div>
                                <div className="input-group-field">
                                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0c294a' }}>Metode Pembayaran</label>
                                    <select
                                        value={newBooking.method}
                                        onChange={(e) => setNewBooking({ ...newBooking, method: e.target.value })}
                                        className="v-input"
                                    >
                                        <option value="QRIS">QRIS / Instant E-Wallet</option>
                                        <option value="Tunai">Tunai / Cash Loket</option>
                                        <option value="Transfer">Bank Transfer</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="btn w-full btn-pill"
                                style={{ backgroundColor: '#0c294a', color: 'white', fontWeight: 900, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                <i className="fa-solid fa-check-circle"></i> SIMPAN BOOKING & CETAK TIKET
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Account Switch Toast Notification */}
            {switchToast && (
                <div className="account-switch-toast">
                    <i className="fa-solid fa-circle-check" style={{ color: '#10b981', fontSize: '1.1rem' }}></i>
                    <span>{switchToast}</span>
                </div>
            )}
        </div>
    );
}