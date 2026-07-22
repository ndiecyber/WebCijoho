import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
    const [history, setHistory] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');

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

    // Date range filter
    const [dateRange, setDateRange] = useState('15 Mei 2025 - 21 Mei 2025');
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [showNotifDropdown, setShowNotifDropdown] = useState(false);

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
    const [systemSettings, setSystemSettings] = useState({
        businessName: 'Waterboom Cijoho Indah',
        whatsapp: '628123456789',
        openHours: '08:00 - 17:00',
        capacity: 1000
    });

    // KPI values
    const [kpis, setKpis] = useState({
        sales: 48750000,
        inflow: 55350000,
        outflow: 8620000,
        visitors: 2356,
        transactions: 1024
    });

    // Forms temp states
    const [newExpense, setNewExpense] = useState({ date: '', category: 'Operasional', desc: '', amount: '' });
    const [newUser, setNewUser] = useState({ name: '', email: '', role: 'kasir', password: '' });
    const [priceEdit, setPriceEdit] = useState({ tickets: {}, rentals: {} });
    const [settingsEdit, setSettingsEdit] = useState({});

    const navigate = useNavigate();

    // Load initial data and localStorage configurations
    useEffect(() => {
        const loadAllData = () => {
            // 1. Load Sales History
            const savedHistory = localStorage.getItem('waterboom_sales_history');
            let historyData = [];
            if (savedHistory) {
                historyData = JSON.parse(savedHistory);
            } else {
                historyData = [
                    {
                        code: 'TRX-250521-1024',
                        date: '21 Mei 2025 14:32',
                        type: 'Tiket Masuk',
                        channel: 'Offline',
                        product: 'Tiket Reguler',
                        qty: 3,
                        total: 60000,
                        method: 'Tunai',
                        status: 'Lunas',
                        details: { ticketTypeKey: 'reguler', rentals: { ban: 0, sepeda: 0, gazebo: 0 } }
                    },
                    {
                        code: 'TRX-250521-1023',
                        date: '21 Mei 2025 14:15',
                        type: 'Sewa Ban',
                        channel: 'Offline',
                        product: 'Sewa Ban',
                        qty: 2,
                        total: 10000,
                        method: 'Tunai',
                        status: 'Lunas',
                        details: { ticketTypeKey: 'reguler', rentals: { ban: 2, sepeda: 0, gazebo: 0 } }
                    },
                    {
                        code: 'TRX-250521-1022',
                        date: '21 Mei 2025 13:58',
                        type: 'Tiket Masuk',
                        channel: 'Online',
                        product: 'Tiket Reguler',
                        qty: 2,
                        total: 40000,
                        method: 'QRIS',
                        status: 'Lunas',
                        details: { ticketTypeKey: 'reguler', rentals: { ban: 0, sepeda: 0, gazebo: 0 } }
                    },
                    {
                        code: 'TRX-250521-1021',
                        date: '21 Mei 2025 13:45',
                        type: 'Sewa Gazebo',
                        channel: 'Offline',
                        product: 'Gazebo',
                        qty: 1,
                        total: 20000,
                        method: 'Tunai',
                        status: 'Lunas',
                        details: { ticketTypeKey: 'reguler', rentals: { ban: 0, sepeda: 0, gazebo: 1 } }
                    },
                    {
                        code: 'TRX-250521-1020',
                        date: '21 Mei 2025 13:30',
                        type: 'Sewa Angsa',
                        channel: 'Online',
                        product: 'Sewa Angsa',
                        qty: 1,
                        total: 5000,
                        method: 'QRIS',
                        status: 'Lunas',
                        details: { ticketTypeKey: 'reguler', rentals: { ban: 0, sepeda: 1, gazebo: 0 } }
                    }
                ];
                localStorage.setItem('waterboom_sales_history', JSON.stringify(historyData));
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

            // 3. Load Expenditures
            const savedExpenses = localStorage.getItem('waterboom_expenditures');
            let expensesData = [
                { id: '1', date: '2025-05-21', category: 'Operasional', desc: 'Pembelian Bahan Kimia Kolam', amount: 1250000 },
                { id: '2', date: '2025-05-21', category: 'Listrik & Air', desc: 'Pembayaran Listrik & Air', amount: 2150000 },
                { id: '3', date: '2025-05-20', category: 'Perawatan', desc: 'Perawatan Wahana Air', amount: 1800000 }
            ];
            if (savedExpenses) {
                expensesData = JSON.parse(savedExpenses);
            } else {
                localStorage.setItem('waterboom_expenditures', JSON.stringify(expensesData));
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

            // Compute Statistics & KPIs
            let addedSales = 0;
            let addedTransactions = 0;

            historyData.forEach(item => {
                // Accumulate cashier sales
                if (item.code.startsWith('WCI-')) {
                    addedSales += item.total || 0;
                    addedTransactions += 1;
                }
            });

            // Sum up expenditures
            let totalExpenses = 0;
            expensesData.forEach(e => {
                totalExpenses += e.amount || 0;
            });

            setKpis({
                sales: 48750000 + addedSales,
                inflow: 55350000 + addedSales,
                outflow: totalExpenses,
                visitors: 2356 + (addedTransactions * 2),
                transactions: 1024 + addedTransactions
            });
        };

        loadAllData();
        window.addEventListener('storage', loadAllData);
        return () => window.removeEventListener('storage', loadAllData);
    }, []);

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

    // Calculate aggregated rental items sold
    const getRentalTotals = () => {
        let banQty = 525;
        let gazeboQty = 320;
        let angsaQty = 240;

        history.forEach(item => {
            if (item.code.startsWith('WCI-') && item.details && item.details.rentals) {
                const r = item.details.rentals;
                banQty += r.ban || 0;
                angsaQty += r.sepeda || 0; // sepeda maps to angsa
                gazeboQty += r.gazebo || 0;
            }
        });

        const banRev = banQty * prices.rentals.ban;
        const gazeboRev = gazeboQty * prices.rentals.gazebo;
        const angsaRev = angsaQty * prices.rentals.sepeda;

        return {
            ban: { qty: banQty, rev: banRev },
            gazebo: { qty: gazeboQty, rev: gazeboRev },
            angsa: { qty: angsaQty, rev: angsaRev },
            totalQty: banQty + gazeboQty + angsaQty,
            totalRev: banRev + gazeboRev + angsaRev
        };
    };

    const rentals = getRentalTotals();

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

        // Reset form
        setNewExpense({ date: '', category: 'Operasional', desc: '', amount: '' });

        // Update stats
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

        // Reset form
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

    // Delete sales history transaction (Refund)
    const handleDeleteTransaction = (code) => {
        if (window.confirm(`Apakah Anda yakin ingin melakukan refund/hapus transaksi ${code}?`)) {
            const updated = history.filter(item => item.code !== code);
            setHistory(updated);
            localStorage.setItem('waterboom_sales_history', JSON.stringify(updated));

            // Recalculate stats
            let addedSales = 0;
            let addedTransactions = 0;
            updated.forEach(item => {
                if (item.code.startsWith('WCI-')) {
                    addedSales += item.total || 0;
                    addedTransactions += 1;
                }
            });

            setKpis(prev => ({
                ...prev,
                sales: 48750000 + addedSales,
                inflow: 55350000 + addedSales,
                visitors: 2356 + (addedTransactions * 2),
                transactions: 1024 + addedTransactions
            }));
            alert(`Transaksi ${code} berhasil direfund.`);
        }
    };

    // Filter log list
    const filteredHistory = history.filter(item => {
        const matchesSearch = item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.product?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.type.toLowerCase().includes(searchQuery.toLowerCase());

        if (selectedFilter === 'all') return matchesSearch;
        if (selectedFilter === 'offline') return matchesSearch && item.channel === 'Offline';
        if (selectedFilter === 'online') return matchesSearch && item.channel === 'Online';
        return matchesSearch;
    });

    return (
        <div className="superadmin-dashboard-container">
            {/* 1. LEFT SIDEBAR */}
            <aside className="superadmin-sidebar">
                <div className="sidebar-brand-header">
                    <img src="assets/logo.png" alt="Logo" className="brand-logo" />
                    <div className="brand-title-wrap">
                        <span className="brand-name">{systemSettings.businessName}</span>
                        <span className="brand-loc">PORTAL UTAMA</span>
                    </div>
                </div>

                <div className="sidebar-profile-card">
                    <div className="profile-avatar-circle" style={{ backgroundColor: currentAccount.badgeColor }}>
                        <i className={`fa-solid ${currentAccount.avatarIcon}`}></i>
                    </div>
                    <div className="profile-meta">
                        <strong>{currentAccount.name}</strong>
                        <span>{currentAccount.role}</span>
                    </div>
                </div>

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
                            {activeTab === 'rekap_keuangan' && 'Periode Laporan: 15–21 Mei 2025'}
                            {activeTab !== 'dashboard' && activeTab !== 'transaksi' && activeTab !== 'produk_harga' && activeTab !== 'pengguna' && activeTab !== 'pengeluaran' && activeTab !== 'rekap_keuangan' && 'Manajemen master data dan laporan operasional'}
                        </p>
                    </div>

                    <div className="header-controls-column">
                        <div className="date-range-selector">
                            <i className="fa-regular fa-calendar-days"></i>
                            <span>{dateRange}</span>
                            <i className="fa-solid fa-chevron-down caret"></i>
                        </div>

                        <div className="notif-wrapper" onClick={() => setShowNotifDropdown(!showNotifDropdown)}>
                            <button className="notif-btn">
                                <i className="fa-regular fa-bell"></i>
                                <span className="notif-count-badge">3</span>
                            </button>
                        </div>

                        <div className="user-profile-dropdown-container">
                            <div className="avatar-capsule" onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
                                <div className="profile-avatar-circle" style={{ width: '32px', height: '32px', fontSize: '0.85rem', backgroundColor: currentAccount.badgeColor, flexShrink: 0 }}>
                                    <i className={`fa-solid ${currentAccount.avatarIcon}`}></i>
                                </div>
                                <div className="user-avatar-text">
                                    <span className="name">{currentAccount.name}</span>
                                    <span className="role">{currentAccount.role}</span>
                                </div>
                                <i className={`fa-solid fa-chevron-${showProfileDropdown ? 'up' : 'down'} caret`}></i>
                            </div>

                            {showProfileDropdown && (
                                <div className="account-switcher-dropdown">
                                    <div className="account-switcher-header">
                                        <span className="switcher-title">Beralih Akun (Account Switcher)</span>
                                    </div>

                                    <div className="account-switcher-list">
                                        {accounts.map(acc => (
                                            <div
                                                key={acc.id}
                                                className={`account-switcher-item ${acc.id === currentAccount.id ? 'active-account' : ''}`}
                                                onClick={() => handleSwitchAccount(acc)}
                                            >
                                                <div className="account-item-left">
                                                    <div className="account-avatar-wrapper">
                                                        <div className="account-avatar-icon" style={{ backgroundColor: acc.badgeColor }}>
                                                            <i className={`fa-solid ${acc.avatarIcon}`}></i>
                                                        </div>
                                                        {acc.isOnline && <span className="account-online-dot"></span>}
                                                    </div>
                                                    <div className="account-item-info">
                                                        <span className="acc-name">{acc.name}</span>
                                                        <span className="acc-role">{acc.role}</span>
                                                    </div>
                                                </div>
                                                {acc.id === currentAccount.id && (
                                                    <i className="fa-solid fa-circle-check account-check-badge"></i>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="account-switcher-actions">
                                        <button
                                            className="account-action-btn"
                                            onClick={() => {
                                                setShowProfileDropdown(false);
                                                setActiveTab('pengguna');
                                            }}
                                        >
                                            <i className="fa-solid fa-user-plus"></i> Tambah Akun Staf Baru
                                        </button>
                                        <button
                                            className="account-action-btn logout"
                                            onClick={handleLogout}
                                        >
                                            <i className="fa-solid fa-right-from-bracket"></i> Keluar (Logout)
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
                                    <div className="svg-chart-container">
                                        <svg viewBox="0 0 500 200" className="svg-line-chart">
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
                                            <line x1="0" y1="40" x2="500" y2="40" stroke="#f1f5f9" strokeWidth="1" />
                                            <line x1="0" y1="90" x2="500" y2="90" stroke="#f1f5f9" strokeWidth="1" />
                                            <line x1="0" y1="140" x2="500" y2="140" stroke="#f1f5f9" strokeWidth="1" />
                                            <text x="15" y="44" fill="#94a3b8" fontSize="8" fontWeight="700">20 JT</text>
                                            <text x="15" y="94" fill="#94a3b8" fontSize="8" fontWeight="700">15 JT</text>
                                            <text x="15" y="144" fill="#94a3b8" fontSize="8" fontWeight="700">10 JT</text>
                                            <text x="15" y="190" fill="#94a3b8" fontSize="8" fontWeight="700">0</text>
                                            <path d="M 50 140 Q 120 110 190 60 T 330 80 T 470 120 L 470 190 L 50 190 Z" fill="url(#pemasukanGrad)" />
                                            <path d="M 50 140 Q 120 110 190 60 T 330 80 T 470 120" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                                            <path d="M 50 150 Q 120 158 190 145 T 330 142 T 470 148 L 470 190 L 50 190 Z" fill="url(#pengeluaranGrad)" />
                                            <path d="M 50 150 Q 120 158 190 145 T 330 142 T 470 148" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 3" />
                                            <circle cx="50" cy="140" r="4" fill="#10b981" stroke="white" strokeWidth="1" />
                                            <circle cx="120" cy="110" r="4" fill="#10b981" stroke="white" strokeWidth="1" />
                                            <circle cx="190" cy="60" r="4" fill="#10b981" stroke="white" strokeWidth="1" />
                                            <circle cx="260" cy="72" r="4" fill="#10b981" stroke="white" strokeWidth="1" />
                                            <circle cx="330" cy="80" r="4" fill="#10b981" stroke="white" strokeWidth="1" />
                                            <circle cx="470" cy="120" r="4" fill="#10b981" stroke="white" strokeWidth="1" />
                                        </svg>
                                    </div>
                                    <div className="chart-x-labels">
                                        <span>15 Mei</span><span>16 Mei</span><span>17 Mei</span><span>18 Mei</span><span>19 Mei</span><span>20 Mei</span><span>21 Mei</span>
                                    </div>
                                </div>

                                {/* Donut Chart: Pemasukan Berdasarkan Sumber */}
                                <div className="chart-card-box donut-chart-card">
                                    <h3>Pemasukan Berdasarkan Sumber</h3>
                                    <div className="donut-chart-flex">
                                        <div className="svg-donut-wrapper">
                                            <svg viewBox="0 0 100 100" width="120" height="120">
                                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#eff6ff" strokeWidth="15" />
                                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1a73e8" strokeWidth="15" strokeDasharray="120 251.2" strokeDashoffset="0" transform="rotate(-90 50 50)" />
                                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="15" strokeDasharray="67 251.2" strokeDashoffset="-120" transform="rotate(-90 50 50)" />
                                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="15" strokeDasharray="24 251.2" strokeDashoffset="-187" transform="rotate(-90 50 50)" />
                                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#6366f1" strokeWidth="15" strokeDasharray="29 251.2" strokeDashoffset="-211" transform="rotate(-90 50 50)" />
                                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ec4899" strokeWidth="15" strokeDasharray="11 251.2" strokeDashoffset="-240" transform="rotate(-90 50 50)" />
                                            </svg>
                                        </div>
                                        <div className="donut-legend-list">
                                            <div className="legend-row"><span className="bullet blue"></span><div className="info"><span>Tiket Masuk Offline</span><strong>Rp 26.450.000 <small>(47.8%)</small></strong></div></div>
                                            <div className="legend-row"><span className="bullet green"></span><div className="info"><span>Tiket Masuk Online</span><strong>Rp 14.850.000 <small>(26.8%)</small></strong></div></div>
                                            <div className="legend-row"><span className="bullet orange"></span><div className="info"><span>Sewa Ban</span><strong>Rp 5.250.000 <small>(9.5%)</small></strong></div></div>
                                            <div className="legend-row"><span className="bullet indigo"></span><div className="info"><span>Sewa Gazebo</span><strong>Rp 6.400.000 <small>(11.6%)</small></strong></div></div>
                                            <div className="legend-row"><span className="bullet pink"></span><div className="info"><span>Sewa Angsa</span><strong>Rp 2.400.000 <small>(4.3%)</small></strong></div></div>
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
                                                        <div className="channel-value">Rp 26.450.000</div>
                                                        <span className="channel-sub">1.452 Tiket</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bar-wrapper">
                                                <div className="bar-track">
                                                    <div className="bar-fill blue" style={{ width: '57%' }}></div>
                                                </div>
                                                <span className="pct-label">57%</span>
                                            </div>
                                        </div>
                                        <div className="channel-box">
                                            <div className="channel-info-row">
                                                <div className="channel-title">
                                                    <div className="channel-icon-square green"><i className="fa-solid fa-globe"></i></div>
                                                    <div>
                                                        <span className="channel-label">Online</span>
                                                        <div className="channel-value">Rp 14.850.000</div>
                                                        <span className="channel-sub">904 Tiket</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bar-wrapper">
                                                <div className="bar-track">
                                                    <div className="bar-fill green" style={{ width: '43%' }}></div>
                                                </div>
                                                <span className="pct-label">43%</span>
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
                                                    <th>Tanggal</th><th>No. Transaksi</th><th>Jenis</th><th>Channel</th><th>Produk</th><th>Jumlah</th><th>Total</th><th>Metode</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredHistory.slice(0, 5).map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td className="text-secondary">{item.date}</td>
                                                        <td className="font-bold">{item.code}</td>
                                                        <td><span className={`type-badge ${item.type === 'Tiket Masuk' ? 'ticket' : 'rental'}`}><i className={`fa-solid ${item.type === 'Tiket Masuk' ? 'fa-ticket' : 'fa-parachute-box'}`}></i> {item.type}</span></td>
                                                        <td><span className={`channel-badge ${item.channel === 'Offline' ? 'offline' : 'online'}`}>{item.channel}</span></td>
                                                        <td>{item.product}</td>
                                                        <td>{item.qty}</td>
                                                        <td className="font-bold">Rp {item.total.toLocaleString('id-ID')}</td>
                                                        <td><span className="method-text">{item.method}</span></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="table-pagination-bar">
                                        <button className="page-nav-btn"><i className="fa-solid fa-chevron-left"></i></button>
                                        <button className="page-num active">1</button>
                                        <button className="page-num">2</button>
                                        <button className="page-num">3</button>
                                        <button className="page-num">4</button>
                                        <button className="page-num">5</button>
                                        <span className="dots">...</span>
                                        <button className="page-num">205</button>
                                        <button className="page-nav-btn"><i className="fa-solid fa-chevron-right"></i></button>
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
                                                <tr className="total-row-highlight"><td><strong>Total</strong></td><td><strong>1.085</strong></td><td className="font-bold text-blue"><strong>Rp 14.050.000</strong></td></tr>
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
                                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1a73e8" strokeWidth="15" strokeDasharray="134 251.2" strokeDashoffset="0" transform="rotate(-90 50 50)" />
                                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="15" strokeDasharray="106 251.2" strokeDashoffset="-134" transform="rotate(-90 50 50)" />
                                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="15" strokeDasharray="11 251.2" strokeDashoffset="-240" transform="rotate(-90 50 50)" />
                                            </svg>
                                        </div>
                                        <div className="donut-legend-list">
                                            <div className="legend-row"><span className="bullet blue"></span><div className="info"><span>Tunai</span><strong>Rp 29.580.000 <small>(53.4%)</small></strong></div></div>
                                            <div className="legend-row"><span className="bullet green"></span><div className="info"><span>QRIS</span><strong>Rp 23.450.000 <small>(42.4%)</small></strong></div></div>
                                            <div className="legend-row"><span className="bullet orange"></span><div className="info"><span>Transfer</span><strong>Rp 2.320.000 <small>(4.2%)</small></strong></div></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="chart-card-box daily-visitors-card">
                                    <h3>Pengunjung Harian</h3>
                                    <div className="visitors-chart-container">
                                        <div className="y-axis-labels"><span>800</span><span>600</span><span>400</span><span>200</span><span>0</span></div>
                                        <div className="bar-chart-bars">
                                            <div className="chart-col"><div className="bar-fill" style={{ height: '55%' }}></div><span className="label">15 Mei</span></div>
                                            <div className="chart-col"><div className="bar-fill" style={{ height: '50%' }}></div><span className="label">16 Mei</span></div>
                                            <div className="chart-col"><div className="bar-fill" style={{ height: '80%' }}></div><span className="label">17 Mei</span></div>
                                            <div className="chart-col"><div className="bar-fill" style={{ height: '75%' }}></div><span className="label">18 Mei</span></div>
                                            <div className="chart-col"><div className="bar-fill" style={{ height: '75%' }}></div><span className="label">19 Mei</span></div>
                                            <div className="chart-col"><div className="bar-fill" style={{ height: '50%' }}></div><span className="label">20 Mei</span></div>
                                            <div className="chart-col"><div className="bar-fill" style={{ height: '60%' }}></div><span className="label">21 Mei</span></div>
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
                                        <option value="all">Semua Channel</option>
                                        <option value="offline">Offline (Kasir)</option>
                                        <option value="online">Online (Pengunjung)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="superadmin-table-wrapper">
                                <table className="superadmin-table">
                                    <thead>
                                        <tr>
                                            <th>Tanggal</th>
                                            <th>Kode Transaksi</th>
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
                                                    <td>{item.date}</td>
                                                    <td className="font-bold">{item.code}</td>
                                                    <td><span className={`type-badge ${item.type === 'Tiket Masuk' ? 'ticket' : 'rental'}`}>{item.type}</span></td>
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
                                                <td colSpan="9" className="table-empty-row">Tidak ada data transaksi yang cocok.</td>
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
                                            <div className="legend-row"><span className="bullet blue"></span><div className="info"><span>Tiket Masuk Offline</span><strong>Rp 26.450.000 <small>(47.8%)</small></strong></div></div>
                                            <div className="legend-row"><span className="bullet green"></span><div className="info"><span>Tiket Masuk Online</span><strong>Rp 14.850.000 <small>(26.8%)</small></strong></div></div>
                                            <div className="legend-row"><span className="bullet orange"></span><div className="info"><span>Sewa Ban Renang</span><strong>Rp {rentals.ban.rev.toLocaleString('id-ID')} <small>(9.5%)</small></strong></div></div>
                                            <div className="legend-row"><span className="bullet indigo"></span><div className="info"><span>Sewa Gazebo</span><strong>Rp {rentals.gazebo.rev.toLocaleString('id-ID')} <small>(11.6%)</small></strong></div></div>
                                            <div className="legend-row"><span className="bullet pink"></span><div className="info"><span>Sewa Bebek / Angsa</span><strong>Rp {rentals.angsa.rev.toLocaleString('id-ID')} <small>(4.3%)</small></strong></div></div>
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
                                                <th>Tanggal</th><th>No. Transaksi</th><th>Jenis Pemasukan</th><th>Channel</th><th>Item / Produk</th><th>Qty</th><th>Total Nominal</th><th>Metode</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {history.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="text-secondary">{item.date}</td>
                                                    <td className="font-bold">{item.code}</td>
                                                    <td><span className={`type-badge ${item.type === 'Tiket Masuk' ? 'ticket' : 'rental'}`}>{item.type}</span></td>
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
                                            {expenditures.map((item, idx) => (
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
                                                <tr><td>Penjualan Tiket Masuk Offline (Kasir)</td><td>1.452 Orang</td><td className="font-bold">Rp 26.450.000</td></tr>
                                                <tr><td>Penjualan Tiket Masuk Online (Mobile App)</td><td>904 Orang</td><td className="font-bold">Rp 14.850.000</td></tr>
                                                <tr className="total-row-highlight"><td><strong>Total Tiket Terjual</strong></td><td><strong>2.356 Orang</strong></td><td className="font-bold text-blue"><strong>Rp 41.300.000</strong></td></tr>
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
                                                {[
                                                    { label: '15 Mei', pemasukan: 30, pengeluaran: 15 },
                                                    { label: '16 Mei', pemasukan: 40, pengeluaran: 13 },
                                                    { label: '17 Mei', pemasukan: 55, pengeluaran: 17 },
                                                    { label: '18 Mei', pemasukan: 90, pengeluaran: 20 },
                                                    { label: '19 Mei', pemasukan: 70, pengeluaran: 18 },
                                                    { label: '20 Mei', pemasukan: 50, pengeluaran: 22 },
                                                    { label: '21 Mei', pemasukan: 45, pengeluaran: 20 },
                                                ].map((d, i) => (
                                                    <div key={i} className="rkeu-bar-group">
                                                        <div className="rkeu-bars">
                                                            <div className="rkeu-bar pemasukan" style={{ height: `${d.pemasukan}%` }}></div>
                                                            <div className="rkeu-bar pengeluaran" style={{ height: `${d.pengeluaran}%` }}></div>
                                                        </div>
                                                        <span className="rkeu-bar-label">{d.label}</span>
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
                                                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#1a73e8" strokeWidth="18" strokeDasharray="120 239" strokeDashoffset="0" transform="rotate(-90 50 50)" />
                                                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#10b981" strokeWidth="18" strokeDasharray="64 239" strokeDashoffset="-120" transform="rotate(-90 50 50)" />
                                                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f59e0b" strokeWidth="18" strokeDasharray="23 239" strokeDashoffset="-184" transform="rotate(-90 50 50)" />
                                                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#6366f1" strokeWidth="18" strokeDasharray="28 239" strokeDashoffset="-207" transform="rotate(-90 50 50)" />
                                                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#ec4899" strokeWidth="18" strokeDasharray="11 239" strokeDashoffset="-235" transform="rotate(-90 50 50)" />
                                                        <circle cx="50" cy="50" r="25" fill="white" />
                                                    </svg>
                                                </div>
                                                <div className="rkeu-donut-legend">
                                                    <div className="rkeu-legend-row"><span style={{ background: '#1a73e8' }}></span><div><div className="rkeu-leg-label">Tiket Masuk Offline</div><div className="rkeu-leg-val">Rp 26.450.000 <span>(47.8%)</span></div></div></div>
                                                    <div className="rkeu-legend-row"><span style={{ background: '#10b981' }}></span><div><div className="rkeu-leg-label">Tiket Masuk Online</div><div className="rkeu-leg-val">Rp 14.850.000 <span>(26.8%)</span></div></div></div>
                                                    <div className="rkeu-legend-row"><span style={{ background: '#f59e0b' }}></span><div><div className="rkeu-leg-label">Sewa Ban</div><div className="rkeu-leg-val">Rp 5.250.000 <span>(9.5%)</span></div></div></div>
                                                    <div className="rkeu-legend-row"><span style={{ background: '#6366f1' }}></span><div><div className="rkeu-leg-label">Sewa Gazebo</div><div className="rkeu-leg-val">Rp 6.400.000 <span>(11.6%)</span></div></div></div>
                                                    <div className="rkeu-legend-row"><span style={{ background: '#ec4899' }}></span><div><div className="rkeu-leg-label">Sewa Angsa</div><div className="rkeu-leg-val">Rp 2.400.000 <span>(4.3%)</span></div></div></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Donut 2: Metode Pembayaran */}
                                        <div className="rkeu-card rkeu-donut-card">
                                            <div className="rkeu-card-title">Metode Pembayaran</div>
                                            <div className="rkeu-donut-wrap">
                                                <div className="rkeu-donut-svg">
                                                    <svg viewBox="0 0 100 100" width="110" height="110">
                                                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#1a73e8" strokeWidth="18" strokeDasharray="134 239" strokeDashoffset="0" transform="rotate(-90 50 50)" />
                                                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#10b981" strokeWidth="18" strokeDasharray="101 239" strokeDashoffset="-134" transform="rotate(-90 50 50)" />
                                                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f59e0b" strokeWidth="18" strokeDasharray="10 239" strokeDashoffset="-235" transform="rotate(-90 50 50)" />
                                                        <circle cx="50" cy="50" r="25" fill="white" />
                                                    </svg>
                                                </div>
                                                <div className="rkeu-donut-legend">
                                                    <div className="rkeu-legend-row"><span style={{ background: '#1a73e8' }}></span><div><div className="rkeu-leg-label">Tunai</div><div className="rkeu-leg-val">Rp 29.580.000 <span>(53.4%)</span></div></div></div>
                                                    <div className="rkeu-legend-row"><span style={{ background: '#10b981' }}></span><div><div className="rkeu-leg-label">QRIS</div><div className="rkeu-leg-val">Rp 23.450.000 <span>(42.4%)</span></div></div></div>
                                                    <div className="rkeu-legend-row"><span style={{ background: '#f59e0b' }}></span><div><div className="rkeu-leg-label">Transfer</div><div className="rkeu-leg-val">Rp 2.320.000 <span>(4.2%)</span></div></div></div>
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
                                                <div className="rkeu-ticket-amount">Rp 26.450.000</div>
                                                <div className="rkeu-ticket-sub">1.452 Tiket</div>
                                                <div className="rkeu-ticket-bar"><div style={{ width: '57%', background: '#1a73e8' }}></div></div>
                                                <div className="rkeu-ticket-pct">57%</div>
                                            </div>
                                        </div>
                                        <div className="rkeu-card rkeu-ticket-card">
                                            <div className="rkeu-ticket-icon green"><i className="fa-solid fa-ticket"></i></div>
                                            <div className="rkeu-ticket-meta">
                                                <div className="rkeu-ticket-channel">Online</div>
                                                <div className="rkeu-ticket-amount">Rp 14.850.000</div>
                                                <div className="rkeu-ticket-sub">904 Tiket</div>
                                                <div className="rkeu-ticket-bar"><div style={{ width: '43%', background: '#10b981' }}></div></div>
                                                <div className="rkeu-ticket-pct">43%</div>
                                            </div>
                                        </div>
                                        <div className="rkeu-card rkeu-ticket-card">
                                            <div className="rkeu-ticket-icon orange"><i className="fa-solid fa-ticket"></i></div>
                                            <div className="rkeu-ticket-meta">
                                                <div className="rkeu-ticket-channel">Reguler</div>
                                                <div className="rkeu-ticket-amount">Rp 32.500.000</div>
                                                <div className="rkeu-ticket-sub">1.300 Tiket</div>
                                                <div className="rkeu-ticket-bar"><div style={{ width: '78%', background: '#f59e0b' }}></div></div>
                                                <div className="rkeu-ticket-pct">78%</div>
                                            </div>
                                        </div>
                                        <div className="rkeu-card rkeu-ticket-card">
                                            <div className="rkeu-ticket-icon purple"><i className="fa-solid fa-ticket"></i></div>
                                            <div className="rkeu-ticket-meta">
                                                <div className="rkeu-ticket-channel">Rombongan</div>
                                                <div className="rkeu-ticket-amount">Rp 8.800.000</div>
                                                <div className="rkeu-ticket-sub">352 Tiket</div>
                                                <div className="rkeu-ticket-bar"><div style={{ width: '22%', background: '#8b5cf6' }}></div></div>
                                                <div className="rkeu-ticket-pct">22%</div>
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
                                            <thead><tr><th>Tanggal</th><th>No. TRX</th><th>Jenis</th><th>Total</th><th>Metode</th></tr></thead>
                                            <tbody>
                                                <tr><td>21 Mei 2025 14:32</td><td>TRX-250521-1024</td><td><span className="rkeu-badge blue">Tiket Masuk</span></td><td>Rp 60.000</td><td>Tunai</td></tr>
                                                <tr><td>21 Mei 2025 14:15</td><td>TRX-250521-1023</td><td><span className="rkeu-badge green">Sewa Ban</span></td><td>Rp 10.000</td><td>Tunai</td></tr>
                                                <tr><td>21 Mei 2025 13:58</td><td>TRX-250521-1022</td><td><span className="rkeu-badge blue">Tiket Masuk</span></td><td>Rp 40.000</td><td>QRIS</td></tr>
                                                <tr><td>21 Mei 2025 13:45</td><td>TRX-250521-1021</td><td><span className="rkeu-badge orange">Sewa Gazebo</span></td><td>Rp 20.000</td><td>Tunai</td></tr>
                                                <tr><td>21 Mei 2025 13:30</td><td>TRX-250521-1020</td><td><span className="rkeu-badge purple">Sewa Angsa</span></td><td>Rp 5.000</td><td>QRIS</td></tr>
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
                                                    <td>525</td>
                                                    <td>Rp 5.250.000</td>
                                                </tr>
                                                <tr>
                                                    <td><div className="rkeu-service-name"><span className="rkeu-sq orange"></span> Sewa Gazebo</div></td>
                                                    <td>320</td>
                                                    <td>Rp 6.400.000</td>
                                                </tr>
                                                <tr>
                                                    <td><div className="rkeu-service-name"><span className="rkeu-sq purple"></span> Sewa Angsa</div></td>
                                                    <td>240</td>
                                                    <td>Rp 2.400.000</td>
                                                </tr>
                                                <tr className="rkeu-total-row">
                                                    <td><strong>Total</strong></td>
                                                    <td><strong>1.085</strong></td>
                                                    <td><strong>Rp 14.050.000</strong></td>
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
                                                <tr><td>21 Mei 2025</td><td><span className="rkeu-cat-badge">Operasional</span></td><td>Pembelian Bahan Kimia Kolam</td><td className="rkeu-red">Rp 1.250.000</td></tr>
                                                <tr><td>21 Mei 2025</td><td><span className="rkeu-cat-badge">Listrik & Air</span></td><td>Pembayaran Listrik & Air</td><td className="rkeu-red">Rp 2.150.000</td></tr>
                                                <tr><td>20 Mei 2025</td><td><span className="rkeu-cat-badge">Perawatan</span></td><td>Perawatan Wahana Air</td><td className="rkeu-red">Rp 1.800.000</td></tr>
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
                                        {[
                                            { label: '15 Mei', tunai: 30, qris: 20, transfer: 5 },
                                            { label: '16 Mei', tunai: 28, qris: 18, transfer: 4 },
                                            { label: '17 Mei', tunai: 45, qris: 30, transfer: 6 },
                                            { label: '18 Mei', tunai: 55, qris: 38, transfer: 7 },
                                            { label: '19 Mei', tunai: 42, qris: 29, transfer: 5 },
                                            { label: '20 Mei', tunai: 32, qris: 22, transfer: 4 },
                                            { label: '21 Mei', tunai: 38, qris: 26, transfer: 5 },
                                        ].map((d, i) => (
                                            <div key={i} className="rkeu-stacked-group">
                                                <div className="rkeu-stacked-col">
                                                    <div className="rkeu-seg" style={{ height: `${d.tunai}%`, background: '#1a73e8' }}></div>
                                                    <div className="rkeu-seg" style={{ height: `${d.qris}%`, background: '#10b981' }}></div>
                                                    <div className="rkeu-seg" style={{ height: `${d.transfer}%`, background: '#f59e0b' }}></div>
                                                </div>
                                                <span className="rkeu-stacked-label">{d.label}</span>
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
                        <div className="chart-card-box" style={{ maxWidth: '600px' }}>
                            <h3>Master Kategori Produk</h3>
                            <ul className="sidebar-menu-links" style={{ listStyle: 'none', padding: 0, marginTop: '15px' }}>
                                <li style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', fontWeight: 800 }}>1. Tiket Masuk</li>
                                <li style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', fontWeight: 800 }}>2. Layanan Sewa Perlengkapan</li>
                                <li style={{ padding: '12px', fontWeight: 800 }}>3. Kelas Kursus Edukatif</li>
                            </ul>
                        </div>
                    )}

                    {/* TAB: PENGUNJUNG */}
                    {activeTab === 'pengunjung' && (
                        <div className="data-table-card">
                            <h3>Database Pengunjung</h3>
                            <div className="superadmin-table-wrapper" style={{ marginTop: '15px' }}>
                                <table className="superadmin-table">
                                    <thead>
                                        <tr><th>ID</th><th>Nama</th><th>Jumlah Kunjungan</th><th>Status Loyalitas</th></tr>
                                    </thead>
                                    <tbody>
                                        <tr><td className="font-bold">USR-382</td><td>Agus Budiman</td><td>12 Kunjungan</td><td><span className="badge-lunas">VIP Member</span></td></tr>
                                        <tr><td className="font-bold">USR-291</td><td>Siti Rahmawati</td><td>5 Kunjungan</td><td><span className="badge-lunas" style={{ backgroundColor: '#eff6ff', color: '#1a73e8' }}>Regular</span></td></tr>
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
