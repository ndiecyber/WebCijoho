import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import WaveDivider from '../components/WaveDivider';

export default function LoginPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const [loginRole, setLoginRole] = useState('admin'); // 'admin' | 'kasir'
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const role = queryParams.get('role');
        if (role === 'kasir') {
            setLoginRole('kasir');
        } else if (role === 'admin') {
            setLoginRole('admin');
        }
    }, [location.search]);

    const handleRoleSwitch = (role) => {
        setLoginRole(role);
        setError('');
    };

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');

        if (!username.trim() || !password) {
            setError('Username dan kata sandi wajib diisi.');
            return;
        }

        setIsLoading(true);

        setTimeout(() => {
            const cleanUser = username.toLowerCase().trim();
            
            // Determine target role from typed username or active tab role
            let targetRole = loginRole; // 'admin' | 'kasir'
            if (cleanUser.includes('kasir')) {
                targetRole = 'kasir';
            } else if (cleanUser.includes('admin')) {
                targetRole = 'admin';
            }

            if (targetRole === 'kasir') {
                const sessionData = {
                    email: cleanUser.includes('@') ? cleanUser : 'kasir@cijoho.com',
                    role: 'kasir',
                    name: 'Petugas Kasir 1',
                    loginTime: new Date().toISOString()
                };
                localStorage.setItem('staffSession', JSON.stringify(sessionData));
                setIsLoading(false);
                navigate('/kasir');
            } else {
                const sessionData = {
                    email: cleanUser.includes('@') ? cleanUser : 'admin@cijoho.com',
                    role: 'admin',
                    name: 'Admin Utama',
                    loginTime: new Date().toISOString()
                };
                localStorage.setItem('staffSession', JSON.stringify(sessionData));
                setIsLoading(false);
                navigate('/admin');
            }
        }, 300);
    };

    return (
        <div className="login-page-container">
            {/* Background SVG Water Waves, Fluffy Cloud Canopy, Sun Glow & Floating Bubbles */}
            <WaveDivider type="login" color={loginRole} />
            
            <div className="login-glass-card fade-in">
                {/* Header Brand */}
                <div className="login-header" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                    <img 
                        src="assets/logo.png" 
                        alt="Waterboom Cijoho Indah" 
                        className="login-logo-img" 
                        style={{ height: '72px', width: 'auto', objectFit: 'contain', display: 'block', margin: '0 auto 6px auto' }} 
                    />
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e3a8a', letterSpacing: '0.2px', display: 'block', marginBottom: '1px', lineHeight: 1 }}>
                        Waterboom
                    </span>
                    <h1 style={{ fontSize: '1.95rem', fontWeight: 800, color: '#0f2b5c', margin: '0', fontFamily: 'serif, "Georgia", "Playfair Display"', letterSpacing: '-0.4px', lineHeight: 1.05 }}>
                        Cijoho Indah
                    </h1>
                    {/* Water drop divider */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '10px', width: '100%' }}>
                        <div style={{ width: '32px', height: '1.5px', backgroundColor: '#93c5fd' }}></div>
                        <i className="fa-solid fa-droplet" style={{ color: '#2563eb', fontSize: '0.75rem' }}></i>
                        <div style={{ width: '32px', height: '1.5px', backgroundColor: '#93c5fd' }}></div>
                    </div>
                </div>

                {/* Role Switcher Tabs */}
                <div className="login-role-tabs" style={{ display: 'flex', gap: '6px', backgroundColor: '#f8fafc', border: '1.5px solid #e2e8f0', padding: '5px', borderRadius: '16px', marginBottom: '20px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                    <button 
                        type="button"
                        className={`role-tab-btn ${loginRole === 'admin' ? 'active' : ''}`}
                        onClick={() => handleRoleSwitch('admin')}
                        style={{
                            flex: 1,
                            padding: '11px 12px',
                            borderRadius: '12px',
                            border: 'none',
                            background: loginRole === 'admin' ? 'linear-gradient(135deg, #0f2b5c 0%, #1e3a8a 100%)' : 'transparent',
                            color: loginRole === 'admin' ? '#ffffff' : '#475569',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: loginRole === 'admin' ? '0 4px 14px rgba(15, 43, 92, 0.25)' : 'none',
                            transition: 'all 0.25s ease'
                        }}
                    >
                        <span>Portal Admin</span>
                    </button>
                    <button 
                        type="button"
                        className={`role-tab-btn ${loginRole === 'kasir' ? 'active' : ''}`}
                        onClick={() => handleRoleSwitch('kasir')}
                        style={{
                            flex: 1,
                            padding: '11px 12px',
                            borderRadius: '12px',
                            border: 'none',
                            background: loginRole === 'kasir' ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'transparent',
                            color: loginRole === 'kasir' ? '#ffffff' : '#475569',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: loginRole === 'kasir' ? '0 4px 14px rgba(2, 132, 199, 0.25)' : 'none',
                            transition: 'all 0.25s ease'
                        }}
                    >
                        <span>Portal Kasir</span>
                    </button>
                </div>

                {error && (
                    <div className="login-error-alert animate-bounce-subtle" style={{ padding: '8px 12px', fontSize: '0.78rem', marginBottom: '14px', borderRadius: '10px' }}>
                        <i className="fa-solid fa-triangle-exclamation"></i> {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="login-form" autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                    {/* Username Input */}
                    <div className="input-group-field" style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '14px' }}>
                        <label htmlFor="username" style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>Username</label>
                        <div className="input-with-icon" style={{ display: 'flex', alignItems: 'center', backgroundColor: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '0 10px', height: '48px', transition: 'border-color 0.2s ease' }}>
                            <div style={{ backgroundColor: '#eff6ff', borderRadius: '10px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px', flexShrink: 0 }}>
                                <i className="fa-solid fa-user" style={{ color: loginRole === 'kasir' ? '#0284c7' : '#2563eb', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, margin: 0 }}></i>
                            </div>
                            <input 
                                type="text" 
                                id="username" 
                                placeholder="Masukkan username" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="off"
                                required 
                                style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}
                            />
                        </div>
                    </div>

                    {/* Kata Sandi Input */}
                    <div className="input-group-field" style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '14px' }}>
                        <label htmlFor="password" style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>Kata Sandi</label>
                        <div className="input-with-icon" style={{ display: 'flex', alignItems: 'center', backgroundColor: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '0 10px', height: '48px', transition: 'border-color 0.2s ease' }}>
                            <div style={{ backgroundColor: '#eff6ff', borderRadius: '10px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px', flexShrink: 0 }}>
                                <i className="fa-solid fa-lock" style={{ color: loginRole === 'kasir' ? '#0284c7' : '#2563eb', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, margin: 0 }}></i>
                            </div>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                id="password" 
                                placeholder="Masukkan kata sandi" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="off"
                                required 
                                style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}
                            />
                            <button 
                                type="button" 
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label="Toggle Password Visibility"
                                style={{ background: 'none', border: 'none', color: loginRole === 'kasir' ? '#0284c7' : '#1e3a8a', cursor: 'pointer', fontSize: '1rem', padding: '4px', marginLeft: '4px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <i className={showPassword ? "fa-regular fa-eye-slash" : "fa-regular fa-eye"} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}></i>
                            </button>
                        </div>
                    </div>

                    {/* Remember me & Forgot password row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px', marginBottom: '18px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                style={{ width: '16px', height: '16px', accentColor: loginRole === 'kasir' ? '#0284c7' : '#1e3a8a', cursor: 'pointer' }}
                            />
                            Ingat saya
                        </label>
                        <button
                            type="button"
                            onClick={() => alert('Silakan hubungi Administrator Utama untuk mereset kata sandi staf.')}
                            style={{ background: 'none', border: 'none', color: loginRole === 'kasir' ? '#0284c7' : '#2563eb', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                        >
                            Lupa kata sandi?
                        </button>
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        className="btn-login-submit" 
                        disabled={isLoading} 
                        style={{ 
                            width: '100%',
                            background: loginRole === 'kasir' ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #1d4ed8 100%)' : 'linear-gradient(135deg, #0f2b5c 0%, #1e3a8a 50%, #2563eb 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '14px',
                            height: '50px',
                            fontSize: '0.95rem',
                            fontWeight: 800,
                            letterSpacing: '1px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            boxShadow: loginRole === 'kasir' ? '0 6px 20px rgba(2, 132, 199, 0.35)' : '0 6px 20px rgba(15, 43, 92, 0.35)',
                            transition: 'all 0.25s ease'
                        }}
                    >
                        {isLoading ? (
                            <>
                                <span className="login-spinner"></span> Memproses Masuk...
                            </>
                        ) : (
                            <>
                                MASUK <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.88rem' }}></i>
                            </>
                        )}
                    </button>
                </form>

                {/* Back to Home Link */}
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <Link to="/" style={{ color: '#2563eb', fontSize: '0.85rem', fontWeight: 800, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <i className="fa-solid fa-arrow-left"></i> Kembali ke Beranda Utama
                    </Link>
                </div>
            </div>

            {/* Bottom Security / Trust Badge */}
            <div style={{ marginTop: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#ffffff', fontSize: '0.82rem', fontWeight: 800, textShadow: '0 2px 6px rgba(0, 0, 0, 0.4)', zIndex: 10 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><i className="fa-solid fa-shield-halved" style={{ color: '#38bdf8' }}></i> Aman</span>
                <span>•</span>
                <span>Cepat</span>
                <span>•</span>
                <span>Terpercaya</span>
            </div>
        </div>
    );
}
